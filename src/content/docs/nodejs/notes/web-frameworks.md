---
title: "Web Frameworks (Express.js Architecture)"
description: "Master the most popular Node.js framework. Learn the Chain of Responsibility pattern, how 'next()' works, the difference between app.use and app.get, and how to write global Error Handling middleware."
tags: ["express", "middleware", "frameworks", "architecture"]
sidebar:
  order: 10
---

The raw `http` module (Guide 9) is powerful but tedious. You have to write massive `if/else` blocks for routing and parse every JSON body manually.

Express.js solves this by introducing two key concepts:

1. **Routing:** A clean API for matching URLs to functions.
2. **Middleware:** A pipeline architecture for processing requests.

## 1. The Middleware Pipeline (The Core Concept)

In Express, an application is essentially a stack of functions. When a request comes in, it passes through these functions one by one until a response is sent.

### The `next()` Function

Every piece of middleware receives three arguments: `req`, `res`, and `next`.

* **`req`**: The Request object (augmented with extra properties).
* **`res`**: The Response object (augmented with helper methods).
* **`next`**: A function that, when called, passes control to the **next** middleware in the stack.

**Crucial Rule:** If you don't call `next()` and you don't send a response (like `res.send`), the request will **hang** forever until it times out.

```javascript
const express = require('express');
const app = express();

// Middleware 1: Global Logger
app.use((req, res, next) => {
    console.log(`Request received at ${Date.now()}`);
    next(); // Pass to the next function
});

// Middleware 2: Authentication
app.use((req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    if (apiKey === 'secret') {
        next(); // Authorized! Continue.
    } else {
        res.status(401).send('Unauthorized'); // Stop here. Do NOT call next().
    }
});

// Middleware 3: The Route Handler
app.get('/', (req, res) => {
    res.send('Hello Admin');
});

app.listen(3000);

```

---

## 2. Express vs. Native HTTP

Express wraps the native Node.js objects, adding "Syntactic Sugar" to make life easier.

| Feature | Native Node.js (`http`) | Express.js |
| --- | --- | --- |
| **Sending JSON** | `res.writeHead(200, ...); res.end(JSON.stringify(data))` | `res.json(data)` (Auto-sets headers & stringifies) |
| **Status Codes** | `res.statusCode = 404` | `res.status(404).send(...)` |
| **Reading Body** | Manually listen to streams & buffers | `req.body` (requires `express.json()` middleware) |
| **URL Params** | Parse `req.url` manually | `req.params.id` |

---

## 3. Routing Strategies

Express matches requests based on Method (GET, POST) and Path.

### Dynamic Parameters

Use a colon `:` to define variable parts of the URL.

```javascript
// Matches: /users/1, /users/500
app.get('/users/:id', (req, res) => {
    console.log(req.params.id);
    res.send(`User Profile ${req.params.id}`);
});

```

### The Router Object (Modularization)

Do not dump all your routes in `app.js`. Use `express.Router` to split your app into mini-modules.

```javascript
// routes/users.js
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => res.send('All Users'));
router.get('/:id', (req, res) => res.send('One User'));

module.exports = router;

// app.js
const userRoutes = require('./routes/users');
app.use('/users', userRoutes); 
// Now accessing /users/ calls the router

```

---

## 4. Error Handling Middleware

This is a special type of middleware. It has **four** arguments: `(err, req, res, next)`.
Express recognizes it by the argument count. If you pass an error to `next(err)`, Express skips all normal middleware and jumps straight to the error handler.

```javascript
// 1. Normal Route
app.get('/broken', (req, res, next) => {
    const err = new Error("Something broke!");
    next(err); // Pass error to the handler
});

// 2. Error Handler (Must be defined LAST)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        success: false, 
        message: err.message 
    });
});

```

---

## 5. Common Middleware Ecosystem

You rarely write everything from scratch. These are the standard middleware packages you will see in every project:

1. **`express.json()`**: Parses incoming JSON payloads into `req.body`.
2. **`cors`**: Handles Cross-Origin Resource Sharing (allowing frontend to talk to backend).
3. **`morgan`**: HTTP request logger (nicer than writing your own).
4. **`helmet`**: Sets security headers to protect against common attacks.
5. **`compression`**: Gzip compresses response bodies for speed.

```javascript
const compression = require('compression');
const helmet = require('helmet');

app.use(helmet());
app.use(compression());

```
