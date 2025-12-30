---
title: "Node.js Interview Handbook"
description: "A comprehensive roadmap for Node.js interviews. This handbook covers core mechanics, V8 internals, security hardening, and high-level system design patterns across four seniority tiers."
tags: ["career", "node.js", "engineering", "handbook"]
---

## 1. The Junior Level: "How things work"

**Focus:** Syntax, basic asynchronous flow, and the Node.js environment.

### Core Questions:

* **What is the difference between `__dirname` and `process.cwd()`?**
* *Answer:* `__dirname` is the absolute path to the directory containing the source code file. `process.cwd()` is the directory from which you *launched* the node process.


* **Why is Node.js better for I/O-bound tasks than CPU-bound tasks?**
* *Answer:* Because it is single-threaded. I/O tasks (database, network) are offloaded to the system/Libuv, leaving the thread free. CPU tasks (heavy math) block that single thread, making the app unresponsive.


* **What is "Callback Hell" and how do Promises solve it?**
* *Answer:* Callback hell is deep nesting that makes code unreadable. Promises flatten this into `.then()` chains or `async/await` blocks.



---

## 2. The Mid-Level: "Best Practices and Internals"

**Focus:** Performance, Error handling, and Streams.

### Core Questions:

* **Explain the Event Loop phases in order.**
* *Answer:* Timers (setTimeout) → Pending Callbacks → Idle/Prepare → Poll (I/O) → Check (setImmediate) → Close Callbacks.


* **What is Backpressure in Streams?**
* *Answer:* It happens when a Readable stream sends data faster than a Writable stream can consume it. Node.js uses a buffer; if that buffer fills up, backpressure signals the source to pause.


* **How do you handle unhandled promise rejections?**
* *Answer:* Using the `process.on('unhandledRejection', callback)` listener.



---

## 3. The Senior Level: "Patterns and Security"

**Focus:** Architecture, Security, and Memory.

### Core Questions:

* **How would you debug a Memory Leak in a production Node.js app?**
* *Answer:* Use the `--inspect` flag to connect Chrome DevTools. Take "Heap Snapshots" at intervals. Look for objects that are growing in size but never being garbage collected (often event listeners or global arrays).


* **Explain Prototype Pollution.**
* *Answer:* It’s a vulnerability where an attacker manipulates the `__proto__` property of an object to inject properties into all objects in the application. Prevent it by using `Map` instead of objects or by freezing prototypes.


* **What is the difference between `cluster` and `worker_threads`?**
* *Answer:* `cluster` spawns multiple **processes** (separate memory, good for scaling web servers). `worker_threads` spawns multiple **threads** within the same process (shared memory, good for CPU-heavy math).



---

## 4. The Architect Level: "System Design and Strategy"

**Focus:** Scalability, Microservices, and Infrastructure.

### Core Questions:

* **How do you handle a "Thundering Herd" problem in a distributed cache?**
* *Answer:* Implement **Promise Memoization** (so only one request hits the DB while others "await" that same promise) or use **jitter** (randomized expiration times) so all caches don't expire at once.


* **Design a Rate Limiter for a high-traffic API.**
* *Answer:* Use a **Fixed Window** or **Sliding Window Log** algorithm stored in **Redis**. For higher performance, use the **Token Bucket** algorithm.


* **When would you choose a Microservices architecture over a Monolith for Node.js?**
* *Answer:* When different parts of the app have different scaling needs (e.g., an Image Processing service needs more CPU, while an API service needs more I/O) or when teams need to deploy independently.



---

## 5. The "Golden" Interview Cheat Sheet

| Topic | The "Junior" Answer | The "Senior/Architect" Answer |
| --- | --- | --- |
| **Single Thread** | "Node can only do one thing at a time." | "The Event Loop is single-threaded, but the Libuv Thread Pool and OS handle concurrent I/O." |
| **Errors** | "Use try/catch." | "Distinguish between Operational errors (try/catch) and Programmer errors (crash & restart)." |
| **npm** | "It installs packages." | "It manages a dependency tree; use `npm audit` and `package-lock.json` for security/integrity." |
| **Middleware** | "Functions that run in the middle." | "An implementation of the Chain of Responsibility pattern for request/response augmentation." |

---

## Coding Challenge Checklist

If they ask you to write code, ensure you do the following to look like a Senior:

1. **Validation:** Use a schema validator like `Zod` or `Joi`.
2. **Error Handling:** Never leave a `.catch()` empty.
3. **Environment Variables:** Use `process.env` (don't hardcode secrets).
4. **Logging:** Use `pino` or `winston` instead of `console.log`.
5. **Status Codes:** Return `201` for creation, `401` for auth, `422` for validation errors.
