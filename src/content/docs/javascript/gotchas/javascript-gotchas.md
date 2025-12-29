---
title: "JavaScript Gotchas: The Weird Parts"
description: "A survival guide to JavaScript's quirks. Learn why 0.1+0.2 isn't 0.3, why loops break with 'var', how 'this' gets lost, and why your async forEach loops aren't waiting."
tags: ["javascript", "advanced", "debugging", "best-practices"]
sidebar:
  order: 9
---

JavaScript was built in 10 days in 1995. While it has evolved into a powerful language, it carries "historical baggage" that can lead to baffling bugs. This module categorizes these quirks so you can spot them before they break your production code.

---

## 1. Type Coercion and Equality Madness

You learned about `==` vs `===` in Module 1, but the rabbit hole goes deeper.

### The "Falsy" Object Trap

You might expect objects to behave logically in boolean contexts. However, **all objects are truthy**, even empty ones.

```javascript
// Expectation: An empty array is "nothing", so it should be false?
// Reality:
if ([]) {
    console.log("This runs!"); // Objects (including Arrays) are always truthy
}

// The Paradox:
console.log([] == false); // true (Wait, what?)

```

**Why?**

1. `if ([])`: Checks if the *reference* exists. It does, so it's **true**.
2. `[] == false`: The `==` operator triggers **numeric conversion**.
* `[]` converts to `""` (empty string).
* `""` converts to `0`.
* `false` converts to `0`.
* `0 == 0` -> **true**.



### The `NaN` Check

`NaN` (Not a Number) is the only value in JavaScript that is **not equal to itself**.

```javascript
const result = "abc" / 2; // NaN

console.log(result == NaN);  // false
console.log(result === NaN); // false

// The Fix:
console.log(Number.isNaN(result)); // true

```

---

## 2. Floating Point Math (IEEE 754)

This is not unique to JS, but it bites JS developers often because JS uses floating-point math for *all* numbers (it has no dedicated Integer type).

### The 0.1 + 0.2 Problem

```javascript
const sum = 0.1 + 0.2;
console.log(sum); // 0.30000000000000004

console.log(sum === 0.3); // false

```

**Why?**
Computers store numbers in binary. `0.1` and `0.2` result in repeating fractions in binary (like 1/3 in base 10), causing precision loss.

**The Fix:**
When dealing with money or precise decimals, multiply to integers first or use `toFixed()`.

```javascript
// Method 1: Work with cents
const price = (10 + 20) / 100; // 0.3

// Method 2: Rounding (returns a String)
console.log(sum.toFixed(1)); // "0.3"

```

---

## 3. Reference vs. Value (The Mutation Trap)

We covered this briefly, but this is the #1 cause of "Ghost Bugs" where data changes in one part of your app affect an unrelated part.

### Shallow Copies

Using the Spread operator `...` creates a **Shallow Copy**. It copies the top level, but nested objects are still references.

```javascript
const user = {
    name: "Alice",
    settings: {
        theme: "Dark"
    }
};

const userCopy = { ...user };

// 1. Changing a primitive on the copy is fine
userCopy.name = "Bob";

// 2. Changing a nested object affects the ORIGINAL!
userCopy.settings.theme = "Light";

console.log(user.name); // "Alice" (Safe)
console.log(user.settings.theme); // "Light" (RUINED!)

```

**The Fix: Deep Clone**
For simple objects (no functions/dates), use `JSON`. For complex ones, use `structuredClone()`.

```javascript
const safeCopy = structuredClone(user);

```

---

## 4. Scope: The `var` Loop Disaster

This is a classic interview question that demonstrates the danger of `var` and Function Scope.

```javascript
// The Setup
for (var i = 0; i < 3; i++) {
    setTimeout(() => {
        console.log(i);
    }, 100);
}

```

**Expectation:** `0, 1, 2`
**Reality:** `3, 3, 3`

**Why?**

* `var i` is **function scoped** (or global here). It is hoisted outside the loop.
* There is only **one** variable `i` shared by all 3 iterations.
* The `setTimeout` runs *after* the loop finishes. By then, `i` has already incremented to `3`.

**The Fix:**
Use `let`. It creates a new **block-scoped** binding for every iteration.

```javascript
for (let i = 0; i < 3; i++) { ... } // Output: 0, 1, 2

```

---

## 5. The Automatic Semicolon Insertion (ASI)

JavaScript tries to be helpful by adding semicolons where you forgot them. Usually, this is fine. Sometimes, it is catastrophic.

### The Return Statement Trap

```javascript
function getUser() {
    return
    {
        name: "Alice"
    }
}

console.log(getUser()); // undefined

```

**Why?**
The parser sees a `return` followed by a newline. It assumes you are done and inserts a semicolon: `return;`. The object block below it is never reached.

**The Fix:**
Never start a return object on a new line.

```javascript
function getUser() {
    return { // Brace starts on the same line
        name: "Alice"
    }
}

```

---

## 6. Async Gotchas: `forEach` with `await`

Array methods like `forEach`, `map`, and `filter` do not play nice with `async/await` in the way you might expect.

### The `forEach` Problem

`forEach` expects a synchronous function. If you pass it an `async` function, it fires them all off and immediately returns. It does **not** wait for them to finish.

```javascript
const urls = ['url1', 'url2', 'url3'];

async function process() {
    console.log("Start");
    
    urls.forEach(async (url) => {
        const data = await fetch(url); // Takes 1 second
        console.log("Fetched", url);
    });

    console.log("End"); 
}

process();

```

**Expectation:** Start -> Fetched x3 -> End
**Reality:** Start -> End -> Fetched x3

**The Fix:**
Use a standard `for...of` loop. It respects `await`.

```javascript
async function process() {
    console.log("Start");
    
    for (const url of urls) {
        await fetch(url);
        console.log("Fetched", url);
    }

    console.log("End");
}

```

---

## 7. The `this` Keyword Disappearing Act

When you pass a method as a callback (e.g., to an event listener or timer), it loses its connection to the original object.

```javascript
class Button {
    constructor() {
        this.text = "Click Me";
    }
    
    click() {
        console.log(this.text);
    }
}

const btn = new Button();
const myFunc = btn.click;

myFunc(); // undefined (or Error in strict mode)

```

**Why?**
`this` is determined at **call time**. Since `myFunc` is called as a plain function (not `btn.myFunc()`), `this` is global/undefined.

**The Fix:**

1. **Bind:** `this.click = this.click.bind(this);` in constructor.
2. **Arrow Functions:** Arrow functions preserve the lexical `this`.

```javascript
// Class Field Syntax (Best Practice in React/Modern JS)
class Button {
    click = () => {
        console.log(this.text);
    }
}

```

---

## 8. Sorting Numbers

The `.sort()` method converts elements to strings by default.

```javascript
const nums = [1, 5, 20, 100];
nums.sort();

console.log(nums); // [1, 100, 20, 5]

```

**Why?**
Alphabetically, "100" comes before "20" just like "Apple" comes before "Banana".

**The Fix:**
Always provide a comparator function for numbers.

```javascript
// a - b yields negative if a is smaller (sorts ascending)
nums.sort((a, b) => a - b); 
console.log(nums); // [1, 5, 20, 100]

```

---

## **Review Challenge**

Spot the bug in this code snippet:

```javascript
const data = { count: 0 };

// We want to set default to 10 if count is missing
const finalCount = data.count || 10;

console.log(finalCount);

```

<details>
<summary>Click to see the answers</summary>

*(**Answer:** `finalCount` will be `10`, not `0`. Because `0` is falsy, the `||` operator skips it. The fix is to use the Nullish Coalescing operator `??`, which only skips `null` or `undefined`: `data.count ?? 10`)*

</details>
