---
title: "Docker for JavaScript Developers"
description: "Master containerization for Node.js. Learn about multi-stage builds, layer caching, Docker Compose networking, and persistent volumes."
tags: ["docker", "infrastructure", "node.js", "security"]
sidebar:
  order: 1
---

In the past, we relied on documentation like *"Please install Node 18, Redis 6, and PostgreSQL 14 to run this app."* If the developer had the wrong version, everything broke.

**Docker** solves this by packaging the code, the runtime, the libraries, and the OS settings into a single, immutable **Image**.

---

## 1. The Core Concepts: Image vs. Container

* **Dockerfile:** A text file containing the "recipe" for your environment.
* **Image:** The "executable package" (like a `.dmg` or `.exe`) created from the Dockerfile. It is read-only.
* **Container:** A running instance of an image. You can have 10 containers running from 1 single image.

---

## 2. Crafting the Perfect `Dockerfile` (Node.js)

Most developers write inefficient Dockerfiles that result in massive images (1GB+) and slow build times. A Senior Developer uses **Multi-Stage Builds** and **Layer Caching**.

### The "Senior" Dockerfile

```dockerfile
# Stage 1: Build & Dependencies
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files FIRST to leverage layer caching
COPY package*.json ./
RUN npm install

# Copy the rest and build (if using TS)
COPY . .
RUN npm run build

# Stage 2: Production Runtime
FROM node:20-alpine AS runner
WORKDIR /app

# Set environment to production
ENV NODE_ENV=production

# Only copy necessary files from the builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

# Create a non-root user for security
RUN addgroup -S nodeapp && adduser -S nodeapp -G nodeapp
USER nodeapp

EXPOSE 3000
CMD ["node", "dist/main.js"]

```

### Why this is better:

1. **Alpine Linux:** We use `node:20-alpine`, which is ~50MB compared to the standard ~900MB image.
2. **Layer Caching:** By copying `package.json` before the rest of the code, `npm install` only reruns if you change your dependencies.
3. **Multi-Stage:** The final image doesn't contain source code or dev-dependencies, making it smaller and more secure.
4. **Security:** We switch to a `non-root` user so that if an attacker compromises your app, they don't have root access to the container.

---

## 3. Docker Compose: Managing the Stack

Rarely does a Node.js app live alone. It usually needs a Database and a Cache. **Docker Compose** allows you to define your entire infrastructure in a single YAML file.

### `docker-compose.yml`

```yaml
services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DB_URL=postgres://user:pass@db:5432/mydb
    depends_on:
      - db

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
      - POSTGRES_DB=mydb
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:

```

**The Magic of Networking:** In this setup, the Node.js app connects to the database using the hostname `db` (the service name). Docker handles the internal DNS automatically.

---

## 4. Persistent Data (Volumes)

Containers are **ephemeral**. If a container is deleted, all data inside it is lost.
To keep your database data alive, you use **Volumes**. Volumes map a folder on your physical computer to a folder inside the container.

* **Anonymous Volumes:** Managed by Docker, deleted when the container is.
* **Named Volumes:** (Like `pgdata` above) Survive even if the container is destroyed.
* **Bind Mounts:** Maps a specific folder on your hard drive (great for development).

---

## 5. Senior Interview Questions: Docker

* **Q: What is the difference between `CMD` and `ENTRYPOINT`?**
* *A:* `ENTRYPOINT` sets the command that will always run. `CMD` provides default arguments that the user can override when starting the container.


* **Q: Why should you avoid using `latest` tags?**
* *A:* Because `latest` is non-deterministic. If a new version of Node is released tonight, your build tomorrow might break. Always use specific versions (e.g., `node:20.10.0`).


* **Q: How do you reduce Docker image size?**
* *A:* Use Alpine images, use `.dockerignore` to skip `node_modules`, and use multi-stage builds.
