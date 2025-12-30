---
title: "PostgreSQL Mastery"
description: "Master the database layer. Learn about B-Tree and GIN indexing, how to use EXPLAIN ANALYZE to fix slow queries, and why JSONB makes Postgres a viable alternative to MongoDB."
tags: ["postgresql", "sql", "performance", "architecture"]
sidebar:
  order: 2
---

PostgreSQL is a **Relational Database Management System (RDBMS)**. Unlike NoSQL, it enforces a strict schema, ensuring that your data remains consistent and valid over time.

## 1. The ACID Guarantee

PostgreSQL is famous for being strictly ACID-compliant. If you are building a Fintech or E-commerce app, this is non-negotiable.

* **Atomicity:** All operations in a transaction succeed, or none do (All or nothing).
* **Consistency:** Data must follow all your rules (Constraints) after a transaction.
* **Isolation:** Transactions happening at the same time don't interfere with each other.
* **Durability:** Once a transaction is committed, it remains saved even if the power goes out.

---

## 2. Advanced Indexing: Why your app is slow

In production, `SELECT * FROM users WHERE email = 'test@test.com'` is fast with 1,000 users, but crawls with 10 million. An index is a "lookup table" that prevents the database from reading every single row (a **Sequential Scan**).

### B-Tree Index (The Default)

Perfect for equality (`=`) and range (`>`, `<`) queries.

```sql
CREATE INDEX idx_user_email ON users(email);

```

### GIN Index (Generalized Inverted Index)

Essential for **Full-Text Search** or searching inside **JSONB** columns.

```sql
-- Search inside a JSONB column called 'metadata'
CREATE INDEX idx_metadata_gin ON users USING GIN (metadata);

```

### How to debug: `EXPLAIN ANALYZE`

Never guess why a query is slow. Use the `EXPLAIN` command to see the execution plan.

```sql
EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'alice@example.com';

```

Look for **"Index Scan"** (Good) vs. **"Seq Scan"** (Bad for large tables).

---

## 3. JSONB: The Best of Both Worlds

One of Postgres's "Killer Features" is the `JSONB` data type. It allows you to store unstructured data (like MongoDB) inside a relational table.

* **JSON:** Stores the exact text. Slow to query.
* **JSONB:** Stores a binary version of the JSON. Fast to query and supports indexing.

**When to use it:** For metadata, user preferences, or dynamic form responses where the schema changes frequently.

---

## 4. Constraints: Let the DB handle the logic

Mid-level developers write validation logic in Node.js. Architects write it in the Database.

* **Unique:** `email VARCHAR(255) UNIQUE`
* **Check:** Ensure a price is never negative:
```sql
ALTER TABLE products ADD CONSTRAINT price_check CHECK (price > 0);

```


* **Foreign Keys:** Ensure an `order` cannot exist without a `user`.

---

## 5. Scaling: Connection Pooling (pg-helper)

Node.js is single-threaded, but it handles thousands of requests. PostgreSQL creates a new process for every connection. If you open 1,000 connections from Node, the DB will crash.

**The Solution: PgBouncer or Internal Pools.**
In Node.js, always use a `Pool` rather than a `Client`.

```javascript
const { Pool } = require('pg');

const pool = new Pool({
  max: 20, // Never allow more than 20 simultaneous connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Use pool.query (it automatically checks out and returns connections)
await pool.query('SELECT * FROM users');

```

---

## 6. Senior Architect Interview Questions

* **Q: What is the difference between a `JOIN` and a `Subquery`?**
* *A:* A `JOIN` combines rows from two tables based on a related column and is generally more efficient as the DB engine can optimize it. A subquery is a query nested inside another.


* **Q: When should you NOT use an index?**
* *A:* On tables that have more writes than reads, or on columns with "Low Cardinality" (e.g., a "Boolean" column like `is_active`), as the overhead of updating the index outweighs the search benefit.


* **Q: What is a Deadlock?**
* *A:* When Transaction A waits for a resource held by Transaction B, while B is waiting for a resource held by A. Neither can move. Postgres detects this and kills one of them.
