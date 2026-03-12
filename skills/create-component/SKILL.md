---
name: create-component, modify-component
description: Guide for creating new Next.js React components with TDD, proper structure, and project conventions. Use when creating a new component, adding a UI element, building a new feature component, or when the user asks to create, add, or build a component.
---

Use this skill when:

- creating a new React component
- building a UI feature
- adding a new reusable component

# Create React Component

## Workflow (strict order)

1. **Plan** — reuse check, placement, naming
2. **Write tests first** — all scenarios and edge cases
3. **Run tests** — confirm they fail (red)
4. **Build component** — implement until all tests pass (green)
5. **Cleanup** — split if > 400 LOC, extract duplicated logic
6. **Final test run** — full suite, zero failures

---

## Reuse check (do this BEFORE writing any code)

1. Search `src/components/`, `src/hooks/`, `src/utils/`, `src/lib/` for similar logic or UI patterns
2. If a pattern already exists 2+ times → extract a shared component or utility instead of repeating it
3. Check `src/types.ts` for existing interfaces before defining new ones
4. Check `src/hooks/` for hooks that already cover your use case

---

## TDD process

Write tests **before** the component. Create co-located test file: `ComponentName.test.tsx`

### Edge cases to cover (Cursor often misses these)

- Empty / loading / error states
- Boundary values: empty arrays, `null`, `undefined`, very long strings
- Conditional rendering — every branch must have a test
- Callbacks fire with correct arguments and correct number of times
- Rapid interactions (double-clicks, spam inputs)

Run tests and **confirm all fail** before writing the component. If any pass, the test is not testing new behavior.

---

## Code structure rules

### Extract logic out of JSX

The `return` block should be a clean JSX tree. Move logic into named functions above it:

```tsx
function getStatusLabel(status: Status): string {
  if (status === "active") return "Playing";
  return "Paused";
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const label = getStatusLabel(status);
  return <span>{label}</span>;
}
```
