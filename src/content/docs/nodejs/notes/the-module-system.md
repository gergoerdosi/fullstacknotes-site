---
title: "The Module System (CommonJS vs ESM)"
description: "A deep dive into Node's module systems. Learn the internal difference between require() (CommonJS) and import (ESM), Live Bindings, circular dependency resolution, and NPM's flat dependency tree."
tags: ["esm", "commonjs", "modular-design", "javascript"]
sidebar:
  order: 2
---

In the browser, JavaScript originally had no "module" system. Variables defined in one script were global and could overwrite variables in another. This was chaos.

Node.js solved this by implementing the **CommonJS** module system. Years later, JavaScript officially adopted **ES Modules (ESM)**. Today, Node.js supports both, but they function fundamentally differently. Understanding these internals is the difference between a "it works on my machine" developer and a systems architect.

## 1. CommonJS (CJS): The Legacy Standard

CommonJS is the default system in Node.js. It is characterized by `require()` and `module.exports`.

### The Mechanics of `require()`

When you type `const myMod = require('./myMod')`, Node.js does not just read the file and run it. It performs a specific sequence:

1. **Resolving:** It expands relative paths (`./`) to absolute paths. It looks for files in the following order: `myMod.js`, `myMod.json`, `myMod.node`. If not found, it looks inside `node_modules`.
2. **Loading:** It reads the file content **synchronously**. (This is why you generally keep `require` at the top of the file; putting it inside a request handler would block the server).
3. **Wrapping:** This is the secret sauce. Node wraps your code in a function.

### The Module Wrapper

Your code is never executed "naked". It is wrapped inside this IIFE (Immediately Invoked Function Expression):

```javascript
(function(exports, require, module, __filename, __dirname) {
    // YOUR CODE GOES HERE
    const x = 10;
    module.exports = x;
});

```

**Why do this?**

* It keeps top-level variables (like `x`) scoped to the module, rather than polluting the global object.
* It provides the magic variables `exports`, `__dirname`, etc., which look global but are actually function arguments.

### The Caching Mechanism

Node.js caches modules after the first load.

```javascript
// a.js
console.log("I run only once");
module.exports = { time: Date.now() };

// app.js
const a1 = require('./a');
const a2 = require('./a');

console.log(a1.time === a2.time); // TRUE

```

* **How it works:** `require` checks `require.cache` (an object where keys are filenames).
* **The Gotcha:** If you delete the key from `require.cache`, `require` will reload the file. This is useful for hot-reloading dev tools but dangerous in production (memory leaks).

### Exports vs `module.exports`

This confuses everyone.

* `module.exports` is the *actual* object that gets returned.
* `exports` is just a helper variable pointing to `module.exports`.

```javascript
// OK
exports.add = (a, b) => a + b; 

// OK
module.exports = { add: (a, b) => a + b };

// BROKEN
exports = { add: (a, b) => a + b }; 
// Why? You just pointed the 'exports' variable to a new object. 
// You broke the link to 'module.exports', which is what Node actually returns.

```

---

## 2. ES Modules (ESM): The Modern Standard

ESM is the official ECMAScript standard. It uses `import` and `export`.
Node.js treats files ending in `.mjs` as ESM, or `.js` files if `"type": "module"` is in `package.json`.

### The Three Phases of ESM

Unlike CommonJS, which loads and runs sequentially, ESM happens in three distinct phases. This allows for **Static Analysis**.

1. **Construction (Parsing):**
* Node finds all `import` statements.
* It recursively loads every file in the dependency graph.
* It parses them but **does not execute code**.


2. **Instantiation (Linking):**
* It creates a map of exported names and memory locations.
* It connects the imports to exports. Crucially, these are **Live Bindings** (pointers), not copies.


3. **Evaluation (Execution):**
* Only now does the code run, filling the memory locations with actual values.



### The "Live Binding" Difference

In CommonJS, imports are **copies**. In ESM, imports are **references**.

**CommonJS (Copy):**

```javascript
// counter.js
let count = 1;
exports.increment = () => count++;
exports.count = count; // Exports a COPY of the value '1'

// app.js
const { count, increment } = require('./counter');
increment();
console.log(count); // Output: 1 (The copy didn't change)

```

**ESM (Live Reference):**

```javascript
// counter.js
export let count = 1;
export const increment = () => count++;

// app.js
import { count, increment } from './counter.js';
increment();
console.log(count); // Output: 2 (We are looking at the same memory location)

```

---

## 3. Handling Cyclic Dependencies

Circular dependencies occur when Module A needs B, and B needs A.

**In CommonJS:**
Because it executes code line-by-line, if B requires A while A is still running, B gets an **unfinished** version of A (usually an empty object `{}`).

* *Result:* `TypeError: a.someFunction is not a function`.

**In ESM:**
Because of the "Instantiation" phase, ESM knows *what* A will export before it runs.

* B will get a "Reference" to A's export.
* If B tries to use it immediately (top-level code), it might crash (ReferenceError).
* If B uses it inside a function (later), it will work perfectly because the reference will be filled by then.

---

## 4. NPM Internals (Dependency Tree)

NPM (Node Package Manager) manages the `node_modules` folder. The structure of this folder has evolved to prevent "Dependency Hell".

### Nested vs. Flat (NPM v2 vs v3+)

**NPM v2 (Nested):**
If `App` needs `A` and `B`, and both `A` and `B` need `C`, NPM v2 would duplicate `C`.

```
node_modules
├── A
│   └── node_modules
│       └── C (v1.0)
└── B
    └── node_modules
        └── C (v1.0)

```

* *Problem:* On Windows, file paths became too long (`C:\users\...\node_modules\...\node_modules...`) and broke the OS.

**NPM v3+ (Flat):**
NPM attempts to hoist dependencies to the top level.

```
node_modules
├── A
├── B
└── C (v1.0)  <-- Shared by both!

```

* *Gotcha:* What if A needs C v1.0 and B needs C v2.0?
* NPM hoists one version (usually the more common one) to the root.
* It nests the other version inside the specific module that needs it. This is why you sometimes see a `node_modules` inside another `node_modules`.



### The `package-lock.json`

This file is not a suggestion; it is a snapshot.
It contains the **Integrity Hash** (SHA-512) of every file.

* When you run `npm install` on a server, NPM checks the downloaded package against this hash.
* If even one byte of code is different from when you developed it (e.g., a malicious hacker compromised the package registry), NPM will throw a security error and refuse to install.
