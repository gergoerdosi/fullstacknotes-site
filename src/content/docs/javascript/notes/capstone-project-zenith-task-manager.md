---
title: "Capstone Project: Zenith Task Manager"
description: "The final challenge. Build a framework-free, reactive Task Analytics Dashboard implementing OOP, Proxies, Async Patterns, and DOM optimization."
tags: ["capstone", "project-based-learning", "vanilla-js", "software-architecture"]
sidebar:
  order: 21
---

## 1. Functional Requirements

1. **Task Management (CRUD):**
* Users can add tasks with a Title, Priority (Low/Med/High), and Due Date.
* Users can delete tasks and mark them as "Complete."
* **Requirement:** Use **Event Delegation** on the list container. Do not attach listeners to individual buttons.


2. **The Analytics Panel:**
* A real-time dashboard at the top showing: Total Tasks, Completed %, and "High Priority" count.
* **Requirement:** This must update *automatically* whenever the data changes using the **Observer Pattern (Proxies)**. Do not manually call `updateDashboard()` everywhere.


3. **Data Persistence:**
* Tasks must survive a page reload (`localStorage`).
* Session data (e.g., "Show Completed" filter toggle) should survive a tab refresh but expire on browser close (`sessionStorage`).


4. **Simulated Backend:**
* On load, "fetch" initial data from a mock API (use `setTimeout` or `JSONPlaceholder`).
* **Requirement:** Use **Async/Await** and **Promise.all** to load User Settings and Tasks in parallel.


5. **Search & Filter:**
* A search bar that filters the list in real-time.
* **Requirement:** Use a **Debounce** function (using closures/timers) so the search doesn't fire on every single keystroke.



---

## 2. Technical Constraints (The Rules)

You must implement the following specific patterns to prove your mastery:

* **ESM:** The code must be split into at least 3 files: `main.js`, `store.js`, `dom.js`. Use `<script type="module">`.
* **Classes:** Create a base class `Task` and a subclass `UrgentTask` (which adds a red flag icon automatically).
* **Proxies:** Your application state (`{ tasks: [], filter: '' }`) must be wrapped in a `Proxy`. The `set` trap should trigger the UI re-render.
* **Performance:** When rendering the initial list of tasks, you **MUST** use a `DocumentFragment` to avoid Layout Thrashing.
* **Forms:** Use `new FormData()` to capture the "Add Task" input.
* **Event Loop:** Implement a "Save Status" indicator. When data changes, show "Saving..." immediately, but use a fake network delay (`setTimeout`) to show "Saved" 1 second later.

---

## 3. Architecture Blueprint

**A. The Store (`store.js`)**
Holds the `state` object.
Exports a `subscribe()` function so other modules can listen for changes.
Uses a `Proxy` to detect changes to `state.tasks`.

**B. The UI Renderer (`dom.js`)**
Contains pure functions like `renderTasks(tasks)` and `updateStats(stats)`.
Uses `innerHTML` safely (avoiding XSS) or `createElement`.

**C. The Controller (`main.js`)**
Initializes the app.
Handles Event Listeners (`submit`, `click`, `input`).
Orchestrates the flow between Store and DOM.

---

## 4. Step-by-Step Implementation Strategy

**Phase 1: The Foundation**

1. Set up `index.html` with a `<form>`, a `<div id="stats">`, and a `<ul id="task-list">`.
2. Create your ES Modules structure.
3. Implement the **Task Class** structure.

**Phase 2: The Reactivity Engine (The Hard Part)**

1. Create a simple State object.
2. Wrap it in a `Proxy`.
3. In the `set` trap, check which property changed. If `tasks` changed, call a function to re-render the list and the stats.

**Phase 3: The DOM & Events**

1. Implement `renderTasks` using `DocumentFragment`.
2. Add the `submit` listener to the form (use `preventDefault` and `FormData`).
3. Add the `click` listener to the `<ul>` (Delegation) to handle Delete/Complete actions.

**Phase 4: Async & Polish**

1. Add the `mockFetch()` function using Promises.
2. Load data on startup using `await`.
3. Implement the Search Debounce.

---

## 5. Starter Code Snippet (The Proxy Setup)

Here is a hint for the most difficult part:

```javascript
// store.js
const subscribers = [];

// The State
const internalState = {
  tasks: [],
  filter: 'all'
};

// The Interceptor
export const state = new Proxy(internalState, {
  set(target, property, value) {
    target[property] = value;
    
    // Notify the UI that data changed
    console.log(`State change: ${property}`);
    subscribers.forEach(fn => fn(target));
    
    return true;
  }
});

export function subscribe(callback) {
  subscribers.push(callback);
}

```
