---
title: "DOM Manipulation and Performance"
description: "Learn to manipulate the DOM without freezing the browser. Master the Critical Rendering Path, avoid Reflow/Layout Thrashing, and use DocumentFragments."
tags: ["dom-manipulation", "performance", "rendering", "reflow"]
sidebar:
  order: 11
---

## 1. Creating and Modifying Elements

**A. The Secure Way (`textContent`)**
When you want to put text inside an element, always use `textContent`.

```javascript
const title = document.createElement('h1');
title.textContent = "Hello <script>alert('Hack')</script>"; 
// Browser renders the brackets literally. Safe.

```

**B. The Dangerous Way (`innerHTML`)**
`innerHTML` parses the string as HTML code. This is useful but opens the door to **Cross-Site Scripting (XSS)**.

```javascript
const box = document.querySelector('.box');
// DANGER: If this data comes from a user/database, they can inject malicious scripts.
box.innerHTML = "<img src='x' onerror='stealCookies()'>"; 

```

> **Rule:** Only use `innerHTML` if you completely trust the content (e.g., hardcoded templates). For everything else, use `textContent`.

---

## 2. Modern Insertion (`append` vs `appendChild`)

You probably learned `appendChild`. It's time to upgrade.

* **`parent.appendChild(node)` (Old):**
* Can only append **Nodes** (elements).
* Cannot append text strings directly.
* Returns the appended node.


* **`parent.append(node, "text", ...)` (Modern):**
* Can append **Nodes** AND **Strings** (text).
* Can append multiple things at once.
* Returns `undefined`.



```javascript
const div = document.createElement('div');
const p = document.createElement('p');

// Modern
div.append(p, "Some text"); 

// Old School
div.appendChild(p);
div.appendChild(document.createTextNode("Some text"));

```

---

## 3. Performance: Reflow vs. Repaint

This is the most technical part of frontend performance.

When you change the DOM, the browser follows a sequence:

1. **Recalculate Styles:** Figure out which CSS rules apply.
2. **Layout (Reflow):** Calculate the exact position (x, y) and size (width, height) of every element. **(Expensive!)**
3. **Paint (Repaint):** Fill in the pixels (colors, shadows, borders). **(Moderate)**
4. **Composite:** Stack the layers together. **(Cheap)**

**A. What triggers a Reflow (Bad)?**
Changing geometry. If you change `width`, `height`, `margin`, `font-size`, or `top/left`, the browser must re-measure the page layout. It might even affect surrounding elements.

**B. What triggers a Repaint (Better)?**
Changing appearance without changing geometry. `color`, `background-color`, `visibility`.

**C. The Best (Composite only):**
`transform` and `opacity`. These are handled by the GPU and bypass the Layout/Paint stages completely. *Always use transform for animations.*

---

## 4. Layout Thrashing (The "Forced Synchronous Layout")

Browsers are smart. If you update styles 10 times in a row, the browser waits and does one single Reflow at the end.
**Unless you break the optimization.**

If you **Write** a style, then immediately **Read** a geometry property, you force the browser to run Layout *right now* to give you the answer.

**The "Thrashing" Loop (Don't do this):**

```javascript
const box = document.getElementById('box');

// BAD LOOP
for (let i = 0; i < 10; i++) {
  box.style.width = (10 + i) + 'px'; // WRITE
  
  // To answer this, the browser MUST run a Reflow immediately!
  console.log(box.offsetWidth);      // READ
}
// Result: 10 separate Reflows. Extremely slow.

```

**The Fix (Batching):**
Read everything first. Write everything last.

---

## 5. `DocumentFragment` (The Secret Weapon)

If you need to add 100 items to a list, don't append them one by one to the DOM. That causes 100 calculations.

Use a `DocumentFragment`. It is a lightweight DOM container that lives **off-screen**. You can append 100 items to it (0 reflows). Then, append the fragment to the real DOM (1 reflow).

```javascript
const list = document.querySelector('ul');
const fragment = document.createDocumentFragment();

for (let i = 0; i < 100; i++) {
  const li = document.createElement('li');
  li.textContent = `Item ${i}`;
  fragment.appendChild(li); // Happens in memory, not on screen
}

list.appendChild(fragment); // ONE single Reflow for the whole list

```

---

## 6. Interactive Exercises

**Exercise 1: Safe Content**
*You have a user input string: `const name = "<img src=x onerror=alert(1)>"`. Write the JS code to insert this into `<div id="profile"></div>` safely so it displays the text literally instead of running the alert.*

**Exercise 2: Reflow Detective**
*Which line in this function triggers a Layout (Reflow) calculation?*

```javascript
function update() {
  const div = document.querySelector('div');
  div.style.color = 'blue';       // Line A
  div.style.margin = '10px';      // Line B
  div.style.display = 'none';     // Line C
  const height = div.clientHeight; // Line D
}

```

**Exercise 3: Optimization**
*Refactor this code to use a DocumentFragment.*

```javascript
const container = document.getElementById('container');
const data = ['A', 'B', 'C', 'D'];

data.forEach(letter => {
  const span = document.createElement('span');
  span.textContent = letter;
  container.append(span); // Causes 4 browser updates
});

```

---

### **Solutions to Exercises**

**Solution 1:**

```javascript
document.getElementById('profile').textContent = name;

```

**Solution 2:**

* **Line B (`margin`)**: Schedules a reflow (geometry change).
* **Line C (`display: none`)**: Schedules a reflow (element removed from layout tree).
* **Line D (`clientHeight`)**: **TRIGGERS** the reflow. The browser realizes you are asking for a measurement, so it must process the pending changes from Lines B and C immediately to give you the correct number.

**Solution 3:**

```javascript
const fragment = document.createDocumentFragment();
data.forEach(letter => {
  const span = document.createElement('span');
  span.textContent = letter;
  fragment.append(span);
});
container.append(fragment);

```
