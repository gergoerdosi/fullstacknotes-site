---
title: "Data Types, Immutability, and Coercion"
description: "Dive into the difference between Primitives and Reference types, understand Stack vs. Heap memory, and learn how JavaScript handles type coercion and immutability."
tags: ["data-types", "memory-management", "coercion", "immutability"]
sidebar:
  order: 2
---

## 1. The Two Categories of Types

JavaScript has 8 official data types. They are split into two distinct categories based on how they are stored and accessed.

**Category A: Primitive Types (The Stack Dwellers)**
These are stored directly in the **Stack**. They are simple, lightweight, and **Immutable** (unchangeable).

1. **String** (`"Hello"`)
2. **Number** (`42`, `3.14`)
3. **BigInt** (`9007199254740991n` - for math larger than safe numbers)
4. **Boolean** (`true`, `false`)
5. **Undefined** (`undefined`)
6. **Symbol** (`Symbol('id')` - unique identifiers)
7. **Null** (`null` - *Special Case: Technically a primitive, but acts buggy with `typeof*`)

**Category B: Reference Types (The Heap Dwellers)**
These are stored in the **Heap**. The variable in the Stack only holds a *pointer* (memory address) to them.

1. **Objects** (This includes `Array`, `Function`, `Date`, `RegExp`, etc.)

---

## 2. Deep Dive: Immutability vs. Mutability

This is the most misunderstood concept by beginners. **Primitives are immutable.** You cannot change a primitive value; you can only replace it.

**The "Modification" Illusion:**

```javascript
let str = "Hello";
str[0] = "J"; 
console.log(str); // Output: "Hello"

```

* **Why?** Strings are primitives. You cannot go into memory address `<001>` and change "H" to "J".
* **The Reassignment:** When you say `str = "Jello"`, you are **not** modifying the old string. You are creating a brand new string "Jello" in a *new* memory slot and pointing the variable `str` to it. The old "Hello" is eventually garbage collected.

**Objects are Mutable:**

```javascript
let arr = [1, 2, 3];
arr[0] = 99;
console.log(arr); // Output: [99, 2, 3]

```

* **Why?** Arrays are objects in the Heap. You *can* go to the Heap address and change the data inside the "box" without changing the box itself.

---

## 3. Type Coercion (The Engine's "Magic")

JavaScript is **weakly typed**. This means the engine tries to be helpful by automatically converting types when they don't match. This is called **Implicit Coercion**.

**A. String Coercion (The Strongest Pull)**
If you use the `+` operator and *one* side is a string, the engine converts the other side to a string.

```javascript
console.log(1 + "2");   // "12" (Number 1 becomes "1")
console.log("5" + 5);   // "55"
console.log("5" - 1);   // 4    (Wait, what?)

```

* **Why did minus work?** The `-`, `*`, `/` operators only work on numbers. The engine sees `"5" - 1`, realizes `-` doesn't work on strings, converts `"5"` to number `5`, and does math.

**B. Boolean Coercion (Truthy vs Falsy)**
Every value in JavaScript implies a boolean when placed in a logical context (like an `if` statement).

**The Falsy 7 (Memorize these):**
These evaluate to `false`:

1. `false`
2. `0`
3. `-0`
4. `""` (Empty string)
5. `null`
6. `undefined`
7. `NaN` (Not a Number)

**Everything else is Truthy.**

* `"0"` (String containing zero) -> **True**
* `"false"` (String containing word false) -> **True**
* `[]` (Empty Array) -> **True** (References are always truthy!)
* `{}` (Empty Object) -> **True**

---

## 4. Equality: `==` vs `===`

**A. Loose Equality (`==`)**
Allows coercion. The engine tries to convert types to match before comparing.

* `"5" == 5` -> **True** (String converted to Number)
* `0 == false` -> **True** (Boolean converted to Number)
* `null == undefined` -> **True** (Special rule: they are "loose equals")

**B. Strict Equality (`===`)**
Disallows coercion. Types must match *and* values must match.

* `"5" === 5` -> **False**
* `null === undefined` -> **False**

**Pro Tip:** **Always use `===**`. The only acceptable time to use `==` is when checking for null/undefined simultaneously: `if (variable == null)` catches both.

---

## 5. Special Types: `null`, `undefined`, and `NaN`

**A. `undefined` vs `null**`

* **`undefined`:** "I haven't set this yet." The engine's default value for uninitialized variables.
* **`null`:** "I deliberately set this to nothing." Used by developers to reset a variable.

**B. The `typeof` Bug**
There is a famous bug in the original JavaScript implementation that can never be fixed (it would break the web).

```javascript
console.log(typeof undefined); // "undefined"
console.log(typeof null);      // "object"  <-- THE BUG
console.log(typeof []);        // "object"
console.log(typeof function(){}); // "function"

```

* *Note:* Because `null` returns "object", you cannot use `typeof` to check for null.

**C. `NaN` (Not a Number)**
`NaN` is technically a Number type (ironically). It represents an invalid mathematical operation.

```javascript
const result = "Hello" / 2; // NaN
console.log(typeof result); // "number"

```

* **The Trap:** `NaN` is the only value in the universe that is not equal to itself.
```javascript
console.log(NaN === NaN); // False

```


* *Solution:* Use `Number.isNaN(value)` to check.



---

## 6. Interactive Exercises

These exercises are designed to break your intuition and force you to think like the engine.

**Exercise 1: Coercion Chaos**
*Determine the output of these expressions:*

```javascript
1.  true + false
2.  12 / "6"
3.  "number" + 15 + 3
4.  15 + 3 + "number"
5.  [1] > null
6.  "foo" + + "bar"

```

**Exercise 2: Reference Trap**
*What is the output?*

```javascript
const a = [1, 2, 3];
const b = [1, 2, 3];
const c = "1,2,3";

console.log(a == c);
console.log(a == b);
console.log(a === b);

```

**Exercise 3: The Unchangeable String**
*We want to Capitalize the first letter of `user`. Why does this fail, and how do you fix it?*

```javascript
let user = "alice";
user[0] = "A"; 
console.log(user); // "alice"

```

---

### **Solutions to Exercises**

**Solution 1:**

1. **1** -> `true` converts to `1`, `false` to `0`. `1 + 0 = 1`.
2. **2** -> `/` only works on numbers. `"6"` coerced to `6`. `12 / 6 = 2`.
3. **"number153"** -> Engine sees string first. `"number" + "15"` -> `"number15"`. Then `"number15" + "3"`.
4. **"18number"** -> Engine sees numbers first. `15 + 3 = 18`. Then `18 + "number"`. Order matters!
5. **true** -> `[1]` coerces to string `"1"`, then number `1`. `null` coerces to `0`. `1 > 0`.
6. **"fooNaN"** -> Look closely at `+ +`. The second `+` is a "unary plus" trying to convert "bar" to a number. It fails -> `NaN`. Then `"foo" + NaN` -> `"fooNaN"`.

**Solution 2:**

1. `a == c` -> **True**. The engine calls `.toString()` on the array `a`, which becomes `"1,2,3"`. The strings match.
2. `a == b` -> **False**.
3. `a === b` -> **False**.
* *Why?* Arrays are Reference types. `a` and `b` are two distinct boxes in the Heap. The variables point to different addresses. Comparing references (`==` or `===`) checks if the **address** is the same, not the content.



**Solution 3:**

* **Why it fails:** Strings are **immutable primitives**. `user[0] = "A"` does nothing silently.
* **The Fix:** You must create a *new* string and reassign.
```javascript
user = "A" + user.slice(1);

```
