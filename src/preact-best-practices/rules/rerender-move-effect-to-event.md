---
title: Put Interaction Logic in Event Handlers
impact: MEDIUM-HIGH
impactDescription: reduces effect churn and makes user-driven logic easier to follow
tags: rerender, effects, events
---

## Put Interaction Logic in Event Handlers

**Impact: MEDIUM-HIGH (reduces effect churn and makes user-driven logic easier to follow)**

If logic exists because the user clicked, typed, or submitted something, prefer the event handler over an effect chain.

**Incorrect (effect reacts after a state flip):**

```typescript
const [shouldSave, setShouldSave] = useState(false);

useEffect(() => {
  if (shouldSave) {
    saveProfile();
  }
}, [shouldSave]);
```

**Correct (run the user action in the handler):**

```typescript
const onSave = async () => {
  await saveProfile();
};
```

Reference: [Synchronizing with effects](https://react.dev/learn/synchronizing-with-effects)
