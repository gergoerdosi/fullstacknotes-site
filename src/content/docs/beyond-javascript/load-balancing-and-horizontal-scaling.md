---
title: "Load Balancing and Horizontal Scaling"
description: "Prepare for high traffic. Learn how to scale Node.js apps horizontally, implement Load Balancers with Nginx, and ensure your application remains stateless for distributed environments."
tags: ["scalability", "load balancing", "nginx", "infrastructure"]
sidebar:
  order: 3
---

In a production environment, you never have just one instance of your Node.js app running. If that one server fails, your business stops. Horizontal scaling provides **High Availability** and **Fault Tolerance**.

## 1. Vertical vs. Horizontal Scaling

* **Vertical (Scaling Up):** Adding more RAM or CPU to your existing machine.
* *Limit:* Eventually, you hit a hardware ceiling and it becomes exponentially expensive.


* **Horizontal (Scaling Out):** Adding more machines to your pool.
* *Benefit:* Theoretically infinite scale. If one machine dies, the others pick up the slack.

---

## 2. The Role of the Load Balancer

A Load Balancer (LB) acts as a "traffic cop" sitting in front of your servers. It routes incoming client requests to whichever server is best able to handle them.

### Common Algorithms:

1. **Round Robin:** Requests are distributed sequentially (Server A, then B, then C).
2. **Least Connections:** Sends traffic to the server with the fewest active sessions.
3. **IP Hash:** Ensures a specific user (based on IP) always hits the same server (useful for "Sticky Sessions").

### Health Checks:

The LB constantly "pings" your Node.js servers (usually at a `/health` endpoint). If a server doesn't respond with a `200 OK`, the LB removes it from the rotation automatically until it's healthy again.

---

## 3. The "Stateless" Requirement

This is the most critical rule of horizontal scaling: **Your Node.js app must be Stateless.**

In a single-server setup, you might store user data in a local variable or a file on the disk. In a scaled setup, this fails:

1. User logs in on **Server A**.
2. The next request hits **Server B**.
3. **Server B** has no idea who the user is.

### How to achieve Statelessness:

* **Sessions:** Store session data in **Redis**, not in local memory.
* **Files:** Store uploads in **S3 (Object Storage)**, not on the server's local hard drive.
* **Auth:** Use **JWTs** (JSON Web Tokens) so the user's identity is contained within the request itself.

---

## 4. Nginx as a Load Balancer

While cloud providers (AWS, GCP) offer hardware load balancers, you can build your own using **Nginx**. This is common in smaller setups or private clouds.

**Example `nginx.conf` for Load Balancing:**

```nginx
upstream my_nodejs_app {
    least_conn; # Algorithm
    server 10.0.0.1:3000; # Server A
    server 10.0.0.2:3000; # Server B
    server 10.0.0.3:3000; # Server C
}

server {
    listen 80;
    location / {
        proxy_pass http://my_nodejs_app;
    }
}

```

---

## 5. Service Discovery

In a dynamic environment (like Kubernetes), servers are created and destroyed constantly. Their IP addresses change. You cannot hardcode them in Nginx.
**Service Discovery** (using tools like **Consul**, **Etcd**, or built-in **K8s DNS**) allows the Load Balancer to automatically find new servers as they come online.

---

## 6. Senior Architect Interview Questions

* **Q: What is the "Sticky Session" problem?**
* *A:* It’s when a load balancer forces a user to stay on one server. It’s a "code smell" because it prevents true horizontal scaling. It’s better to use a shared session store (Redis).


* **Q: How do you handle database scaling?**
* *A:* Databases are harder to scale than apps. We use **Read Replicas** (one "Primary" for writes, multiple "Secondaries" for reads) or **Sharding** (splitting data across different databases).


* **Q: What is a Layer 4 vs. Layer 7 Load Balancer?**
* *A:* Layer 4 (Transport) routes based on IP and Port (faster). Layer 7 (Application) routes based on HTTP headers, cookies, or URL paths (smarter).
