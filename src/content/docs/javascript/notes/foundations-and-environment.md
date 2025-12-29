---
title: "Foundations and Environment"
description: "The essential building blocks of JavaScript. Learn environment setup (Node.js vs Browser), master variable scope (let vs const), understand primitive vs. reference types, and demystify type coercion and operators."
tags: ["javascript", "programming", "basics"]
sidebar:
  order: 1
---

## 1. Environment Setup

Before writing JavaScript, you must understand where it runs. JavaScript primarily runs in two environments: the **Browser** (client-side) and **Node.js** (server-side).

### Node.js vs. Browser Console

| Feature | Browser Console | Node.js |
| --- | --- | --- |
| **Primary Use** | Interacting with webpages, DOM manipulation, debugging UI. | Backend development, scripting, file system access, API servers. |
| **Global Object** | `window` | `global` |
| **DOM API** | Yes (can manipulate HTML elements). | No (cannot access HTML/CSS). |
| **Engine** | V8 (Chrome), SpiderMonkey (Firefox), JavaScriptCore (Safari). | V8 (Google's engine). |

#### How to use the Browser Console

1. Open Chrome or Firefox.
2. Right-click anywhere on the page and select **Inspect**.
3. Click the **Console** tab.
4. Type `console.log("Hello World");` and hit Enter.

#### How to use Node.js

1. **Install:** Download from [nodejs.org](https://nodejs.org/).
2. **Verify:** Open your terminal and type `node -v`.
3. **REPL (Read-Eval-Print Loop):** Type `node` in the terminal to start an interactive session.
4. **Run a file:** Create a file named `script.js` and run it via `node script.js`.

### Code Editors: VS Code

Visual Studio Code (VS Code) is the industry standard.

* **Extensions to install:** *ESLint* (for code quality), *Prettier* (for formatting), and *Live Server* (for viewing HTML/JS changes instantly).

---

## 2. Variables and Scope

In modern JavaScript, how you declare a variable determines its **scope** (where it is visible) and its **mutability** (if it can be changed).

### `var` vs. `let` vs. `const`

| Keyword | Scope | Re-assignable? | Hoisting Behavior |
| --- | --- | --- | --- |
| **`var`** | Function Scope | Yes | Hoisted & initialized with `undefined`. |
| **`let`** | Block Scope | Yes | Hoisted but in "Temporal Dead Zone" (TDZ). |
| **`const`** | Block Scope | No | Hoisted but in "Temporal Dead Zone" (TDZ). |

### Block Scope vs. Function Scope

**Function Scope (`var`):**
Variables declared with `var` are accessible anywhere inside the function they were declared in, ignoring blocks like `if` or `for`.

```javascript
function varTest() {
  if (true) {
    var x = "I am visible everywhere in this function!";
  }
  console.log(x); // Works! Output: "I am visible..."
}

```

**Block Scope (`let` & `const`):**
Variables declared inside a block `{ ... }` (loops, if-statements) exist *only* inside that block.

```javascript
function letTest() {
  if (true) {
    let y = "I am trapped in this block";
    const z = "Me too";
  }
  // console.log(y); // Error: y is not defined
  // console.log(z); // Error: z is not defined
}

```

### The `const` Nuance (Mutation)

`const` prevents re-assignment, but it does **not** make objects immutable.

```javascript
const user = { name: "Alice" };

// user = { name: "Bob" }; // ERROR: Assignment to constant variable.

// However, you CAN modify the contents:
user.name = "Bob"; 
console.log(user.name); // Output: "Bob" (This is allowed)

```

---

## 3. Data Types

JavaScript is **dynamically typed**, meaning variables do not hold types; values do.

### A. Primitive Types (Immutable)

These are stored directly in the stack (fast access).

1. **String:** Text data.
```javascript
let name = "John";
let greeting = `Hello ${name}`; // Template Literal

```


2. **Number:** Integers and floats (stored as 64-bit floating point).
```javascript
let int = 42;
let float = 3.14;
let infinity = 1 / 0; // Infinity
let notANumber = "text" / 2; // NaN (technically a Number type)

```


3. **BigInt:** For integers larger than .
```javascript
let big = 9007199254740991n; // Note the 'n' at the end

```


4. **Boolean:** Logical `true` or `false`.
5. **Undefined:** A variable declared but not assigned a value.
```javascript
let x;
console.log(x); // undefined

```


6. **Null:** A deliberate non-value (assignment of "nothing").
* *Note:* `typeof null` returns `"object"`. This is a famous, unfixable bug in JS.


7. **Symbol:** Unique and immutable identifiers (often used for object keys).
```javascript
let sym1 = Symbol("id");
let sym2 = Symbol("id");
console.log(sym1 === sym2); // false (Symbols are always unique)

```



### B. Reference Types (Objects)

Stored in the heap (memory); variables hold a "reference" (address) to the location.

```javascript
// Object
let person = {
    name: "Dave",
    age: 30
};

// Array (Special type of Object)
let colors = ["Red", "Green", "Blue"];

// Function (Callable Object)
function greet() { return "Hi"; }

```

**The Reference Trap:**
Copying a primitive copies the value. Copying an object copies the *reference*.

```javascript
let a = { value: 10 };
let b = a; // b points to the same memory as a

b.value = 20;
console.log(a.value); // Output: 20 (a changed because b modified the shared memory)

```

---

## 4. Type Coercion

JavaScript tries to be helpful by automatically converting types, which can lead to unexpected results.

### Implicit vs. Explicit Conversion

**Explicit (Manual):**
You force the type change.

```javascript
let str = "123";
let num = Number(str); // 123
let bool = Boolean(1); // true
let text = String(456); // "456"

```

**Implicit (Automatic):**
Happens when operators handle mismatched types.

```javascript
console.log("5" - 1); // 4 (String converted to Number)
console.log("5" + 1); // "51" (Number converted to String for concatenation)
console.log("5" * "2"); // 10 (Both converted to Numbers)

```

### "Truthy" and "Falsy" Values

When a value is used in a boolean context (like an `if` statement), JS coerces it to `true` or `false`.

**Falsy Values (Only these 6 are false):**

1. `false`
2. `0` (and `-0`)
3. `""` (Empty string)
4. `null`
5. `undefined`
6. `NaN`

**Truthy Values:**
Everything else.

```javascript
if ("hello") { console.log("Run"); } // Runs (non-empty string is truthy)
if ([]) { console.log("Run"); }      // Runs (empty array is truthy!)
if ({}) { console.log("Run"); }      // Runs (empty object is truthy!)

```

---

## 5. Operators

### A. Arithmetic

Standard math operations.

```javascript
let x = 10;
console.log(x ** 2); // Exponentiation (10 to power of 2 = 100)
console.log(x % 3);  // Modulus (Remainder of 10/3 = 1)
x++; // Increment (x becomes 11)

```

### B. Comparison (`==` vs `===`)

This is a critical distinction in JavaScript.

* **Loose Equality (`==`):** Performs type coercion before comparing.
* **Strict Equality (`===`):** Compares value AND type (No coercion).

```javascript
console.log(5 == "5");  // true (String "5" converted to Number 5)
console.log(5 === "5"); // false (Different types: Number vs String)

console.log(null == undefined); // true
console.log(null === undefined); // false

```

*Best Practice: Always use `===` unless you have a very specific reason not to.*

### C. Logical Operators

1. **AND (`&&`):** Returns the first falsy value, or the last value if all are truthy.
```javascript
console.log(true && "Dog"); // "Dog"
console.log(false && "Dog"); // false

```


2. **OR (`||`):** Returns the first truthy value.
```javascript
let input = "";
let username = input || "Guest"; // "Guest" (because input is falsy)

```


3. **Nullish Coalescing (`??`):**
Only returns the right side if the left side is strict `null` or `undefined`. Useful when `0` or `""` are valid values.
```javascript
let count = 0;

// Using ||
console.log(count || 10); // 10 (Bad! 0 is falsy, but 0 might be a valid count)

// Using ??
console.log(count ?? 10); // 0 (Good! It only falls back if count is null/undefined)

```

---

## Review Challenge

Try to predict the output of the following code snippet based on what you learned:

```javascript
const a = [1, 2, 3];
const b = [1, 2, 3];
const c = "1,2,3";

console.log(a === b);       // ?
console.log(a == c);        // ?
console.log(0 || "Hello");  // ?
console.log(0 ?? "Hello");  // ?

```

<details>
<summary>Click to see the answers</summary>

*(**Answers:** `false`, `true`, `"Hello"`, `0`)*

</details>
