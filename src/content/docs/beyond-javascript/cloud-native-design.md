---
title: "Cloud Native Design (Serverless and S3)"
description: "Master the cloud. Learn to optimize AWS Lambda, solve the Cold Start problem, and implement high-performance file uploads using the S3 Pre-signed URL pattern."
tags: ["aws", "serverless", "s3", "lambda", "architecture"]
sidebar:
  order: 9
---

"Serverless" doesn't mean there are no servers; it means you don't have to manage them. You simply upload your code (functions), and the provider executes them on demand.

## 1. AWS Lambda and FaaS (Function as a Service)

In a traditional setup, your Node.js server is always running, costing you money even at 3 AM with zero traffic. In Serverless, you pay **only** for the milliseconds your code is actually running.

### The "Cold Start" Problem

When a Lambda function hasn't been used for a while, the cloud provider spins down the container. The next request triggers a "Cold Start," where the provider must:

1. Initialize the runtime (Node.js).
2. Download your code.
3. Start your script.

**How to minimize Cold Starts:**

* **Keep it light:** Use smaller packages and avoid heavy dependencies.
* **Provisioned Concurrency:** Pay a bit extra to keep a few instances "warm."
* **Use ESM:** Faster initialization than CommonJS in some environments.

---

## 2. Object Storage (Amazon S3)

A Full Stack Architect never stores files (images, PDFs, videos) on the application server's local disk. Why? Because if you scale to 5 servers, the file uploaded to Server 1 won't exist on Server 2.

**Amazon S3 (Simple Storage Service)** is the solution.

* **Bucket:** A container for your files.
* **Key:** The unique path/name of the file.
* **Durability:** 99.999999999% (Your data is replicated across multiple data centers).

### The Pre-signed URL Pattern (High Performance)

Don't let users upload 100MB files *through* your Node.js server. It wastes memory and CPU.

1. **Client** asks Node: "Can I upload this?"
2. **Node** asks S3: "Give me a temporary URL."
3. **Node** sends the URL to the Client.
4. **Client** uploads the file **directly** to S3.

---

## 3. Serverless Databases (Aurora and DynamoDB)

Traditional databases (Postgres) don't play well with Serverless because Lambda can scale to 1,000 instances instantly, exhausting the database's connection limit (see Guide 22).

* **DynamoDB (NoSQL):** Key-value store that handles millions of requests per second with single-digit millisecond latency.
* **Aurora Serverless (SQL):** A relational database that automatically scales its capacity up or down based on your application's needs.

---

## 4. Event-Driven Cloud (EventBridge)

Cloud-native apps use "Triggers."

* User uploads an image to **S3**.
* This triggers a **Lambda** to resize the image.
* That triggers a **SNS/SQS** message to notify the user.

---

## 5. Senior Architect Interview Questions

* **Q: When would you NOT use Serverless?**
* **A:** For long-running tasks (over 15 minutes), applications with constant, high-volume traffic (where a reserved instance is cheaper), or apps that require extremely low, consistent latency (to avoid cold start spikes).


* **Q: What is the "State" problem in Serverless?**
* **A:** Lambda functions are completely stateless. You cannot save a variable in memory and expect it to be there for the next request. Every bit of state must be in an external DB or Cache (Redis).


* **Q: Explain "Infrastructure as Code" (IaC).**
* **A:** Instead of clicking buttons in a dashboard, you define your cloud setup in code using tools like **Terraform**, **AWS CDK**, or **Serverless Framework**. This makes your environment reproducible and version-controlled.
