---
title: Version and Minimize localStorage Data
impact: MEDIUM-HIGH
impactDescription: prevents stale schema bugs and accidental persistence of unnecessary data
tags: client, localstorage, storage, versioning
---

## Version and Minimize localStorage Data

**Impact: MEDIUM-HIGH (prevents stale schema bugs and accidental persistence of unnecessary data)**

Persist only the fields the UI actually needs, version the key, and guard reads and writes with `try/catch`.

**Incorrect (stores an unversioned broad object with no failure handling):**

```typescript
localStorage.setItem("userConfig", JSON.stringify(fullUserObject));
const data = localStorage.getItem("userConfig");
```

**Correct (store minimal data under a versioned key):**

```typescript
const VERSION = "v2";

function saveConfig(config: { theme: string; language: string }) {
  try {
    localStorage.setItem(`userConfig:${VERSION}`, JSON.stringify(config));
  } catch {
    // Throws in incognito/private browsing, quota exceeded, or disabled
  }
}

function loadConfig() {
  try {
    const data = localStorage.getItem(`userConfig:${VERSION}`);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

function migrate() {
  try {
    const v1 = localStorage.getItem("userConfig:v1");
    if (v1) {
      const old = JSON.parse(v1);
      saveConfig({
        theme: old.darkMode ? "dark" : "light",
        language: old.lang,
      });
      localStorage.removeItem("userConfig:v1");
    }
  } catch {}
}
```

**Store minimal fields from server responses:**

```typescript
function cachePrefs(user: FullUser) {
  try {
    localStorage.setItem(
      "prefs:v1",
      JSON.stringify({
        theme: user.preferences.theme,
        notifications: user.preferences.notifications,
      }),
    );
  } catch {}
}
```

Reference: [Window.localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
