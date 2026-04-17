# Preact Best Practices

**Version 3.2.0**  
Transported Labs Frontend  
April 2026

> **Note:**  
> This document is designed for agents and LLMs maintaining company Preact applications built with Vite and TypeScript. It prioritizes predictable guidance, compatibility with React-oriented libraries, and performance improvements that are safe for the existing stack.

---

## Abstract

Structured guidance for company Preact applications that use `preact`, `preact/hooks`, Vite, TypeScript, Zustand, MUI, and other React ecosystem libraries. The guide is split into a short trigger layer (`SKILL.md`), modular rule files (`rules/*.md`), and this compiled document for deeper reviews and refactors.

Several portable performance rule examples in this skill are adapted from `vercel-react-best-practices` and then filtered for Preact, Vite, and React-compat safety. Company guardrails and compatibility rules remain specific to this stack.

The intended optimization order is:

1. Prevent framework churn and preserve compatibility boundaries.
2. Remove async waterfalls.
3. Fix bundle and loading mistakes.
4. Keep browser storage and persisted client data disciplined.
5. Narrow subscriptions and rerender triggers.
6. Improve browser rendering only on real UI paths.
7. Use JavaScript micro-optimizations only on proven hot paths.

---

## Table of Contents

1. [Guardrails and Scope](#1-guardrails-and-scope) — **HIGH**
2. [Async and Data Flow](#2-async-and-data-flow) — **CRITICAL**
3. [Bundle and Loading Hygiene](#3-bundle-and-loading-hygiene) — **CRITICAL**
4. [Compatibility and Integration](#4-compatibility-and-integration) — **HIGH**
5. [Client Data and Storage](#5-client-data-and-storage) — **MEDIUM-HIGH**
6. [Store and Re-render Shape](#6-store-and-re-render-shape) — **MEDIUM-HIGH**
7. [Rendering and Browser Work](#7-rendering-and-browser-work) — **MEDIUM**
8. [JavaScript Hot Paths](#8-javascript-hot-paths) — **LOW-MEDIUM**

---

## 1. Guardrails and Scope

**Impact: HIGH**

These rules prevent churn that is expensive, risky, and usually unrelated to the task at hand.

### 1.1 Do Not Recommend HTM by Default

Company apps use `TSX` and Vite. Switching to `HTM` changes tooling and typings without helping most maintenance tasks.

Rule file: [`rules/guard-no-default-htm.md`](./rules/guard-no-default-htm.md)

### 1.2 Do Not Introduce Signals by Default

Do not replace established store or provider patterns with `@preact/signals` unless there is a concrete reason and team intent.

Rule file: [`rules/guard-no-default-signals.md`](./rules/guard-no-default-signals.md)

### 1.3 Avoid Import Churn

Do not mass-rewrite `react` imports to `preact` or the reverse just for purity.

Rule file: [`rules/guard-no-import-churn.md`](./rules/guard-no-import-churn.md)

### 1.4 Exclude React-only and Next.js-only APIs by Default

Do not recommend `React.cache()`, `next/dynamic`, server actions, `after()`, or similar APIs unless the stack actually supports them.

Rule file: [`rules/guard-no-react-next-only-apis.md`](./rules/guard-no-react-next-only-apis.md)

---

## 2. Async and Data Flow

**Impact: CRITICAL**

Waterfalls are usually the highest-value fix in real screens and setup flows.

### 2.1 Check Cheap Conditions Before Await

If a cheap synchronous condition can fail early, evaluate it before awaiting a remote value.

Rule file: [`rules/async-cheap-condition-before-await.md`](./rules/async-cheap-condition-before-await.md)

### 2.2 Defer Await Until Needed

Keep `await` inside the branch that actually needs the result.

Rule file: [`rules/async-defer-await.md`](./rules/async-defer-await.md)

### 2.3 Run Independent Async Work in Parallel

Use `Promise.all()` or early promise creation for independent requests and setup work.

Rule file: [`rules/async-parallel.md`](./rules/async-parallel.md)

---

## 3. Bundle and Loading Hygiene

**Impact: CRITICAL**

After waterfalls, the next common wins come from reducing unnecessary initial work.

### 3.1 Prefer Direct Imports in Bundle-sensitive Paths

Avoid broad barrels in hot or large entry paths when direct imports keep bundles smaller and more analyzable.

Rule file: [`rules/bundle-barrel-imports.md`](./rules/bundle-barrel-imports.md)

### 3.2 Prefer Statically Analyzable Paths

Keep import and file-system paths obvious to the bundler so code splitting and tracing stay narrow and predictable.

Rule file: [`rules/bundle-analyzable-paths.md`](./rules/bundle-analyzable-paths.md)

### 3.3 Load Optional or Heavy Modules Conditionally

If a feature is not needed on first paint, load it with `import()` when it becomes relevant.

Rule file: [`rules/bundle-conditional.md`](./rules/bundle-conditional.md)

### 3.4 Defer Non-critical Third-party Code

Analytics, logging, and optional SDKs should not compete with initial render or first useful paint.

Rule file: [`rules/bundle-defer-third-party.md`](./rules/bundle-defer-third-party.md)

---

## 4. Compatibility and Integration

**Impact: HIGH**

Company apps mix Preact-native code with React-oriented libraries. Compatibility stability matters more than purity.

### 4.1 Preserve Import Boundaries

If a file or integration area already uses a compat-sensitive import style, preserve it unless there is a concrete failure or migration plan.

Rule file: [`rules/compat-preserve-import-boundaries.md`](./rules/compat-preserve-import-boundaries.md)

### 4.2 Verify React API Support Before Recommending It

Do not recommend a React-oriented API in Preact code unless the current setup supports it.

Rule file: [`rules/compat-verify-react-api-support.md`](./rules/compat-verify-react-api-support.md)

---

## 5. Client Data and Storage

**Impact: MEDIUM-HIGH**

Persisted browser data tends to outlive releases. Poor storage discipline creates migrations, stale data bugs, and accidental data exposure.

### 5.1 Version and Minimize localStorage Data

Persist only what the UI actually needs, version the key, and handle read or write failures safely.

Rule file: [`rules/client-localstorage-schema.md`](./rules/client-localstorage-schema.md)

---

## 6. Store and Re-render Shape

**Impact: MEDIUM-HIGH**

Many expensive rerenders are caused by subscription shape, effect misuse, or reading state too early.

### 6.1 Defer State Reads to the Usage Point

Do not subscribe to state that is only used inside an event handler or callback.

Rule file: [`rules/rerender-defer-reads.md`](./rules/rerender-defer-reads.md)

### 6.2 Narrow Effect Dependencies

Effects should depend on the narrow primitive values they actually use, not large objects or wider inputs.

Rule file: [`rules/rerender-dependencies.md`](./rules/rerender-dependencies.md)

### 6.3 Derive Cheap State During Render

Avoid effect-mirrored state when the value can be computed synchronously from current props or state.

Rule file: [`rules/rerender-derived-state-no-effect.md`](./rules/rerender-derived-state-no-effect.md)

### 6.4 Use Functional State Updates

When the next state depends on the current state, prefer functional updates to avoid stale closures and unstable callbacks.

Rule file: [`rules/rerender-functional-setstate.md`](./rules/rerender-functional-setstate.md)

### 6.5 Put Interaction Logic in Events When Possible

If logic is caused by a user interaction, prefer the event handler over an effect chain.

Rule file: [`rules/rerender-move-effect-to-event.md`](./rules/rerender-move-effect-to-event.md)

### 6.6 Narrow Store Selectors

For Zustand and similar stores, subscribe to the smallest useful slice or derived boolean.

Rule file: [`rules/rerender-narrow-store-selectors.md`](./rules/rerender-narrow-store-selectors.md)

### 6.7 Do Not Define Components Inside Components

Inline component definitions create a new component type on each render and can trigger full remounts.

Rule file: [`rules/rerender-no-inline-components.md`](./rules/rerender-no-inline-components.md)

### 6.8 Split Combined Hooks by Dependency Shape

When one hook mixes independent computations or side effects, separate them so changes only rerun the work that actually depends on them.

Rule file: [`rules/rerender-split-combined-hooks.md`](./rules/rerender-split-combined-hooks.md)

---

## 7. Rendering and Browser Work

**Impact: MEDIUM**

These rules focus on browser work after the data and subscription shape are already sane.

### 7.1 Use Passive Event Listeners When Safe

Scroll and touch paths should not block the browser when `preventDefault()` is not needed.

Rule file: [`rules/rendering-passive-event-listeners.md`](./rules/rendering-passive-event-listeners.md)

### 7.2 Consider Content Visibility for Long Sections

Large scroll-heavy screens can sometimes benefit from `content-visibility`, but only when measurements and sticky layout logic stay correct.

Rule file: [`rules/rendering-content-visibility.md`](./rules/rendering-content-visibility.md)

### 7.3 Use Async or Deferred Script Loading

External scripts that are not required for initial parsing should not block the page.

Rule file: [`rules/rendering-script-defer-async.md`](./rules/rendering-script-defer-async.md)

---

## 8. JavaScript Hot Paths

**Impact: LOW-MEDIUM**

These rules are useful, but only after bigger problems are already addressed.

### 8.1 Prefer Early Returns

Simpler control flow is easier to reason about and often avoids unnecessary work.

Rule file: [`rules/js-early-exit.md`](./rules/js-early-exit.md)

### 8.2 Use Set or Map for Repeated Lookups

When membership checks or keyed access happen repeatedly on meaningful collections, `Set` and `Map` usually beat repeated scans.

Rule file: [`rules/js-set-map-lookups.md`](./rules/js-set-map-lookups.md)

### 8.3 Combine Array Passes Only When Clarity Survives

One pass can be better than multiple passes, but not if it creates hard-to-maintain code.

Rule file: [`rules/js-combine-iterations.md`](./rules/js-combine-iterations.md)

---

## Default Review Order

When reviewing or refactoring company Preact code:

1. Check if a suggestion would violate a guardrail.
2. Remove sequential async that can be parallel or deferred.
3. Keep client storage minimal, versioned, and safe to evolve.
4. Narrow store subscriptions and remove effect-mirrored state.
5. Cut eager bundle work and non-critical third-party loading.
6. Address browser rendering only on the actual problem path.
7. Use JavaScript micro-optimizations only after the bigger wins are gone.

## Default Response Expectations

- Say whether the recommendation is driven by a guardrail, async rule, compat rule, rerender rule, rendering rule, or JavaScript hot-path rule.
- Prefer guidance that preserves the current stack over framework-purity rewrites.
- If a local pattern already works and is consistent, keep it unless there is a concrete correctness, compatibility, or measurable performance reason to change it.
