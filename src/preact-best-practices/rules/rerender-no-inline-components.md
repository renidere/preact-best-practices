---
title: Do Not Define Components Inside Components
impact: MEDIUM-HIGH
impactDescription: prevents full remounts, focus loss, and effect restarts
tags: rerender, components, remount, focus
---

## Do Not Define Components Inside Components

**Impact: MEDIUM-HIGH (prevents full remounts, focus loss, and effect restarts)**

Defining a component inside another component creates a new component type on every render. That often remounts the child, resets local state, and restarts effects.

**Incorrect (creates a new component type on every parent render):**

```typescript
type UserProfileProps = {
  user: { avatarUrl: string; followers: number; posts: number }
  theme: string
}

function UserProfile({ user, theme }: UserProfileProps) {
  const Avatar = () => (
    <img
      src={user.avatarUrl}
      className={theme === 'dark' ? 'avatar-dark' : 'avatar-light'}
    />
  )

  const Stats = () => (
    <div>
      <span>{user.followers} followers</span>
      <span>{user.posts} posts</span>
    </div>
  )

  return (
    <div>
      <Avatar />
      <Stats />
    </div>
  )
}
```

**Correct (define the component once and pass props):**

```typescript
function Avatar({ src, theme }: { src: string; theme: string }) {
  return (
    <img
      src={src}
      className={theme === 'dark' ? 'avatar-dark' : 'avatar-light'}
    />
  )
}

function Stats({ followers, posts }: { followers: number; posts: number }) {
  return (
    <div>
      <span>{followers} followers</span>
      <span>{posts} posts</span>
    </div>
  )
}

function UserProfile({ user, theme }: UserProfileProps) {
  return (
    <div>
      <Avatar src={user.avatarUrl} theme={theme} />
      <Stats followers={user.followers} posts={user.posts} />
    </div>
  )
}
```

Reference: [Preserving and resetting state](https://react.dev/learn/preserving-and-resetting-state)
