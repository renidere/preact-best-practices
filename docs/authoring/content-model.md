# Content Model

This repo separates source content from generated runtime artifacts.

## Source Layer

- `manifest.yaml` defines metadata and release metadata.
- `sections.yaml` defines rule grouping and ordering.
- `entrypoint.md` is the lean runtime guidance that loads whenever the skill triggers.
- `rules/*.md` are atomic rule units.
- `references/*.md` are optional deep references that the runtime skill can load on demand.
- `evals/` and `examples/` support iteration and trigger quality.

## Generated Layer

`npm run build:skill` compiles source files into `dist/preact-best-practices/`.

Generated outputs include:

- `SKILL.md`
- `references/full-guide.md`
- `references/rule-index.md`
- copied `rules/`, `references/`, `LICENSE.txt`, and `agents/openai.yaml`
