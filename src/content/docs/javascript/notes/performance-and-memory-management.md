---
title: "Performance and Memory Management"
description: "Optimize your applications by understanding Garbage Collection, identifying Memory Leaks, and mastering script loading strategies like async and defer."
tags: ["performance", "memory-management", "garbage-collection", "optimization"]
sidebar:
  order: 20
---

## 1. Garbage Collection (The Mark-and-Sweep Algorithm)

In languages like C, you must manually allocate and free memory (`malloc` / `free`). If you forget, the app leaks RAM.
JavaScript manages memory automatically. The engine has a **Garbage Collector (GC)** that runs periodically.

**How does it know what to delete?**
It uses the concept of **Reachability**.

1. **Roots:** The GC starts at the "Roots" (usually the global `window` object and the currently executing Stack).
2. **Mark:** It follows every reference (variables, objects, pointers) and "marks" the objects it finds as "Active."
3. **Sweep:** It looks at the Memory Heap. Any object that was **NOT** marked is considered "Unreachable." It is effectively garbage. The GC deletes it and reclaims the memory.

---

## 2. Common Memory Leaks

A **Memory Leak** happens when you think you destroyed an object, but a hidden reference prevents the GC from cleaning it up.

**Leak Type A: The Forgotten Event Listener**
This is the most common leak in Single Page Applications (React/Vue/Angular).

```javascript
function init() {
  const bigData = new Array(10000).fill("x"); // Heavy object

  function handleResize() {
    console.log(bigData.length);
  }

  // WE ATTACHED IT TO WINDOW
  window.addEventListener('resize', handleResize);
}

init();
// When init() finishes, you might think 'bigData' is gone.
// BUT: 'handleResize' uses 'bigData'.
// AND: 'window' holds a reference to 'handleResize'.
// RESULT: 'bigData' stays in memory forever (or until the window is closed).

```

* **Fix:** You must use `removeEventListener` when the component unmounts or the page changes.

**Leak Type B: The Detached DOM Node**
If you remove an element from the DOM but keep a JS variable pointing to it, it stays in memory.

```javascript
let detachedNodes;

function create() {
  const ul = document.createElement('ul');
  for (let i = 0; i < 1000; i++) {
    ul.appendChild(document.createElement('li'));
  }
  
  // We save a reference in a global variable
  detachedNodes = ul;
}

function clear() {
  // We remove it from the screen, but 'detachedNodes' still points to it!
  detachedNodes.remove(); 
  // GC cannot delete it yet.
}

```

---

## 3. Script Loading Strategies (`async` vs `defer`)

Where you put your `<script>` tag matters.

1. **`<script src="...">` (Default):**
* Parsing HTML pauses.
* Script downloads.
* Script executes.
* Parsing HTML resumes.
* **Result:** Blocks the UI. Slow page load.


2. **`<script async src="...">`:**
* Script downloads *in parallel* with HTML parsing.
* Executes *immediately* when downloaded (pausing HTML).
* **Use for:** Independent scripts (Analytics) that don't care about the DOM order.


3. **`<script defer src="...">` (The Best Practice):**
* Script downloads *in parallel*.
* Executes **only after** HTML parsing is complete.
* **Use for:** Your main application bundle. It guarantees the DOM is ready.



---

## 4. Animation Performance (`requestAnimationFrame`)

Never use `setInterval` for animations.

* **`setInterval`:** Tries to run every 16ms. If the browser is busy, it doesn't care; it forces the code to run, causing stutter (dropped frames).
* **`requestAnimationFrame` (rAF):** Asks the browser: "Whenever you are ready to paint the next frame, run this function."
* It syncs with the monitor's Refresh Rate (60Hz / 144Hz).
* It pauses automatically if the user switches tabs (saving battery).



```javascript
// BAD
setInterval(() => {
  box.style.left = parseInt(box.style.left) + 1 + 'px';
}, 16);

// GOOD
function animate() {
  box.style.left = parseInt(box.style.left) + 1 + 'px';
  requestAnimationFrame(animate); // Loop
}
requestAnimationFrame(animate);

```

---

## 5. Interactive Exercises

**Exercise 1: The Leak Hunter**
*Why does `largeObject` never get garbage collected in this code?*

```javascript
let storage = [];

function process() {
  const largeObject = { data: new Array(1000000) };
  
  // We push a function into a global array
  storage.push(function() {
    console.log(largeObject.data.length);
  });
}
process();

```

**Exercise 2: Script Tag Optimization**
*You have two scripts: `analytics.js` (independent) and `app.js` (needs the DOM to be ready). How should you load them in the `<head>`?*

**Exercise 3: The Interval Trap**
*You are building a stopwatch. You tab away from the browser for 10 minutes. When you come back, the `setInterval` based timer has drifted and is incorrect. Why? How does the browser throttle timers in background tabs?*

---

### **Solutions to Exercises**

**Solution 1:**
**Closure Scope.**
The function pushed into `storage` creates a **Closure** over `largeObject`. Because `storage` is global and stays alive, the function inside it stays alive. Because the function references `largeObject`, the GC marks `largeObject` as Reachable. It cannot be deleted.

**Solution 2:**

```html
<head>
  <script async src="analytics.js"></script>
  
  <script defer src="app.js"></script>
</head>

```

**Solution 3:**
Browsers aggressively throttle `setInterval` and `setTimeout` in inactive tabs to save battery (sometimes running only once per second or minute).
**Fix:** Do not rely on the interval count for time. Instead, check `Date.now()` (System Time) inside the interval to calculate the actual elapsed difference.
