import { readGlossarySource } from "./glossary-source.ts";

// Checks the glossary's source files and prints any problems.

const source = readGlossarySource();

for (const problem of source.problems)
{
    console.error(problem);
}

if (source.problems.length > 0)
{
    console.error(source.problems.length + " problems");
    process.exit(1);
}

console.log(source.terms.length + " terms in " + source.categories.length + " categories; no problems");
