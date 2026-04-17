---
title: Use Functional State Updates
impact: MEDIUM
impactDescription: prevents stale closures and reduces callback instability
tags: rerender, hooks, state, callbacks
---

## Use Functional State Updates

**Impact: MEDIUM (prevents stale closures and reduces callback instability)**

When the next state depends on the current state, prefer the functional update form so callbacks do not need to capture stale values.

**Incorrect (requires state as a callback dependency and risks stale closures):**

```typescript
function TodoList() {
  const [items, setItems] = useState(initialItems)

  const addItems = useCallback((newItems: Item[]) => {
    setItems([...items, ...newItems])
  }, [items])

  const removeItem = useCallback((id: string) => {
    setItems(items.filter((item) => item.id !== id))
  }, [])

  return <ItemsEditor items={items} onAdd={addItems} onRemove={removeItem} />
}
```

**Correct (always uses the latest state value):**

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
