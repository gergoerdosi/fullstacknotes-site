---
title: "Testing Methodologies"
description: "Ensure your code is production-ready. Master the testing pyramid, write unit tests with Jest, mock dependencies, and perform API integration testing with Supertest."
tags: ["testing", "jest", "tdd", "integration"]
sidebar:
  order: 18
---

In Node.js, testing is particularly vital because of the dynamic nature of JavaScript. Without types (if not using TypeScript), a simple typo can crash a production server. Testing provides a "safety net" that allows you to refactor code with confidence.

## 1. The Testing Pyramid

A healthy project follows the testing pyramid: many small tests at the bottom, fewer large tests at the top.

1. **Unit Tests (70%):** Test a single function or class in isolation. Fast and cheap.
2. **Integration Tests (20%):** Test how multiple parts of the system work together (e.g., API route + Database).
3. **End-to-End (E2E) Tests (10%):** Test the entire flow from the user's perspective (e.g., Browser -> API -> DB).

---

## 2. Unit Testing with Jest

**Jest** is the industry standard for Node.js. It provides a test runner, an assertion library, and mocking tools in one package.

### The "AAA" Pattern: Arrange, Act, Assert

```javascript
// math.js
export const add = (a, b) => a + b;

// math.test.js
import { add } from './math';

test('should add two numbers correctly', () => {
    // 1. Arrange
    const num1 = 5;
    const num2 = 10;

    // 2. Act
    const result = add(num1, num2);

    // 3. Assert
    expect(result).toBe(15);
});

```

### Mocking (The Key to Isolation)

If you are testing a "Service" that sends an email, you don't want to send a real email every time you run tests. You "Mock" the email module.

```javascript
import { registerUser } from './userService';
import { sendEmail } from './emailService';

// Tell Jest to replace the real module with a mock
jest.mock('./emailService');

test('should send welcome email on registration', async () => {
    await registerUser({ email: 'test@test.com' });
    
    // Check if the mock function was called
    expect(sendEmail).toHaveBeenCalledTimes(1);
    expect(sendEmail).toHaveBeenCalledWith('test@test.com');
});

```

---

## 3. Integration Testing with Supertest

For API development, you need to test your Express routes. **Supertest** allows you to simulate HTTP requests without actually binding to a network port (making it very fast).

```javascript
const request = require('supertest');
const app = require('../app'); // Your Express app

describe('POST /api/users', () => {
    it('should create a new user and return 201', async () => {
        const response = await request(app)
            .post('/api/users')
            .send({
                name: 'John Doe',
                email: 'john@example.com'
            });

        expect(response.status).toBe(201);
        expect(response.body.user).toHaveProperty('id');
        expect(response.body.user.name).toBe('John Doe');
    });

    it('should return 400 if email is missing', async () => {
        const response = await request(app)
            .post('/api/users')
            .send({ name: 'John' });

        expect(response.status).toBe(400);
    });
});

```

---

## 4. Managing Test Databases

Never run integration tests against your production (or even your local development) database.

**Best Practices:**

1. **Test Environment:** Set `process.env.NODE_ENV = 'test'`.
2. **Separate DB:** Use a dedicated `myapp_test` database.
3. **Global Teardown:** Use Jest's `beforeEach` and `afterAll` hooks to clean the data.

```javascript
beforeEach(async () => {
    // Clear the database before every test to ensure a clean slate
    await User.deleteMany({});
});

afterAll(async () => {
    // Close the DB connection so Jest can exit
    await mongoose.connection.close();
});

```

---

## 5. TDD (Test Driven Development)

TDD is a workflow where you write the test **before** you write the code.

1. **Red:** Write a test for a feature that doesn't exist yet. Run it and watch it fail.
2. **Green:** Write the minimum amount of code to make the test pass.
3. **Refactor:** Clean up the code while ensuring the test stays green.

---

## 6. Code Coverage

How do you know if you've tested enough? Jest can generate a **Coverage Report**.
`jest --coverage`

It measures:

* **Statement Coverage:** Has every line been run?
* **Branch Coverage:** Have both `if` and `else` blocks been executed?
* **Function Coverage:** Has every function been called?

**Note:** 100% coverage doesn't mean your code is perfect; it just means every line was executed. Logic errors can still exist!
