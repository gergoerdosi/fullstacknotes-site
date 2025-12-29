---
title: "TypeScript Coding Interview Handbook"
description: "Master the TypeScript technical interview. Covers Generics, Structural Typing, Type Guards, Discriminated Unions, and essential Utility Types like Pick and Omit."
---

## Part 1: The "Why" and The Compiler

Interviewers often start with conceptual questions to see if you understand *why* we use TypeScript, not just *how*.

### 1. TypeScript vs. JavaScript

* **Static vs. Dynamic:** JS is dynamic (types change at runtime). TS is static (types are checked at compile time).
* **Runtime vs. Compile Time:** TypeScript errors happen **before** you run the code (during transpilation). JavaScript errors happen **while** the code is running (in the browser).
* **The "Superset" Concept:** All valid JS is valid TS, but not vice-versa.

### 2. Structural Typing ("Duck Typing")

This is the most unique feature of TS compared to languages like Java.

* **Nominal Typing (Java/C#):** Checks the *name* of the class. `Person` and `User` are different, even if they have the same fields.
* **Structural Typing (TypeScript):** Checks the *shape* of the object. If it looks like a duck and quacks like a duck, it IS a duck.

```typescript
interface Point { x: number; y: number; }
interface Coordinates { x: number; y: number; }

const p: Point = { x: 10, y: 20 };
const c: Coordinates = p; // ✅ OK! Same structure.

```

---

## Part 2: Essential Type Features

### 1. Interfaces vs. Types

The most common question: "When should I use `interface` vs `type`?"

* **Interface:** Best for defining **Objects** and **Classes**. Supports "Merging" (extending an existing interface by declaring it again).
* **Type:** Best for **Unions**, **Intersections**, **Primitives**, and **Tuples**.

```typescript
// Interface (Extendable)
interface User {
    name: string;
}
interface User {
    age: number; // Merges into the User above
}

// Type (Flexible)
type ID = string | number; // Union
type Coordinate = [number, number]; // Tuple

```

### 2. Generics (The Big One)

If you can't write Generics, you can't pass a Senior TS interview. Generics allow you to write reusable code that adapts to the data type passed in.

**Challenge:** *Write a function that takes an array of any type and returns the last element, while preserving the type.*

```typescript
// The <T> captures the type of the array elements
function getLast<T>(arr: T[]): T | undefined {
    return arr[arr.length - 1];
}

const num = getLast([1, 2, 3]); // TS knows 'num' is number
const str = getLast(["a", "b"]); // TS knows 'str' is string

```

### 3. Union (`|`) vs. Intersection (`&`)

* **Union (`A | B`):** The value can be A **OR** B. (Access only shared properties).
* **Intersection (`A & B`):** The value must be A **AND** B. (Combines properties).

```typescript
type Draggable = { drag: () => void };
type Resizable = { resize: () => void };

// Intersection: Must have BOTH methods
type UIWidget = Draggable & Resizable; 

const widget: UIWidget = {
    drag: () => {},
    resize: () => {}
};

```

---

## Part 3: Advanced Patterns (The "Senior" Section)

### 1. Type Guards and Narrowing

How do you safely handle a variable that could be multiple things?

**The `is` Keyword (User-Defined Type Guard):**
This is crucial. You tell the compiler "If this function returns true, then the variable is DEFINITELY this type."

```typescript
interface Fish { swim: () => void }
interface Bird { fly: () => void }

// "pet is Fish" is the predicate
function isFish(pet: Fish | Bird): pet is Fish {
    return (pet as Fish).swim !== undefined;
}

function move(pet: Fish | Bird) {
    if (isFish(pet)) {
        pet.swim(); // TS knows it's a Fish here
    } else {
        pet.fly();  // TS knows it must be a Bird here
    }
}

```

### 2. Discriminated Unions

The industry standard for handling state (Redux, API responses).

```typescript
type Response = 
    | { status: "success"; data: string }
    | { status: "error"; message: string };

function handle(res: Response) {
    if (res.status === "success") {
        console.log(res.data); // OK: TS knows success has 'data'
    } else {
        console.log(res.message); // OK: TS knows error has 'message'
    }
}

```

### 3. Utility Types

You should know the built-ins by heart.

* `Partial<T>`: Makes all properties optional.
* `Pick<T, K>`: Selects a subset of properties.
* `Omit<T, K>`: Removes a subset of properties.
* `Record<K, T>`: Creates an object type with keys K and values T.

**Challenge:** *Create a type for updating a User, but you can't update the `id`.*

```typescript
interface User {
    id: number;
    name: string;
    email: string;
}

// 1. Omit 'id' (name, email remain)
// 2. Partial (make name/email optional for updates)
type UpdateUserDTO = Partial<Omit<User, 'id'>>;

```

---

## Part 4: "Spot the Error" (Common Gotchas)

Interviewers love giving you code that *looks* right but fails compilation.

### 1. The `any` Trap

**Code:**

```typescript
function log(msg: any) {
    console.log(msg.toUpperCase());
}
log(123);

```

**Issue:** It compiles! `any` turns off type checking. It will crash at runtime (`123.toUpperCase is not a function`).
**Fix:** Use `unknown`. It forces you to check the type before using it.

### 2. `const` Assertions

**Code:**

```typescript
let config = { method: "GET" };
fetch("https://api.com", { method: config.method }); 
// Error: Types of property 'method' are incompatible.
// Type 'string' is not assignable to type '"GET" | "POST"'.

```

**Why:** TS infers `config.method` as `string` (because you can change it later). `fetch` expects the literal `"GET"`.
**Fix:** `let config = { method: "GET" } as const;` (Locks it as a literal).

---

## Part 5: Cheat Sheet - The "Must Memorize"

1. **`keyof`:** Returns a union of keys. `keyof User` -> `"id" | "name"`.
2. **`typeof`:** Gets the type of a value. `type Config = typeof configObj`.
3. **Inference:** TS is smart. `let x = 10` is automatically `number`. Don't over-annotate.
4. **Generics:** Use `<T>` when the type depends on the input.
5. **Strict Mode:** Always assume `strict: true` is on (no implicit `any`, no `null` bugs).
