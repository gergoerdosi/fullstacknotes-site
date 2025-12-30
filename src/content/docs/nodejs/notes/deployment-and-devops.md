---
title: "Deployment and DevOps"
description: "Take your application to the real world. Learn Dockerization, Nginx reverse proxy configuration, PM2 process management, and how to build automated CI/CD pipelines."
tags: ["docker", "ci-cd", "devops", "cloud"]
sidebar:
  order: 20
---

Writing the code is only half the battle. "It works on my machine" doesn't help your users. To be a professional backend engineer, you must understand how your code lives on a server.

## 1. Containerization with Docker

The biggest problem in deployment is environment inconsistency (different Node versions, different OS). **Docker** solves this by packaging your app, its dependencies, and the OS into a single "Image."

### A Basic `Dockerfile` for Node.js

```dockerfile
# 1. Use an official Node.js runtime as a parent image
FROM node:18-alphine

# 2. Set the working directory inside the container
WORKDIR /usr/src/app

# 3. Copy package files and install dependencies
COPY package*.json ./
RUN npm install --production

# 4. Copy the rest of your app's source code
COPY . .

# 5. Expose the port your app runs on
EXPOSE 3000

# 6. Command to run your app
CMD ["node", "src/server.js"]

```

---

## 2. Process Management with PM2

In production, you don't run `node app.js`. If the code crashes or the server reboots, the app stays down. **PM2** is a production process manager that keeps your app alive forever.

**Why use PM2?**

* **Auto-Restart:** Restarts the app immediately if it crashes.
* **Cluster Mode:** Automatically scales your app across all CPU cores (Guide 17).
* **Hot Reload:** Updates your code with zero downtime.

**Essential Commands:**

```bash
npm install pm2 -g
pm2 start server.js -i max  # Start in cluster mode using all CPUs
pm2 save                    # Freeze the process list for server reboots
pm2 startup                 # Generate a script to start PM2 on system boot

```

---

## 3. Reverse Proxies (Nginx)

You should never expose your Node.js process directly to the public internet (Port 80/443). Instead, you place a **Reverse Proxy** like Nginx in front of it.

**Benefits of Nginx:**

1. **SSL Termination:** Nginx handles the heavy lifting of HTTPS/Encryption, freeing up Node.js for business logic.
2. **Gzip Compression:** Nginx can compress files faster than Node.
3. **Static File Serving:** Nginx is 10x faster than Node at serving images, CSS, and JS.
4. **Load Balancing:** Nginx can split traffic between multiple Node.js servers.

---

## 4. CI/CD Pipelines

**CI (Continuous Integration):** Every time you push code to GitHub, a script automatically runs your tests (Guide 18) and linter. If a test fails, the code cannot be merged.

**CD (Continuous Deployment):** If the tests pass, the code is automatically built into a Docker image and pushed to your production server (AWS, Google Cloud, DigitalOcean).

### Example GitHub Actions Workflow (`.github/workflows/deploy.yml`)

```yaml
name: Node.js CI/CD
on: [push]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Use Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm test  # The pipeline stops here if tests fail

```

---

## 5. Monitoring and Observability

Once your app is live, you need to know if it's healthy.

1. **Health Checks:** An endpoint (e.g., `GET /health`) that returns `200 OK` if the DB and app are connected. Load balancers use this to know if they should send traffic to that instance.
2. **APM (Application Performance Monitoring):** Tools like **New Relic**, **Datadog**, or **Elastic APM** track response times, slow DB queries, and memory leaks in real-time.
3. **Log Aggregation:** Since you are using JSON logging (Guide 4), tools like **ELK Stack (Elasticsearch, Logstash, Kibana)** or **Loki** allow you to search through millions of logs across multiple servers.

---

## 6. Serverless (AWS Lambda)

The "Serverless" alternative to traditional deployment. Instead of a server running 24/7, you upload your code as a "Function."

* **Pros:** You only pay when the code runs. Scales to infinity automatically.
* **Cons:** "Cold Starts" (delay when starting the function) and limited execution time (usually 15 minutes).
