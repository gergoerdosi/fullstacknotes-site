---
title: "Buffers and Streams (Handling Binary Data)"
description: "Handle massive datasets without crashing your server. Learn about raw Buffers, the 4 types of Streams, creating Pipelines, and the crucial concept of Backpressure."
tags: ["streams", "buffers", "binary-data", "memory-management"]
sidebar:
  order: 6
---

Before Node.js, JavaScript (in the browser) was designed to handle text (strings). It wasn't good at handling raw binary data like JPEGs, MP3s, or TCP packets.

Node.js introduced **Buffers** to handle binary data and **Streams** to move that data efficiently.

## 1. Buffers: The Raw Memory

A **Buffer** is a chunk of memory (RAM) allocated outside the V8 engine. It represents a fixed-size sequence of bytes.

Think of an Array, but it can only store integers from `0` to `255` (8-bit bytes), and you cannot resize it.

### Why do we need them?

Computers don't understand "Hello World"; they understand binary (`01001000...`).

* **Strings** in JS are complex objects (UTF-16).
* **Buffers** are raw bytes. When you read a file or receive a network packet, you get a Buffer.

### Creating Buffers

```javascript
// 1. Safe Allocation (initializes with Zeros)
const buf1 = Buffer.alloc(10); // 10 bytes of empty memory

// 2. Unsafe Allocation (Faster, but might contain old sensitive data!)
const buf2 = Buffer.allocUnsafe(10); 

// 3. From Data
const buf3 = Buffer.from("Hello"); // Automatically converts string to bytes
console.log(buf3); 
// Output: <Buffer 48 65 6c 6c 6f> (Hexadecimal representation)

```

**Common Mistake:** Buffers act like Arrays but are not Arrays. You cannot `.push()` to them because their size is fixed in memory.

---

## 2. Streams: Processing Data Chunk-by-Chunk

If you have a 10GB video file and you want to send it to a user:

* **Without Streams:** You load the full 10GB into RAM. **Crash.**
* **With Streams:** You read 64KB, send 64KB, then free that RAM. You repeat this until done. Your RAM usage stays tiny (e.g., 64KB constant).

### The Four Types of Streams

1. **Readable:** Source of data (e.g., `fs.createReadStream`, `req` in HTTP).
2. **Writable:** Destination for data (e.g., `fs.createWriteStream`, `res` in HTTP).
3. **Duplex:** Both Readable and Writable (e.g., TCP Sockets).
4. **Transform:** Duplex streams that modify data as it passes through (e.g., Zlib for compression, Crypto for encryption).

---

## 3. Readable Streams and Modes

A Readable stream has two modes:

1. **Flowing Mode:** Data flows automatically and is lost if you don't listen for it. (Like water from an open tap).
2. **Paused Mode:** You must manually ask for chunks of data using `.read()`.

**Listening to Data (Flowing Mode):**

```javascript
const fs = require('fs');

// highWaterMark determines chunk size (default 64KB)
const readStream = fs.createReadStream('./big-file.txt', { highWaterMark: 16000 }); 

readStream.on('data', (chunk) => {
    console.log(`Received ${chunk.length} bytes of data.`);
    // 'chunk' is a Buffer here!
});

readStream.on('end', () => {
    console.log('Finished reading.');
});

```

---

## 4. The Pipe Method (`.pipe()`)

The manual way of handling streams (listening to `'data'` events and writing to a destination) is error-prone. The `.pipe()` method handles the flow control automatically.

```javascript
// Copy a massive file efficiently
const source = fs.createReadStream('source.mp4');
const destination = fs.createWriteStream('copy.mp4');

source.pipe(destination);
// Reads from source -> Writes to dest. Done.

```

### Chaining Streams (Pipelines)

You can chain Transform streams.

```javascript
const zlib = require('zlib'); // Compression library

const source = fs.createReadStream('log.txt');
const gzip = zlib.createGzip(); // Transform Stream
const destination = fs.createWriteStream('log.txt.gz');

// Read -> Compress -> Write
source.pipe(gzip).pipe(destination);

```

---

## 5. Backpressure: The Hidden Killer

What happens if the **Readable** stream is faster than the **Writable** stream?

* *Example:* Reading a file from a fast SSD (1000 MB/s) and sending it over a slow Network connection (1 MB/s).

**Without handling:** The memory fills up with buffered chunks waiting to be sent, eventually causing a "Heap Out of Memory" crash.
**With Backpressure:** The Writable stream signals the Readable stream: *"Stop! My internal buffer is full."* The Readable stream pauses until the Writable stream drains.

**The Magic of `.pipe()`:**
The `.pipe()` method handles backpressure automatically. It listens for the `'drain'` event on the destination and pauses/resumes the source accordingly. If you write streams manually without pipe, you **must** implement this logic yourself.

---

## 6. Creating Custom Streams

Sometimes you need to build your own stream (e.g., a stream that pulls data from an API).

```javascript
const { Readable } = require('stream');

class NumberStream extends Readable {
    constructor(max) {
        super();
        this.max = max;
        this.current = 0;
    }

    // You must implement the _read method
    _read() {
        this.current += 1;
        if (this.current > this.max) {
            this.push(null); // Signal "End of Stream"
        } else {
            const str = String(this.current);
            this.push(str); // Push data to the stream buffer
        }
    }
}

const myStream = new NumberStream(5);
myStream.pipe(process.stdout); // Output: 12345

```
