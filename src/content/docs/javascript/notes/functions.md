---
title: "Functions: Scope, Closures and Recursion"
description: "Unlock the power of functional JavaScript. This module covers function anatomy, the modern syntax of Arrow Functions, the mechanics of Scope and Hoisting, and advanced concepts like Closures and Recursion."
tags: ["javascript", "functions", "web-development", "es6"]
sidebar:
  order: 3
---

## 1. Function Anatomy

In JavaScript, functions are "first-class citizens," meaning they can be treated like any other variable (passed as arguments, returned from other functions, etc.).

### Declaration vs. Expression

**1. Function Declaration:**
The traditional way. These are **hoisted**, meaning you can call them *before* they are defined in the code.

```javascript
// This works!
console.log(add(2, 3)); 

function add(a, b) {
    return a + b;
}

```

**2. Function Expression:**
Storing a function inside a variable. These are **not hoisted** (the variable is, but the function definition isn't). You must define them before using them.

```javascript
// console.log(multiply(2, 3)); // Error: Cannot access 'multiply' before initialization

const multiply = function(a, b) {
    return a * b;
};

```

### Parameters vs. Arguments

* **Parameters:** The placeholders defined in the function signature (`a`, `b`).
* **Arguments:** The actual values passed when calling the function (`2`, `3`).

**Default Parameters (ES6):**
You can set default values to avoid `undefined` errors.

```javascript
function greet(name = "Guest") {
    return `Hello, ${name}`;
}
console.log(greet()); // "Hello, Guest"
console.log(greet("Sam")); // "Hello, Sam"

```

---

## 2. Arrow Functions (ES6)

Arrow functions provide a shorter syntax and a change in how `this` behaves.

### Syntax Differences

```javascript
// Traditional
const square = function(x) {
    return x * x;
};

// Arrow Function
const squareArrow = (x) => {
    return x * x;
};

// Arrow Function (Implicit Return)
// If there is only one line, you can remove {} and 'return'
const squareShort = x => x * x; 

```

### The "Lexical `this`"

This is the main reason to use Arrow Functions apart from brevity.

* **Traditional Functions:** `this` depends on *how* the function is called.
* **Arrow Functions:** `this` is inherited from the parent scope (lexical scope). They do not have their own `this`.

```javascript
const user = {
    name: "Alice",
    skills: ["JS", "React"],
    
    // Traditional function: 'this' refers to 'user'
    showSkills: function() {
        // We use .forEach here.
        // Inside forEach, a traditional function would lose 'this' context!
        this.skills.forEach((skill) => {
            // Because this is an arrow function, it "sees" the 'this' from showSkills
            console.log(`${this.name} knows ${skill}`);
        });
    }
};

user.showSkills();
// Output: 
// Alice knows JS
// Alice knows React

```

---

## 3. Scope and Hoisting

### Execution Context

When JS runs, it creates an "Execution Context."

1. **Creation Phase:** The engine scans for variables and functions.
* `function` declarations are stored in memory fully.
* `var` variables are set to `undefined`.
* `let` and `const` are placed in the "Temporal Dead Zone" (uninitialized).


2. **Execution Phase:** Code is run line-by-line.

### Practical Implications

This is why function declarations work anywhere in the file, but expressions do not.

```javascript
// Variable Hoisting
console.log(a); // undefined (var is hoisted)
var a = 5;

// console.log(b); // ReferenceError (let is in TDZ)
let b = 10;

```

---

## 4. Closures

A closure gives you access to an outer function’s scope from an inner function. In JavaScript, **functions remember the environment in which they were created.**

This is the primary way to achieve **Data Privacy** in JavaScript.

### The "Private Counter" Example

If you just use a global variable, anyone can change it. Closures allow you to hide variables.

```javascript
function createCounter() {
    let count = 0; // This variable is "closed over" (private)

    return {
        increment: function() {
            count++;
            console.log(count);
        },
        decrement: function() {
            count--;
            console.log(count);
        },
        getCount: function() { // Optional: Read-only access
            return count;
        }
    };
}

const myCounter = createCounter();

myCounter.increment(); // 1
myCounter.increment(); // 2
// console.log(count); // Error! 'count' is not defined globally.
// myCounter.count = 100; // Does nothing to the private variable.

```

**Why this matters:**
This pattern is the foundation of the Module Pattern and how React Hooks (like `useState`) work under the hood.

---

## 5. Recursion

Recursion is when a function calls itself. It is useful for traversing tree structures (like the DOM or file systems).

**The Two Requirements:**

1. **Base Case:** A condition to stop the recursion (otherwise: Stack Overflow).
2. **Recursive Step:** The logic that breaks the problem down and calls the function again.

```javascript
// Calculate Factorial (5! = 5 * 4 * 3 * 2 * 1)

function factorial(n) {
    // 1. Base Case
    if (n === 0 || n === 1) {
        return 1;
    }
    
    // 2. Recursive Step
    return n * factorial(n - 1);
}

console.log(factorial(5)); // 120

```

**Visualizing the Call Stack for `factorial(3)`:**

1. `factorial(3)` calls `3 * factorial(2)`
2. `factorial(2)` calls `2 * factorial(1)`
3. `factorial(1)` returns `1` (Base Case hit!)
4. Stack unwinds: `2 * 1 = 2`
5. Stack unwinds: `3 * 2 = 6` -> Result

---

## Review Challenge

Look at the closure example below. What will be logged to the console?

```javascript
function outer() {
    let message = "Hello";
    
    function inner() {
        console.log(message);
    }
    
    message = "Goodbye"; // Variable changed BEFORE inner is returned/called
    return inner;
}

const saySomething = outer();
saySomething(); // ?

```

<details>
<summary>Click to see the answers</summary>

*(**Answer:** `"Goodbye"`. The closure maintains a reference to the **live variable**, not a snapshot of the value at the time of creation.)*

</details>
