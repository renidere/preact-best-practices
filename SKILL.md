---
name: preact-best-practices
description: Use when writing, reviewing, or refactoring Preact, preact/hooks, preact/compat, Vite, Zustand, MUI, or React-ecosystem integrations in company Preact + TypeScript apps. Preserve compat assumptions, follow existing patterns, and apply only framework-safe performance rules.
metadata:
  author: Transported Labs Frontend
  version: "3.2.0"
---

# Preact Best Practices

Structured guidance for company Preact applications that use Vite, TypeScript, Zustand, MUI, and other React-oriented libraries through compat-friendly setup.

## When to Apply

Reference this skill when:

- Writing or refactoring Preact components, hooks, and UI flows
- Reviewing code for performance issues or compatibility risks
- Integrating React ecosystem libraries into Preact apps
- Making decisions about state, imports, bundle size, or browser work

## Company Guardrails

- Keep `TSX` as the default authoring model.
- Do not recommend `HTM`, import maps, or buildless architecture by default.
- Do not introduce `@preact/signals` by default.
- Do not rewrite `react` imports to `preact` or the reverse without a concrete need.
- Do not recommend `React.cache()`, `next/dynamic`, server actions, `after()`, or other Next.js or React-only APIs unless compatibility is confirmed and the project actually uses them.
- Do not recommend `useMemo` or `useCallback` by default as blanket rerender fixes.

## Rule Categories by Priority

| Priority | Category                      | Impact      | Prefix       |
| -------- | ----------------------------- | ----------- | ------------ |
| 0        | Guardrails and Scope          | HIGH        | `guard-`     |
| 1        | Async and Data Flow           | CRITICAL    | `async-`     |
| 2        | Bundle and Loading Hygiene    | CRITICAL    | `bundle-`    |
| 3        | Compatibility and Integration | HIGH        | `compat-`    |
| 4        | Client Data and Storage       | MEDIUM-HIGH | `client-`    |
| 5        | Store and Re-render Shape     | MEDIUM-HIGH | `rerender-`  |
| 6        | Rendering and Browser Work    | MEDIUM      | `rendering-` |
| 7        | JavaScript Hot Paths          | LOW-MEDIUM  | `js-`        |

## Quick Reference

### 0. Guardrails and Scope (HIGH)

- `guard-no-default-htm` - Keep TSX as the default for Preact + Vite apps
- `guard-no-default-signals` - Do not replace existing store patterns with signals by default
- `guard-no-import-churn` - Avoid mass import rewrites between `react` and `preact`
- `guard-no-react-next-only-apis` - Exclude Next.js and React-only APIs by default

### 1. Async and Data Flow (CRITICAL)

- `async-cheap-condition-before-await` - Check cheap sync guards before awaiting
- `async-defer-await` - Move `await` into the branch that needs it
- `async-parallel` - Run independent async work in parallel

### 2. Bundle and Loading Hygiene (CRITICAL)

- `bundle-barrel-imports` - Prefer direct imports in bundle-sensitive paths
- `bundle-analyzable-paths` - Keep import and file paths statically analyzable
- `bundle-conditional` - Load heavy or optional modules only when needed
- `bundle-defer-third-party` - Defer non-critical third-party code

### 3. Compatibility and Integration (HIGH)

- `compat-preserve-import-boundaries` - Preserve established compat boundaries
- `compat-verify-react-api-support` - Verify React-oriented API support before recommending it in Preact

### 4. Client Data and Storage (MEDIUM-HIGH)

- `client-localstorage-schema` - Version storage keys and keep stored data minimal

### 5. Store and Re-render Shape (MEDIUM-HIGH)

- `rerender-defer-reads` - Do not subscribe to state used only in callbacks
- `rerender-dependencies` - Narrow effect dependencies to the primitive values actually used
- `rerender-derived-state-no-effect` - Derive cheap state in render, not effects
- `rerender-functional-setstate` - Use functional state updates when the next value depends on the current one
- `rerender-move-effect-to-event` - Keep interaction logic in event handlers when possible
- `rerender-narrow-store-selectors` - Subscribe to narrow Zustand or store slices
- `rerender-no-inline-components` - Do not define components inside components
- `rerender-split-combined-hooks` - Split independent computations or effects by dependency shape

### 6. Rendering and Browser Work (MEDIUM)

- `rendering-passive-event-listeners` - Use passive listeners for scroll and touch when safe
- `rendering-content-visibility` - Consider `content-visibility` for long scroll-heavy sections
- `rendering-script-defer-async` - Use `defer` or `async` for non-critical script tags

### 7. JavaScript Hot Paths (LOW-MEDIUM)

- `js-early-exit` - Prefer early returns and simpler control flow
- `js-set-map-lookups` - Use `Set` or `Map` for repeated lookups on meaningful collections
- `js-combine-iterations` - Combine repeated passes only when the code stays clear

## How to Use

Use this skill as the default frontend guidance for company Preact apps.

For deeper guidance:

- Read individual rule files under `rules/`
- Use `AGENTS.md` for the compiled full guide

When a rule conflicts with an established local pattern, preserve the local pattern unless there is a concrete correctness, compatibility, or measurable performance reason to change it.
