import * as fs from "node:fs";
import * as path from "node:path";

import type { Category } from "./glossary-source.ts";
import { readGlossarySource, rootDirectory } from "./glossary-source.ts";

// Builds dist/glossary.json from the term files, and copies the schema it follows beside it.

/**
 * The output's metadata.
 */
type Metadata = {
    /**
     * The version of schemas/glossary.schema.json the output follows.
     */
    schema_version: string;

    /**
     * The license, as an SPDX id.
     */
    license: string;

    /**
     * Who to credit.
     */
    attribution: string;

    /**
     * How many terms the glossary holds.
     */
    term_count: number;
};

/**
 * A term in the output.
 */
type TermOutput = {
    /**
     * The term as the glossary lists it.
     */
    term: string;

    /**
     * The category's id.
     */
    category: string;

    /**
     * Every spelling that links to the term, the term itself first.
     */
    forms: Array<string>;

    /**
     * Phrases that contain a form but don't link to the term.
     */
    exceptions?: Array<string>;

    /**
     * The plain-English definition.
     */
    definition: string;

    /**
     * Where the word comes from.
     */
    etymology?: string;

    /**
     * The ids of related terms.
     */
    see_also?: Array<string>;
};

/**
 * The whole output.
 */
type GlossaryOutput = {
    /**
     * The output's metadata.
     */
    _metadata: Metadata;

    /**
     * The categories, in the glossary's order.
     */
    categories: Array<Category>;

    /**
     * The terms, by id.
     */
    terms: Record<string, TermOutput>;
};

const schemaPath = path.join(rootDirectory, "schemas", "glossary.schema.json");
const distDirectory = path.join(rootDirectory, "dist");

/**
 * Read the schema version the schema file declares for its output.
 *
 * @returns The version.
 */
function readSchemaVersion(): string
{
    const schema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));

    return schema.$defs.Metadata.properties.schema_version.const;
}

const source = readGlossarySource();

if (source.problems.length > 0)
{
    for (const problem of source.problems)
    {
        console.error(problem);
    }

    console.error("Not built: " + source.problems.length + " problems");
    process.exit(1);
}

const terms: Record<string, TermOutput> = {};

for (const term of source.terms)
{
    const output: TermOutput = { term: term.term, category: term.category, forms: term.forms, definition: term.definition };

    if (term.exceptions.length > 0)
    {
        output.exceptions = term.exceptions;
    }

    if (term.etymology)
    {
        output.etymology = term.etymology;
    }

    if (term.seeAlso.length > 0)
    {
        output.see_also = term.seeAlso;
    }

    terms[term.id] = output;
}

const glossary: GlossaryOutput = {
    _metadata: {
        schema_version: readSchemaVersion(),
        license: "CC-BY-4.0",
        attribution: "Open Paleo contributors",
        term_count: source.terms.length,
    },
    categories: source.categories,
    terms,
};

fs.mkdirSync(distDirectory, { recursive: true });
fs.writeFileSync(path.join(distDirectory, "glossary.json"), JSON.stringify(glossary, null, 2) + "\n");
fs.copyFileSync(schemaPath, path.join(distDirectory, "glossary.schema.json"));
console.log("Built dist/glossary.json: " + source.terms.length + " terms");
