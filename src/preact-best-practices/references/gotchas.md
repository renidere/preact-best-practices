# Gotchas

- Keep `react` import boundaries intact in compat-sensitive areas unless there is a concrete migration goal or bug.
- Do not suggest `@preact/signals` just because the app uses Preact. Existing Zustand, RTK, or provider patterns should stay in place by default.
- Do not suggest Next.js or React-only APIs such as `next/dynamic`, server actions, `after()`, or `React.cache()` unless the stack explicitly supports them.
- Do not default to `useMemo` or `useCallback` as blanket rerender fixes. Start with state shape, effect dependencies, selectors, and event placement.
- For persisted browser data, version storage keys, store only minimal fields, and handle read and write failures.
- For async work, cheap synchronous guards should run before awaiting, and independent async work should start together.
- For Zustand and similar stores, optimize selector shape before looking for lower-level render tricks.
- Do not apply re-render, rendering, or JavaScript hot-path rules without an observable symptom, profiler finding, or a clear anti-pattern. Speculative selector narrowing, passive listener additions, or Set/Map rewrites without evidence are premature optimization.
