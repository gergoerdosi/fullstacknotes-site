---
title: "Event Architecture and Delegation"
description: "Deep dive into Event Bubbling and Capturing. Learn how to optimize memory usage by implementing the Event Delegation pattern for handling dynamic elements."
tags: ["events", "event-delegation", "bubbling", "dom-events"]
sidebar:
  order: 12
---

## 1. The Three Phases of an Event

When you click a button inside a `div`, inside the `body`, the event doesn't just fire on the button. It traverses the DOM in three phases:

1. **Capturing Phase (The Descent):** The event starts at `window`, goes to `document`, `<html>`, `<body>`, and dives down the tree looking for the target.
2. **Target Phase:** The event arrives at the actual element you clicked (the `event.target`).
3. **Bubbling Phase (The Ascent):** The event "bubbles" up from the target, to the parent, grandparent, and back to `window`.

**Crucial Fact:** By default, `addEventListener` only listens to the **Bubbling Phase** (Phase 3).

```javascript
// This fires during the BUBBLING phase (default)
button.addEventListener('click', handler);

// This fires during the CAPTURING phase (rarely used)
button.addEventListener('click', handler, { capture: true });

```

---

## 2. Bubbling in Action

Imagine nested boxes: `<div id="outer"><div id="inner"><button>Click</button></div></div>`.

If you attach a click listener to **all three** (button, inner, outer), and you click the **button**:

1. **Button** listener fires first.
2. **Inner Div** listener fires second (it bubbled up).
3. **Outer Div** listener fires third.

**Stopping the Bubble:**
If you want to handle the event at the button and stop parents from knowing about it, use `stopPropagation()`.

```javascript
button.addEventListener('click', (e) => {
  e.stopPropagation(); // The event dies here. Parents never feel it.
  console.log("Clicked!");
});

```

> **Warning:** Use `stopPropagation` sparingly. It breaks analytics trackers that rely on bubbling to count clicks on the `document` level.

---

## 3. `target` vs. `currentTarget`

Inside an event listener, there is a critical distinction:

* **`e.target`**: The actual element that was clicked (e.g., the `<i>` icon inside a button).
* **`e.currentTarget`**: The element that **owns** the event listener (the `<button>`).

```javascript
document.querySelector('#parent').addEventListener('click', (e) => {
  console.log(e.target);        // Could be the child span, button, etc.
  console.log(e.currentTarget); // Always the #parent div
});

```

---

## 4. Event Delegation (The Pro Pattern)

**The Problem:**
You have a list `<ul>` with 1,000 `<li>` items.

* **Bad Approach:** Loop through all 1,000 items and add a listener to each. (1,000 functions in memory).
* **The Issue:** If you add a 1,001st item later via JS, it won't have a listener. You have to manually attach one.

**The Solution (Delegation):**
Add **ONE** listener to the parent `<ul>`. Because of **Bubbling**, clicks on any `<li>` will travel up to the `<ul>`. We catch them there.

```javascript
const list = document.querySelector('ul');

list.addEventListener('click', (e) => {
  // 1. Identify what was actually clicked
  const clickedItem = e.target.closest('li');

  // 2. Guard Clause: If they clicked the UL padding (not an LI), ignore
  if (!clickedItem) return;

  // 3. Ensure the click happened inside *this* list (safety check)
  if (!list.contains(clickedItem)) return;

  console.log("You clicked list item:", clickedItem.textContent);
});

```

* **Benefit 1:** Less memory (1 listener vs 1,000).
* **Benefit 2:** Works for dynamic elements added in the future.

---

## 5. `preventDefault()`

Some elements have default browser behaviors:

* `<a href="...">`: Navigates to a new page.
* `<form>`: Refreshes the page to submit data.
* `<input type="checkbox">`: Toggles the checkmark.

To stop this behavior (e.g., to handle a form submission via AJAX instead of reloading), use `preventDefault()`.

```javascript
form.addEventListener('submit', (e) => {
  e.preventDefault(); // Stop page reload
  // ... run custom validation or fetch() ...
});

```

---

## 6. Interactive Exercises

**Exercise 1: Delegation Implementation**
*We have a table with id `data-table`. Inside each row, there is a "Delete" button with class `btn-delete`. Write ONE event listener on the table that logs "Deleting row..." only when a delete button is clicked.*

**Exercise 2: The Phantom Click**
*You have a popup modal. You want to close the modal when the user clicks the "Overlay" (the dark background), but NOT when they click the "Content" (the white box inside).*

```html
<div id="overlay">
  <div id="content">I am important content</div>
</div>

```

*If you add a click listener to `#overlay` to close it, clicking `#content` will also close it because of bubbling. How do you fix this inside the listener?*

**Exercise 3: Order of Operations**
*Given: Window (Capture) -> Button (Target) -> Window (Bubble).*
*If we add listeners to both Window (Capture mode) and Window (Bubble mode), which log appears first when the button is clicked?*

---

### **Solutions to Exercises**

**Solution 1:**

```javascript
const table = document.getElementById('data-table');

table.addEventListener('click', (e) => {
  // Use closest to handle clicks on an icon inside the button
  const btn = e.target.closest('.btn-delete');
  
  // Guard clause: If no button found, or button isn't inside our table
  if (!btn || !table.contains(btn)) return;

  console.log("Deleting row...");
});

```

**Solution 2:**
Check if the `target` is the `currentTarget`.

```javascript
const overlay = document.getElementById('overlay');

overlay.addEventListener('click', (e) => {
  // Only close if the user clicked the Overlay directly, not the child
  if (e.target === e.currentTarget) {
    overlay.style.display = 'none';
  }
});

```

**Solution 3:**
**Window (Capture) fires first.**
The event travels Down (Capture) -> Hits Target -> Travels Up (Bubble).

1. Window Capture Listener runs.
2. Button Listener runs.
3. Window Bubble Listener runs.
