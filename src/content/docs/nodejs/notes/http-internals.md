---
title: "HTTP Internals"
description: "Understand the raw HTTP protocol in Node.js. Learn that Requests and Responses are just Streams, how to manually parse request bodies, and the anatomy of Status Codes and Headers."
tags: ["http", "protocols", "performance", "headers"]
sidebar:
  order: 9
---

Most developers jump straight to frameworks like Express or NestJS. However, those frameworks are just wrappers around Node's built-in `http` module. To debug performance issues or weird header bugs, you need to understand the raw HTTP implementation.

## 1. Anatomy of an HTTP Transaction

HTTP is a text-based protocol that runs over TCP. When a browser visits your site, it sends a block of text (The Request) and waits for a block of text back (The Response).

### The Raw Request

If you could see the raw data coming into your TCP socket, it would look like this:

```http
POST /users HTTP/1.1
Host: api.myapp.com
Content-Type: application/json
User-Agent: Mozilla/5.0...

{"name": "Alice"}

```

### The Raw Response

Your server sends back:

```http
HTTP/1.1 201 Created
Content-Type: application/json
Date: Mon, 27 Oct 2023...

{"id": 1, "status": "success"}

```

---

## 2. The `http` Module

Node.js parses that raw text for you and provides two objects: `req` (IncomingMessage) and `res` (ServerResponse).

```javascript
const http = require('http');

const server = http.createServer((req, res) => {
    // 1. Analyze the Request
    console.log(req.method); // 'GET', 'POST'
    console.log(req.url);    // '/users?id=5'
    console.log(req.headers['user-agent']); 

    // 2. Build the Response
    res.writeHead(200, { 'Content-Type': 'text/plain' }); // Headers
    res.write('Hello '); // Body chunk 1
    res.end('World!');   // Body chunk 2 + Finish
});

server.listen(3000);

```

---

## 3. `req` and `res` are Streams!

This is the most important realization in Node.js web development.

* **`req` is a Readable Stream.** The body of the request (e.g., a file upload) might not have arrived yet when your function starts running.
* **`res` is a Writable Stream.** You pipe data into it.

### Parsing the Body (The Hard Way)

In raw Node.js, there is no `req.body`. You must collect the stream chunks manually. This is exactly what `body-parser` (in Express) does for you.

```javascript
const server = http.createServer((req, res) => {
    if (req.method === 'POST') {
        let body = [];

        // 1. Listen for data chunks
        req.on('data', (chunk) => {
            body.push(chunk);
        });

        // 2. Listen for end of stream
        req.on('end', () => {
            // Combine chunks into one Buffer, then to String
            const parsedBody = Buffer.concat(body).toString();
            console.log("User sent:", parsedBody);
            
            res.end('Data received');
        });
    }
});

```

---

## 4. Status Codes and Headers

### Status Codes

You control the semantics of the response.

* **2xx:** Success (`200 OK`, `201 Created`).
* **3xx:** Redirection (`301 Moved Permanently`, `304 Not Modified`).
* **4xx:** Client Error (`400 Bad Request`, `401 Unauthorized`, `404 Not Found`).
* **5xx:** Server Error (`500 Internal Server Error`).

### Headers

Headers are metadata.

* **Content-Type:** Tells the client what the data is (`application/json`, `text/html`, `image/png`).
* **Cache-Control:** Tells the browser how long to save the file (`max-age=3600`).

```javascript
// Sending JSON
res.writeHead(200, { 
    'Content-Type': 'application/json',
    'X-Powered-By': 'Node.js' // Custom header
});
res.end(JSON.stringify({ data: 'Success' }));

```

---

## 5. HTTPS (SSL/TLS)

Node.js has a separate `https` module. It is almost identical to `http`, but it requires SSL certificates (Private Key and Public Certificate) to encrypt the TCP connection.

```javascript
const https = require('https');
const fs = require('fs');

const options = {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem')
};

https.createServer(options, (req, res) => {
    res.writeHead(200);
    res.end('Secure Hello World');
}).listen(443);

```

**Production Tip:** In most real-world deployments, you do **not** use Node.js to handle SSL. You use a "Reverse Proxy" (like Nginx or AWS Load Balancer) to handle SSL (SSL Termination), and then forward plain HTTP to your Node.js app. This saves CPU on the Node process.
