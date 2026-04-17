# AGENTS.md

## Purpose

This repository authors and packages the installable `preact-best-practices` skill.

Edit the source model under `src/preact-best-practices/`. Do not treat this root `AGENTS.md` as runtime skill content.

## Source Of Truth

- `src/preact-best-practices/manifest.yaml` - runtime metadata and release metadata
- `src/preact-best-practices/sections.yaml` - section ordering, impacts, and prefixes
- `src/preact-best-practices/entrypoint.md` - lean runtime entrypoint that becomes the core of generated `SKILL.md`
- `src/preact-best-practices/rules/*.md` - atomic rule files
- `src/preact-best-practices/references/*.md` - runtime deep references
- `src/preact-best-practices/evals/` - trigger and output eval seeds
- `src/preact-best-practices/vendors/openai.yaml` - Codex-specific adapter metadata

## Generated Files

- `dist/preact-best-practices/` is generated output
- never hand-edit files in `dist/`
- regenerate runtime artifacts with `npm run build:skill`
- if generated output is wrong, fix the source files or the build scripts instead of patching `dist/`

## Commands

1. `npm install`
2. `npm run validate:skill`
3. `npm run build:skill`
4. `npm run install:skill`

## Editing Workflow

1. Update source files in `src/preact-best-practices/`
2. Keep runtime guidance in `entrypoint.md` lean and procedural
3. Keep deep or optional guidance in `references/`
4. Add new rule files under `src/preact-best-practices/rules/`
5. Update `sections.yaml` only when adding or renaming a section
6. Run validation and build before finishing

## Content Boundaries

- authoring-only docs belong in `docs/authoring/`, not in runtime references
- trigger examples belong in `examples/`
- eval fixtures belong in `evals/fixtures/`
- runtime references should help the installed skill, not explain how this repository works

## Repository Policy

- the root repo should not contain a hand-authored runtime `SKILL.md`
- the root repo should not contain top-level runtime `rules/`
- the installable artifact lives in `dist/preact-best-practices/`
- local multi-tool test installs are symlinked into repo-local `.agents/`, `.claude/`, and `.opencode/`
