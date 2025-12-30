---
title: "Networking Core (TCP and UDP)"
description: "Go beyond HTTP. Learn how to build raw TCP servers using the net module, handle high-speed UDP datagrams with dgram, and understand the crucial differences between connection-oriented and connectionless protocols."
tags: ["tcp", "udp", "networking", "sockets"]
sidebar:
  order: 8
---

When you visit a website, you are using **HTTP**. But HTTP is just a high-level set of rules (Application Layer) that runs *on top of* a lower-level transport protocol called **TCP**.

Node.js gives you direct access to these Transport Layer protocols via the `net` (TCP) and `dgram` (UDP) modules.

## 1. TCP (Transmission Control Protocol)

TCP is the backbone of the web. It is **Connection-Oriented** and **Reliable**.

### Key Characteristics:

1. **Reliable Delivery:** It guarantees that data sent is data received. If a packet is lost on the wire, TCP automatically re-sends it.
2. **Ordered:** Packets `A`, `B`, `C` will arrive as `A`, `B`, `C`.
3. **Heavyweight:** It requires a "Handshake" to start and acknowledgment messages for every data chunk.

### Building a Raw TCP Server (`net` module)

This is how you build a custom chat protocol or a database connection handler. Note that `socket` here is a **Duplex Stream** (from Guide 6).

```javascript
const net = require('net');

const server = net.createServer((socket) => {
    console.log('Client connected');

    // 1. Send data to the client
    socket.write('Welcome to the raw TCP server!\r\n');

    // 2. Listen for incoming data
    socket.on('data', (data) => {
        // 'data' is a Buffer. Convert to string.
        const msg = data.toString().trim();
        console.log(`Received: ${msg}`);

        // Echo it back
        socket.write(`You said: ${msg}\r\n`);
    });

    // 3. Handle disconnection
    socket.on('end', () => {
        console.log('Client disconnected');
    });
    
    // 4. Handle Errors (Important! If a client crashes, this fires)
    socket.on('error', (err) => {
        console.error('Socket error:', err.message);
    });
});

server.listen(8080, () => {
    console.log('TCP Server listening on port 8080');
});

```

**How to test this?**
You don't need a browser. Use **Telnet** or **Netcat** in your terminal:
`nc localhost 8080`

### The "Sticking" Problem (Stream vs Packet)

TCP is a **Stream** protocol, not a Packet protocol.
If you send "Hello" and then "World" very quickly, the client might receive "HelloWorld" as a single chunk, or "Hel" and "loWorld".

* **Solution:** You must implement your own "framing" (e.g., ending every message with a newline `\n` or sending the length of the message in the first 2 bytes) so the receiver knows where one message ends and the next begins.

---

## 2. UDP (User Datagram Protocol)

UDP is the "Fire and Forget" protocol. It is **Connectionless** and **Unreliable**.

### Key Characteristics:

1. **Unreliable:** You send a message, but you don't know if it arrived. There are no acknowledgments (ACKs).
2. **Unordered:** Message `A` and `B` might arrive as `B`, `A`.
3. **Lightweight & Fast:** No handshake, no overhead. Ideal for speed.

**Use Cases:** Video streaming (Zoom/Skype), Online Gaming (FPS movement updates), DNS lookups.

* *Why?* If you drop a frame in a video call, it's better to skip it than to pause the video to wait for it.

### Building a UDP Server (`dgram` module)

We use `dgram` (Datagram) instead of `net`. Notice there is no `socket.write`, only `socket.send`.

```javascript
const dgram = require('dgram');
const server = dgram.createSocket('udp4'); // IPv4

server.on('error', (err) => {
    console.log(`Server error:\n${err.stack}`);
    server.close();
});

server.on('message', (msg, rinfo) => {
    // rinfo contains the sender's IP and Port
    console.log(`Server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
    
    // Reply manually (Since there is no persistent connection)
    const reply = Buffer.from('Message Received');
    server.send(reply, rinfo.port, rinfo.address, (err) => {
        if (err) console.error(err);
    });
});

server.on('listening', () => {
    const address = server.address();
    console.log(`UDP Server listening on ${address.address}:${address.port}`);
});

server.bind(41234);

```

---

## 3. DNS (Domain Name System)

The `dns` module allows you to do name resolution (turning `google.com` into `142.250...`).

```javascript
const dns = require('dns');

dns.lookup('google.com', (err, address, family) => {
    console.log('IP Address:', address);
    console.log('IP Version:', family); // 4 or 6
});

```

* **Performance Note:** `dns.lookup` uses the Libuv Thread Pool because it calls the underlying OS `getaddrinfo` function, which blocks. If you do thousands of lookups, you will block your thread pool (Guide 1) unless you use `dns.resolve` (which is purely network-based and non-blocking).

---

## 4. When to use what?

| Feature | TCP | UDP |
| --- | --- | --- |
| **Connection** | Requires Connection (Handshake) | No Connection (Packets) |
| **Reliability** | High (Retries lost data) | Low (Data can be lost) |
| **Order** | Guaranteed | Not Guaranteed |
| **Speed** | Slower (Overhead) | Faster (Minimal overhead) |
| **Node Module** | `net` | `dgram` |
| **Examples** | HTTP, Databases, Email | Video, Gaming, DNS |
