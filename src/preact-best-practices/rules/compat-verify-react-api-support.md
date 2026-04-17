---
title: Verify React-oriented API Support Before Recommending It
impact: HIGH
impactDescription: prevents advice that compiles conceptually but fails in the current stack
tags: compat, react, preact, api
---

## Verify React-oriented API Support Before Recommending It

**Impact: HIGH (prevents advice that compiles conceptually but fails in the current stack)**

Do not recommend a React-oriented API in company Preact code unless the current setup supports it.

**Incorrect (recommends a React-only API without checking support):**

```typescript
// useEffectEvent is not available in preact/compat
const onSearch = useEffectEvent((value: string) => {
  sendSearchMetric(value, currentUserId);
});

useEffect(() => {
  subscribe(channel, onSearch);
  return () => unsubscribe(channel, onSearch);
}, [channel]); // currentUserId intentionally excluded via useEffectEvent
```

**Correct (use the "latest ref" pattern as a framework-safe substitute):**

```typescript
// Update the ref synchronously during render — no race condition with the effect below
const callbackRef = useRef<(value: string) => void>();
callbackRef.current = (value) => {
  sendSearchMetric(value, currentUserId);
};

useEffect(() => {
  const handler = (value: string) => callbackRef.current?.(value);
  subscribe(channel, handler);
  return () => unsubscribe(channel, handler);
}, [channel]); // stable: resubscribes only when channel changes
```

> `useEffectEvent` is available in React but absent from `preact/compat`. The "latest ref" pattern is the established Preact-safe substitute: assign the full callback (including all captured variables) to a ref directly during render so it is always current, then call it from a stable wrapper inside the effect. Updating the ref during render — not inside a `useEffect` — avoids a one-render race window where the subscription fires before the effect has run.
>
> If the logic is triggered by user interaction rather than a subscription, move it directly into the event handler per `rerender-move-effect-to-event.md` — the latest ref pattern is for subscriptions and long-lived effects only.

Reference: [Switching to Preact](https://preactjs.com/guide/v10/switching-to-preact/)
