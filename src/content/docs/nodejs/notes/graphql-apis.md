---
title: "GraphQL APIs"
description: "Build flexible APIs. Learn the Schema Definition Language (SDL), how to write Resolvers, the difference between Query and Mutation, and how to solve the deadly N+1 problem using DataLoader."
tags: ["graphql", "apollo", "schema", "query-language"]
sidebar:
  order: 12
---

In a REST API, the *Server* decides what data to send.
In a GraphQL API, the *Client* decides what data they want.

This shift prevents **Over-fetching** (downloading data you don't need) and **Under-fetching** (needing 3 separate requests to get the data you need).

## 1. The Core Concepts

GraphQL is strongly typed. You define exactly what data is available using a **Schema Definition Language (SDL)**.

### The Schema (Types)

There is only **one** endpoint (usually `/graphql`). The shape of the data is defined in the schema.

```graphql
# typeDefs
type User {
  id: ID!
  username: String!
  email: String
  posts: [Post] # Relationship
}

type Post {
  id: ID!
  title: String!
  content: String
  author: User!
}

# The "Entry Points" for reading data
type Query {
  users: [User]
  user(id: ID!): User
}

# The "Entry Points" for modifying data
type Mutation {
  createUser(username: String!, email: String!): User
}

```

### The Query (Client Side)

The client sends a POST request with a query string describing exactly what they need.

```graphql
# Client asks for:
query {
  user(id: "1") {
    username
    posts {
      title
    }
  }
}

```

---

## 2. Setting up Apollo Server

The most popular library for GraphQL in Node.js is **Apollo Server**.

```javascript
const { ApolloServer, gql } = require('apollo-server');

// 1. Define Schema
const typeDefs = gql`
  type Book {
    title: String
    author: String
  }
  type Query {
    books: [Book]
  }
`;

// 2. Define Resolvers (The logic)
const resolvers = {
  Query: {
    books: () => [
      { title: 'The Awakening', author: 'Kate Chopin' },
      { title: 'City of Glass', author: 'Paul Auster' },
    ],
  },
};

// 3. Start Server
const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});

```

---

## 3. Resolvers: The Engine Room

A Resolver is a function responsible for fetching the data for a single field in your schema.
Signature: `(parent, args, context, info)`

* **`parent`**: The result of the previous resolver (used for nested queries like `user.posts`).
* **`args`**: The arguments passed in the query (e.g., `id: "1"`).
* **`context`**: Shared object across all resolvers (used for Auth Headers, Database connections).

```javascript
const resolvers = {
  Query: {
    user: async (parent, args, context) => {
      // Logic: Fetch user from DB using args.id
      return context.db.users.findById(args.id);
    }
  },
  User: {
    // Nested Resolver: Runs only if the client asks for 'posts'
    posts: async (parent) => {
      // 'parent' is the User object fetched above
      return db.posts.findAll({ authorId: parent.id });
    }
  }
};

```

---

## 4. The "N+1 Problem" (Performance Killer)

This is the biggest pitfall in GraphQL.

**Scenario:** You query for 10 Users and their Posts.

1. **1 Query** to get Users: `SELECT * FROM users LIMIT 10`.
2. The `User.posts` resolver runs **10 times** (once for each user).
3. **10 Queries** for Posts: `SELECT * FROM posts WHERE author_id = ?`.

Total Queries: **11**. If you fetch 100 users, it's 101 queries. This kills the database.

### The Solution: DataLoader

**DataLoader** is a utility that "batches" requests. It waits for one "tick" of the event loop, collects all the IDs requested (1, 2, 3... 10), and fires a **single** batch query.

`SELECT * FROM posts WHERE author_id IN (1, 2, 3... 10)`

```javascript
const DataLoader = require('dataloader');

// Batch Function
const batchPosts = async (userIds) => {
    const posts = await db.posts.find({ authorId: { $in: userIds } });
    // Must return arrays ordered exactly like userIds
    return userIds.map(id => posts.filter(p => p.authorId === id));
};

const postLoader = new DataLoader(batchPosts);

// In Resolver
User: {
    posts: (parent) => postLoader.load(parent.id) // Adds to batch
}

```

---

## 5. REST vs. GraphQL: When to use which?

| Feature | REST | GraphQL |
| --- | --- | --- |
| **Caching** | Excellent (HTTP Caching works natively) | Hard (Everything is POST, needs client-side cache like Apollo Client) |
| **Simplicity** | Easy to start, rigid structure | Complex setup, flexible usage |
| **Over-fetching** | Common | Solved |
| **Versioning** | Need `/v1`, `/v2` | Deprecation (`@deprecated` field), Schema evolves |
| **Security** | Standard tools work well | Needs complexity analysis (Query Depth Limiting) |

**Verdict:** Use GraphQL for complex systems with many relationships (Social Networks, Dashboards). Use REST for simple microservices or public APIs where caching is critical.
