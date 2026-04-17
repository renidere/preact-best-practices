---
title: Defer State Reads to the Usage Point
impact: MEDIUM-HIGH
impactDescription: removes rerenders caused by subscriptions used only in callbacks
tags: rerender, state, subscriptions
---

## Defer State Reads to the Usage Point

**Impact: MEDIUM-HIGH (removes rerenders caused by subscriptions used only in callbacks)**

Do not subscribe a component to state that is only needed when a user clicks a button or submits a form.

**Incorrect (rerenders whenever the store value changes):**

```typescript
const authToken = useAuthStore((state) => state.token);

const onSubmit = () => submitForm(authToken);
```

**Correct (read the value at the point of use instead):**

```typescript
const onSubmit = () => submitForm(useAuthStore.getState().token);
```

> This pattern is safe in **synchronous** callbacks where the value is read immediately. In an `async` callback, `getState()` after an `await` reads the store at an unpredictable point in time — the value may have changed between the call site and the `await` resolution. For async work, capture the value **before** the first `await`:

```typescript
const onSubmit = async () => {
  const token = useAuthStore.getState().token
  await validate()
  submitForm(token)
}
```

Reference: [Zustand getState](https://zustand.docs.pmnd.rs/docs/api/getState)
