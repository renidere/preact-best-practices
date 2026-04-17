# Preact Best Practices

Authoring repository for the installable `preact-best-practices` skill.

This repo now follows a clean `authoring repo -> generated skill artifact` model:

- edit source files in `src/preact-best-practices/`
- generate the runtime skill into `dist/preact-best-practices/`
- keep root `AGENTS.md` focused on maintaining this repo, not on runtime skill guidance

Several portable performance rule ideas and example blocks are adapted from `vercel-react-best-practices`, then filtered through company guardrails for `Preact + Vite + TypeScript + React-ecosystem` apps.

## Repo Model

- `src/preact-best-practices/` - canonical source of truth
- `dist/preact-best-practices/` - generated installable artifact
- `scripts/` - build, validate, and local install helpers
- `docs/authoring/` - authoring-only docs and templates

## Source Layout

- `manifest.yaml` - skill metadata and release metadata
- `sections.yaml` - section ordering, prefixes, and impact labels
- `entrypoint.md` - lean runtime entrypoint that becomes the core of generated `SKILL.md`
- `rules/*.md` - atomic rule files
- `references/*.md` - deeper runtime references loaded on demand
- `examples/` - human-readable trigger examples
- `evals/` - trigger and output eval seeds
- `vendors/openai.yaml` - Codex-specific adapter metadata

## Commands

1. `npm install`
2. `npm run validate:skill`
3. `npm run build:skill`
4. `npm run install:skill`

## Workflow

1. Edit source files under `src/preact-best-practices/`
2. Run `npm run validate:skill`
3. Run `npm run build:skill`
4. Inspect `dist/preact-best-practices/`
5. Optionally run `npm run install:skill` to symlink the built artifact into local `.agents`, `.claude`, and `.opencode` folders for testing

## Design Goals

- keep the runtime skill specific to company Preact apps
- remove manual sync between multiple runtime artifacts
- preserve local project patterns unless there is a concrete need to change them
- optimize for predictable AI-assisted maintenance rather than framework purity
- support eval-driven iteration and multi-tool distribution from one source model
