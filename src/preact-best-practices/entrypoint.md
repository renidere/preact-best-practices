# Preact Best Practices

Structured guidance for company Preact applications that use Vite, TypeScript, Zustand, MUI, and other React-oriented libraries through compat-friendly setup.

## When to Apply

Reference this skill when:

- writing or refactoring Preact components, hooks, and UI flows
- reviewing code for performance issues or compatibility risks
- integrating React ecosystem libraries into Preact apps
- making decisions about state, imports, bundle size, or browser work

## When Not to Apply

Do not use this skill as the default guidance for:

- pure React or Next.js codebases that are not preserving a Preact compat boundary
- backend-only or infrastructure-only tasks
- generic TypeScript questions with no meaningful connection to the Preact frontend stack
- requests that explicitly need React-only or Next.js-only APIs without a Preact compatibility goal

## Company Guardrails

- Keep `TSX` as the default authoring model.
- Do not recommend `HTM`, import maps, or buildless architecture by default.
- Do not introduce `@preact/signals` by default.
- Do not rewrite `react` imports to `preact` or the reverse without a concrete need.
- Do not recommend `React.cache()`, `next/dynamic`, server actions, `after()`, or other Next.js or React-only APIs unless compatibility is confirmed and the project actually uses them.
- Do not recommend `useMemo` or `useCallback` by default as blanket rerender fixes.

## Working Model

- Treat guardrails as the first filter before suggesting a refactor.
- Prefer changes that preserve current working patterns unless there is a concrete correctness, compatibility, or measurable performance reason to change them.
- Rules in categories 0–4 (guardrails through client data) are structural and apply regardless of runtime performance. Rules in categories 5–6 (re-render shape and rendering) require an observable symptom or a clear anti-pattern. Rules in category 7 (JavaScript hot paths) require profiler evidence.
- Use the default review order in `references/review-order.md` when doing reviews or refactors.
- Read `references/gotchas.md` when the task touches compat boundaries, state model changes, storage persistence, or performance advice that is easy to over-apply.
- Read individual files in `rules/` for atomic guidance and examples.
