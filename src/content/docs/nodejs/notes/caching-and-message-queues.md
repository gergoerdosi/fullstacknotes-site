---
title: "Caching and Message Queues"
description: "Scale your architecture. Learn to implement the Cache-Aside pattern with Redis to reduce database load, and use BullMQ/RabbitMQ to offload heavy tasks to background workers."
tags: ["redis", "rabbitmq", "kafka", "caching"]
sidebar:
  order: 14
---

## 1. Redis: The Speed Layer

Your primary database (PostgreSQL/MongoDB) saves data to **Disk**. This makes it durable but slow (milliseconds).
**Redis** saves data to **RAM**. This makes it volatile (data is lost on restart without persistence config) but incredibly fast (microseconds).

### The "Cache-Aside" Strategy

This is the most common pattern. You never query the DB directly without checking Redis first.

```javascript
const redis = require('redis');
const client = redis.createClient();
await client.connect();

async function getProfile(userId) {
    const cacheKey = `user:${userId}`;

    // 1. Check Redis (RAM)
    const cachedData = await client.get(cacheKey);
    if (cachedData) {
        console.log('Cache Hit');
        return JSON.parse(cachedData);
    }

    // 2. If missing, Check Database (Disk)
    console.log('Cache Miss');
    const user = await db.User.findById(userId);

    // 3. Save to Redis for next time
    // 'EX', 3600 means "Expire in 1 hour" (TTL)
    await client.set(cacheKey, JSON.stringify(user), { EX: 3600 });

    return user;
}

```

### Cache Invalidation (The Hard Part)

"There are only two hard things in Computer Science: cache invalidation and naming things."

If you update the user in the database, the Redis cache is now **stale** (outdated).
**Fix:** whenever you run `updateUser()`, you must also run `redis.del('user:123')`.

---

## 2. Message Queues: Async Processing

In HTTP, the user waits for the response. If a user clicks "Generate PDF Report" and it takes 30 seconds, the browser will spinner-lock or timeout.

**Solution:** Offload the work to a **Background Worker**.

1. **Web Server:** "Request received. I'll email you when it's done." (Returns `202 Accepted` immediately).
2. **Producer:** Adds a "Job" to a Queue.
3. **Consumer (Worker):** A separate Node.js process that reads the queue and does the heavy lifting.

### Option A: BullMQ (Redis-based)

For Node.js apps, **BullMQ** is the industry standard. It uses Redis to store the job list. It handles retries, delays, and priorities automatically.

```javascript
// producer.js (The Web Server)
const { Queue } = require('bullmq');
const emailQueue = new Queue('emails');

app.post('/register', async (req, res) => {
    // Add job to queue. This takes <10ms.
    await emailQueue.add('welcome-email', { 
        email: req.body.email,
        name: req.body.name 
    });

    res.send('Welcome! Email is on its way.');
});

```

```javascript
// worker.js (The Background Process)
const { Worker } = require('bullmq');

const worker = new Worker('emails', async (job) => {
    // This runs in the background. 
    // Even if this takes 5 seconds, the user is not blocked.
    console.log(`Sending email to ${job.data.email}...`);
    await sendEmailService(job.data);
    
}, { connection: redisConnection });

```

### Option B: RabbitMQ (AMQP)

Redis is fast, but if you have a massive microservices architecture (e.g., Node talking to Python/Java), **RabbitMQ** is more robust. It uses a protocol called **AMQP**.

* **Exchange:** The post office. It receives messages.
* **Queue:** The mailbox.
* **Binding:** The rule linking Exchange to Queue.

---

## 3. When to use what?

| Scenario | Solution | Why? |
| --- | --- | --- |
| **Fetch top 10 products** | **Redis** | Data is read often, changes rarely. |
| **User Session Store** | **Redis** | Fast access to cookie data on every request. |
| **Rate Limiting** | **Redis** | Increment counters atomically (`INCR`). |
| **Sending Emails** | **Queue** (Bull/Rabbit) | External API might be slow/down. |
| **Video Transcoding** | **Queue** | CPU intensive task. Blocks the Event Loop. |
| **Order Placement** | **Queue** | Reliability. If DB is down, hold the order in queue. |

---

## 4. The "Thundering Herd" Problem

A specific Redis risk.
Imagine your cache for "Homepage Products" expires at 12:00:00.
At 12:00:01, **10,000 users** visit the site simultaneously.

* All 10,000 check Redis -> Miss.
* All 10,000 hit the Database at the exact same millisecond.
* Database crashes.

**Solution: Cache Locking** or **Probabilistic Early Expiration**. Only let *one* request rebuild the cache while the others wait or get stale data.
