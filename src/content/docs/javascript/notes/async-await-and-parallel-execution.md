---
title: "Async/Await and Parallel Execution"
description: "Write asynchronous code that looks synchronous using Async/Await. Learn to handle errors with try/catch and optimize performance with Promise.all."
tags: ["async-await", "parallel-execution", "try-catch", "clean-code"]
sidebar:
  order: 17
---

## 1. The Syntax Transformation

Let's convert a Promise Chain to Async/Await.

**The Old Way (Promise Chain):**

```javascript
function getUser() {
  fetch('/user')
    .then(res => res.json())
    .then(user => console.log(user))
    .catch(err => console.error(err));
}

```

**The New Way (Async/Await):**

1. Mark the function as `async`.
2. Use `await` before any Promise. It pauses the function execution until the Promise resolves.

```javascript
async function getUser() {
  try {
    const res = await fetch('/user');
    
    // Remember to check for 404s!
    if (!res.ok) throw new Error("404 Not Found");

    const user = await res.json();
    console.log(user);
    
  } catch (err) {
    // This catches network errors AND the error we threw above
    console.error(err);
  }
}

```

> **Key Concept:** `await` pauses the **function**, not the **browser**. The Event Loop goes off and handles other tasks (rendering, clicks) while this function waits for the network.

---

## 2. The "Sequential Waterfall" Trap

This is the most common performance bug in modern JavaScript.
If you have two independent tasks, **do not await them one by one.**

**The Slow Way (Sequential):**

```javascript
async function loadDashboard() {
  // 1. Start fetching user... and WAIT 1 second.
  const user = await fetch('/user'); 
  
  // 2. Start fetching posts... and WAIT 1 second.
  const posts = await fetch('/posts'); 
  
  // Total time: 2 Seconds.
}

```

**The Fast Way (Parallel):**
Trigger both requests immediately. Await them later.

```javascript
async function loadDashboard() {
  // 1. Start both requests immediately. Do NOT use await yet.
  const userPromise = fetch('/user');
  const postsPromise = fetch('/posts');

  // 2. Now await them both. They run in parallel.
  const user = await userPromise;
  const posts = await postsPromise;
  
  // Total time: 1 Second (Max of the two).
}

```

---

## 3. `Promise.all` (The Parallel Powerhouse)

To handle multiple promises cleaner, use `Promise.all`. It takes an array of Promises and returns a single Promise that resolves to an array of results.

```javascript
async function loadData() {
  try {
    const [user, posts] = await Promise.all([
      fetch('/user').then(r => r.json()),
      fetch('/posts').then(r => r.json())
    ]);

    console.log(user, posts);

  } catch (err) {
    // If ONE promise fails, Promise.all fails immediately.
    console.error("One of them failed!", err);
  }
}

```

**Advanced: `Promise.allSettled**`
If you don't want the whole thing to crash just because *one* request failed (e.g., getting User succeeded, but getting Ads failed), use `Promise.allSettled`.
It waits for all of them to finish, regardless of success or failure.

---

## 4. Top-Level Await

Historically, you could only use `await` inside an `async` function.
Since ES2022, you can use `await` at the top level of a Module (inside a `<script type="module">` or a Node.js module).

```javascript
// file: data.js
const response = await fetch('/config.json'); // Works!
export const config = await response.json();

```

---

## 5. Interactive Exercises

**Exercise 1: Refactor to Async/Await**
*Rewrite this function using async/await syntax.*

```javascript
function login(username) {
  return verifyUser(username)
    .then(token => getPermissions(token))
    .then(perms => console.log(perms))
    .catch(err => console.error("Login failed"));
}

```

**Exercise 2: The Parallel Fix**
*This code takes 3 seconds to run because each timer waits for the previous one. Refactor it to run in 1 second using `Promise.all`.*

```javascript
async function init() {
  await wait(1000); // Wait 1s
  await wait(1000); // Wait 1s
  await wait(1000); // Wait 1s
  console.log("Done");
}

```

**Exercise 3: The Try/Catch Scope**
*Does the `catch` block handle the error below? Why or why not?*

```javascript
async function test() {
  try {
    // We forgot 'await'!
    fetch('/broken-url'); 
  } catch (e) {
    console.log("Caught!");
  }
}

```

---

### **Solutions to Exercises**

**Solution 1:**

```javascript
async function login(username) {
  try {
    const token = await verifyUser(username);
    const perms = await getPermissions(token);
    console.log(perms);
  } catch (err) {
    console.error("Login failed");
  }
}

```

**Solution 2:**

```javascript
async function init() {
  await Promise.all([
    wait(1000),
    wait(1000),
    wait(1000)
  ]);
  console.log("Done");
}

```

**Solution 3:**
**No, it does NOT catch the error.**

* Without `await`, the `fetch` starts in the background, and the `test` function continues immediately.
* The `try/catch` block finishes execution *before* the fetch fails.
* The error will appear as an "Unhandled Promise Rejection" in the console globally. You **must** await a promise to catch its errors in a `try/catch` block.
