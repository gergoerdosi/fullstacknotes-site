---
title: "Arrays and The Iteration Protocols"
description: "Stop writing loops. Master functional array programming with map, filter, and reduce, and understand how to manipulate data immutably."
tags: ["arrays", "functional-programming", "map-filter-reduce", "data-structures"]
sidebar:
  order: 7
---

## 1. The "Mutation" Danger Zone

Before we learn the new methods, we must distinguish between methods that **change** the original array (Mutators) and methods that **create a new one** (Accessors).

**The Mutators (Old School & Dangerous):**
These modify the array *in place*. If you use these in Redux or React state without copying first, the app won't re-render.

* `push()`, `pop()`, `shift()`, `unshift()`
* `splice()` (The chaos maker)
* `sort()`, `reverse()`

**The Accessors (Safe & Functional):**
These leave the original array untouched and return a **new** array.

* `slice()`
* `concat()`
* `map()`, `filter()`, `reduce()`
* **New in 2023:** `toSorted()`, `toReversed()`, `toSpliced()` (Safe versions of the mutators!)

---

## 2. The Holy Trinity: Map, Filter, Reduce

These three methods are the bread and butter of data manipulation.

**A. `map()` - The Transformer**
"Take an array of X, run a function on every item, and give me back an array of Y."

* **Input:** Array of length N.
* **Output:** New Array of length N.

```javascript
const prices = [10, 20, 30];

// Double every price
const doubled = prices.map((price) => price * 2);

console.log(doubled); // [20, 40, 60]
console.log(prices);  // [10, 20, 30] (Original is safe!)

```

**B. `filter()` - The Gatekeeper**
"Take an array, test every item. If the test passes (true), keep it. If not, throw it away."

* **Input:** Array of length N.
* **Output:** New Array of length 0 to N.

```javascript
const users = [
  { name: "Alice", active: true },
  { name: "Bob", active: false },
  { name: "Charlie", active: true }
];

const activeUsers = users.filter((user) => user.active); 
// Result: [{ Alice }, { Charlie }]

```

**C. `reduce()` - The Swiss Army Knife**
"Take an array and boil it down to **one single value**."
That value can be a number, a string, an object, or even another array.

* **Syntax:** `array.reduce(callback, initialValue)`
* **Callback:** `(accumulator, currentItem) => { ... }`

```javascript
const nums = [10, 20, 30];

// Sum all numbers
const sum = nums.reduce((acc, current) => {
  return acc + current;
}, 0); // <-- 0 is the initial value of 'acc'

console.log(sum); // 60

```

* **Trace:**
1. `acc` starts at 0. `current` is 10. `0 + 10` = 10.
2. `acc` is now 10. `current` is 20. `10 + 20` = 30.
3. `acc` is now 30. `current` is 30. `30 + 30` = 60. Done.



---

## 3. Advanced: Chaining Methods

Because `map` and `filter` return arrays, you can chain them together. This creates a readable pipeline of data.

**Scenario:** We have a list of products. We want to find the "Sale" items, convert their prices to strings, and get a list of just the formatted strings.

```javascript
const products = [
  { name: "Laptop", price: 1000, onSale: true },
  { name: "Phone", price: 500, onSale: false },
  { name: "Mouse", price: 50, onSale: true }
];

const saleLabels = products
  .filter(p => p.onSale)               // 1. Keep only sale items
  .map(p => `$${p.price.toFixed(2)}`); // 2. Transform to string

console.log(saleLabels); // ["$1000.00", "$50.00"]

```

* *Note:* This loops over the data twice. For massive datasets (millions of rows), you might combine these into a single `reduce` for performance, but for 99% of web apps, chaining is preferred for readability.

---

## 4. Searching Arrays

Stop writing loops to find things.

1. **`find()`**: Returns the **first item** that matches.
```javascript
const user = users.find(u => u.id === 55);

```


2. **`some()`**: Returns `true` if **at least one** item matches.
```javascript
const hasAdmin = users.some(u => u.role === 'admin');

```


3. **`every()`**: Returns `true` if **all** items match.
```javascript
const allActive = users.every(u => u.active);

```


4. **`includes()`**: Checks for simple values (primitives).
```javascript
if (tags.includes('new')) { ... }

```



---

## 5. Interactive Exercises

**Exercise 1: The Transform**
*Given an array of user objects, create an array of just their IDs, but only for users who are over 18.*

```javascript
const people = [
  { id: 1, age: 25 },
  { id: 2, age: 15 },
  { id: 3, age: 30 }
];
// Expected Output: [1, 3]
// Task: Use filter() and map() chain.

```

**Exercise 2: The Reducer**
*Turn this array of strings into an Object where the key is the string and the value is the length of the string.*

```javascript
const words = ["apple", "banana", "cherry"];
// Expected Output: { apple: 5, banana: 6, cherry: 6 }
// Task: Use reduce().

```

**Exercise 3: Mutation Fix**
*This function is bad because it sorts the original array. Rewrite it to return a sorted COPY using the modern `toSorted()` or `slice().sort()`.*

```javascript
const numbers = [5, 1, 3];
function getTopScores(arr) {
  return arr.sort((a, b) => b - a); // DANGER: Modifies 'numbers' outside!
}

```

---

### **Solutions to Exercises**

**Solution 1:**

```javascript
const validIds = people
  .filter(person => person.age > 18)
  .map(person => person.id);

```

**Solution 2:**
This is a classic use of `reduce` to transform Array -> Object.

```javascript
const wordMap = words.reduce((acc, word) => {
  acc[word] = word.length; // Assign key-value
  return acc; // ALWAYS return the accumulator for the next loop
}, {}); // <-- Initial value is an empty object

```

**Solution 3:**

```javascript
// Option A: The "Old Reliable" (slice creates a copy, then sort sorts the copy)
function getTopScores(arr) {
  return arr.slice().sort((a, b) => b - a);
}

// Option B: The "Ultra Modern" (ES2023+)
function getTopScores(arr) {
  return arr.toSorted((a, b) => b - a);
}

```
