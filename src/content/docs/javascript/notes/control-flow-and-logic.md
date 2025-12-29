---
title: "Control Flow and Logic"
description: "Master the art of decision-making in code. This module covers conditionals (if/else, switch), loops, iterators (for...of vs. for...in), and robust error handling strategies."
tags: ["javascript", "programming", "web-development"]
sidebar:
  order: 2
---

## 1. Conditionals

Conditionals allow your code to execute different blocks based on whether specific conditions are `true` or `false`.

### A. The `if`, `else if`, and `else` Statements

The most basic form of decision-making.

```javascript
const hour = 14;

if (hour < 12) {
    console.log("Good Morning!");
} else if (hour < 18) {
    console.log("Good Afternoon!");
} else {
    console.log("Good Evening!");
}

```

### B. The Switch Statement

Ideal for comparing a single value against multiple potential matches (cases). It uses **strict equality** (`===`).

**Key Concept:** `break`
Without `break`, execution "falls through" to the next case, executing code regardless of the match.

```javascript
const role = "admin";

switch (role) {
    case "guest":
        console.log("Read-only access");
        break; // Stops execution here
    case "editor":
    case "admin": // Stacking cases: Both editor and admin run this block
        console.log("Read/Write access");
        break;
    default:
        console.log("Unknown role");
}

```

### C. The Ternary Operator (`? :`)

A shorthand for `if...else`. It is the only JavaScript operator that takes three operands.

**Syntax:** `condition ? valueIfTrue : valueIfFalse`

```javascript
const age = 20;

// Standard if-else
let status;
if (age >= 18) {
    status = "Adult";
} else {
    status = "Minor";
}

// Ternary Equivalent (Cleaner)
const quickStatus = age >= 18 ? "Adult" : "Minor";
console.log(quickStatus); // "Adult"

```

---

## 2. Loops (Standard)

Loops repeat a block of code as long as a specified condition is true.

### A. `for` Loop

Best used when you know exactly how many times you want to loop.

**Syntax:** `for (initialization; condition; update) { ... }`

```javascript
for (let i = 0; i < 5; i++) {
    if (i === 2) continue; // Skips the rest of the current iteration (skips printing 2)
    if (i === 4) break;    // Exits the loop entirely (stops before 4)
    console.log(`Iteration: ${i}`);
}
// Output: 0, 1, 3

```

### B. `while` Loop

Best used when the number of iterations is unknown and depends on a condition changing.

```javascript
let count = 0;

while (count < 3) {
    console.log(`Count is ${count}`);
    count++; // CRITICAL: If you forget this, you get an infinite loop!
}

```

### C. `do...while` Loop

Similar to `while`, but guarantees the code block runs **at least once** before checking the condition.

```javascript
let num = 10;

do {
    console.log(num); // Prints 10 even though 10 is not < 5
    num++;
} while (num < 5);

```

---

## 3. Iterators: `for...of` vs `for...in`

This is a common point of confusion. One iterates over **values**, the other over **keys**.

### A. `for...of` (The Modern Standard)

Used for **iterable** objects (Arrays, Strings, Maps, Sets). It accesses the **values**.

```javascript
const colors = ["Red", "Green", "Blue"];

for (const color of colors) {
    console.log(color);
}
// Output: "Red", "Green", "Blue"

```

### B. `for...in` (The Legacy Style)

Used for **Objects**. It iterates over the **keys** (property names).

*Warning:* If used on an array, it returns the *indices* ("0", "1", "2"), not the items.

```javascript
const user = {
    name: "Alice",
    age: 25,
    role: "Developer"
};

for (const key in user) {
    // We have the key ("name"), so we access the value using user[key]
    console.log(`${key}: ${user[key]}`);
}
// Output:
// name: Alice
// age: 25
// role: Developer

```

| Loop Type | Best For | What it returns |
| --- | --- | --- |
| **`for...of`** | Arrays, Strings | The actual items (Values) |
| **`for...in`** | Objects | The property names (Keys) |

---

## 4. Error Handling

When code fails (e.g., trying to parse bad JSON or accessing a missing variable), JavaScript "throws" an error. If unhandled, this crashes the script.

### The `try...catch...finally` Block

```javascript
function safeDivision(a, b) {
    try {
        // 1. Code that might fail goes here
        if (b === 0) {
            throw new Error("Cannot divide by zero!"); // Manually throwing a custom error
        }
        console.log("Result:", a / b);
        
        // Let's pretend we made a typo here to force a crash
        // console.log(undefinedVariable); 
        
    } catch (error) {
        // 2. Runs ONLY if an error occurs in the try block
        console.error("An error occurred!");
        console.error("Error Name:", error.name);
        console.error("Error Message:", error.message);
        
    } finally {
        // 3. Always runs (success or fail). Good for cleanup (closing connections, etc.)
        console.log("Operation complete.");
    }
}

safeDivision(10, 0);
// Output:
// An error occurred!
// Error Name: Error
// Error Message: Cannot divide by zero!
// Operation complete.

```

### The `Error` Object

When creating your own errors, use the built-in `Error` object rather than throwing raw strings. This preserves the "stack trace" (the history of function calls that led to the error), which is vital for debugging.

```javascript
// Bad practice
throw "Something went wrong"; 

// Good practice
throw new Error("Something went wrong"); 

```

---

## Review Challenge

Given the following object, how would you iterate over it to print `"Item: Apple, Price: 1.2"`?

```javascript
const prices = {
    Apple: 1.2,
    Banana: 0.8,
    Cherry: 3.0
};

```

*(Hint: `prices` is an Object, not an Array. Which loop is best for keys?)*

<details>
<summary>Click to see the solution</summary>

**Solution 1: Using `for...in` (The classic way)**

Since `prices` is a plain Object, `for...in` is the direct way to access the keys (Apple, Banana, etc.).

```javascript
const prices = {
    Apple: 1.2,
    Banana: 0.8,
    Cherry: 3.0
};

for (const item in prices) {
    // 'item' is the key (e.g., "Apple")
    // 'prices[item]' is the value (e.g., 1.2)
    console.log(`Item: ${item}, Price: ${prices[item]}`);
}

```

**Solution 2: Using `Object.entries()` (The modern way)**

A more robust method often used in modern development is to convert the object into an array of pairs using `Object.entries()`, and then use `for...of`. This is safer because it avoids iterating over inherited properties.

```javascript
// Object.entries(prices) converts the object into:
// [ ["Apple", 1.2], ["Banana", 0.8], ["Cherry", 3.0] ]

for (const [item, price] of Object.entries(prices)) {
    console.log(`Item: ${item}, Price: ${price}`);
}

```

</details>
