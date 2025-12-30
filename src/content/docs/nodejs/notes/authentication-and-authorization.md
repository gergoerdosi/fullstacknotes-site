---
title: "Authentication and Authorization"
description: "Secure your API. Learn how to hash passwords with Bcrypt, the difference between Stateless JWTs and Stateful Sessions, and how to store tokens securely to prevent XSS attacks."
tags: ["auth", "jwt", "oauth2", "security"]
sidebar:
  order: 15
---

## 1. Authentication vs. Authorization

These two terms are often used interchangeably, but they are distinct steps.

1. **Authentication (AuthN):** *Who are you?*
* Verifying identity (e.g., checking username/password).


2. **Authorization (AuthZ):** *What are you allowed to do?*
* Verifying permissions (e.g., can this user delete this post?).



---

## 2. Storing Passwords (The Golden Rules)

**Rule #1: NEVER store passwords in plain text.**
If your database is leaked (which happens to big companies all the time), attackers will have everyone's passwords.

**Rule #2: Do not write your own crypto.**
Use standard, battle-tested algorithms like **Bcrypt** or **Argon2**.

### How Hashing Works (Bcrypt)

Hashing is one-way. You turn `password123` into `$2b$10$...`. You cannot turn the hash back into the password.

To log in, you hash the *input* password and compare it to the *stored* hash.

```javascript
const bcrypt = require('bcrypt');

// 1. Registration (Hash and Save)
async function register(password) {
    const saltRounds = 10; // The cost factor (higher = slower but safer)
    const hash = await bcrypt.hash(password, saltRounds);
    // Save 'hash' to DB. Never save 'password'.
    return hash;
}

// 2. Login (Compare)
async function login(inputPassword, storedHash) {
    const match = await bcrypt.compare(inputPassword, storedHash);
    if (match) {
        console.log("Login Successful");
    } else {
        console.log("Wrong Password");
    }
}

```

---

## 3. Stateful (Sessions) vs. Stateless (JWT)

Once a user logs in, how does the server remember them for the next request?

### A. Server-Side Sessions (The "Old" Way)

1. Server creates a `sessionId` (random string).
2. Server stores data `{ id: 1, role: 'admin' }` in its memory (or Redis) linked to that `sessionId`.
3. Server sends `sessionId` as a **Cookie**.
4. **Pros:** You can revoke access instantly (just delete the session from Redis).
5. **Cons:** Harder to scale. If you have 5 servers, they all need access to the same Session Store.

### B. JWT (JSON Web Tokens - The "Modern" Way)

1. Server creates a token containing the data `{ id: 1, role: 'admin' }`.
2. Server **signs** it digitally using a Secret Key.
3. Server sends the token to the client.
4. The Server **stores nothing**. When the client sends the token back, the server verifies the signature to ensure the data wasn't tampered with.

---

## 4. Anatomy of a JWT

A JWT is just a string with three parts separated by dots: `Header.Payload.Signature`.

1. **Header:** Algorithm used (e.g., HS256).
2. **Payload:** The data (Claims). e.g., `{"userId": 123, "exp": 1700000000}`.
* *Warning:* This is **Base64 encoded**, not encrypted! Anyone who intercepts the token can read this JSON. **Never put secrets like credit card numbers here.**


3. **Signature:** `Hash(Header + Payload + SecretKey)`. This is what makes it secure. If a hacker changes the Payload (e.g., changes "user" to "admin"), the Signature won't match, and the server will reject it.

---

## 5. Implementation with `jsonwebtoken`

```javascript
const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET; // "MySuperSecretKey"

// 1. Issue Token (Login)
function generateToken(user) {
    const payload = { 
        id: user.id, 
        role: user.role 
    };
    
    // Sign with secret and set Expiration
    return jwt.sign(payload, SECRET_KEY, { expiresIn: '1h' });
}

// 2. Verify Middleware (Protect Routes)
function authenticateToken(req, res, next) {
    // Standard Header format: "Bearer <token>"
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401); // No token? Unauthorized.

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403); // Invalid token? Forbidden.
        
        req.user = user; // Attach decoded payload to request
        next(); // Proceed to route
    });
}

// Usage
app.get('/dashboard', authenticateToken, (req, res) => {
    res.json({ message: `Welcome User ${req.user.id}` });
});

```

---

## 6. Where to store the JWT? (Security Risk)

This is a massive debate in the security community.

### Option A: LocalStorage

* **Easy:** Javascript can read/write it easily.
* **Risk:** **XSS (Cross-Site Scripting).** If an attacker injects a malicious script into your site (e.g., via a compromised npm package or a bad ad), that script can read `localStorage` and steal the token.

### Option B: HttpOnly Cookies (Recommended)

* **Secure:** The browser stores the cookie, but JavaScript **cannot** read it. Even if an attacker injects a script, they can't see the token.
* **Risk:** **CSRF (Cross-Site Request Forgery).** You need to implement CSRF protection (like using the `csurf` library or SameSite cookie attributes).

**Best Practice:**
Use **HttpOnly Cookies** with `SameSite=Strict` and `Secure=true` (HTTPS only).

```javascript
res.cookie('token', token, {
    httpOnly: true,  // JS cannot access
    secure: true,    // HTTPS only
    sameSite: 'strict',
    maxAge: 3600000 // 1 hour
});

```

---

## 7. Role-Based Access Control (RBAC)

Once authenticated, you need to authorize.

```javascript
// Middleware factory
function authorizeRoles(...allowedRoles) {
    return (req, res, next) => {
        // req.user was populated by the previous authenticateToken middleware
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: "Access Denied" });
        }
        next();
    };
}

// Usage
// Only Admins can delete users
app.delete('/users/:id', authenticateToken, authorizeRoles('admin'), deleteUserHandler);

```
