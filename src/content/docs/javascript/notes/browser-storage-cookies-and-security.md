---
title: "Browser Storage, Cookies and Security"
description: "Compare localStorage, sessionStorage, and Cookies. Learn best practices for persisting data and the security implications of storing auth tokens."
tags: ["localstorage", "cookies", "security", "browser-storage"]
sidebar:
  order: 13
---

## 1. The Storage API (Local vs. Session)

The Web Storage API consists of two mechanisms. They share the exact same methods (`setItem`, `getItem`), but differ in **Persistence**.

**A. `localStorage` (The Permanent Store)**

* **Lifespan:** Forever (until the user manually clears cache or code deletes it).
* **Scope:** Shared across all tabs and windows of the same origin (domain).
* **Limit:** ~5MB - 10MB (depending on browser).
* **Use Case:** UI Themes (Dark Mode), Cart data for non-logged-in users.

**B. `sessionStorage` (The Temporary Store)**

* **Lifespan:** Dies when the **Tab** is closed.
* **Scope:** Specific to **one tab**. Even if you have the same site open in two tabs, they cannot see each other's `sessionStorage`.
* **Use Case:** Single-session sensitive data (e.g., form data you don't want persisting if the user walks away).

**The API Pattern:**
The Storage API only accepts **Strings**.

```javascript
const user = { id: 1, theme: "dark" };

// WRITE: You MUST stringify objects
localStorage.setItem("settings", JSON.stringify(user));

// READ: You MUST parse them back
const raw = localStorage.getItem("settings");
const data = JSON.parse(raw); // { id: 1, ... }

// DELETE
localStorage.removeItem("settings");
localStorage.clear(); // Wipes everything

```

---

## 2. Cookies (The Old Guard)

Cookies are fundamentally different. While LocalStorage stays in the browser, **Cookies travel to the server with every single HTTP request.**

* **Capacity:** Tiny (4KB).
* **Purpose:** Authentication (Session IDs), Server-side tracking.

**Setting a Cookie (The Hard Way):**

```javascript
// A simple cookie (expires when browser closes)
document.cookie = "username=JohnDoe";

// A complex cookie with expiration
document.cookie = "user=John; max-age=3600; path=/; SameSite=Strict";

```

> **Warning:** `document.cookie` is a weird API. Reading it returns one long string `"key1=val1; key2=val2"`. You often need a helper function or library to parse it.

---

## 3. Security: Where to store Authentication Tokens?

This is the most critical architectural decision you will make.

**Option A: LocalStorage**

* **Pros:** Easy to use (`localStorage.getItem('jwt')`).
* **Cons:** **Vulnerable to XSS.** If an attacker runs JS on your page (XSS), they can read `localStorage` and steal the token.

**Option B: `HttpOnly` Cookies (The Secure Standard)**

* **Pros:** **Immune to XSS.** JavaScript *cannot* read an `HttpOnly` cookie. Only the server can set/read it.
* **Cons:** Vulnerable to **CSRF** (Cross-Site Request Forgery), though modern `SameSite` attributes fix this.

**The Verdict:**
For sensitive data (Session IDs, Access Tokens), use **HttpOnly Cookies**.
For non-sensitive data (Theme preference, Language), use **LocalStorage**.

---

## 4. The Storage Event (Cross-Tab Sync)

Did you know you can talk to other open tabs?
When `localStorage` changes in one tab, a `storage` event fires in **every other tab** open to the same site.

**Scenario:** User logs out in Tab A. You want Tab B to immediately redirect to the login screen.

```javascript
// In Tab B (and C, D...)
window.addEventListener('storage', (e) => {
  if (e.key === 'logout-trigger') {
    // The user logged out in another tab!
    window.location.reload(); 
  }
});

// In Tab A (Logout Button)
localStorage.setItem('logout-trigger', Date.now());

```

---

## 5. IndexedDB (The Big Gun)

We won't code this deeply (it requires a wrapper library like `idb` to be usable), but you should know it exists.

* **What is it?** A full NoSQL database inside the browser.
* **Capacity:** Hundreds of Megabytes (or Gigabytes).
* **Features:** Transactions, Indexes, Asynchronous.
* **Use Case:** Offline Apps (PWA), caching massive amounts of images/JSON, heavy offline editors (like Google Docs).

---

## 6. Interactive Exercises

**Exercise 1: The Crash Preventer**
*The code below will crash the app if the stored JSON is corrupted (e.g., someone manually edited it). Wrap it in a safe function that returns `null` if parsing fails.*

```javascript
const userData = JSON.parse(localStorage.getItem('user'));
// If localStorage is "invalid_string", this throws an Error.

```

**Exercise 2: The Scope Test**
*You open `mysite.com` in Tab 1 and set `sessionStorage.setItem('test', '123')`. You then Open Link in New Tab (Tab 2).*
*What does `sessionStorage.getItem('test')` return in Tab 2?*

**Exercise 3: Cookie Security**
*You are auditing a junior developer's code. They wrote this login logic:*

```javascript
fetch('/api/login', data)
  .then(res => res.json())
  .then(token => {
    // Storing the sensitive API key for later use
    document.cookie = `apiKey=${token};`; 
  });

```

*Why is this bad, and what specific attribute is missing from the cookie string to make it safer from XSS?*

---

### **Solutions to Exercises**

**Solution 1:**
Always `try/catch` JSON parsing from storage.

```javascript
function getSafeData(key) {
  try {
    return JSON.parse(localStorage.getItem(key));
  } catch (e) {
    console.error("Corrupt storage data", e);
    return null; // Fallback
  }
}

```

**Solution 2:**
It returns **`null`**.
`sessionStorage` is not shared between tabs, even if they are identical URLs. It is strictly for that specific *window process*.

**Solution 3:**

1. **Bad because:** JavaScript created the cookie, so JavaScript (and hackers via XSS) can read it.
2. **Missing Attribute:** It needs `HttpOnly`. However, client-side JS **cannot** set `HttpOnly` cookies. The server must send the cookie in the response header `Set-Cookie: apiKey=...; HttpOnly`.
3. **Fix:** The developer should not be setting the cookie manually. The API response should include the cookie header automatically.
