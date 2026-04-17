# Review Order

When reviewing or refactoring company Preact code, use this order by default:

1. Check whether the proposed change violates a guardrail or a compat boundary.
2. Remove sequential async work that can be parallelized or deferred.
3. Cut eager bundle work and defer non-critical third-party loading.
4. Preserve compat boundaries and verify React-oriented API support.
5. Keep client storage minimal, versioned, and safe to evolve.

Steps 1–5 are structural: they improve correctness, compatibility, and data hygiene regardless of runtime performance. Apply them whenever the code pattern matches.

6. Narrow store subscriptions and remove effect-mirrored state.
7. Address browser rendering only on the actual UI path that needs it.

Steps 6–7 improve re-render efficiency and browser work. Apply them when the code shows a clear anti-pattern (e.g., effect-mirrored derived state, inline component definitions inside render) **or** when there is an observable performance symptom. Do not apply them speculatively to code that already renders within acceptable thresholds.

8. Use JavaScript micro-optimizations only after the bigger wins are gone.

Step 8 applies only when a profiler identifies a concrete hot path and the change produces a measurable improvement.

## Response Expectations

- Say whether a recommendation is driven by a guardrail, async rule, compat rule, rerender rule, rendering rule, or JavaScript hot-path rule.
- For steps 6–8, state the observed symptom or profiler finding that motivates the change. If no symptom exists, still note the anti-pattern but flag it as a low-priority suggestion.
- Prefer guidance that preserves the current stack over framework-purity rewrites.
- If a local pattern already works and is consistent, keep it unless there is a concrete correctness, compatibility, or measurable performance reason to change it.
