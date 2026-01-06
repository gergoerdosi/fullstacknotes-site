---
title: "Promises, Fetch and Chaining"
description: "Move beyond callback hell. Master Promises, learn proper error handling with the Fetch API, and how to chain asynchronous operations cleanly."
tags: ["promises", "fetch-api", "error-handling", "async-patterns"]
sidebar:
  order: 16
---

## 1. The Anatomy of a Promise

A Promise is an object representing the eventual completion (or failure) of an asynchronous operation. It is a proxy for a value not necessarily known when the promise is created.

**The 3 States:**

1. **Pending:** The initial state. The operation is still running (e.g., waiting for the server).
2. **Fulfilled (Resolved):** The operation completed successfully. We get a **value**.
3. **Rejected:** The operation failed. We get a **reason** (error).

Once a promise changes from Pending to Fulfilled/Rejected, it is **Settled**. It can never change state again.

---

## 2. Consuming Promises (`.then`)

We consume promises using methods that register callbacks for the future.

```javascript
const myPromise = new Promise((resolve, reject) => {
  // Simulating a slow network request
  setTimeout(() => {
    const success = true;
    if (success) resolve("Data Received");
    else reject("Connection Failed");
  }, 1000);
});

myPromise
  .then((data) => {
    console.log(data); // "Data Received"
  })
  .catch((error) => {
    console.error(error); // "Connection Failed"
  })
  .finally(() => {
    console.log("Cleanup (Run regardless of outcome)");
  });

```

---

## 3. The Fetch API (Modern AJAX)

`fetch` is the browser's native function for making network requests. It returns a Promise.

**The "Double Await" Pattern:**
When `fetch` resolves, it gives you a `Response` object. This object contains the headers and status, but **not the body text yet**. The body is a stream. You must call a method to read that stream, which returns *another* Promise.

```javascript
fetch('https://api.example.com/user/1')
  .then(response => {
    // Phase 1: Headers received
    return response.json(); // Returns a Promise that parses JSON
  })
  .then(userData => {
    // Phase 2: Body parsing complete
    console.log(userData.name);
  });

```

---

## 4. The "Silent Failure" of Fetch

This is the #1 bug beginners write.
**`fetch` does NOT reject on HTTP errors (404 Not Found, 500 Server Error).**
It only rejects on **Network Errors** (e.g., DNS failure, user is offline).

If the server replies "404 Not Found", `fetch` considers that a *successful* communication. You must manually throw an error.

**The Correct Pattern:**

```javascript
fetch('/api/user')
  .then(res => {
    if (!res.ok) { // Check for 200-299 status
      throw new Error(`HTTP Error: ${res.status}`);
    }
    return res.json();
  })
  .then(data => console.log(data))
  .catch(err => console.error("Request Failed:", err.message));

```

---

## 5. Promise Chaining (Flattening the Pyramid)

The power of Promises is **Chaining**.
Every `.then()` returns a **New Promise**.

1. If you return a **value**, the next `.then` receives that value.
2. If you return a **Promise**, the next `.then` waits for that Promise to settle.

**Bad (Nesting - The "Pyramid of Doom" v2):**

```javascript
fetch('/user')
  .then(res => {
    res.json().then(user => { // <--- NESTING BAD
      fetch(`/posts/${user.id}`).then(posts => {
        // ...
      });
    });
  });

```

**Good (Flat Chain):**

```javascript
fetch('/user')
  .then(res => res.json())
  .then(user => {
    return fetch(`/posts/${user.id}`); // Return the promise!
  })
  .then(res => res.json())
  .then(posts => {
    console.log(posts); // Clean and flat
  })
  .catch(err => {
    // Catches errors from ANY step above
    console.error(err);
  });

```

---

## 6. Interactive Exercises

**Exercise 1: The Broken Chain**
*Why is `finalData` undefined in the console? Fix the code.*

```javascript
fetch('/api/data')
  .then(res => {
    // Oops, I forgot something here...
    res.json(); 
  })
  .then(data => {
    console.log(data); // undefined
  });

```

**Exercise 2: The 404 Trap**
*You fetch a URL that doesn't exist (`/api/ghost`). The server returns status 404. Does the code enter the `.then()` block or the `.catch()` block?*

**Exercise 3: Parallel Fetch**
*You need to fetch User A and User B at the same time. You don't want to wait for A to finish before starting B. Which `Promise` static method should you use? (Hint: We haven't covered it explicitly, but try to guess or recall).*

---

### **Solutions to Exercises**

**Solution 1:**
You forgot to **return** the promise.

```javascript
.then(res => {
  return res.json(); // MUST return to pass data to the next .then
})
// OR implicit return with arrow function:
.then(res => res.json())

```

**Solution 2:**
It enters the **`.then()`** block.
Remember, `fetch` only rejects on network failure. A 404 is a valid HTTP response. You must check `if (!res.ok)` manually.

**Solution 3:**
**`Promise.all([fetchA, fetchB])`**.
This runs them in parallel and waits for *both* to finish. We will cover this in detail in the next module along with Async/Await.
