---
title: "File System and OS Mastery"
description: "Master the fs module. Learn the difference between fs.promises and callbacks, how to handle cross-platform paths, managing File Descriptors, and implementing Graceful Shutdowns with OS Signals."
tags: ["fs", "os", "system-io", "scripting"]
sidebar:
  order: 7
---

Node.js is often used as a scripting tool ("glue code") because it has powerful, low-level access to the file system and operating system. Unlike browser JavaScript, which is sandboxed for security, Node.js has full control over the machine it runs on.

## 1. The Three Faces of `fs`

The `fs` module has evolved over time. There are now three ways to use it. You should know when to use each.

### A. Synchronous (`readFileSync`)

**Behavior:** Blocks the Event Loop until the file is read.
**Use Case:** Only for startup scripts or loading configurations *before* the server starts listening. Never use this inside a request handler.

```javascript
const fs = require('fs');
const config = fs.readFileSync('./config.json', 'utf-8'); // OK if done once at startup

```

### B. Callback API (`readFile`)

**Behavior:** Non-blocking. Uses the error-first callback pattern.
**Use Case:** Legacy codebases.

```javascript
fs.readFile('./data.txt', (err, data) => {
    if (err) throw err;
    console.log(data);
});

```

### C. Promise API (`fs/promises`)

**Behavior:** Non-blocking. Returns Promises.
**Use Case:** The modern standard. Always use this in new projects.

```javascript
const fs = require('fs/promises');

async function getData() {
    try {
        const data = await fs.readFile('./data.txt', 'utf-8');
        console.log(data);
    } catch (error) {
        console.error("File missing");
    }
}

```

---

## 2. Paths and Cross-Platform Compatibility

If you hardcode file paths like `src/data/file.txt`, your code will break on Windows (which uses backslashes `\`) or Linux (which uses forward slashes `/`).

Use the `path` module to ensure your code runs everywhere.

### `path.join` vs `path.resolve`

This is a common interview question.

```javascript
const path = require('path');

// path.join: Just concatenates segments using the OS separator
console.log(path.join('src', 'data', 'file.txt'));
// Linux: src/data/file.txt
// Windows: src\data\file.txt

// path.resolve: Calculates the ABSOLUTE path from the root
console.log(path.resolve('src', 'file.txt'));
// Output: /Users/username/project/src/file.txt

```

### The `__dirname` issue in ESM

In CommonJS, `__dirname` gives you the current folder path. In ES Modules (`.mjs`), `__dirname` **does not exist**. You must reconstruct it:

```javascript
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

```

---

## 3. Low-Level: File Descriptors and Stats

Sometimes you don't want to read a file; you just want to know *about* it (size, creation date) or check if it exists.

### File Metadata (`fs.stat`)

`fs.stat` returns a `Stats` object.

```javascript
const fs = require('fs/promises');

async function checkFile() {
    const stats = await fs.stat('./video.mp4');
    
    console.log(`Size: ${stats.size} bytes`);
    console.log(`Is Directory? ${stats.isDirectory()}`);
    console.log(`Created: ${stats.birthtime}`);
}

```

### File Descriptors (FD)

When you open a file, the OS assigns it a numeric ID called a **File Descriptor**. Node.js uses this integer to reference the open file in the kernel.

**Why it matters:** Operating Systems have a limit on how many files can be open at once (often 1024 by default). If you `fs.open()` thousands of files without `fs.close()`-ing them, your app will crash with `EMFILE: too many open files`.

```javascript
// Advanced: Manual opening/closing
const fileHandle = await fs.open('./log.txt', 'r');
// Do low-level operations...
await fileHandle.close(); // CRITICAL to release the FD

```

---

## 4. Watching Files (`fs.watch`)

Node.js can listen for changes to files (edits, renames, deletions). This is how tools like `nodemon` work.

```javascript
const fs = require('fs');

fs.watch('./logs', (eventType, filename) => {
    console.log(`Event: ${eventType}`);
    console.log(`File Changed: ${filename}`);
});

```

**The Caveats (Why native `watch` is tricky):**

1. **Duplicate Events:** Modifying a file often triggers multiple "change" events (one for saving content, one for updating the timestamp).
2. **Platform Inconsistency:** Renaming files acts differently on Windows vs macOS.
3. **The Solution:** For production apps, use a library like **Chokidar**, which wraps `fs.watch` and smooths out these edge cases.

---

## 5. OS Signals and Graceful Shutdown

When you deploy Node.js (e.g., using Docker or Kubernetes), the orchestration tool stops your app by sending a **Signal**.

* **`SIGINT`**: Sent when you press `Ctrl+C`.
* **`SIGTERM`**: Sent by Docker/Kubernetes to say "Please stop."

If you don't handle these, your app shuts down *instantly*, potentially cutting off active user requests or corrupting database writes.

**The Graceful Shutdown Pattern:**

```javascript
const server = app.listen(3000);

// Handle CTRL+C
process.on('SIGINT', gracefulShutdown);

// Handle Docker Stop
process.on('SIGTERM', gracefulShutdown);

function gracefulShutdown() {
    console.log('Signal received. Closing server...');
    
    // 1. Stop accepting NEW connections
    server.close(() => {
        console.log('HTTP Server closed.');
        
        // 2. Close Database connections
        // await db.disconnect();
        
        // 3. Exit
        process.exit(0);
    });
    
    // Force exit if 1-3 takes too long (e.g., 10 seconds)
    setTimeout(() => {
        console.error('Forced shutdown due to timeout');
        process.exit(1);
    }, 10000);
}

```

---

## 6. The `os` Module

Useful for diagnostics and scaling.

```javascript
const os = require('os');

console.log(os.cpus().length); // Number of Cores (Use this to determine thread pool size!)
console.log(os.freemem());     // Free RAM in bytes
console.log(os.homedir());     // User's home directory

```
