---
title: "\"Under the Hood\" and Tooling"
description: "Go beyond syntax. Learn how the JS Engine optimizes code, how to manage memory and avoid leaks, the differences between LocalStorage and Cookies, and the role of NPM and Bundlers."
tags: ["javascript", "performance", "tooling", "v8"]
sidebar:
  order: 8
---

## 1. Memory Management

JavaScript manages memory automatically, but understanding *how* it works prevents performance issues like "Memory Leaks" (where RAM usage grows until the browser crashes).

### Garbage Collection (GC)

JavaScript uses an algorithm called **Mark-and-Sweep**.

1. **Roots:** The GC starts at the root (the `window` object in browsers).
2. **Marking:** It traverses all references (variables, objects) reachable from the root and marks them as "active."
3. **Sweeping:** Any memory *not* marked (unreachable) is considered garbage and is freed.

### Common Memory Leaks

* **Global Variables:** Accidental globals (variables without `let`/`const`) stay in memory as long as the page is open.
* **Forgotten Timers:** `setInterval` runs forever unless stopped.
```javascript
// Memory Leak!
const intervalId = setInterval(() => {
    // This object stays in memory forever unless cleared
    console.log(bigObject); 
}, 1000);

// Fix:
// clearInterval(intervalId);

```


* **Detached DOM Elements:** Removing an element from the DOM but keeping a JavaScript reference to it prevents the GC from freeing that memory.

---

## 2. The JS Engine and JIT Compilation

JavaScript is not just "interpreted" anymore; it is **Just-In-Time (JIT) Compiled**.

### The Engines

* **V8:** Developed by Google. Used in Chrome, Edge, and Node.js.
* **SpiderMonkey:** Developed by Mozilla. Used in Firefox.
* **JavaScriptCore (Nitro):** Developed by Apple. Used in Safari.

### How JIT Works

1. **Parsing:** The engine reads your code and turns it into an "Abstract Syntax Tree" (AST).
2. **Interpreter (Ignition):** Converts AST to Bytecode and runs it immediately (fast start).
3. **Compiler (TurboFan):** Monitors the running code. If a function is run many times ("Hot"), it compiles that specific part into highly optimized **Machine Code** (faster execution).
* *De-optimization:* If the data types change unexpectedly (e.g., an array of numbers suddenly gets a string), the engine downgrades back to the slower Bytecode. *Consistent types = faster code.*



---

## 3. Storage: Client-Side Data

Browsers provide several ways to store data on the user's machine.

| Feature | LocalStorage | SessionStorage | Cookies |
| --- | --- | --- | --- |
| **Lifetime** | Permanent (until cleared) | Session (cleared when tab closes) | Set expiration date |
| **Capacity** | ~5MB | ~5MB | ~4KB (Very small) |
| **Scope** | Domain-wide | Tab-specific | Domain-wide |
| **Sent to Server** | No | No | Yes (with every request) |

### Usage Example

```javascript
// LocalStorage (Persists after refresh)
localStorage.setItem('theme', 'dark');
const theme = localStorage.getItem('theme');
localStorage.removeItem('theme');

// SessionStorage (Lost on tab close)
sessionStorage.setItem('isLoggedIn', 'true');

// Cookies (Legacy, weird syntax)
// Usually managed via libraries, but natively:
document.cookie = "username=John; expires=Fri, 31 Dec 2024 12:00:00 UTC; path=/";

```

---

## 4. NPM (Node Package Manager)

NPM is the world's largest software registry. It allows you to share and use code packages.

### `package.json`

The configuration file for your project. Created via `npm init`.

### Dependencies vs. DevDependencies

This distinction is crucial for deployment.

1. **`dependencies` (`npm install react`):**
Libraries required for the application to run in production (e.g., React, Vue, Express, Utility libraries like Lodash).
2. **`devDependencies` (`npm install --save-dev jest`):**
Tools needed *only* during development (e.g., Testing frameworks, Linters like ESLint, Bundlers). They are **not** included in the final production build.

---

## 5. Bundlers (Webpack, Vite, Parcel)

Browsers originally didn't support `import` statements or heavy module usage. Bundlers solve this.

### What they do

1. **Bundle:** Combine 100+ JS files into one (or a few) `bundle.js` files to reduce network requests.
2. **Transpile:** Use Babel to convert modern ES6+ code into older ES5 compatible with older browsers (like Internet Explorer).
3. **Minify:** Remove spaces, comments, and shorten variable names to reduce file size.

### The Modern Standard: Vite

Older projects use **Webpack** (powerful but complex config). Modern projects prefer **Vite** (extremely fast, essentially zero-config).

```bash
# Creating a project with Vite
npm create vite@latest my-app -- --template react

```

---

## Review Challenge

Imagine you are building an e-commerce site.

1. Which storage method would you use to save the user's "Shopping Cart" so it persists if they accidentally close the browser?
2. You are installing a testing tool (like Jest). Should it be a `dependency` or `devDependency`?
3. Why is it better to store `[1, 2, 3, 4, 5]` in an array rather than `[1, "2", 3, "four", 5]` regarding the JS Engine?

<details>
<summary>Click to see the answers</summary>

1. **Storage Method:**
You should use **LocalStorage**.
* *Why?* SessionStorage is cleared when the tab/window is closed, which is frustrating for users who want to come back later. Cookies are too small (limited to 4KB) and are sent with every server request, which is unnecessary bandwidth for a client-side cart.


2. **Dependency Type:**
Jest should be a **`devDependency`**.
* *Why?* Your users never run your tests; only you do while developing. Therefore, this code should not be included in the final bundle sent to the user's browser.
* *Command:* `npm install --save-dev jest`


3. **JS Engine Optimization:**
It is better to keep the array **consistent (all Numbers)**.
* *Why?* When an array contains only one type (e.g., Integers), the V8 engine marks it as a "Packed SMI" (Small Integer) array and optimizes it heavily. If you mix types (Numbers and Strings), V8 must "de-optimize" it to a generic array to handle potential size differences, making operations significantly slower.

</details>