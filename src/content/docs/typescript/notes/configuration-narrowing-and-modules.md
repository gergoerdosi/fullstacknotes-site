---
title: "Configuration, Narrowing & Modules"
description: "Master the TypeScript Compiler (tsconfig). Learn how to safely handle multiple types using Type Guards and the Discriminated Union pattern."
tags: ["typescript", "tsconfig", "narrowing", "patterns"]
sidebar:
  order: 3
---

## 1. Mastering `tsconfig.json`

The `tsconfig.json` file is the brain of your project. It dictates how strict TypeScript is and what JavaScript it outputs.

### Crucial Compiler Options

1. **`target`**: Determines the version of JavaScript output.
* `"ES5"`: Maximum compatibility (older browsers).
* `"ES6"` / `"ES2020"`: Cleaner output, native async/await, smaller bundles.


2. **`module`**: The module system to use.
* `"CommonJS"`: For Node.js projects.
* `"ESNext"`: For modern frontend frameworks (React/Vite).


3. **`outDir`**: Where the `.js` files go (e.g., `./dist`).
4. **`strict`**: The "Master Switch". Setting this to `true` turns on a family of strict checks. **Always enable this for new projects.**

### The Strict Family (Inside `strict: true`)

* **`noImplicitAny`**: Raises an error if TS cannot infer a type and falls back to `any`.
```typescript
// Error: Parameter 's' implicitly has an 'any' type.
function log(s) { console.log(s); }

```


* **`strictNullChecks`**: `null` and `undefined` are not ignored.
```typescript
let name: string = "Alice";
// name = null; // Error! (Allowed if strictNullChecks is false)

```



---

## 2. Type Narrowing and Guards

In JavaScript, you often handle multiple types at runtime. TypeScript needs you to "prove" the type inside a specific block of code. This is called **Narrowing**.

### A. The `typeof` Guard

Used for primitives (string, number, boolean).

```typescript
function padLeft(padding: number | string, input: string) {
    // padding is number | string
    
    if (typeof padding === "number") {
        // TS knows 'padding' is number HERE
        return " ".repeat(padding) + input;
    }
    
    // TS knows 'padding' is string HERE (because we returned above)
    return padding + input;
}

```

### B. The `instanceof` Guard

Used for Classes and Objects (Dates, HTML Elements).

```typescript
function logDate(date: Date | string) {
    if (date instanceof Date) {
        console.log(date.toUTCString()); // OK: Date method
    } else {
        console.log(date.toUpperCase()); // OK: String method
    }
}

```

### C. User-Defined Type Guards (`is`)

Sometimes `typeof` isn't enough (e.g., checking if an object has a specific property). You can write a function that returns a **Type Predicate**.

```typescript
interface Fish { swim: () => void }
interface Bird { fly: () => void }

// Return type is 'pet is Fish'
function isFish(pet: Fish | Bird): pet is Fish {
    // Check if the 'swim' property exists
    return (pet as Fish).swim !== undefined;
}

function move(pet: Fish | Bird) {
    if (isFish(pet)) {
        pet.swim(); // TS knows pet is Fish
    } else {
        pet.fly();  // TS knows pet MUST be Bird
    }
}

```

---

## 3. Discriminated Unions

This is the most powerful pattern in TypeScript for handling complex state (like Redux reducers or API responses).

The idea is to combine a **Union Type** with a **Literal Type** (a shared field like `kind` or `type`) that TS can use to discriminate between them.

```typescript
interface SuccessState {
    status: "success"; // Literal type
    data: string[];
}

interface LoadingState {
    status: "loading"; // Literal type
}

interface ErrorState {
    status: "error";   // Literal type
    error: string;
}

type NetworkState = SuccessState | LoadingState | ErrorState;

function printStatus(state: NetworkState) {
    // We switch on the shared literal field 'status'
    switch (state.status) {
        case "loading":
            console.log("Please wait...");
            // console.log(state.data); // Error! LoadingState has no data.
            break;
            
        case "error":
            console.log("Error:", state.error); // TS allows accessing .error
            break;
            
        case "success":
            console.log("Data:", state.data); // TS allows accessing .data
            break;
    }
}

```

---

## 4. Modules and Ambient Declarations

### Modules (ESM)

TypeScript treats any file containing a top-level `import` or `export` as a module.

```typescript
// math.ts
export const PI = 3.14;
export interface Shape { area: number; }

// app.ts
import { PI, type Shape } from "./math"; // 'type' keyword is optional but recommended for build tools

```

### Ambient Declarations (`.d.ts`)

What if you use a library that wasn't written in TypeScript (e.g., an old jQuery plugin or a global variable injected by a script tag)? TS will yell at you.

You need to tell TS that these variables exist using `declare`.

**Scenario:** You have a global variable `MY_APP_CONFIG` injected into `window`.

```typescript
// global.d.ts (A definition file)
declare const MY_APP_CONFIG: {
    apiUrl: string;
    retryCount: number;
};

```

Now you can use `MY_APP_CONFIG` anywhere in your TS files without errors.

---

## Review Challenge

You are building a payment processor.

1. Define a **Discriminated Union** type called `Payment`.
* **Cash:** Has `type: 'cash'` and `amount`.
* **Card:** Has `type: 'card'`, `amount`, and `last4Digits`.
* **PayPal:** Has `type: 'paypal'`, `amount`, and `email`.


2. Write a function `processPayment(p: Payment)` that:
* Logs "Processing [amount]" for all types.
* If Card: Logs "Card ending in..."
* If PayPal: Logs "Email sent to..."
* If Cash: Logs "Open drawer."



*(Hint: Use a `switch` statement on the `type` field).*

<details>
<summary>Click to see the solution</summary>

This solution demonstrates the **Discriminated Union** pattern. By checking the shared literal property `type`, TypeScript automatically narrows down the object, allowing us to safely access properties specific to `Card` (like `last4Digits`) or `PayPal` (like `email`) without errors.

```typescript
// 1. Define the individual shapes
interface Cash {
    type: 'cash'; // The "Discriminant"
    amount: number;
}

interface Card {
    type: 'card';
    amount: number;
    last4Digits: string;
}

interface PayPal {
    type: 'paypal';
    amount: number;
    email: string;
}

// 2. Create the Union Type
type Payment = Cash | Card | PayPal;

// 3. The Function
function processPayment(p: Payment) {
    // Common property access is allowed immediately
    console.log(`Processing payment of $${p.amount}`);

    // Switch on the discriminant to narrow the type
    switch (p.type) {
        case 'cash':
            // TS knows 'p' is Cash here
            console.log("Action: Open register drawer.");
            break;
            
        case 'card':
            // TS knows 'p' is Card here
            console.log(`Action: Charge card ending in ${p.last4Digits}`);
            break;
            
        case 'paypal':
            // TS knows 'p' is PayPal here
            console.log(`Action: Send confirmation to ${p.email}`);
            break;
            
        default:
            // The "Exhaustiveness Check"
            // If we add a new payment type but forget a case, TS will error here
            const _exhaustiveCheck: never = p;
            console.error("Unknown payment method");
    }
}

// Testing
processPayment({ type: 'paypal', amount: 50, email: 'user@example.com' });
// Output:
// Processing payment of $50
// Action: Send confirmation to user@example.com

```
</details>
