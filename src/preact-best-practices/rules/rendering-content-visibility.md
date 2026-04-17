---
title: Consider Content Visibility for Long Sections
impact: MEDIUM
impactDescription: reduces browser rendering work for long scroll-heavy pages
tags: rendering, css, browser, lists
---

## Consider Content Visibility for Long Sections

**Impact: MEDIUM (reduces browser rendering work for long scroll-heavy pages)**

On long scroll-heavy pages, `content-visibility` can reduce rendering work, but only when layout measurements and sticky behavior remain correct.

**Incorrect (renders every large offscreen section eagerly):**

```css
.resultsSection {
  min-height: 800px;
}
```

**Correct (allow the browser to skip offscreen rendering work):**

```css
.resultsSection {
  content-visibility: auto;
  contain-intrinsic-size: 800px;
}
```

Reference: [content-visibility](https://web.dev/articles/content-visibility)
