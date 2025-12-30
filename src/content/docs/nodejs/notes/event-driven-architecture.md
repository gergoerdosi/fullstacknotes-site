---
title: "Event-Driven Architecture"
description: "Master the Observer Pattern in Node.js. Learn how to extend the EventEmitter class, why emit() is synchronous by default, and how to avoid the common MaxListenersExceeded memory leak."
tags: ["eventemitter", "pub-sub", "patterns", "reactive"]
sidebar:
  order: 5
---

In traditional programming (like PHP or early Java), the flow of the application is linear: "Do A, then do B, then do C."
In Node.js, the flow is **Event-Driven**: "Start the server. When a request comes in, do A. When a file is read, do B."

This relies on the **Observer Pattern**. One object (the Subject) maintains a list of dependents (Observers) and notifies them automatically of any state changes.

## 1. The `EventEmitter` Class

The core logic lives in the built-in `events` module.

```javascript
const EventEmitter = require('events');

// Create an instance
const myEmitter = new EventEmitter();

// 1. Subscribe (Listen)
myEmitter.on('user-joined', (user) => {
    console.log(`Welcome, ${user.name}!`);
});

myEmitter.on('user-joined', (user) => {
    console.log(`Sending email to ${user.email}...`);
});

// 2. Publish (Emit)
// This triggers ALL listeners attached to 'user-joined'
myEmitter.emit('user-joined', { name: 'Alice', email: 'alice@example.com' });

```

### Core Methods

* **`on(event, listener)`**: Adds a listener to the end of the array.
* **`prependListener(event, listener)`**: Adds a listener to the *beginning* (runs first).
* **`once(event, listener)`**: The listener runs once and then automatically deletes itself.
* **`emit(event, ...args)`**: Triggers the event.
* **`off(event, listener)`** / **`removeListener`**: Removes a specific listener.

---

## 2. Sync vs. Async: The Great Misconception

This is a favorite interview question: **"Is `myEmitter.emit()` synchronous or asynchronous?"**

**Answer: Synchronous.**

When you call `.emit()`, Node.js finds the array of functions attached to that event and loops through them **one by one**, executing them immediately on the main thread. It does *not* wait for the next event loop tick.

```javascript
const myEmitter = new EventEmitter();

myEmitter.on('event', () => {
    console.log('A');
});

myEmitter.on('event', () => {
    console.log('B');
});

console.log('Start');
myEmitter.emit('event'); // Both 'A' and 'B' run right here!
console.log('End');

// Output:
// Start
// A
// B
// End

```

**Blocking Warning:** Since listeners run synchronously, if one listener contains a heavy CPU task (like a large `for` loop), it will block the remaining listeners *and* the rest of your program.

**How to make it Async?**
If you want listeners to run in the background, you must wrap the listener code in `setImmediate()` or `process.nextTick()`.

---

## 3. Building Real Systems (Extending EventEmitter)

You rarely use `new EventEmitter()` directly. Instead, you create classes that **extend** it. This is how the internal `http.Server` works.

**Example: A Payment Processor**

```javascript
const EventEmitter = require('events');

class PaymentService extends EventEmitter {
    process(orderId) {
        console.log(`Processing order ${orderId}...`);
        
        // Simulate Logic
        const success = true;

        if (success) {
            // Instead of returning a value, we EMIT success
            this.emit('success', orderId);
        } else {
            this.emit('error', new Error('Card declined'));
        }
    }
}

// Usage
const payment = new PaymentService();

// Separation of Concerns: 
// The PaymentService doesn't know about emails or databases. 
// It just announces "I'm done!", and other parts of the app react.

payment.on('success', (id) => console.log(`[Email Service] Emailed user for order ${id}`));
payment.on('success', (id) => console.log(`[Inventory] Deducted stock for order ${id}`));

payment.process(101);

```

---

## 4. The Memory Leak Trap (`MaxListenersExceededWarning`)

If you look at the `EventEmitter` source code, the listeners are just stored in a standard JavaScript Array: `this._events[eventName] = [func1, func2, ...]`.

Every time you call `.on()`, you push to this array. If you keep adding listeners without removing them (e.g., adding a listener inside a request handler), the array grows infinitely. This is a **Memory Leak**.

**The Warning:**
Node.js tries to help. If you add more than **10** listeners to a single event, it prints:
`(node:1234) MaxListenersExceededWarning: Possible EventEmitter memory leak detected. 11 listeners added.`

**How to Fix:**

1. **Check your logic:** Do you really need 11 distinct listeners? Or are you accidentally adding the same listener in a loop?
2. **Use `.once()`:** If the event only matters once, let it clean itself up.
3. **Increase Limit:** If you genuinely need more listeners, call `myEmitter.setMaxListeners(20)`.

---

## 5. Handling Errors in Emitters

Unlike standard Promises or try/catch blocks, `EventEmitter` has special behavior for errors.

If you emit an `error` event (`myEmitter.emit('error', ...)`), and **NO** listener is attached to `'error'`, Node.js will throw the error, print a stack trace, and **crash the process**.

**Best Practice:** Always attach an error listener.

```javascript
const myEmitter = new EventEmitter();

// myEmitter.emit('error', new Error('Whoops!')); 
// ^ CRASHES APP

myEmitter.on('error', (err) => {
    console.error('Caught an error:', err.message);
});

myEmitter.emit('error', new Error('Whoops!')); 
// ^ Handled safely

```
