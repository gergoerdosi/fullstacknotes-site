---
title: "Operators, Logic, and Control Flow"
description: "Master logical operators, short-circuit evaluation, the nullish coalescing operator (??), and efficient control flow patterns beyond standard if/else statements."
tags: ["operators", "logic", "control-flow", "short-circuiting"]
sidebar:
  order: 3
---

## 1. Arithmetic Nuances: Prefix vs. Postfix

You know `+`, `-`, `*`, `/`. But the Increment (`++`) and Decrement (`--`) operators have a "gotcha" depending on where you place them.

* **Postfix (`i++`):** "Use the value *then* increment."
* **Prefix (`++i`):** "Increment *then* use the value."

**The Trap:**

```javascript
let a = 10;
let b = a++; 

console.log(a); // 11 (It incremented)
console.log(b); // 10 (Wait, what?)

```

* **Why?** `a++` returns the value of `a` *before* it changes.
* If we used `let b = ++a`, `b` would be `11`.

---

## 2. Logical Operators: They Don't Return Booleans

This is the biggest secret in JS Logic.
Operators like `&&` (AND) and `||` (OR) **do not return `true` or `false**`. They return **the value of one of the operands**.

**A. The `||` (OR) Operator - "The First Truthy Finder"**
It scans from left to right. It returns the **first truthy value** it finds. If it finds none, it returns the last value.

```javascript
// "Hello" is truthy, so it stops there and returns "Hello".
const result1 = "Hello" || "World"; 
console.log(result1); // "Hello"

// null is falsy, so it keeps going. "User" is truthy.
const result2 = null || "User"; 
console.log(result2); // "User"

```

* **Pattern:** This is often used for **Default Values** (Legacy style).
`const name = inputName || "Anonymous";`

**B. The `&&` (AND) Operator - "The First Falsy Finder"**
It scans from left to right. It returns the **first falsy value** it finds. If all are true, it returns the last value.

```javascript
// 0 is falsy. It stops immediately and returns 0.
const res1 = 0 && "Hello"; 
console.log(res1); // 0 (Not false, but 0!)

// Both are truthy. It returns the last one.
const res2 = "Hello" && "World";
console.log(res2); // "World"

```

* **Pattern:** This is used for **Guard Clauses** (running code only if something exists).
```javascript
// Instead of: if (user) { print(user.name) }
user && print(user.name);

```



---

## 3. The "Zero" Bug and The Solution (`??`)

The `||` operator has a flaw. It treats `0` and `""` (empty string) as bad values because they are Falsy.

**The Problem:**
Imagine you are building an app where a user can set their volume to `0`.

```javascript
const userVolume = 0; // The user wants silence
const systemVolume = userVolume || 50; // Fallback to 50 if userVolume is "bad"

console.log(systemVolume); // 50
// BUG! The user asked for 0, but we forced 50 because 0 is falsy.

```

**The Solution: Nullish Coalescing (`??`)**
Added in ES2020, `??` is smarter. It **only** considers `null` and `undefined` as "bad" values. It accepts `0` and `""` as valid data.

```javascript
const userVolume = 0;
const systemVolume = userVolume ?? 50; 

console.log(systemVolume); // 0 (Correct!)

```

> **Rule of Thumb:** When setting default values for numbers or strings, **always use `??**`. Only use `||` if you specifically want to block `0` or empty strings.

---

## 4. Logical Assignment Operators (`+=`, `||=`, `??=`)

You know `x += 5` is short for `x = x + 5`. ES2021 brought this logic to `||` and `??`.

**A. OR Assignment (`||=`)**
"Assign this value only if the variable is currently falsy."

```javascript
let username = "";
username ||= "Guest"; // equivalent to: username = username || "Guest"
console.log(username); // "Guest"

```

**B. Nullish Assignment (`??=`)**
"Assign this value only if the variable is currently null/undefined."

```javascript
let score = 0;
score ??= 100; 
console.log(score); // 0 (It didn't overwrite 0!)

```

---

## 5. The Ternary Operator (`? :`)

The only operator that takes three operands. It is the inline replacement for `if/else`.

**Syntax:** `condition ? value_if_true : value_if_false`

```javascript
const age = 20;
const type = age >= 18 ? "Adult" : "Child";

```

**Anti-Pattern: Nested Ternaries**
Never nest ternaries. It makes code unreadable.

```javascript
// TERRIBLE CODE - DO NOT DO THIS
const result = score > 50 ? "Pass" : score < 20 ? "Fail" : "Retry";

```

* *Solution:* Use a standard `if/else` or a `switch` statement when logic gets complex.

---

## 6. Interactive Exercises

**Exercise 1: Short-Circuit Detective**
*What are the final values of A, B, and C?*

```javascript
const x = 0;
const y = "Hello";
const z = null;

const A = x || "Default";
const B = x ?? "Default";
const C = y && z && "Finished";

```

**Exercise 2: The Crash Prevention**
*Refactor this code to use Short-Circuiting (`?.` or `&&`).*

```javascript
const user = null;
// This line throws an error because user is null:
// console.log(user.address.street); 

// Task: Make it log 'undefined' (or nothing) instead of crashing, 
// without using an 'if' statement.

```

**Exercise 3: The Wallet Logic**
*We have a wallet. We want to add 50 coins ONLY if the wallet currently has `null` or `undefined` coins. If it has `0`, leave it alone.*

```javascript
let wallet = 0;
// Write one line of code to add 50 coins strictly using logical assignment.
console.log(wallet); // Should still be 0

```

---

### **Solutions to Exercises**

**Solution 1:**

* **A = "Default"**. `x` is `0` (falsy). `||` looks for the next truthy value.
* **B = 0**. `x` is `0`. `??` does NOT consider `0` to be nullish. It accepts it and stops.
* **C = null**. `y` is "Hello" (truthy), so `&&` moves to `z`. `z` is `null` (falsy). `&&` finds a falsy value, stops, and returns it.

**Solution 2:**
You can use **Optional Chaining (`?.`)**, which pairs perfectly with short-circuit logic (we will cover this deeply in Objects, but it's good to preview).

```javascript
console.log(user?.address?.street); 
// Output: undefined

```

* Alternatively, using `&&`: `console.log(user && user.address && user.address.street);`

**Solution 3:**

```javascript
wallet ??= 50;

```

* Since `wallet` was `0`, and `0` is not null/undefined, the assignment does not happen. `wallet` remains `0`.
