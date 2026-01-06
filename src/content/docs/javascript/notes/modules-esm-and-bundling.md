---
title: "Modules (ESM) and Bundling"
description: "Organize code with ES Modules (import/export), understand the difference between ESM and CommonJS, and learn why bundlers and Tree Shaking matter."
tags: ["es-modules", "bundling", "modular-architecture", "tree-shaking"]
sidebar:
  order: 18
---

## 1. ES Modules (The Modern Standard)

**ESM (ECMAScript Modules)** is the official standard. It runs natively in modern browsers and recent versions of Node.js.

**A. Named Exports**
Use this when you want to export multiple things from one file.

```javascript
// math.js
export const add = (a, b) => a + b;
export const subtract = (a, b) => a - b;

// main.js
import { add, subtract } from './math.js';
console.log(add(1, 2));

```

**B. Default Exports**
Use this for the "main" thing a file does (like a React component or a Class).

```javascript
// User.js
export default class User { ... }

// main.js
import User from './User.js'; // Name it whatever you want

```

> **Best Practice:** Prefer **Named Exports**. They enforce consistent naming across files and work better with auto-refactoring tools in VS Code.

---

## 2. CommonJS (The Node.js Legacy)

Before ESM existed, Node.js created its own system called **CommonJS (CJS)**. You will see this in server-side code and configuration files (like `webpack.config.js`).

* **Export:** `module.exports = ...`
* **Import:** `const x = require('...')`

```javascript
// logger.js (CommonJS)
function log(msg) { console.log(msg); }
module.exports = log;

// app.js
const log = require('./logger');
log("Hello Node");

```

**The Conflict:** Browsers **cannot** run `require()`. It simply doesn't exist in the browser runtime. If you try to use a library written in CJS inside a browser without a bundler, it will crash.

---

## 3. Why do we need Bundlers? (Webpack / Vite)

If you write 100 JS files with `import/export`, the browser has to make 100 HTTP requests to fetch them all. This is slow.

**Bundlers (like Vite, Webpack, Parcel)** do two main things:

1. **Bundle:** They stitch all 100 files into one big file (e.g., `bundle.js`) so the browser only makes ONE request.
2. **Transpile:** They convert modern code (ES6+) into older code (ES5) so it runs on old browsers (using Babel).

---

## 4. Tree Shaking (Dead Code Elimination)

This is a specific optimization that Bundlers perform, but **only if you use ESM**.

Imagine you import a massive library like `lodash` but you only use *one* function.

```javascript
// BAD (Imports the WHOLE library, e.g., 500kb)
import _ from 'lodash'; 
_.join(['a', 'b'], '~');

// GOOD (Imports ONLY the 'join' function, e.g., 2kb)
import { join } from 'lodash-es';
join(['a', 'b'], '~');

```

**Tree Shaking** is the process where the bundler looks at your code, sees you are only using `join`, and **deletes** the rest of the library from the final bundle.

* *Note:* Tree Shaking generally does not work with CommonJS (`require`).

---

## 5. Dynamic Imports (Lazy Loading)

Sometimes you don't want to load a huge module until the user actually clicks a button. This is called **Code Splitting**.

```javascript
button.addEventListener('click', async () => {
  // This downloads 'heavyModule.js' ONLY when clicked
  const module = await import('./heavyModule.js');
  
  module.doHeavyWork();
});

```

This returns a Promise. It is essential for performance in large React/Vue apps.

---

## 6. Interactive Exercises

**Exercise 1: Conversion Therapy**
*Convert this CommonJS code to Modern ESM.*

```javascript
// utils.js
module.exports.add = (a, b) => a + b;

// server.js
const utils = require('./utils');
console.log(utils.add(5, 5));

```

**Exercise 2: The Import Fix**
*You are using a library `super-math` that exports `add`, `sub`, `mul`, `div`. You only need `add`. Write the import statement that allows Tree Shaking to remove the other 3 functions.*

**Exercise 3: Browser Compatibility**
*If you use `<script src="app.js"></script>` in your HTML and `app.js` contains an `import` statement, it will fail. What attribute must you add to the script tag to make the browser understand it is a module?*

---

### **Solutions to Exercises**

**Solution 1:**

```javascript
// utils.js
export const add = (a, b) => a + b;

// server.js
import { add } from './utils.js';
console.log(add(5, 5));

```

**Solution 2:**

```javascript
import { add } from 'super-math';
// Do NOT use: import superMath from 'super-math';

```

**Solution 3:**
You must add `type="module"`.

```html
<script type="module" src="app.js"></script>

```

* *Bonus:* Modules are deferred by default (they wait for HTML to parse).
