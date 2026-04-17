# Rationale

This skill exists to keep company Preact guidance specific, predictable, and compatible with the actual stack.

The repo intentionally avoids framework-purity rewrites. Company apps often mix `preact`, `preact/compat`, Zustand, MUI, and other React-oriented libraries. The best advice in that environment is usually the smallest correct change that improves correctness, compatibility, or measurable performance without introducing conceptual churn.

Several portable example patterns are adapted from broader React performance guidance, then filtered through Preact-specific guardrails. The result should feel narrower than a generic React optimization checklist and more reusable than project-specific tribal knowledge.
