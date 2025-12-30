---
title: "Real-time Communication (WebSockets)"
description: "Build bidirectional applications. Learn the WebSocket handshake, how to scale real-time apps using Redis Pub/Sub, and securing socket connections with JWTs."
tags: ["websockets", "socket.io", "redis", "real-time"]
sidebar:
  order: 4
---

Standard HTTP is like sending a letter: you send a request, wait, and get a response. The server cannot talk to you unless you speak first. **WebSockets** change this by creating a "persistent connection" where both the client and server can send data at any time.

## 1. How the Upgrade Works

A WebSocket connection starts as a standard HTTP request. The client sends a special "Upgrade" header. If the server agrees, the protocol switches from HTTP to binary WS.

* **HTTP:** Stateless, high overhead (headers sent every time).
* **WebSockets:** Stateful, low overhead (tiny frames sent over a single TCP connection).

---

## 2. Socket.io vs. Native WebSockets

While Node.js has a native `ws` module, most developers use **Socket.io**.

**Why Socket.io?**

1. **Auto-Reconnection:** If the Wi-Fi drops, Socket.io automatically reconnects.
2. **Fallback:** If the browser doesn't support WebSockets, it falls back to "HTTP Long Polling."
3. **Rooms & Namespaces:** Built-in logic to group users (e.g., "Join Chat Room #50").

### Basic Implementation

```javascript
// Server (Node.js + Express)
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Joining a room
  socket.on('join-room', (roomId) => {
    socket.join(roomId);
  });

  // Sending a message to a specific room
  socket.on('send-message', (data) => {
    io.to(data.roomId).emit('receive-message', data.msg);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

server.listen(3000);

```

---

## 3. The Scaling Challenge (The Redis Adapter)

This is where Mid-level developers get stuck. If you have **two servers** behind a load balancer:

1. User A connects to **Server 1**.
2. User B connects to **Server 2**.
3. User A sends a message. **Server 2 has no idea User B is waiting for it.**

**The Solution: Redis Pub/Sub.**
We use the **Socket.io Redis Adapter**. When Server 1 receives a message, it publishes it to Redis. Server 2 is "subscribed" to Redis and sees the message, then sends it to User B.

---

## 4. Security: Authentication in WebSockets

You cannot use standard `express-session` easily with WebSockets because the handshake happens once.

**Best Practice:**
Send a **JWT** in the "auth" handshake metadata.

```javascript
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  try {
    const user = jwt.verify(token, process.env.SECRET);
    socket.user = user; // Attach user to socket
    next();
  } catch (err) {
    next(new Error("Authentication error"));
  }
});

```

---

## 5. Senior Architect Interview Questions

* **Q: When would you use WebSockets vs. Server-Sent Events (SSE)?**
* *A:* Use **SSE** if you only need one-way data (Server → Client, like a stock ticker). It runs over standard HTTP and is simpler. Use **WebSockets** if you need two-way data (like a chat).


* **Q: What is a "Sticky Session" in the context of WebSockets?**
* *A:* Since the WebSocket handshake starts with HTTP, some load balancers require "Sticky Sessions" (Session Affinity) to ensure the initial HTTP polling hits the same server that the WebSocket will eventually upgrade on.


* **Q: How do you prevent a "Broadcast Storm"?**
* *A:* By using **Rooms**. Never emit to `io.emit()` (everyone) if you can emit to `io.to(room).emit()`. Broadcasting to 100,000 connected users at once will crash the Event Loop.



---

## Astro Frontmatter

```yaml
---
title: "Real-time Node.js: WebSockets & Socket.io"
description: "Build bidirectional applications. Learn the WebSocket handshake, how to scale real-time apps using Redis Pub/Sub, and securing socket connections with JWTs."
category: "Real-time"
order: 27
tags: ["WebSockets", "Socket.io", "Redis", "Real-time"]
pubDate: 2025-12-30
author: "Gemini"
layout: "../../layouts/MarkdownPostLayout.astro"
---

```

**Would you like me to proceed to Guide 25: GraphQL Deep Dive (Schema Design & Directives)?**