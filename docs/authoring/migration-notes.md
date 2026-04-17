# Migration Notes

This repository started as a hand-maintained skill layout with root-level `SKILL.md`, `metadata.json`, `rules/`, and a compiled `AGENTS.md`.

It now uses an authoring-first model:

- runtime source lives in `src/preact-best-practices/`
- human and agent repo guidance lives in the root `AGENTS.md`
- installable runtime artifacts are generated into `dist/preact-best-practices/`

The main goal of the migration is to remove manual sync between multiple runtime files and make evals, references, and vendor adapters first-class parts of the source model.
