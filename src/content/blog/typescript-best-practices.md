---
title: "TypeScript Best Practices: Writing Code That Scales"
description: "Practical TypeScript conventions for teams: strict mode, smart typing patterns, and the mistakes to avoid in large codebases."
pubDate: 2026-08-15
category: "best-practices"
tags: ["typescript", "javascript", "code-quality"]
author: "Kaonix Team"
---

TypeScript pays off most in large codebases — but only if used well. Here are the practices that matter.

## 1. Enable Strict Mode

Start every project with:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true
  }
}
```

`strict` catches entire classes of bugs at compile time. It may feel painful on legacy code, but it's worth a gradual migration.

## 2. Prefer `unknown` Over `any`

`any` disables type checking; `unknown` forces you to validate first:

```typescript
function parse(json: string): unknown {
  return JSON.parse(json);
}

const data = parse(input);
if (typeof data === "object" && data !== null && "id" in data) {
  // Safe to use here
}
```

## 3. Use `as const` and Literal Types

```typescript
type Status = "idle" | "loading" | "success" | "error";

const ROUTES = {
  home: "/",
  blog: "/blog",
} as const;
```

This gives you autocomplete and prevents typos — no enums needed.

## 4. Derive Types, Don't Duplicate

Let TypeScript do the work:

```typescript
interface User {
  id: string;
  email: string;
  passwordHash: string;
}

// Derived types stay in sync automatically
type PublicUser = Omit<User, "passwordHash">;
type UserDraft = Partial<Pick<User, "email">>;
```

## 5. Type Assertions Are a Last Resort

Avoid `as` unless you genuinely know more than the compiler. If you must, isolate and document it.

```typescript
// Acceptable with justification
const canvas = document.getElementById("draw") as HTMLCanvasElement;
```

## 6. Structure Types Around Your Domain

Model your business logic explicitly instead of scattering primitives:

```typescript
// Weak
function createOrder(userId: string, qty: number, price: number) {}

// Strong
interface UserId { value: string }
type Quantity = number & { __brand: "qty" };
function createOrder(userId: UserId, quantity: Quantity, unitPrice: Price) {}
```

## Quick Checklist

- [ ] `strict: true` everywhere
- [ ] No bare `any` (enforce with ESLint)
- [ ] Prefer union types over enums
- [ ] Use utility types (`Pick`, `Omit`, `Record`) to avoid duplication
- [ ] Validate external data at runtime (e.g., Zod)

Good typing is documentation that never goes stale — invest in it early.
