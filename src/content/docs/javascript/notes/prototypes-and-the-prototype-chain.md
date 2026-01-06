---
title: "Prototypes and The Prototype Chain"
description: "Uncover the engine's inheritance model. Learn how objects link via __proto__, how the prototype chain works, and how to use prototypal inheritance without classes."
tags: ["prototypes", "inheritance", "prototype-chain", "oop"]
sidebar:
  order: 8
---

## 1. The "Ghost" Behind Every Object

Every time you create an object in JavaScript, the engine secretly adds a hidden property to it. In older browsers, this was exposed as `__proto__`. In modern terms, we call it the `[[Prototype]]`.

This hidden property is a **Link** (a reference) to another object: its "Parent" or "Prototype."

**The Lookup Algorithm:**
When you try to access `user.name`:

1. The engine checks: Does `user` have a property `name`?
* **Yes:** Use it.
* **No:** Look at `user.__proto__` (the parent).


2. Does the Parent have `name`?
* **Yes:** Use it.
* **No:** Look at the Parent's `__proto__` (the grandparent).


3. ... Repeat until the chain hits `null`. If still not found, return `undefined`.

---

## 2. `prototype` vs. `__proto__`

This is the most confusing naming convention in JavaScript history. Read this carefully.

1. **`prototype` (The Box of DNA)**
* **Who has it?** Only **Functions** (specifically, Constructor Functions).
* **What is it?** An object that will become the parent (`__proto__`) of any objects created by this function.


2. **`__proto__` (The Link)**
* **Who has it?** Every **Object** (Instances).
* **What is it?** The actual link pointing to the parent.



**The Relationship:**

```javascript
function User(name) {
  this.name = name;
}

// 1. We put methods on the function's 'prototype' box
User.prototype.login = function() {
  console.log("Logged in!");
};

// 2. We create an instance
const user1 = new User("Alice");

// 3. The Magic Link happens here:
console.log(user1.__proto__ === User.prototype); // true

```

* `user1` does NOT have a `login` method.
* When we call `user1.login()`, the engine follows the `__proto__` link up to `User.prototype` and finds it there.

---

## 3. Constructor Functions (The Old "Classes")

Before ES6 introduced the `class` keyword, this is how we built reusable objects. You will still see this in legacy code.

```javascript
function Car(make, speed) {
  // Instance properties (Unique to each car)
  this.make = make;
  this.speed = speed;
}

// Shared methods (Stored once in memory, shared by all cars)
Car.prototype.drive = function() {
  console.log(this.make + " is going " + this.speed);
};

const bmw = new Car("BMW", 100);
const audi = new Car("Audi", 120);

bmw.drive(); // "BMW is going 100"

```

**Memory Benefit:**
If we defined `drive` *inside* the function (`this.drive = function...`), every single car would have its own copy of the function. By putting it on the `prototype`, 1000 cars share **one** function in memory.

---

## 4. `Object.create()` (Pure Prototypal Inheritance)

If you don't want to use Constructor functions (or Classes), you can just link two objects directly.

```javascript
const animal = {
  eats: true,
  walk() {
    console.log("Animal walking");
  }
};

// Create 'rabbit', and set 'animal' as its prototype
const rabbit = Object.create(animal);
rabbit.jumps = true;

console.log(rabbit.eats); // true (Inherited from animal)
console.log(rabbit.jumps); // true (Own property)

// The Chain: rabbit -> animal -> Object.prototype -> null

```

---

## 5. Prototypal Shadowing

What happens if the child has the same property name as the parent?

```javascript
const parent = { theme: "light" };
const child = Object.create(parent);

console.log(child.theme); // "light" (Inherited)

// Assignment creates an OWN property. It does NOT overwrite the parent.
child.theme = "dark"; 

console.log(child.theme); // "dark" (Found on child, stop looking)
console.log(parent.theme); // "light" (Parent is untouched!)

```

This is called **Shadowing**. The child "shadows" the parent's property.

---

## 6. Interactive Exercises

**Exercise 1: The Chain Check**
*We have an Array `[]`. It has methods like `.map()` and `.filter()`. Tracing the prototype chain, where do these methods actually live?*

```javascript
const arr = [];
// Questions:
// 1. arr.__proto__ is equal to what?
// 2. arr.__proto__.__proto__ is equal to what?
// 3. arr.__proto__.__proto__.__proto__ is equal to what?

```

**Exercise 2: Adding to Built-ins (Polyfilling)**
*JavaScript Arrays do not have a `.last()` method. Add one to the `Array.prototype` so that ALL arrays in your program can use it to get their last element.*

```javascript
const scores = [10, 20, 30];
// scores.last() should return 30.
// Write the code to make this work.

```

**Exercise 3: The "New" Operator Logic**
*When we say `new User()`, the engine does 4 things. Two are listed below. What are the missing steps?*

1. Creates a new empty object `{}`.
2. (Missing Step: Linking).
3. (Missing Step: Context).
4. Returns the object.

---

### **Solutions to Exercises**

**Solution 1:**

1. `Array.prototype` (Where `map`, `filter` live).
2. `Object.prototype` (Where `toString`, `hasOwnProperty` live).
3. `null` (The end of the chain).

**Solution 2:**
*Warning: Modifying native prototypes is generally discouraged in production libraries, but essential for understanding.*

```javascript
Array.prototype.last = function() {
  // 'this' refers to the array calling the method
  return this[this.length - 1];
};

console.log([1, 2, 3].last()); // 3

```

**Solution 3:**
The 4 steps of `new`:

1. Creates a new empty object.
2. **Sets the new object's `__proto__` to point to the Constructor's `prototype`.**
3. **Executes the Constructor function with `this` pointing to the new object.**
4. Returns the new object (unless the constructor manually returns a different object).
