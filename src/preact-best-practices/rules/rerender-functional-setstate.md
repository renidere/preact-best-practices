---
title: Use Functional State Updates
impact: MEDIUM
impactDescription: prevents stale closures and reduces callback instability
tags: rerender, hooks, state, callbacks
---

## Use Functional State Updates

**Impact: MEDIUM (prevents stale closures and reduces callback instability)**

When the next state depends on the current state, prefer the functional update form so callbacks do not need to capture stale values.

**Incorrect — two different problems in one block:**

```typescript
function TodoList() {
  const [items, setItems] = useState(initialItems)

  // Problem 1: [items] in deps makes the callback unstable —
  // it changes every time items change, causing children to re-render.
  const addItems = useCallback((newItems: Item[]) => {
    setItems([...items, ...newItems])
  }, [items])

  // Problem 2: [] hides the [items] dependency — stale closure.
  // removeItem always sees the items value from the first render.
  const removeItem = useCallback((id: string) => {
    setItems(items.filter((item) => item.id !== id))
  }, [])

  return <ItemsEditor items={items} onAdd={addItems} onRemove={removeItem} />
}
```

**Correct (always uses the latest state value):**

> `useCallback` is used here because both callbacks are passed as props to a child component — not as a blanket rerender fix. See the guardrail in `entrypoint.md` before adding `useCallback` elsewhere.

```typescript
function TodoList() {
  const [items, setItems] = useState(initialItems)

  const addItems = useCallback((newItems: Item[]) => {
    setItems((curr) => [...curr, ...newItems])
  }, [])

  const removeItem = useCallback((id: string) => {
    setItems((curr) => curr.filter((item) => item.id !== id))
  }, [])

  return <ItemsEditor items={items} onAdd={addItems} onRemove={removeItem} />
}
```

Reference: [Queueing a series of state updates](https://react.dev/learn/queueing-a-series-of-state-updates)
