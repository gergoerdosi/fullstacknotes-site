---
title: "Data Structures and Manipulation"
description: "Master data manipulation in JavaScript. Learn the essential array methods (map, filter, reduce), understand object context, and modernize your code with Destructuring, Spread, and Sets."
tags: ["javascript", "arrays", "es6", "data-structures"]
sidebar:
  order: 4
---

## 1. Arrays: The Workhorse of JS

Arrays are ordered collections of data. Knowing how to manipulate them efficiently is the single most important skill for handling data.

### Mutation vs. Non-Mutation

It is critical to know if a method changes the original array (Mutation) or returns a new one. In modern frameworks like React, **immutability** (not changing the original) is preferred.

**1. Mutation Methods (Changes Original):**

* `push()` / `pop()`: Add/Remove from end.
* `unshift()` / `shift()`: Add/Remove from start.
* `splice(start, deleteCount, item)`: Removes or replaces items in place.
```javascript
const nums = [1, 2, 3, 4, 5];
nums.splice(1, 2); // Removes 2 items starting at index 1
console.log(nums); // [1, 4, 5] (Original changed!)

```


* `sort()` / `reverse()`: Reorders the array in place.

**2. Non-Mutation Methods (Returns New Array):**

* `slice(start, end)`: cuts out a piece of an array.
```javascript
const nums = [1, 2, 3, 4, 5];
const sub = nums.slice(1, 3); // Returns [2, 3]
console.log(nums); // [1, 2, 3, 4, 5] (Unchanged)

```


* `concat()`: Merges arrays.

### High-Order Array Methods

These methods take a callback function as an argument. They represent the "functional programming" style of JS.

**1. `.map()` (Transform)**
Creates a new array by applying a function to *every* element.

```javascript
const prices = [10, 20, 30];
const tax = prices.map(price => price * 1.2);
console.log(tax); // [12, 24, 36]

```

**2. `.filter()` (Select)**
Creates a new array with only elements that pass the test.

```javascript
const ages = [12, 18, 25, 8];
const adults = ages.filter(age => age >= 18);
console.log(adults); // [18, 25]

```

**3. `.reduce()` (Accumulate)**
Boils an array down to a single value (number, object, string).
*Syntax:* `arr.reduce(callback, initialValue)`

```javascript
const nums = [1, 2, 3, 4];
const sum = nums.reduce((total, current) => total + current, 0);
console.log(sum); // 10

```

**4. `.find()`:** Returns the **first** element that matches.
**5. `.some()` / `.every()`:** Returns `true`/`false` based on whether *some* or *all* elements match.

---

## 2. Objects

Objects are key-value pairs.

### Property Access

* **Dot Notation (`obj.key`):** Cleanest, used when you know the key name.
* **Bracket Notation (`obj['key']`):** Mandatory when the key is a variable or has spaces.

```javascript
const person = {
    name: "John",
    "home address": "123 St"
};

const key = "name";
console.log(person.key); // undefined (looks for key named "key")
console.log(person[key]); // "John" (evaluates variable 'key')
console.log(person["home address"]); // "123 St"

```

### Static Object Methods

Useful for iterating over objects.

1. `Object.keys(obj)`: Returns array of keys.
2. `Object.values(obj)`: Returns array of values.
3. `Object.entries(obj)`: Returns array of `[key, value]` pairs.

### The `this` Keyword (Context)

Inside an object method, `this` refers to the object itself (usually).

```javascript
const car = {
    brand: "Toyota",
    start: function() {
        console.log(`Starting ${this.brand}`);
    }
};
car.start(); // "Starting Toyota"

```

*Note: If you extract the function `const start = car.start; start();`, `this` is lost (undefined or global).*

---

## 3. Modern ES6+ Syntax

These features make code cleaner and are ubiquitous in modern codebases.

### Destructuring

Unpacking values from arrays or objects into distinct variables.

```javascript
// Object Destructuring
const user = { id: 1, name: "Alice", email: "a@test.com" };
const { name, email } = user; 
// Creates variables 'name' and 'email' automatically.

// Array Destructuring
const coords = [10, 20];
const [x, y] = coords; 
// x=10, y=20

```

### Spread Operator (`...`)

Expands an iterable into individual elements.

```javascript
// Merging Arrays
const a = [1, 2];
const b = [3, 4];
const combined = [...a, ...b]; // [1, 2, 3, 4]

// Cloning Objects (Shallow Copy)
const obj1 = { name: "Alice" };
const obj2 = { ...obj1, age: 30 }; 
// { name: "Alice", age: 30 }

```

### Rest Parameters (`...`)

Collects multiple arguments into a single array. Used in function definitions.

```javascript
function sumAll(...numbers) { // 'numbers' becomes an array
    return numbers.reduce((a, b) => a + b, 0);
}
console.log(sumAll(1, 2, 3, 4)); // 10

```

---

## 4. Maps and Sets

Standard Objects are great, but sometimes you need specialized data structures.

| Feature | Object `{}` | Map `new Map()` | Set `new Set()` |
| --- | --- | --- | --- |
| **Key Types** | Strings/Symbols only | Any type (Objects, Functions) | N/A (Stores values only) |
| **Order** | Not guaranteed | Insertion order preserved | Insertion order preserved |
| **Duplicates** | Keys must be unique | Keys must be unique | **Values** must be unique |

### When to use a Set?

The fastest way to remove duplicates from an array.

```javascript
const duplicates = [1, 2, 2, 3, 4, 4];
const uniqueSet = new Set(duplicates);
const uniqueArray = [...uniqueSet]; // Convert back to array

console.log(uniqueArray); // [1, 2, 3, 4]

```

### When to use a Map?

When you need to associate data with DOM nodes or objects without modifying them, or need frequent size checks (`map.size` vs `Object.keys(obj).length`).

---

## Review Challenge

You have an array of user objects. Use `.map()` to get an array of just their IDs, but only for users who are active (`isActive: true`).

```javascript
const users = [
    { id: 1, name: "A", isActive: true },
    { id: 2, name: "B", isActive: false },
    { id: 3, name: "C", isActive: true }
];

```

*Hint: You might need to chain two methods together.*

<details>
<summary>Click to see the solution</summary>

**Solution: Chaining `.filter()` and `.map()`**

This is the most readable and common pattern in modern JavaScript.

1. **Filter** first to remove the unwanted items.
2. **Map** second to transform the remaining items into just the IDs.

```javascript
const users = [
    { id: 1, name: "A", isActive: true },
    { id: 2, name: "B", isActive: false },
    { id: 3, name: "C", isActive: true }
];

const activeIds = users
    .filter(user => user.isActive)  // Step 1: Keep only active users
    .map(user => user.id);          // Step 2: Extract IDs

console.log(activeIds); // Output: [1, 3]

```

**Alternative Solution: Using `.reduce()`**

You can do both steps in one pass using `reduce`, though it can be slightly harder to read.

```javascript
const activeIdsReduce = users.reduce((acc, user) => {
    if (user.isActive) {
        acc.push(user.id);
    }
    return acc;
}, []);

console.log(activeIdsReduce); // Output: [1, 3]

```

</details>