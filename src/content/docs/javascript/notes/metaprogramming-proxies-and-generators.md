---
title: "Metaprogramming (Proxies and Generators)"
description: "Unlock advanced metaprogramming capabilities. Learn to intercept object operations with Proxies and pause function execution with Generators."
tags: ["proxies", "generators", "metaprogramming", "reflect-api"]
sidebar:
  order: 19
---

## 1. The Proxy Object (The Interceptor)

A `Proxy` wraps an object and intercepts operations (reading, writing, deleting) performed on that object. It creates a "trap" for fundamental actions.

**Syntax:** `new Proxy(target, handler)`

**Use Case: Validation**
Imagine an object where the `age` property must always be a number.

```javascript
const user = {
  name: "Alice",
  age: 25
};

const validator = {
  // Trap for 'setting' a property
  set(target, prop, value) {
    if (prop === 'age') {
      if (typeof value !== 'number') {
        throw new TypeError('Age must be a number!');
      }
      if (value < 0) {
        throw new RangeError('Age must be positive!');
      }
    }
    
    // If valid, actually write the value to the original object
    target[prop] = value;
    return true; // Indicate success
  }
};

const userProxy = new Proxy(user, validator);

userProxy.age = 30; // Works
// userProxy.age = "thirty"; // Throws TypeError!

```

> **Real World:** **Vue 3** uses Proxies for its reactivity system. When you change `state.count`, the Proxy catches it and tells the DOM to update.

---

## 2. The Reflect API

`Reflect` is a built-in object that provides methods for interceptable JavaScript operations. It is designed to work hand-in-hand with `Proxy`.

**Why use it?**

1. **Better Returns:** `Object.defineProperty` throws an error if it fails. `Reflect.defineProperty` returns `false`.
2. **Default Behavior:** Inside a Proxy trap, `Reflect` allows you to say "Okay, I'm done intercepting, just do the default thing now."

```javascript
const handler = {
  get(target, prop, receiver) {
    console.log(`Someone is reading ${prop}`);
    // Forward the operation to the original object using Reflect
    return Reflect.get(target, prop, receiver);
  }
};

```

---

## 3. Generators (Pausing Functions)

Standard functions run to completion. You call them, they run, they return.
**Generators** (`function*`) can **pause** in the middle and resume later.

**Keywords:**

* `function*`: Declares a generator.
* `yield`: Pauses the function and spits out a value.
* `.next()`: Tells the paused function to resume until the next `yield`.

```javascript
function* numberGenerator() {
  console.log("Start");
  yield 1; // Pause here and return 1
  console.log("Resuming...");
  yield 2; // Pause here and return 2
  console.log("End");
}

const gen = numberGenerator(); // Returns a "Generator Object". Does NOT run code yet.

console.log(gen.next()); // "Start" -> { value: 1, done: false }
console.log(gen.next()); // "Resuming..." -> { value: 2, done: false }
console.log(gen.next()); // "End" -> { value: undefined, done: true }

```

**Use Case:** **Redux Saga** uses generators to handle complex async flows (e.g., "Login", wait for token, then fetch user, but if Logout happens in the middle, cancel the fetch).

---

## 4. Symbols (Unique Identifiers)

`Symbol` is a primitive type used to create **unique** property keys.

**The Problem:**
If you use a string key `user.id`, some other library might accidentally overwrite `user.id`.

**The Solution:**

```javascript
const idSym = Symbol('id');

const user = {
  [idSym]: 12345, // Hidden unique key
  name: "Alice"
};

console.log(user[idSym]); // 12345
console.log(user.id);     // undefined (standard dot notation doesn't see it)

```

* **Privacy:** Symbols do not show up in `for...in` loops or `Object.keys()`.

---

## 5. Interactive Exercises

**Exercise 1: The Defensive Object**
*Create a Proxy that throws an error if you try to read a property that doesn't exist. (Normally JS just returns `undefined`, which leads to bugs).*

```javascript
const dictionary = { hello: "hola" };
// Task: Wrap 'dictionary' in a Proxy so that dictionary.goodbye throws "Property not found"

```

**Exercise 2: The ID Generator**
*Write a generator function `idMaker` that yields an infinite sequence of IDs: 1, 2, 3, 4...*

```javascript
// const ids = idMaker();
// ids.next().value // 1
// ids.next().value // 2

```

**Exercise 3: Private Metadata**
*You have a user object. You want to attach a secret API key to it so that `JSON.stringify(user)` does NOT include the key.*

```javascript
const user = { name: "Bond" };
// Task: Add property "apiKey" = "007" using a Symbol so it's hidden from JSON.

```

---

### **Solutions to Exercises**

**Solution 1:**

```javascript
const safeDict = new Proxy(dictionary, {
  get(target, prop) {
    if (prop in target) {
      return target[prop];
    }
    throw new Error(`Property "${String(prop)}" not found.`);
  }
});

```

**Solution 2:**

```javascript
function* idMaker() {
  let index = 1;
  while (true) { // Infinite loops are safe in generators!
    yield index++;
  }
}

```

**Solution 3:**

```javascript
const apiKey = Symbol("apiKey");
user[apiKey] = "007";

console.log(JSON.stringify(user)); // {"name":"Bond"}
console.log(user[apiKey]); // "007"

```
