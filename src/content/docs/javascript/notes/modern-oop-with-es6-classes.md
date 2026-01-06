---
title: "Modern OOP with ES6 Classes"
description: "Learn modern Object-Oriented Programming in JS using Classes, inheritance with `extends`, the `super` keyword, private fields, and static methods."
tags: ["es6-classes", "object-oriented-programming", "inheritance", "class-syntax"]
sidebar:
  order: 9
---

## 1. The Basic Class Syntax

Instead of manually attaching functions to `.prototype`, we write them inside a `class` block.

**The Transformation:**

* **The Old Way:**
```javascript
function User(name) {
  this.name = name;
}
User.prototype.sayHi = function() { console.log("Hi"); }

```


* **The Modern Way (Class):**
```javascript
class User {
  // The Constructor: Runs immediately when you call 'new User()'
  constructor(name) {
    this.name = name; // Instance Property (Unique to this object)
  }

  // Method: Automatically added to User.prototype
  sayHi() {
    console.log(`Hi, I am ${this.name}`);
  }
}

const user1 = new User("Alice");
user1.sayHi(); // "Hi, I am Alice"

```



> **Key Difference:** Code inside a `class` is always in **Strict Mode** automatically. Also, you cannot call a class without the `new` keyword (it throws an error), which prevents common bugs.

---

## 2. Inheritance (`extends`)

In the old days, linking one prototype to another was messy. Now, we just use `extends`.

```javascript
class Animal {
  constructor(name) {
    this.name = name;
  }
  
  run() {
    console.log(`${this.name} runs.`);
  }
}

// Dog inherits from Animal
class Dog extends Animal {
  bark() {
    console.log(`${this.name} barks!`);
  }
}

const dog = new Dog("Rex");
dog.run();  // Inherited from Animal
dog.bark(); // Defined in Dog

```

---

## 3. The `super` Keyword

When you inherit from a parent, sometimes you need to customize the constructor.

**Rule:** If a child class has a `constructor`, you **MUST** call `super()` before you can use `this`.

* `super()` calls the Parent's constructor.

```javascript
class Bird extends Animal {
  constructor(name, canFly) {
    // this.canFly = canFly; // ERROR! Must call super first.
    
    super(name); // 1. Call parent (Animal) to set up 'this.name'
    
    this.canFly = canFly; // 2. Now we can use 'this'
  }
  
  // Method Overriding (Shadowing)
  run() {
    super.run(); // Call the parent's run method first
    console.log("...and then it creates a nest.");
  }
}

```

---

## 4. Static Methods

A **Static Method** belongs to the Class itself, not to the instances (objects). It is used for utility functions.

* **Instance Method:** `user1.login()` (Depends on specific user data).
* **Static Method:** `User.compare(user1, user2)` (Doesn't belong to one specific user).

```javascript
class MathHelper {
  static add(a, b) {
    return a + b;
  }
}

console.log(MathHelper.add(5, 10)); // 15
// const m = new MathHelper();
// m.add(5, 10); // TypeError: m.add is not a function

```

---

## 5. Private Fields (`#`)

For 25 years, JavaScript had no privacy. Developers used underscores (`_name`) to signal "please don't touch this," but it wasn't enforced.
Recently (ES2022), we got **Private Fields** using the `#` symbol.

```javascript
class Wallet {
  #balance = 0; // Private field

  deposit(amount) {
    this.#balance += amount; // Internal access allowed
  }

  getBalance() {
    return this.#balance;
  }
}

const myWallet = new Wallet();
myWallet.deposit(100);
console.log(myWallet.getBalance()); // 100

// console.log(myWallet.#balance); // SyntaxError: Private field '#balance' must be declared in an enclosing class

```

---

## 6. Getters and Setters

These look like functions but act like properties. They allow you to run code when someone reads or writes a variable.

```javascript
class User {
  constructor(first, last) {
    this.first = first;
    this.last = last;
  }

  // Getter
  get fullName() {
    return `${this.first} ${this.last}`;
  }

  // Setter
  set fullName(value) {
    [this.first, this.last] = value.split(" ");
  }
}

const user = new User("John", "Doe");
console.log(user.fullName); // "John Doe" (Accessed as prop, not function!)

user.fullName = "Jane Smith"; // Triggers the setter
console.log(user.first); // "Jane"

```

---

## 7. Interactive Exercises

**Exercise 1: The Class Conversion**
*Convert this Constructor Function into an ES6 Class.*

```javascript
function Item(name) {
  this.name = name;
}
Item.prototype.info = function() {
  return "Item: " + this.name;
};

```

**Exercise 2: Inheritance Logic**
*We have a class `Shape` and a child `Square`. The `Square` needs a constructor that takes `sideLength`. It should pass "Square" as the name to the parent `Shape`.*

```javascript
class Shape {
  constructor(name) { this.name = name; }
}

class Square extends Shape {
  // Write the constructor here
}
const sq = new Square(5);
console.log(sq.name); // Should be "Square"

```

**Exercise 3: The Private Bank**
*Create a class `Account`. It has a private field `#pin`. Add a method `checkPin(input)` that returns `true` if the input matches the private pin.*

---

### **Solutions to Exercises**

**Solution 1:**

```javascript
class Item {
  constructor(name) {
    this.name = name;
  }
  
  info() {
    return `Item: ${this.name}`;
  }
}

```

**Solution 2:**

```javascript
class Square extends Shape {
  constructor(sideLength) {
    super("Square"); // Pass fixed string to parent
    this.sideLength = sideLength;
  }
}

```

**Solution 3:**

```javascript
class Account {
  #pin = "1234"; // Hardcoded for example
  
  checkPin(input) {
    return input === this.#pin;
  }
}

```
