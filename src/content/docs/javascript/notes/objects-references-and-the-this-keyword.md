---
title: "Objects, References, and The `this` Keyword"
description: "Tackle the 'Pass by Reference' trap, learn deep vs. shallow copying, and master explicit binding of the `this` keyword using call, apply, and bind."
tags: ["objects", "this-keyword", "memory-references", "binding"]
sidebar:
  order: 6
---

## 1. The "Pass By Reference" Trap

When you assign a primitive (number/string) to a new variable, you make a **copy**.
When you assign an object to a new variable, you copy the **address**, not the object.

```javascript
const user1 = { name: "Alice", settings: { theme: "dark" } };
const user2 = user1; // Copying the ADDRESS, not the data

user2.name = "Bob";

console.log(user1.name); // "Bob"
// user1 and user2 are just two different keys to the exact same room.

```

---

## 2. Copying Objects: Shallow vs. Deep

How do we create a true copy so that changing `user2` doesn't wreck `user1`?

**A. Shallow Copy (Spread Syntax `...` or `Object.assign`)**
This copies the top-level properties. **BUT**, if the object contains *another* object (nested), that nested object is still shared by reference!

```javascript
const original = { a: 1, nested: { b: 2 } };
const shallowCopy = { ...original }; // Spread syntax

shallowCopy.a = 99; // Safe! 'original.a' is still 1.
shallowCopy.nested.b = 99; // DANGER! 'original.nested.b' becomes 99.

```

* *Why?* The spread operator copies the *value* of `nested`. The value of `nested` is a memory address. So both objects still point to the same nested object in the heap.

**B. Deep Copy (The Real Solution)**
To copy an object *and* all its children recursively.

* **The Old Hack:** `JSON.parse(JSON.stringify(obj))`
* *Pros:* Works in ancient browsers.
* *Cons:* Slow. Deletes functions and `undefined` values. Fails on Dates/Maps.


* **The Modern Standard:** `structuredClone(obj)`
* *Pros:* Native, fast, handles complex types (Dates, Maps, Sets).
* *Cons:* Requires modern browsers (available since ~2022).



```javascript
const deepCopy = structuredClone(original);
deepCopy.nested.b = 99; // original.nested.b remains 2. Safe!

```

---

## 3. Explicit Binding: Controlling `this`

We learned `this` depends on *how* a function is called. Sometimes, you want to force a function to use a specific object as `this`, even if it wasn't defined inside that object.

We use three methods to "hijack" functions: `call`, `apply`, and `bind`.

**Scenario:** We have a standalone function, and we want it to work on different users.

```javascript
function greet(greeting, punctuation) {
  console.log(`${greeting}, ${this.name}${punctuation}`);
}

const user = { name: "Alice" };
const admin = { name: "Bob" };

```

**A. `call(thisObj, arg1, arg2)**`
Invokes the function immediately. You pass arguments one by one.

```javascript
greet.call(user, "Hello", "!"); // "Hello, Alice!"
greet.call(admin, "Hi", ".");   // "Hi, Bob."

```

**B. `apply(thisObj, [argsArray])**`
Invokes the function immediately. You pass arguments as an **Array**.

```javascript
// Useful if your data is already in a list
const args = ["Welcome", "!!!"];
greet.apply(user, args); // "Welcome, Alice!!!"

```

**C. `bind(thisObj, arg1, arg2)**`
**Does NOT invoke the function.** It returns a **new function** copy that is permanently locked to that `this` context. You call the new function later.

```javascript
const greetAlice = greet.bind(user); 
// Later...
greetAlice("Hey", "?"); // "Hey, Alice?"

```

> **Why is `bind` critical?**
> It fixes the "Lost Context" problem in React class components or event listeners where passing a method often loses the `this` reference.

---

## 4. Optional Chaining (`?.`)

It is the best way to access nested properties in objects that might be missing data.

**The Problem:**
If `user.address` is missing (undefined), accessing `user.address.street` throws an Error (crash).

**The Solution:**

```javascript
const street = user?.address?.street;

```

* If `user` is null -> stops, returns `undefined`.
* If `address` is null -> stops, returns `undefined`.
* If both exist -> returns `street`.

**Advanced: Optional Function Call `?.()**`
You can even use it for functions that might not exist.

```javascript
// Only call onSave if it is actually a function
props.onSave?.(); 

```

---

## 5. Object Descriptors (The Hidden Metadata)

Did you know properties have attributes like "Read Only"?
Every key in an object has a **Property Descriptor**.

```javascript
const config = {};
Object.defineProperty(config, 'API_KEY', {
  value: '12345',
  writable: false, // Cannot be changed
  enumerable: false, // Will not show up in for...in loops or console.log
  configurable: false // Cannot be deleted
});

config.API_KEY = '999'; // Fails silently (or throws error in Strict Mode)
console.log(config.API_KEY); // '12345'

```

---

## 6. Interactive Exercises

**Exercise 1: The Clone Wars**
*We need to update a user's email without changing the original record. The user object contains a nested `preferences` object.*

```javascript
const originalUser = { 
  id: 1, 
  email: "test@test.com", 
  preferences: { newsletter: true } 
};

// Task: Create a copy called 'newUser'. 
// 1. Change email to "new@test.com".
// 2. Change preferences.newsletter to false.
// 3. Ensure 'originalUser.preferences.newsletter' remains TRUE.

```

**Exercise 2: Context Hijacking**
*Fix the last line so it prints "I am a Mac", using the `printModel` function defined on `laptop`.*

```javascript
const laptop = {
  model: "Mac",
  printModel() {
    console.log(`I am a ${this.model}`);
  }
};

const desktop = { model: "PC" };

// Task: Use 'call' to make laptop's function print desktop's model.
// laptop.printModel.....?

```

**Exercise 3: The Bind Trap**
*What does this code output? Explain why.*

```javascript
const person = {
  name: "John",
  getName: function() { return this.name; }
};

const getRef = person.getName;
console.log(getRef()); 

```

---

### **Solutions to Exercises**

**Solution 1:**
You must use a Deep Copy or manually spread the nested object.

```javascript
// Method A: Modern Deep Copy
const newUser = structuredClone(originalUser);
newUser.email = "new@test.com";
newUser.preferences.newsletter = false;

// Method B: Manual Spread (The React Redux way)
const newUser2 = {
  ...originalUser,
  email: "new@test.com",
  preferences: {
    ...originalUser.preferences, // We must spread the nested object too!
    newsletter: false
  }
};

```

**Solution 2:**

```javascript
laptop.printModel.call(desktop); // Output: "I am a PC"

```

**Solution 3:**

* **Output:** `undefined` (or "" in browser if name is empty).
* **Reason:** When we assign `const getRef = person.getName`, we are copying the *function definition* into the variable `getRef`. The link to the `person` object is lost.
* When we call `getRef()`, it is a standalone function call. `this` becomes the Global Object (window), which usually doesn't have a `name` property.
* **Fix:** `const getRef = person.getName.bind(person);`
