---
title: "Microservices Architecture"
description: "Master the move from Monolith to Microservices. Learn about API Gateways, Synchronous vs. Asynchronous communication, the Saga Pattern, and implementing Circuit Breakers."
tags: ["microservices", "system design", "rabbitmq", "architecture"]
sidebar:
  order: 6
---

In a **Monolith**, all features (User Auth, Payments, Inventory) share the same memory, database, and codebase.
In **Microservices**, each feature is a standalone service with its own database, language, and deployment cycle.

## 1. The Core Principles

* **Single Responsibility:** Each service does one thing well.
* **Database per Service:** Services **must not** share a database. If Service A needs Service B's data, it must ask via an API or a message.
* **Encapsulation:** The internal logic of a service is hidden. Only the API is public.

## 2. Service Communication: Sync vs. Async

How do services talk to each other?

### A. Synchronous (HTTP/gRPC)

Service A waits for Service B to respond.

* **Best for:** Tasks that need an immediate answer (e.g., checking if a password is correct).
* **Risk:** If Service B is slow, Service A becomes slow (Cascading Failure).

### B. Asynchronous (Message Brokers)

Service A emits an event ("OrderCreated") and moves on. Service B listens for that event.

* **Tools:** RabbitMQ, Apache Kafka, Amazon SQS.
* **Best for:** Non-blocking tasks (e.g., sending an email, processing a payment).

---

## 3. The API Gateway Pattern

You don't want your frontend to manage 50 different URLs for 50 services. An **API Gateway** acts as a single entry point.

* **Routing:** Directs `/users` to the User Service and `/orders` to the Order Service.
* **Authentication:** Validates the JWT once so the internal services don't have to.
* **Rate Limiting:** Protects the entire ecosystem from being overwhelmed.

---

## 4. Handling Distributed Transactions (Saga Pattern)

In a monolith, you use a database transaction. In microservices, you can't. If the "Order Service" succeeds but the "Payment Service" fails, how do you undo the order?
**The Solution: The Saga Pattern.**
Each service performs its local transaction and publishes an event. If a step fails, the previous services execute **Compensating Transactions** (e.g., "Refund Payment" or "Cancel Order").

---

## 5. Resilience: The Circuit Breaker

If a service is failing, continuing to hit it will only make it worse. A **Circuit Breaker** (like the `opossum` library in Node.js) monitors failures.

1. **Closed:** Traffic flows normally.
2. **Open:** Service B is failing; Service A stops calling it and returns a fallback/error immediately.
3. **Half-Open:** After a timeout, a small amount of traffic is allowed through to see if Service B is back online.

---

## 6. Senior Architect Interview Questions

* **Q: What is "Service Discovery"?**
* **A:** In a cloud environment, service IPs change constantly. Service Discovery (like Consul or Kubernetes DNS) allows services to find each other by name (e.g., `http://inventory-service`) instead of hardcoded IPs.


* **Q: When should you NOT use microservices?**
* **A:** When the team is small (under 10 people), when the domain is not yet well-understood, or when the operational overhead (CI/CD, monitoring, logging) exceeds the benefit of scaling.


* **Q: How do you handle "Distributed Tracing"?**
* **A:** Since a request might pass through 5 different services, we use a **Correlation ID** in the headers. Tools like **Jaeger** or **Zipkin** help visualize the entire path of a single request across all services.
