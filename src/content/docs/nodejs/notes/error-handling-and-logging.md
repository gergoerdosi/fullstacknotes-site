---
title: "Error Handling and Logging"
description: "Prevent server crashes. Learn the difference between Operational and Programmer errors, how to handle Async errors properly using try/catch, and why console.log is dangerous in production."
tags: ["error-handling", "logging", "pino", "winston"]
sidebar:
  order: 4
---

In PHP or Python (Django), if a request crashes, only that thread dies. The server stays up.
In Node.js, because there is only **one thread**, if you throw an unhandled error, the **entire process exits**. Your website goes offline immediately.

This guide covers how to architect robust error handling so your server "fails gracefully" instead of crashing and burning.

## 1. The Two Types of Errors

Not all errors are created equal. You must distinguish between them to handle them correctly.

### A. Operational Errors (Run-time)

These are expected situations where the system is working correctly, but something else failed.

* **Examples:** "Database is down", "File not found", "User input invalid", "Request timeout".
* **Strategy:** Handle them, log them, and return a polite error message to the user. **Do not crash.**

### B. Programmer Errors (Bugs)

These are mistakes in the code itself.

* **Examples:** "Cannot read property of undefined", "Syntax error", "Wrong arguments passed".
* **Strategy:** You cannot handle these safely. The state of your application might be corrupted (e.g., a transaction hung halfway). The best practice is to **crash gracefully**, let a process manager (like PM2) restart the server, and alert the developer.

---

## 2. The Anatomy of an Error

In Node.js, an error is just an Object.

```javascript
const err = new Error("Something went wrong");

```

### The Stack Trace

The most valuable part of an error is `err.stack`. It records the state of the Call Stack at the moment the error was created.

**Best Practice:** Never throw a string. Always throw an Error object.

```javascript
// BAD
throw "User not found"; // No stack trace! Good luck debugging.

// GOOD
throw new Error("User not found"); // Contains file name and line number.

```

### Extending the Error Class

For enterprise apps, you should create custom error classes to simplify checking error types.

```javascript
class DatabaseError extends Error {
    constructor(message) {
        super(message);
        this.name = 'DatabaseError';
        this.isOperational = true; // Mark as "safe" to handle
    }
}

// Usage
if (err instanceof DatabaseError) {
    // Retry connection...
}

```

---

## 3. Handling Asynchronous Errors

This is where 90% of Node.js bugs hide. `try/catch` **only** works for synchronous code (or `await`). It **cannot** catch errors inside a callback or a detached Promise.

### The Callback Trap

```javascript
try {
    fs.readFile('does-not-exist.txt', (err, data) => {
        if (err) throw err; // THIS WILL CRASH THE SERVER
    });
} catch (e) {
    // This block will NEVER run.
    // The execution context of the callback is completely different 
    // from the try/catch block.
    console.log("Caught!"); 
}

```

### The Async/Await Solution

`async/await` allows standard `try/catch` to work on asynchronous code.

```javascript
async function readFile() {
    try {
        await fs.readFile('does-not-exist.txt');
    } catch (e) {
        console.log("Caught safely:", e.message);
    }
}

```

### The "Forgotten Await" Trap

This is dangerous. If you call an async function but forget `await`, the `try/catch` block finishes *before* the error happens.

```javascript
async function badHandler() {
    try {
        // Forgot 'await'! The promise runs in the background.
        databaseQuery(); 
    } catch (e) {
        console.log("This will NOT catch the DB error");
    }
}
// Result: Unhandled Promise Rejection (Process might crash or warn)

```

---

## 4. The Global Safety Nets

What happens if an error slips through all your try/catch blocks? Node.js provides two "Last Resort" listeners on the global `process` object.

### A. Uncaught Exception

Fires when a standard error is thrown and never caught.

```javascript
process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION! Shutting down...', err);
    
    // CRITICAL: You must exit. The app is in an undefined state.
    // 1 = Exit with error code
    process.exit(1);
});

```

### B. Unhandled Rejection

Fires when a Promise is rejected and no `.catch()` is attached.

```javascript
process.on('unhandledRejection', (reason, promise) => {
    console.error('UNHANDLED REJECTION! Shutting down...', reason);
    
    // It is recommended to crash here too, though Node allows you to continue.
    // In future Node versions, this WILL crash the process automatically.
    process.exit(1);
});

```

---

## 5. Professional Logging (Stop using `console.log`)

In development, `console.log` is fine. In production, it is a performance killer and a management nightmare.

### Why `console.log` fails in Production:

1. **Blocking:** In many environments (like Docker containers or terminals), `console.log` writes to `stdout` **synchronously**. High traffic logging can block the Event Loop!
2. **No Structure:** It prints plain text. Log aggregation tools (like Datadog, Splunk, CloudWatch) prefer **JSON**.
3. **No Levels:** You can't filter out "Debug" logs vs "Error" logs easily.

### The Solution: Winston or Pino

Use a structured logging library. **Pino** is currently the fastest for Node.js.

```javascript
const pino = require('pino');
const logger = pino();

// Logs as JSON: {"level":30,"time":1630000000,"msg":"Server started","pid":123}
logger.info("Server started"); 

// Adding Metadata (Crucial for debugging)
logger.error({ 
    err: errorObj, 
    userId: 50, 
    requestId: 'abc-123' 
}, "Database transaction failed");

```

* **Why JSON?** You can query your logs later: `Select * where userId=50`. You can't do that with `console.log("Error for user 50")`.
