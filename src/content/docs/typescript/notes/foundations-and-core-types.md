---
title: "Foundations and Core Types"
description: "The ultimate guide to starting TypeScript. Covers environment setup, static typing vs dynamic, strict primitives, interfaces vs types, and handling unions."
tags: ["typescript", "web-development", "basics"]
sidebar:
  order: 1
---

## 1. Introduction: Why TypeScript?

JavaScript is **dynamically typed**, meaning variables can change types at runtime. This flexibility is also its biggest weakness, leading to bugs like `undefined is not a function`.

**TypeScript (TS)** is a "superset" of JavaScript. It adds **Static Typing**.

* **Static Typing:** You define types *before* running the code. The compiler checks for errors during development, not after deployment.
* **Superset:** All valid JavaScript is valid TypeScript.
* **Compilation:** Browsers cannot read TypeScript. It must be "transpiled" into JavaScript using the TS Compiler (`tsc`).

---

## 2. Environment Setup

### Installation

You need Node.js installed. Then, install the TypeScript compiler globally:

```bash
npm install -g typescript

```

### The `tsconfig.json` File

Every TypeScript project needs a configuration file.

1. Create a folder.
2. Run `tsc --init`.
3. This creates `tsconfig.json`, where you define how TS behaves (e.g., how strict it should be, what version of JS to output).

### Compiling

* Create a file `index.ts`.
* Run `tsc index.ts` -> Generates `index.js`.
* **Watch Mode:** Run `tsc --watch` to automatically recompile when you save.

---

## 3. Basic Types (Primitives)

In TypeScript, you use a colon `:` to annotate types.

### String, Number, Boolean

```javascript
let username: string = "Alice";
// username = 123; // Error: Type 'number' is not assignable to type 'string'.

let age: number = 25;
let isActive: boolean = true;

```

### Type Inference

TS is smart. You don't always need to write the type.

```javascript
let city = "London"; 
// TS knows 'city' is a string.
// city = 5; // Error!

```

*Best Practice: Let inference do the work. Only annotate when necessary.*

---

## 4. Special TypeScript Types

These types do not exist in JavaScript but are crucial for safety.

### A. `any` (The Escape Hatch)

Disables type checking. Use this **rarely** (usually when migrating legacy code).

```javascript
let data: any = 5;
data = "Hello"; // OK
data = true;    // OK
data.nonExistentMethod(); // OK (Compiler ignores this, but it will crash at runtime!)

```

### B. `unknown` (The Safe `any`)

Like `any`, it accepts any value. Unlike `any`, you **cannot** perform operations on it until you check its type.

```javascript
let input: unknown = 5;
let str: string;

// str = input; // Error: Type 'unknown' is not assignable to type 'string'.

if (typeof input === 'string') {
    str = input; // OK: We proved it's a string.
}

```

### C. `void`

Represents the absence of a value. Used mainly for functions that do not return anything.

```javascript
function logMessage(msg: string): void {
    console.log(msg);
    // return true; // Error
}

```

### D. `never`

Represents values that **never occur**. Used for functions that throw errors indefinitely or infinite loops.

```javascript
function throwError(msg: string): never {
    throw new Error(msg);
}

```

---

## 5. Structural Types

### A. Arrays

Two syntaxes exist.

```javascript
// Syntax 1 (Preferred)
let numbers: number[] = [1, 2, 3];

// Syntax 2 (Generic style)
let names: Array<string> = ["Alice", "Bob"];

```

### B. Tuples

A fixed-length array where each element has a specific type.

```javascript
// A database record: [id, name, isAdmin]
let user: [number, string, boolean] = [1, "Steve", true];

// user[0] = "Steve"; // Error: Type 'string' is not assignable to type 'number'.

```

### C. Enums

A way to define a set of named constants. Useful for status codes or directions.

```javascript
// Numeric Enum (Auto-increments: 0, 1, 2)
enum Role {
    User,  // 0
    Admin, // 1
    SuperAdmin // 2
}
const myRole: Role = Role.Admin;

// String Enum (More readable in logs)
enum Status {
    Success = "SUCCESS",
    Failure = "FAILURE"
}

```

---

## 6. Objects: Interfaces vs. Types

This is the most common debate in TS. Both define the shape of an object.

### The `type` Alias

Can define primitives, unions, tuples, and objects.

```javascript
type ID = string | number; // Union Type

type Point = {
    x: number;
    y: number;
};

```

### The `interface`

Designed specifically for defining **Object shapes**. It supports **inheritance**.

```javascript
interface User {
    readonly id: number; // Cannot be changed after creation
    name: string;
    email?: string;      // Optional property (string or undefined)
}

const user1: User = {
    id: 1,
    name: "Alice"
    // email is missing, but that's allowed
};

// user1.id = 2; // Error: Cannot assign to 'id' because it is a read-only property.

```

### Extending Interfaces (Inheritance)

```javascript
interface Animal {
    name: string;
}

interface Dog extends Animal {
    breed: string;
}

const myDog: Dog = {
    name: "Buddy",
    breed: "Golden Retriever"
};

```

**Which to use?**

* Use **Interfaces** for Objects and Classes (better error messages, supports merging).
* Use **Types** for Unions (`string | number`), Functions, and complex utility types.

---

## 7. Functions

TypeScript allows you to strictly control inputs and outputs.

### Basic Annotation

```javascript
function add(x: number, y: number): number {
    return x + y;
}

```

### Optional and Default Parameters

```javascript
// 'last?' is optional. 'salutation' has a default value.
function greet(first: string, last?: string, salutation: string = "Hello"): string {
    if (last) {
        return `${salutation} ${first} ${last}`;
    }
    return `${salutation} ${first}`;
}

```

### Function Overloads

Sometimes a function returns different types based on inputs.

```javascript
// Signatures (The Plan)
function getLength(x: string): number;
function getLength(x: any[]): number;

// Implementation (The Code)
function getLength(x: any): number {
    return x.length;
}

getLength("hello"); // OK
getLength([1, 2]);  // OK
// getLength(123);  // Error: No overload matches this call.

```

---

## 8. Union and Intersection Types

### Union Types (`|`)

"This value can be A **OR** B".

```javascript
function printId(id: number | string) {
    console.log(`Your ID is: ${id}`);
    
    // Narrowing:
    if (typeof id === "string") {
        console.log(id.toUpperCase()); // Allowed because we checked it's a string
    }
}

```

### Intersection Types (`&`)

"This value must be A **AND** B".

```javascript
type Draggable = { drag: () => void };
type Resizable = { resize: () => void };

// A UI widget must be BOTH
type UIWidget = Draggable & Resizable;

let box: UIWidget = {
    drag: () => {},
    resize: () => {}
};

```

---

## Review Challenge

Create an Interface for a `Car` and a Function to process it.

1. **Interface `Car`:**
* `brand` (string)
* `year` (number)
* `isElectric` (optional boolean)


2. **Function `getCarInfo`:**
* Accepts a `Car`.
* Returns a string: "Brand: [brand], Year: [year]".
* If `isElectric` is true, append " (Electric)" to the string.

*(Self-correction: Ensure you handle the optional property check safely).*

<details>
<summary>Click to see the solution</summary>

This solution demonstrates defining an `interface` with optional properties and using logic inside a function to handle that optional data safely.

```typescript
// 1. Define the Interface
interface Car {
    brand: string;
    year: number;
    isElectric?: boolean; // Optional property (denoted by ?)
}

// 2. Define the Function
function getCarInfo(car: Car): string {
    // Basic info string
    let info = `Brand: ${car.brand}, Year: ${car.year}`;
    
    // Check if the optional property exists AND is true
    if (car.isElectric) {
        info += " (Electric)";
    }
    
    return info;
}

// Testing the code
const tesla: Car = {
    brand: "Tesla",
    year: 2023,
    isElectric: true
};

const ford: Car = {
    brand: "Ford",
    year: 1965
    // isElectric is missing, which is valid
};

console.log(getCarInfo(tesla)); // "Brand: Tesla, Year: 2023 (Electric)"
console.log(getCarInfo(ford));  // "Brand: Ford, Year: 1965"

```

</details>
