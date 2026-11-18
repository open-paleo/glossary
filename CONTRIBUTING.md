# Contributing

## Adding a term

Each term is one YAML file in the folder of its category, named after the term in lowercase
words joined by hyphens: `terms/naming/nomen-dubium.yml`. The folders are listed in
[categories.yml](categories.yml); a new folder needs an entry there.

```yaml
term: nomen dubium
forms: [nomina dubia]
definition: >-
  A name based on fossils that can't be reliably told apart from those of related animals, so it
  may not represent a distinct species or genus.
etymology: Latin, "doubtful name".
see_also: [synonym]
```

| Field | Required | What it holds |
|---|---|---|
| `term` | Yes | The term as the glossary lists it, in lowercase unless it is a name. |
| `definition` | Yes | The definition: one or two sentences, under 400 characters, ending with a period. |
| `forms` | No | Other spellings that should link to this term: plurals, adjectives, adverbs. The term itself is always a form. |
| `exceptions` | No | Phrases that contain a form but use it in another sense, and so shouldn't link: `derived from`. |
| `etymology` | No | Where the word comes from, such as its Latin or Greek roots. |
| `see_also` | No | The ids (file names) of related terms. |

## Writing a definition

Write for a visitor who likes dinosaurs but has no training in anatomy or biology.

- Say what the thing is or does, starting with the definition itself: "A name based on…", not
  "This term refers to…".
- Use everyday words. Where another technical word can't be avoided, explain it in passing ("the
  main body of a vertebra") rather than relying on the reader to look it up.
- When a definition says what a word means, quote the meaning: Manual means "of the hand".
  Write straight quotation marks; the site sets them as curly ones.
- Keep it to one or two sentences. A definition explains the word; it doesn't survey the
  science.
- Write your own definition. Don't copy or adapt Wikipedia, textbooks or other glossaries: their
  licenses don't allow it, or would impose their terms on this glossary.
- Use American English.

## Choosing forms

The site links every form it finds in text to the term, so the forms decide what gets linked.

- List each spelling the dataset uses: `caudal`, `caudals`, `caudal vertebrae`.
- A form can belong to only one term. When a word has two meanings, give the bare word to one
  term and list longer, unambiguous forms on the other: bare *dorsal* goes to the direction, and
  *dorsals* and *dorsal vertebrae* go to the vertebra.
- When a form is usually the term but sometimes plain English, keep it and list the phrases
  that use it the other way as `exceptions`: *derived* lists `derived from`, and *basal* (on
  early-diverging) lists `basal tubera`. Each exception must contain one of the term's forms.
- Leave out words whose everyday meaning is enough.

## Checks

```
npm ci
npm run validate      # the term files and categories.yml
npm run spellcheck    # term files, categories.yml and the docs
npm run build         # writes dist/glossary.json
npm run lint
npm run typecheck
```

`validate` checks that each file has a term and a definition and no unknown fields, that each
definition ends with a period and is under 400 characters, that no form belongs to two terms,
and that every `see_also` names a term that exists. The spell check accepts every word in the
terms' forms and exceptions; add other words, such as Greek roots, to `dictionaries/words.txt`.

## Changing the output

`schemas/glossary.schema.json` describes `dist/glossary.json`, and its
`schema_version` constant is the version the build writes. Removing or renaming a field is a new
major version; adding one is a new minor version. Note every change in
[CHANGELOG.md](CHANGELOG.md).

## Code style

The scripts in `scripts/` follow the same rules as open-paleo/data's, and ESLint enforces the
formatting:

- Allman braces everywhere, including single-statement `if` bodies
- A blank line before every `return`
- Function names start with a verb; a function that returns a value is `get…`, `find…`,
  `create…` or `read…`
- Helpers are `function` declarations; arrows only for short callbacks
- Plain loops over `map`, `filter` and `reduce`, and no functions declared inside loops
- `type`, not `interface`; `Array<T>`, not `T[]`; no `any`
- No abbreviated names; American English in code and comments
- Multi-line JSDoc on every function, type and type field
- Exact dependency versions in `package.json`, of releases at least two weeks old
