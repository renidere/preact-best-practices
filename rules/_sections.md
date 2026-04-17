# Sections

This file defines all sections, their ordering, impact levels, and descriptions.
The section ID in parentheses is the filename prefix used to group rules.

---

## 0. Guardrails and Scope (guard)

**Impact:** HIGH  
**Description:** Prevent expensive framework churn, incompatible recommendations, and over-eager rewrites.

## 1. Async and Data Flow (async)

**Impact:** CRITICAL  
**Description:** Waterfalls and unnecessary sequential awaits are usually the highest-value fixes in company Preact screens and setup flows.

## 2. Bundle and Loading Hygiene (bundle)

**Impact:** CRITICAL  
**Description:** Reduce unnecessary initial work by controlling imports, optional features, and third-party loading.

## 3. Compatibility and Integration (compat)

**Impact:** HIGH  
**Description:** Preserve the existing balance between Preact-native code and React ecosystem libraries.

## 4. Client Data and Storage (client)

**Impact:** MEDIUM-HIGH  
**Description:** Persisted browser data needs versioning, minimization, and failure handling to stay safe across releases.

## 5. Store and Re-render Shape (rerender)

**Impact:** MEDIUM-HIGH  
**Description:** Fix broad subscriptions, effect-mirrored state, and callback-driven rerender triggers before micro-optimizing.

## 6. Rendering and Browser Work (rendering)

**Impact:** MEDIUM  
**Description:** Improve browser work on real UI paths after data flow and subscriptions are already sane.

## 7. JavaScript Hot Paths (js)

**Impact:** LOW-MEDIUM  
**Description:** Apply JavaScript micro-optimizations only where code shape or profiling suggests a meaningful hot path.
