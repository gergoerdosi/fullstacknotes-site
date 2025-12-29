---
title: "Asynchronous JavaScript"
description: "Master the Event Loop. Learn how to handle time-consuming tasks without freezing the browser using Promises, Async/Await syntax, and the modern Fetch API for network requests."
tags: ["javascript", "async", "fetch", "promises"]
sidebar:
  order: 7
---

## 1. The Model: How JS Handles Time

JavaScript is **Single-Threaded**. This means it can only do **one thing at a time**.

If JS is single-threaded, how does it fetch data from a server or wait for a timer without freezing the entire browser? It uses a system consisting of the **Call Stack**, **Web APIs**, and the **Event Loop**.

1. **Call Stack:** Executes JS code (one line at a time).
2. **Web APIs:** Provided by the browser (not JS engine). Handles "waiting" tasks like `setTimeout`, DOM events, or Network Requests.
3. **Callback Queue:** When a Web API finishes a task, it puts the callback function here.
4. **The Event Loop:** The "traffic controller." It constantly checks: *Is the Call Stack empty? If yes, move the first item from the Queue to the Stack.*

```javascript
console.log("1");

// setTimeout is a Web API. It moves to the API area, waits 0ms, 
// then moves the callback to the Queue.
setTimeout(() => {
    console.log("2"); 
}, 0);

console.log("3");

// Output: 1, 3, 2
// Explanation: "2" waits in the Queue until the Stack (main code) is clear.

```

---

## 2. Callbacks and "Callback Hell"

Before Promises, we handled async operations by passing a function (callback) to be run *after* the task finished.

If you needed to do three things in order (e.g., Login -> Get User Data -> Get User Posts), you had to nest callbacks inside callbacks. This created a pyramid shape known as **Callback Hell**.

```javascript
// The Old Way (Hard to read/debug)
login(user, function(token) {
    getUser(token, function(userData) {
        getPosts(userData.id, function(posts) {
            console.log(posts);
        });
    });
});

```

---

## 3. Promises

A **Promise** is an object representing the eventual completion (or failure) of an asynchronous operation. It has three states:

1. **Pending:** Initial state, neither fulfilled nor rejected.
2. **Fulfilled (Resolved):** Operation completed successfully.
3. **Rejected:** Operation failed.

Promises allow us to chain operations vertically using `.then()`.

```javascript
// The Promise Way (Cleaner)
login(user)
    .then(token => getUser(token))
    .then(userData => getPosts(userData.id))
    .then(posts => console.log(posts))
    .catch(error => console.error("Something went wrong:", error));

```

---

## 4. Async / Await (ES8)

Introduced in 2017, this is "syntactic sugar" built on top of Promises. It makes asynchronous code look and behave like synchronous code (top-down).

* **`async` keyword:** Makes a function return a Promise automatically.
* **`await` keyword:** Pauses the execution of the function until the Promise is resolved.

### Handling Errors (`try...catch`)

With `.then()`, we used `.catch()`. With `async/await`, we use standard `try/catch` blocks.

```javascript
async function displayUserPosts() {
    try {
        const token = await login(user);        // Waits for login
        const userData = await getUser(token);  // Waits for user data
        const posts = await getPosts(userData.id); // Waits for posts
        
        console.log(posts);
    } catch (error) {
        console.error("Error in process:", error);
    }
}

```

---

## 5. Network Requests: The Fetch API

The `fetch()` function is the modern, built-in way to make network requests. It returns a **Promise**.

### A. GET Request (Reading Data)

Note the "Two-Step" process with `fetch`:

1. Fetch gets the Response object (headers, status), but not the body yet.
2. You must call `.json()` (which is also async) to parse the body.

```javascript
async function getTodos() {
    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/todos/1');
        
        // Check if the request was successful (Status 200-299)
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json(); // Wait for JSON parsing
        console.log("Data received:", data);
        
    } catch (error) {
        console.error("Fetch failed:", error);
    }
}

```

### B. POST Request (Sending Data)

To send data, you must provide a configuration object as the second argument.

```javascript
async function createPost() {
    const newPost = {
        title: 'foo',
        body: 'bar',
        userId: 1,
    };

    const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
        method: 'POST', // HTTP Verb
        headers: {
            // Tell the server we are sending JSON
            'Content-Type': 'application/json' 
        },
        body: JSON.stringify(newPost) // Convert JS Object to JSON String
    });

    const result = await response.json();
    console.log("Created:", result);
}

```

---

## Review Challenge

Write an `async` function named `getRandomUser`.

1. Fetch data from `https://randomuser.me/api/`.
2. Parse the JSON.
3. Log the **first name** of the user (located at `data.results[0].name.first`).
4. Wrap it in a `try/catch` to handle potential network errors.

```javascript
// Your Code Here:

```

<details>
<summary>Click to see the solution</summary>

This solution uses `async/await` for clean syntax and includes error handling for both the network request and the data parsing.

```javascript
async function getRandomUser() {
    try {
        // 1. Make the request
        const response = await fetch('https://randomuser.me/api/');

        // 2. Check for HTTP errors (e.g., 404 Not Found, 500 Server Error)
        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        // 3. Parse the JSON body
        const data = await response.json();

        // 4. Access the specific data path
        // The API returns an object with a 'results' array
        const firstName = data.results[0].name.first;
        
        console.log(`Random User: ${firstName}`);

    } catch (error) {
        console.error("Failed to fetch user:", error);
    }
}

// Call the function to test it
getRandomUser();

```

</details>
