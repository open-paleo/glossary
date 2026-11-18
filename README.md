# Open Paleo Glossary

Plain-English definitions of the terms used in paleontology: anatomy such as *opisthocoelous*
and *ilium*, naming terms such as *holotype* and *nomen dubium*, and the words for directions,
specimens, family trees and rocks. [open-paleo.org](https://open-paleo.org) uses it to explain
the terms in its genus pages, and anyone can use it under the license below.

## Using the glossary

Every push to `main` builds `dist/glossary.json`. Alongside it are the JSON Schema it follows,
`dist/glossary.schema.json`, and TypeScript types, `dist/bindings/glossary.d.ts`.

```json
{
  "_metadata": { "schema_version": "1.0.0", "license": "CC-BY-4.0", "attribution": "Open Paleo contributors", "term_count": 6 },
  "categories": [
    { "id": "anatomy/vertebrae", "name": "Backbone", "description": "The vertebrae of the neck, back, hips and tail, and their parts." }
  ],
  "terms": {
    "opisthocoelous": {
      "term": "opisthocoelous",
      "category": "anatomy/vertebrae",
      "forms": ["opisthocoelous"],
      "definition": "Describes a vertebra whose main body is rounded at the front and hollow at the back, so each one fits into the next like a ball and socket.",
      "etymology": "Greek opisthen, \"behind\", and koilos, \"hollow\".",
      "see_also": ["procoelous", "amphicoelous"]
    }
  }
}
```

To find terms in text, match each term's `forms` case-insensitively as whole words, trying the
longest first, so "caudal vertebrae" wins over "caudal". No form belongs to two terms.

`schema_version` follows semantic versioning: a new major version is a breaking change, a new
minor version adds fields. [CHANGELOG.md](CHANGELOG.md) lists every change to the output.

## Layout

Each term is one file, `terms/<category>/<id>.yml`, where the folder is the term's category and
the file name is its id. [categories.yml](categories.yml) names the categories and gives their
order. [CONTRIBUTING.md](CONTRIBUTING.md) describes the file format and how to write a
definition.

## License

The glossary is licensed under [CC BY 4.0](LICENSE). Credit "Open Paleo contributors".
