---
title: "Software Architecture (SOLID & Layered Design)"
description: "Stop writing spaghetti code. Learn the 3-layer architecture (Controller-Service-Repository), Dependency Injection, and SOLID principles to build maintainable enterprise Node.js applications."
tags: ["solid", "design-patterns", "clean-code", "architecture"]
sidebar:
  order: 19
---

In a small Express app, it’s tempting to put all your database logic, validation, and business rules inside the Route Handler. This is called a **"Fat Controller"** and it is a maintenance nightmare. To build professional Node.js apps, we separate concerns.

## 1. The Layered Architecture (Controller-Service-Repository)

The industry standard for Node.js backends is the **Three-Layer Architecture**. By separating your app into layers, you can change your database (e.g., move from MongoDB to PostgreSQL) without ever touching your business logic.

### Layer 1: The Controller (Routing and HTTP)

The controller’s only job is to handle the HTTP request. It parses headers, gets data from `req.body`, and sends a response. **It contains no business logic.**

```javascript
// controllers/userController.js
exports.createUser = async (req, res, next) => {
    try {
        const userData = req.body;
        // Delegate work to the Service Layer
        const newUser = await userService.registerUser(userData);
        res.status(201).json(newUser);
    } catch (err) {
        next(err);
    }
};

```

### Layer 2: The Service Layer (Business Logic)

This is the "brain" of your application. This layer decides *what* happens. It handles calculations, permissions, and third-party integrations (like sending emails).

```javascript
// services/userService.js
exports.registerUser = async (userData) => {
    // 1. Business Logic: Check if user already exists
    const existingUser = await userRepository.findByEmail(userData.email);
    if (existingUser) throw new Error("Email already taken");

    // 2. Business Logic: Logic-specific transformations
    userData.role = 'guest'; 

    // 3. Delegate data saving to Repository
    return await userRepository.create(userData);
};

```

### Layer 3: The Repository/Data Access Layer (DB Logic)

This layer is the only one that knows about the database. If you use Mongoose, the Mongoose models live here. If you switch databases, you only change this file.

```javascript
// repositories/userRepository.js
const User = require('../models/User');

exports.findByEmail = async (email) => {
    return await User.findOne({ email });
};

exports.create = async (data) => {
    return await User.create(data);
};

```

---

## 2. Dependency Injection (DI)

Dependency Injection is a technique where an object receives its dependencies from the outside rather than creating them itself.

**Hardcoded (Bad):**

```javascript
class UserService {
    constructor() {
        this.db = new Database(); // Hardcoded dependency makes testing impossible
    }
}

```

**Injected (Good):**

```javascript
class UserService {
    constructor(db) {
        this.db = db; // We can "inject" a mock DB during testing!
    }
}
const service = new UserService(realDB);

```

---

## 3. SOLID Principles in Node.js

Apply these five principles to keep your backend flexible:

1. **S - Single Responsibility:** A class or function should do one thing. If a function parses a CSV *and* sends an email, split it.
2. **O - Open/Closed:** Code should be open for extension but closed for modification. Use classes and inheritance instead of giant `switch` statements.
3. **L - Liskov Substitution:** You should be able to replace a parent class with a child class without breaking the app.
4. **I - Interface Segregation:** Don't force a class to implement methods it doesn't use. (More relevant in TypeScript).
5. **D - Dependency Inversion:** Depend on abstractions (Interfaces), not concrete implementations.

---

## 4. Folder Structure for Scalability

A professional Node.js project usually looks like this:

```text
src/
  ├── app.js            # Express setup
  ├── server.js         # Entry point (Cluster/Server)
  ├── api/              # Controllers & Routes
  │    ├── routes/
  │    └── controllers/
  ├── services/         # Business Logic
  ├── repositories/     # Data Access
  ├── models/           # DB Schemas (Prisma/Mongoose)
  ├── middleware/       # Custom Auth/Error middleware
  ├── config/           # Env variables
  └── utils/            # Shared helpers

```

---

## 5. Why Bother with Architecture?

* **Testability:** You can test the Service layer without needing a real database.
* **Scalability:** Multiple developers can work on different layers without stepping on each other's toes.
* **Maintenance:** When a bug appears in the database query, you know exactly which folder (`repositories/`) to look in.
