import * as fs from "node:fs";
import * as path from "node:path";
import * as url from "node:url";

import { parse } from "yaml";

// Reads the glossary's categories and terms, and finds problems in them.

/**
 * A folder under terms/ and the name readers see for it.
 */
export type Category = {
    /**
     * The folder, relative to terms/, such as "anatomy/vertebrae".
     */
    id: string;

    /**
     * The name readers see.
     */
    name: string;

    /**
     * What the category covers, in one sentence.
     */
    description: string;
};

/**
 * A term, read from its file.
 */
export type Term = {
    /**
     * The file name without ".yml", such as "nomen-dubium".
     */
    id: string;

    /**
     * The folder the file is in, such as "naming".
     */
    category: string;

    /**
     * The term as the glossary lists it.
     */
    term: string;

    /**
     * Every spelling that links to the term in text, the term itself first.
     */
    forms: Array<string>;

    /**
     * Phrases that contain a form but use it in another sense, and so don't link, such as
     * "derived from".
     */
    exceptions: Array<string>;

    /**
     * The plain-English definition.
     */
    definition: string;

    /**
     * Where the word comes from, if given.
     */
    etymology: string | undefined;

    /**
     * The ids of related terms.
     */
    seeAlso: Array<string>;
};

/**
 * The glossary as its source files give it, with any problems found.
 */
export type GlossarySource = {
    /**
     * The categories, in the order categories.yml lists them.
     */
    categories: Array<Category>;

    /**
     * The terms, in id order.
     */
    terms: Array<Term>;

    /**
     * Each problem found, naming the file it is in.
     */
    problems: Array<string>;
};

export const rootDirectory = path.join(path.dirname(url.fileURLToPath(import.meta.url)), "..");

const termsDirectory = path.join(rootDirectory, "terms");
const categoriesPath = path.join(rootDirectory, "categories.yml");

// The fields a term file may have.
const termFields = new Set(["term", "forms", "exceptions", "definition", "etymology", "see_also"]);

// The longest definition, in characters: about two sentences.
const maximumDefinitionLength = 400;

// Term ids and the parts of category folders: lowercase words joined by hyphens.
const idPattern = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/**
 * Check whether a value is a non-empty string with no stray spaces.
 *
 * @param value - The value.
 * @returns Whether it is.
 */
function isCleanText(value: unknown): value is string
{
    return typeof value === "string" && value.length > 0 && value === value.trim() && !value.includes("  ");
}

/**
 * Read categories.yml.
 *
 * @param problems - Where to add problems.
 * @returns The categories, in file order.
 */
function readCategories(problems: Array<string>): Array<Category>
{
    const categories = new Array<Category>();
    const data: unknown = parse(fs.readFileSync(categoriesPath, "utf8"));

    if (typeof data !== "object" || data === null || Array.isArray(data))
    {
        problems.push("categories.yml: expected a mapping of folder to name and description");

        return categories;
    }

    for (const [id, value] of Object.entries(data))
    {
        const entry = value as Record<string, unknown> | null;

        if (!id.split("/").every((part) => idPattern.test(part)))
        {
            problems.push("categories.yml: " + id + " is not a folder name of lowercase words and hyphens");
        }
        else if (!entry || !isCleanText(entry.name) || !isCleanText(entry.description))
        {
            problems.push("categories.yml: " + id + " needs a name and a description");
        }
        else
        {
            categories.push({ id, name: entry.name, description: entry.description });
        }
    }

    return categories;
}

/**
 * Find every .yml file under a directory.
 *
 * @param directory - The directory.
 * @returns The files' paths.
 */
function findTermFiles(directory: string): Array<string>
{
    const files = new Array<string>();

    for (const entry of fs.readdirSync(directory, { withFileTypes: true }))
    {
        const entryPath = path.join(directory, entry.name);

        if (entry.isDirectory())
        {
            files.push(...findTermFiles(entryPath));
        }
        else if (entry.name.endsWith(".yml"))
        {
            files.push(entryPath);
        }
    }

    return files;
}

/**
 * Read a list of strings from a term file's field.
 *
 * @param value - The field's value.
 * @param field - The field's name, for problems.
 * @param file - The file, for problems.
 * @param problems - Where to add problems.
 * @returns The strings; none if the field is absent or invalid.
 */
function readTextList(value: unknown, field: string, file: string, problems: Array<string>): Array<string>
{
    const list = new Array<string>();

    if (value === undefined)
    {
        return list;
    }

    if (!Array.isArray(value))
    {
        problems.push(file + ": " + field + " must be a list");

        return list;
    }

    for (const item of value)
    {
        if (isCleanText(item))
        {
            list.push(item);
        }
        else
        {
            problems.push(file + ": every item in " + field + " must be text with no stray spaces");
        }
    }

    return list;
}

/**
 * Read one term file.
 *
 * @param filePath - The file.
 * @param problems - Where to add problems.
 * @returns The term, or undefined if the file cannot be used.
 */
function readTerm(filePath: string, problems: Array<string>): Term | undefined
{
    const relativePath = path.relative(termsDirectory, filePath).split(path.sep).join("/");
    const file = "terms/" + relativePath;
    const category = path.posix.dirname(relativePath);
    const id = path.posix.basename(relativePath, ".yml");
    const data: unknown = parse(fs.readFileSync(filePath, "utf8"));

    if (typeof data !== "object" || data === null || Array.isArray(data))
    {
        problems.push(file + ": expected a mapping of fields");

        return undefined;
    }

    const fields = data as Record<string, unknown>;

    for (const field of Object.keys(fields))
    {
        if (!termFields.has(field))
        {
            problems.push(file + ": unknown field " + field);
        }
    }

    if (!isCleanText(fields.term) || !isCleanText(fields.definition))
    {
        problems.push(file + ": needs a term and a definition");

        return undefined;
    }

    if (fields.etymology !== undefined && !isCleanText(fields.etymology))
    {
        problems.push(file + ": etymology must be text with no stray spaces");
    }

    const forms = [fields.term, ...readTextList(fields.forms, "forms", file, problems)];

    return {
        id,
        category,
        term: fields.term,
        forms,
        exceptions: readTextList(fields.exceptions, "exceptions", file, problems),
        definition: fields.definition,
        etymology: isCleanText(fields.etymology) ? fields.etymology : undefined,
        seeAlso: readTextList(fields.see_also, "see_also", file, problems),
    };
}

/**
 * Check whether a phrase contains one of a term's forms as a whole word.
 *
 * @param phrase - The phrase.
 * @param forms - The term's forms.
 * @returns Whether it does.
 */
function containsForm(phrase: string, forms: Array<string>): boolean
{
    const words = " " + phrase.toLowerCase().replace(/[^\p{L}\p{N}-]+/gu, " ") + " ";

    for (const form of forms)
    {
        if (words.includes(" " + form.toLowerCase() + " "))
        {
            return true;
        }
    }

    return false;
}

/**
 * Get the path of a term's file, for problems.
 *
 * @param term - The term.
 * @returns The path, relative to the repository.
 */
function getTermFile(term: Term): string
{
    return path.posix.join("terms", term.category, term.id + ".yml");
}

/**
 * Check the terms against each other and the categories.
 *
 * @param categories - The categories.
 * @param terms - The terms.
 * @param problems - Where to add problems.
 */
function checkTerms(categories: Array<Category>, terms: Array<Term>, problems: Array<string>): void
{
    const categoryIds = new Set<string>();
    const termIds = new Set<string>();
    const termByForm = new Map<string, string>();

    for (const category of categories)
    {
        categoryIds.add(category.id);
    }

    for (const term of terms)
    {
        termIds.add(term.id);
    }

    for (const term of terms)
    {
        const file = getTermFile(term);

        if (term.category === ".")
        {
            problems.push(file + ": terms go in a category folder, not directly in terms/");
        }
        else if (!categoryIds.has(term.category))
        {
            problems.push(file + ": the folder " + term.category + " is not in categories.yml");
        }

        if (!idPattern.test(term.id))
        {
            problems.push(file + ": file names are lowercase words joined by hyphens");
        }

        if (term.definition.length > maximumDefinitionLength)
        {
            problems.push(file + ": the definition is " + term.definition.length + " characters; keep it under " + maximumDefinitionLength);
        }

        if (!term.definition.endsWith("."))
        {
            problems.push(file + ": the definition must end with a period");
        }

        for (const form of term.forms)
        {
            const key = form.toLowerCase();
            const owner = termByForm.get(key);

            if (owner && owner !== term.id)
            {
                problems.push(file + ": the form \"" + form + "\" also belongs to " + owner + "; a form can link to only one term");
            }
            else if (owner)
            {
                problems.push(file + ": the form \"" + form + "\" is listed twice");
            }

            termByForm.set(key, term.id);
        }

        for (const exception of term.exceptions)
        {
            if (!containsForm(exception, term.forms))
            {
                problems.push(file + ": the exception \"" + exception + "\" contains none of the term's forms");
            }
        }

        for (const related of term.seeAlso)
        {
            if (related === term.id)
            {
                problems.push(file + ": see_also lists the term itself");
            }
            else if (!termIds.has(related))
            {
                problems.push(file + ": see_also names " + related + ", which has no file");
            }
        }
    }
}

/**
 * Read the glossary's source files and check them.
 *
 * @returns The categories, the terms and any problems.
 */
export function readGlossarySource(): GlossarySource
{
    const problems = new Array<string>();
    const categories = readCategories(problems);
    const terms = new Array<Term>();
    const seenIds = new Map<string, string>();

    for (const filePath of findTermFiles(termsDirectory))
    {
        const term = readTerm(filePath, problems);

        if (!term)
        {
            continue;
        }

        const earlier = seenIds.get(term.id);

        if (earlier)
        {
            problems.push(getTermFile(term) + ": the id " + term.id + " is also used in " + earlier);
            continue;
        }

        seenIds.set(term.id, term.category);
        terms.push(term);
    }

    terms.sort((first, second) => first.id.localeCompare(second.id));
    checkTerms(categories, terms, problems);

    return { categories, terms, problems };
}
