---
title: "REST API Design (Best Practices)"
description: "Design APIs that scale. Learn the difference between PUT and PATCH, how to choose the right HTTP Status Codes, implementing pagination/filtering, and strategies for API Versioning."
tags: ["rest", "api-design", "standards", "json"]
sidebar:
  order: 11
---

Building an API is easy. Building a *good* API is hard. A poorly designed API confuses frontend developers, leads to bugs, and is difficult to change later.

REST is not a protocol; it is a set of **Constraints** and **Conventions**. It treats everything as a **Resource**.

## 1. Resource Naming (Nouns, not Verbs)

The #1 mistake beginners make is thinking in terms of "Actions" (RPC style).

**Bad (RPC Style):**

* `POST /createUser`
* `GET /getAllProducts`
* `POST /updateOrder`
* `GET /deleteComment?id=1`

**Good (REST Style):**

* `POST /users` (Create)
* `GET /products` (Read All)
* `PATCH /orders/123` (Update)
* `DELETE /comments/1` (Delete)

**Hierarchy:**
Use nesting to show relationships, but don't go too deep.

* `GET /users/1/posts` (Get posts belonging to user 1)
* `GET /users/1/posts/5` (Get specific post 5 by user 1)

---

## 2. HTTP Methods and Idempotency

You must choose the correct verb for the action.

| Method | Action | Safe? | Idempotent? | Description |
| --- | --- | --- | --- | --- |
| **GET** | Read | Yes | Yes | Retrieve a resource. Should never modify data. |
| **POST** | Create | No | No | Create a new resource. Running it twice creates two resources. |
| **PUT** | Replace | No | **Yes** | Replace a resource **entirely**. If fields are missing, they are set to null. |
| **PATCH** | Update | No | No* | Update **part** of a resource. Only changes the fields sent. |
| **DELETE** | Delete | No | **Yes** | Remove a resource. Running it twice is safe (second time returns 404). |

### The PUT vs. PATCH Debate

This is a classic interview question.

* **PUT**: "Here is the **new** object. Throw away the old one and save this."
* **PATCH**: "Here are some changes. Apply them to the existing object."

---

## 3. Status Codes: The Language of Success and Failure

Don't just return `200 OK` for everything. Frontend apps rely on status codes to know how to react (e.g., redirecting on 301, showing a login modal on 401).

**Success:**

* **200 OK**: Generic success.
* **201 Created**: Successful creation (POST). *Convention: Return the created object.*
* **204 No Content**: Successful request, but nothing to send back (common for DELETE or PUT).

**Client Errors:**

* **400 Bad Request**: The client sent invalid JSON or missing parameters.
* **401 Unauthorized**: "I don't know who you are." (Missing/Invalid Token).
* **403 Forbidden**: "I know who you are, but you aren't allowed to do this." (Admins only).
* **404 Not Found**: Resource doesn't exist.
* **422 Unprocessable Entity**: The JSON is valid, but the data is wrong (e.g., "Email already exists").

**Server Errors:**

* **500 Internal Server Error**: The code crashed. (Programmer Error).

---

## 4. Advanced Querying: Pagination, Filtering, Sorting

Do not create separate endpoints like `/getActiveUsers`. Use **Query Parameters**.

### A. Filtering

```http
GET /products?category=electronics&price_lt=500

```

* `price_lt` (less than) is a convention used by many APIs to map to DB queries.

### B. Sorting

Allow users to sort by multiple fields (`-` for descending).

```http
GET /users?sort=-createdAt,lastname

```

### C. Pagination

Never return *all* records. Always paginate.

```http
GET /users?page=2&limit=20

```

**Response Envelope for Pagination:**
Don't just return an array. Return metadata so the UI knows how many pages exist.

```json
{
  "status": "success",
  "data": [...],
  "meta": {
    "total": 100,
    "page": 2,
    "limit": 20,
    "pages": 5
  }
}

```

---

## 5. API Versioning

Your API *will* change. You *will* break things. You need a strategy to handle old clients (e.g., old mobile apps that users haven't updated).

### Strategy A: URL Versioning (Easiest)

Prefix the URL.

* `https://api.myapp.com/v1/users`
* `https://api.myapp.com/v2/users`

### Strategy B: Header Versioning (REST Purist)

Use a custom header or the `Accept` header.

* Header: `Accept-Version: v1`
* Header: `Accept: application/vnd.myapp.v1+json`

**Recommendation:** Stick to **URL Versioning** for Node.js apps. It's explicit, easier to debug in browsers, and easier to route in load balancers.

---

## 6. Statelessness

REST APIs must be **Stateless**.
The server should **not** store "User Session State" in its memory (RAM).

* **Why?** If you have 2 servers (Server A and Server B), and User 1 logs into Server A, Server B doesn't know about it.
* **Solution:** Every request must contain all the info needed to identify the user (usually via a **JWT** in the headers). We will cover this in Guide 15.
