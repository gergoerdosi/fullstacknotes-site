---
title: "The Object-Oriented Model"
description: "Transition from scripting to architecture. Understand the prototype chain, master ES6 Class syntax (inheritance, super, getters), and learn how to organize code using ES Modules."
tags: ["javascript", "oop", "classes", "modules"]
sidebar:
  order: 5
---

## 1. Prototypes: The Hidden Mechanism

JavaScript is unique. Unlike Java or C++, which are class-based, JavaScript is **prototype-based**. Even though we now have the `class` keyword (introduced in ES6), it is just "syntactic sugar" over the existing prototype system.

### The Prototype Chain

Every JavaScript object has a hidden property (often exposed as `__proto__`) that points to another object: its **prototype**.

When you try to access a property (e.g., `user.name`):

1. JS looks for `name` on the `user` object itself.
2. If not found, it looks at `user.__proto__`.
3. If not found, it looks at `user.__proto__.__proto__`.
4. This continues until it hits `null` (the end of the chain).

### Prototypal Inheritance

This is how objects share methods without copying them.

```javascript
const animal = {
    eats: true,
    walk() {
        console.log("Animal walk");
    }
};

const rabbit = {
    jumps: true
};

// Sets rabbit's prototype to be animal
// (Modern way: Object.setPrototypeOf(rabbit, animal))
rabbit.__proto__ = animal; 

// 1. JS looks for 'eats' in rabbit -> Not found
// 2. JS looks in rabbit's prototype (animal) -> Found!
console.log(rabbit.eats); // true
rabbit.walk(); // "Animal walk"

```

---

## 2. Classes (ES6)

Classes provide a cleaner, more familiar syntax for creating objects and handling inheritance.

### Basic Syntax and Constructor

The `constructor` method runs immediately when you create a new instance with `new`.

```javascript
class User {
    constructor(name) {
        this.name = name;
    }

    sayHi() {
        console.log(`Hello, I am ${this.name}`);
    }
}

const user1 = new User("Alice");
user1.sayHi(); // "Hello, I am Alice"

```

### Inheritance (`extends` and `super`)

* **`extends`**: Creates a child class that inherits from a parent.
* **`super()`**: Calls the parent's constructor. **Must** be called before using `this` in a child constructor.

```javascript
class Admin extends User {
    constructor(name, permissionLevel) {
        super(name); // Call User(name)
        this.permissionLevel = permissionLevel;
    }

    deletePost() {
        console.log("Post deleted");
    }
}

const admin = new Admin("Bob", "High");
admin.sayHi(); // Inherited from User
admin.deletePost(); // Defined in Admin

```

### Getters and Setters

These allow you to execute code when reading or writing a property, often used for validation or computed values.

```javascript
class Rect {
    constructor(width, height) {
        this.width = width;
        this.height = height;
    }

    // Getter: accessed like a property, not a function
    get area() {
        return this.width * this.height;
    }

    // Setter: allows validation
    set width(value) {
        if (value <= 0) throw new Error("Width must be positive");
        this._width = value;
    }
}

const r = new Rect(10, 5);
console.log(r.area); // 50 (Note: no parentheses!)

```

---

## 3. The `new` Keyword

When you write `const u = new User("Alice")`, four specific things happen "under the hood":

1. A **new empty object** is created `{}`.
2. The object's **prototype** is set to the class's prototype (`User.prototype`).
3. The **constructor** is executed, with `this` bound to the new object.
4. The new object is **returned** automatically.

If you forget `new` (in older functions), `this` will point to the global object (window) or be undefined in strict mode, breaking your code.

---

## 4. Modules: Organizing Code

As applications grow, you split code into multiple files.

### ES Modules (`import`/`export`)

This is the modern standard used in React, Vue, and modern Node.js.

**File: `math.js**`

```javascript
// Named Export
export const add = (a, b) => a + b;

// Default Export (only one per file)
export default function subtract(a, b) {
    return a - b;
}

```

**File: `main.js**`

```javascript
import subtract, { add } from './math.js'; 
// Note: default export (subtract) has no brackets. 
// Named exports (add) need brackets.

console.log(add(2, 2));

```

### CommonJS (`require`)

The traditional Node.js standard. You will still see this often in backend code and configuration files.

**File: `math.js**`

```javascript
const add = (a, b) => a + b;
module.exports = { add };

```

**File: `main.js**`

```javascript
const { add } = require('./math.js');

```

---

## Review Challenge

You have a class `Vehicle`. Create a subclass `Car` that:

1. Extends `Vehicle`.
2. Has an additional property `fuel` in its constructor.
3. Calls the parent constructor correctly.

```javascript
class Vehicle {
    constructor(brand) {
        this.brand = brand;
    }
}

// Your Code Here:
// class Car ...

```

<details>
<summary>Click to see the solution</summary>

The key here is using `extends` to inherit the parent class's features and calling `super()` inside the constructor to ensure the parent initializes its part of the object (the `brand`) before you add your own properties (`fuel`).

```javascript
class Vehicle {
    constructor(brand) {
        this.brand = brand;
    }
}

class Car extends Vehicle {
    constructor(brand, fuel) {
        // 1. Call the parent constructor first with the required argument
        super(brand); 
        
        // 2. Assign the new property specific to Car
        this.fuel = fuel;
    }
    
    // Optional: Adding a method to prove it works
    getDetails() {
        return `${this.brand} runs on ${this.fuel}`;
    }
}

const myCar = new Car("Toyota", "Hybrid");
console.log(myCar.brand); // "Toyota" (Inherited)
console.log(myCar.fuel);  // "Hybrid" (Specific to Car)

```

</details>