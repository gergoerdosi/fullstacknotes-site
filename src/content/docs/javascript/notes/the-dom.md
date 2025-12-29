---
title: "The DOM (Document Object Model)"
description: "Learn how JavaScript interacts with HTML. This module covers selecting elements (querySelector), manipulating content and styles, traversing the DOM tree, and mastering Event Listeners and Event Delegation."
tags: ["javascript", "dom", "frontend", "web-development"]
sidebar:
  order: 6
---

## 1. Selection: Finding Elements

Before you can change an element, you must find it. The DOM is a tree structure representing your HTML.

### Modern Selection (`querySelector`)

These are the standard methods used in modern development because they use CSS syntax.

* **`document.querySelector('css-selector')`**: Returns the **first** match.
* **`document.querySelectorAll('css-selector')`**: Returns **all** matches as a `NodeList`.

```javascript
// Select by ID
const header = document.querySelector('#main-header');

// Select by Class
const buttons = document.querySelectorAll('.btn');

// Select complex structures (e.g., specific link inside nav)
const navLink = document.querySelector('nav ul li a');

```

### Legacy Selection

* `document.getElementById('id')`: Slightly faster, returns one element.
* `document.getElementsByClassName('class')`: Returns an `HTMLCollection`.

### `NodeList` vs. `HTMLCollection`

This is a common "gotcha."

* **NodeList (from `querySelectorAll`):** Has a `.forEach()` method.
* **HTMLCollection (from `getElementsByClassName`):** Does **not** have `.forEach()`. You must convert it to an array (`Array.from()`) to loop over it easily.

---

## 2. Manipulation: Changing Elements

Once selected, you can modify the element's structure, style, or content.

### Content (`textContent` vs. `innerHTML`)

```javascript
const title = document.querySelector('h1');

// 1. Safe: Changes text only
title.textContent = "Welcome User!"; 

// 2. Risky: Parses HTML tags (Vulnerable to XSS attacks if user input is used)
title.innerHTML = "<span style='color:red'>Alert!</span>"; 

```

### Styles and Classes

**Do not** manipulate `.style` directly for complex changes. Use CSS classes instead.

```javascript
const box = document.querySelector('.box');

// BAD (Inline styles are hard to override/maintain)
box.style.backgroundColor = "blue";
box.style.display = "none";

// GOOD (Toggle CSS classes)
box.classList.add('active');    // Adds class="active"
box.classList.remove('hidden'); // Removes class="hidden"
box.classList.toggle('dark-mode'); // Adds if missing, removes if present

```

### Creating and Inserting Elements

```javascript
// 1. Create the element (it exists in memory only)
const newBtn = document.createElement('button');
newBtn.textContent = "Click Me";

// 2. Append it to the DOM (now it's visible)
const container = document.querySelector('.container');
container.append(newBtn); // Adds to the end of container

```

---

## 3. Traversing: Moving Around

Sometimes you select an element and need to move relative to it (e.g., "delete the parent of this button").

```javascript
const item = document.querySelector('.list-item');

// Go Up
const parent = item.parentElement;

// Go Down
const children = item.children; // Returns HTMLCollection

// Go Sideways
const nextItem = item.nextElementSibling;
const prevItem = item.previousElementSibling;

```

---

## 4. Events: Making it Interactive

Events are signals that something has happened (clicks, key presses, mouse movements).

### Event Listeners

Always use `addEventListener`. Avoid `onclick` in HTML (`<button onclick="...">`), as it scales poorly.

```javascript
const btn = document.querySelector('#submit');

btn.addEventListener('click', function(e) {
    // 'e' is the Event Object containing details about the click
    console.log("Button Clicked!");
    console.log("Coordinates:", e.clientX, e.clientY);
    console.log("Target Element:", e.target); 
});

```

### Event Bubbling and Capturing

When you click a button inside a div, the click doesn't just happen on the button.

1. **Capturing Phase:** The event goes down from `window` -> `document` -> `target`.
2. **Target Phase:** The event hits the actual element clicked.
3. **Bubbling Phase:** The event bubbles **up** from `target` -> `parent` -> `window`.

*Most events listen to the Bubbling phase by default.*

```javascript
// Stopping Propagation
button.addEventListener('click', (e) => {
    e.stopPropagation(); // Prevents the parent div from "feeling" the click
});

```

### Event Delegation (Efficiency)

Imagine a list with 100 items. Instead of adding 100 event listeners (heavy on memory), add **one** listener to the parent container.

```javascript
const list = document.querySelector('#todo-list');

// Bad: Loop through 100 items and add listeners
// items.forEach(item => item.addEventListener(...));

// Good: Delegation
list.addEventListener('click', (e) => {
    // Check if the actual thing clicked was a list item
    if (e.target.tagName === 'LI') {
        console.log("List item clicked:", e.target.textContent);
        
        // E.g., toggle 'completed' class
        e.target.classList.toggle('completed');
    }
});

```

*Why this is powerful:* If you add *new* list items later via JavaScript, the parent listener will automatically work for them too without extra code.

---

## Review Challenge

You have a `<ul id="menu">` containing several `<li>` items.
Write code to:

1. Select the `<ul>`.
2. Add a new `<li>` with text "Contact" to the end of the list.
3. Add a class named `"nav-item"` to this new `<li>`.

```javascript
// Your Code Here:

```

<details>
<summary>Click to see the solution</summary>

This solution demonstrates the three-step process: Creation, Configuration (adding classes/text), and Insertion.

```javascript
// 1. Select the parent <ul>
const menu = document.querySelector('#menu');

// 2. Create the new <li> element
const newItem = document.createElement('li');

// 3. Configure the element
newItem.textContent = "Contact";      // Set text
newItem.classList.add('nav-item');    // Add class

// 4. Insert into the DOM
menu.append(newItem);

```

</details>