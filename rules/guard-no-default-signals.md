---
title: Do Not Introduce Signals by Default
impact: HIGH
impactDescription: prevents unnecessary state model churn in apps that already use stores and providers
tags: guardrail, preact, signals, zustand, state
---

## Do Not Introduce Signals by Default

**Impact: HIGH (prevents unnecessary state model churn in apps that already use stores and providers)**

Preact supports signals, but company apps already use established patterns such as Zustand, RTK, and provider-based state. Do not replace those by default in ordinary maintenance work.

**Incorrect (changes the state model without a concrete requirement):**

```typescript
import { signal } from "@preact/signals";

export const currentUser = signal<User | null>(null);
```

**Correct (keep the store pattern already used in that area):**

```typescript
export const useUserStore = create<UserState>()((set) => ({
  currentUser: null,
  setCurrentUser: (currentUser) => set({ currentUser }),
}));
```

Reference: [Zustand documentation](https://zustand.docs.pmnd.rs/)
