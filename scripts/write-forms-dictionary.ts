import * as fs from "node:fs";
import * as path from "node:path";

import { readGlossarySource, rootDirectory } from "./glossary-source.ts";

// Writes every word in the terms' forms and exceptions to scratch/forms.txt, so the spell check
// accepts them.

const words = new Set<string>();

for (const term of readGlossarySource().terms)
{
    for (const form of [...term.forms, ...term.exceptions])
    {
        for (const word of form.split(/[\s-]+/))
        {
            words.add(word);
        }
    }
}

fs.mkdirSync(path.join(rootDirectory, "scratch"), { recursive: true });
fs.writeFileSync(path.join(rootDirectory, "scratch", "forms.txt"), [...words].sort().join("\n") + "\n");
