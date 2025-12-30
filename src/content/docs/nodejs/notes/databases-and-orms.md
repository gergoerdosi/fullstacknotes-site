---
title: "Databases and ORMs"
description: "Manage data persistence like a pro. Learn the importance of Connection Pooling, how to model data with Mongoose and Prisma, and how to execute safe ACID transactions to prevent data corruption."
tags: ["sql", "nosql", "prisma", "mongoose"]
sidebar:
  order: 13
---

Node.js is database-agnostic. It doesn't care if you use SQL (PostgreSQL, MySQL) or NoSQL (MongoDB, Redis). However, **how** you manage the connection between your single-threaded Node process and the database server makes or breaks your application's scalability.

## 1. The Connection Pool (The Heart of Performance)

Beginners often make this mistake: opening a new database connection for every API request and closing it when the request ends.

* **Cost:** Handshaking with a DB takes time (TCP + Auth + SSL). Doing this 1000 times/sec kills the server.

**The Solution: Connection Pooling**
A "Pool" is a cache of open, ready-to-use connections maintained by the driver.

1. **Startup:** Node opens 10 connections immediately.
2. **Request 1:** Borrows Connection #1.
3. **Request 2:** Borrows Connection #2.
4. **Request 1 Finishes:** Returns Connection #1 to the pool (does NOT close it).
5. **Queueing:** If 11 requests come in and only 10 connections exist, Request 11 waits in a queue until a connection is returned.

## 2. NoSQL with Mongoose (MongoDB)

MongoDB is the most popular pair for Node.js (the "M" in MERN stack). Since both use JSON, data flows naturally.

**Mongoose** is an ODM (Object Data Modeler). It enforces structure (Schemas) on a schema-less database.

### Defining a Schema and Model

```javascript
const mongoose = require('mongoose');

// 1. Define the Shape
const userSchema = new mongoose.Schema({
    email: { 
        type: String, 
        required: true, 
        unique: true,
        lowercase: true 
    },
    role: { 
        type: String, 
        enum: ['user', 'admin'], 
        default: 'user' 
    },
    // Automatic timestamps (createdAt, updatedAt)
}, { timestamps: true });

// 2. Add Instance Methods (Business Logic)
userSchema.methods.isAdmin = function() {
    return this.role === 'admin';
};

// 3. Compile Model
const User = mongoose.model('User', userSchema);

```

### The Power of Middleware (Hooks)

Mongoose lets you run code *before* or *after* database actions. Perfect for hashing passwords.

```javascript
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    // Hash password before saving to DB
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

```

---

## 3. SQL with Prisma (PostgreSQL/MySQL)

For SQL databases, **Prisma** is the modern standard (replacing Sequelize/TypeORM). It is type-safe and auto-generates types for TypeScript users.

### The Schema (`schema.prisma`)

Unlike Mongoose (defined in JS), Prisma uses a declarative file.

```prisma
// schema.prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  posts     Post[]   // Relation (One-to-Many)
}

model Post {
  id        Int      @id @default(autoincrement())
  title     String
  authorId  Int
  author    User     @relation(fields: [authorId], references: [id])
}

```

### Querying with Prisma

Prisma's API is incredibly intuitive and solves complex joins automatically.

```javascript
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getUsersWithPosts() {
    // Returns plain JS objects, fully typed
    const users = await prisma.user.findMany({
        where: {
            email: { endsWith: '@gmail.com' }
        },
        include: {
            posts: true // Auto-JOINs the posts table!
        }
    });
    console.log(users);
}

```

---

## 4. ACID Transactions (Data Integrity)

What if you need to transfer money?

1. Deduct $100 from Alice.
2. Add $100 to Bob.

If the server crashes after step 1 but before step 2, the money disappears. You need an **Atomic Transaction**. All steps must succeed, or **none** happen.

### Transactions in Mongoose

```javascript
const session = await mongoose.startSession();
session.startTransaction();

try {
    const opts = { session };
    
    // Pass 'session' to every operation
    await Account.updateOne({ user: 'Alice' }, { $inc: { balance: -100 } }, opts);
    await Account.updateOne({ user: 'Bob' }, { $inc: { balance: 100 } }, opts);

    // Commit: Save changes permanently
    await session.commitTransaction();
    session.endSession();
    
} catch (error) {
    // Abort: Undo EVERYTHING in the try block
    await session.abortTransaction();
    session.endSession();
}

```

### Transactions in Prisma

```javascript
try {
    await prisma.$transaction([
        prisma.account.update({
            where: { userId: 'Alice' },
            data: { balance: { decrement: 100 } }
        }),
        prisma.account.update({
            where: { userId: 'Bob' },
            data: { balance: { increment: 100 } }
        })
    ]);
} catch (err) {
    // Automatically rolled back on error
}

```

---

## 5. SQL Injection and Security

Never concatenate strings to build queries. This allows attackers to delete your database.

**Vulnerable Code (Do NOT use):**

```javascript
const query = "SELECT * FROM users WHERE id = " + req.body.id;
// If id is "1; DROP TABLE users;", you are doomed.

```

**Safe Code (Parameterized Queries):**
All modern libraries (Prisma, Mongoose, pg, mysql2) handle this automatically if you use their API methods.

```javascript
// Raw SQL with Parameterization
db.query('SELECT * FROM users WHERE id = $1', [req.body.id]);
// The DB treats the input strictly as a value, never as executable code.

```
