# Preact Best Practices

A structured repository for creating and maintaining company Preact best practices optimized for agents and LLMs.

Several portable performance rule ideas and example blocks are adapted from `vercel-react-best-practices`, then filtered through company guardrails for `Preact + Vite + TypeScript + React-ecosystem` apps. Company-specific guardrails, compat boundaries, and tool assumptions are maintained separately in this skill.

## Structure

- `rules/` - Individual rule files (one per rule)
  - `_sections.md` - Section metadata (titles, impacts, descriptions)
  - `_template.md` - Template for creating new rules
  - `area-description.md` - Individual rule files
- `metadata.json` - Document metadata (version, organization, abstract)
- `AGENTS.md` - Compiled guide for deeper review
- `SKILL.md` - Trigger layer and quick reference used by OpenCode

## Rule Prefixes

- `guard-` - Scope, churn prevention, and company defaults
- `async-` - Async control flow and waterfall removal
- `bundle-` - Bundle size and loading hygiene
- `compat-` - React ecosystem compatibility and integration boundaries
- `client-` - Browser storage and client-side persistence discipline
- `rerender-` - Store shape and rerender control
- `rendering-` - Browser rendering and client-side UX work
- `js-` - JavaScript hot-path rules

## Maintenance Notes

This skill is intentionally modular:

1. `SKILL.md` stays short so loading it does not bloat context.
2. `AGENTS.md` provides a compiled, readable full guide.
3. `rules/*.md` keeps individual recommendations atomic and easy to audit.

When adding a rule:

1. Copy `rules/_template.md`
2. Choose the correct prefix
3. Add a clear bad/good example
4. Update `AGENTS.md` and `SKILL.md` quick references if the new rule changes the default guidance

## Design Goals

- Keep the default frontend skill specific to company Preact apps
- Reduce conflicting guidance from overlapping generic React skills
- Preserve local project patterns unless there is a concrete need to change them
- Optimize for predictable AI-assisted maintenance rather than framework purity
- Use portable, didactic rule examples instead of treating legacy local code as a best-practice source
