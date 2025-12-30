---
title: "GraphQL Deep Dive (Schema Design)"
description: "Design scalable GraphQL APIs. Learn about Cursor-based pagination, Input objects, Custom Directives, and securing your API against Complexity Attacks."
tags: ["graphql", "apollo", "architecture", "api"]
sidebar:
  order: 5
---

In a professional environment, GraphQL is more than just a tool to avoid over-fetching; it is a **Contract** between the frontend and backend.

## 1. Schema-First vs. Code-First

* **Schema-First:** You write the `.graphql` file first. This serves as the documentation and the "Single Source of Truth."
* **Code-First:** You define types in JS/TS (using libraries like `type-graphql`), and the schema is generated automatically.
* *Architect's Choice:* **Schema-First** is preferred for large teams because frontend developers can mock the API based on the file before the backend is even written.



---

## 2. Advanced Schema Design Patterns

### A. The Connection Pattern (Pagination)

Don't just return a list `[Post]`. Use the **Relay Connection Specification**. This allows for "Cursor-based" pagination, which is much faster for large datasets than "Offset" pagination.

```graphql
type PostConnection {
  edges: [PostEdge]
  pageInfo: PageInfo!
}

type PostEdge {
  cursor: String!
  node: Post!
}

type PageInfo {
  hasNextPage: Boolean!
  endCursor: String
}

```

### B. Input Objects

Never pass dozens of individual arguments to a mutation. Group them into an `Input` type. This makes your API more resilient to changes.

```graphql
# GOOD
mutation {
  updateUser(input: { firstName: "Jane", bio: "Architect" })
}

# BAD
mutation {
  updateUser(firstName: "Jane", lastName: "Doe", bio: "Architect", age: 30)
}

```

---

## 3. Directives: Logic in the Schema

Directives are "tags" that start with `@` and allow you to add custom logic to your schema.

### Auth Directive

Instead of checking permissions in every resolver, you can handle it in the schema:

```graphql
type User {
  id: ID!
  email: String! @auth(requires: ADMIN)
  username: String!
}

```

---

## 4. The "Data Loader" Pattern (N+1 Solution)

As discussed in the Node masterclass, the N+1 problem is the #1 performance killer in GraphQL.

**How it works in practice:**

1. GraphQL sees you want 10 Users and their 10 Posts.
2. `DataLoader` intercepts the 10 calls to `getPostsByUserId`.
3. It waits for one "tick" of the event loop.
4. It combines the 10 IDs into a single query: `SELECT * FROM posts WHERE userId IN (1,2,3...10)`.

---

## 5. Security: Complexity and Depth Limiting

Since clients can request whatever they want, a malicious user could send a "Circular Query" to crash your server:

```graphql
query {
  user {
    posts {
      author {
        posts {
           author { ... } # Repeat 100 times
        }
      }
    }
  }
}

```

**Prevention:**

* **Depth Limiting:** Set a max depth (e.g., 5 levels).
* **Complexity Scoring:** Assign "points" to fields. A simple field = 1, a list = 5. Block queries that exceed 100 points.

---

## 6. Senior Architect Interview Questions

* **Q: Why would you choose GraphQL over REST for a mobile app?**
* *A:* Mobile apps often suffer from high latency and limited bandwidth. GraphQL allows the app to get exactly what it needs in **one round trip**, significantly improving the user experience on slow networks.


* **Q: How do you handle File Uploads in GraphQL?**
* *A:* GraphQL is for structured data, not binary. Two common ways:
1. **Multipart Requests:** Using the `graphql-upload` spec.
2. **The "S3 Pre-signed URL" Pattern:** The client asks GraphQL for a URL, then uploads the file directly to S3 via HTTP (Highly recommended for scalability).




* **Q: What is a "Federated" GraphQL Schema?**
* *A:* It’s a way to split a giant "Monolith" schema into multiple microservices. Each service owns part of the graph, and a "Gateway" stitches them together for the client.
