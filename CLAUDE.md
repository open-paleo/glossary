# Claude Code Instructions

Read [CONTRIBUTING.md](CONTRIBUTING.md) before writing a term or changing a script: it gives the
file format, how to write a definition, how to choose forms, and the code style.

- **Write every definition yourself.** Never copy or adapt Wikipedia, textbooks or other
  glossaries. Mark definitions you draft as drafts for the user to review; they need checking by
  someone who knows the anatomy before they are committed
- **Plain English for a lay reader**, one or two sentences, American English
- Run `npm run validate`, `npm run spellcheck`, `npm run build`, `npm run lint` and
  `npm run typecheck` before considering a change complete
- A change to `schemas/glossary.schema.json` changes the output contract that open-paleo/web
  reads: bump `schema_version` (major for breaking changes) and add a CHANGELOG entry

## Git workflow

**Do not commit or push unless explicitly told to.** Show the changes and wait for the user to
say to commit or push.

## Generated output

The build writes `dist/`, which only CI commits. Working files go in `scratch/`, which is never
committed; anything there worth keeping belongs in a GitHub issue.
