---
title: "JavaScript Coding Interview Handbook"
description: "Ace your technical interview with this comprehensive guide. Covers Big O analysis, essential algorithms (Sorting, BFS/DFS), data structures, and common problem-solving patterns like Sliding Window."
---

## Part 1: The Foundations of Analysis (Big O)

In an interview, "working code" is not enough. It must be **scalable**. You need to articulate *why* your solution is efficient.

### Time Complexity

How does the runtime grow as the input () grows?

1. **O(1) - Constant Time:** The best case. Operations do not depend on input size.
* *Examples:* accessing array index `arr[5]`, pushing to the end of a stack, math operations `1 + 1`.


2. **O(log n) - Logarithmic Time:** Very efficient. The number of operations is cut in half at each step.
* *Examples:* Binary Search, Finding keys in a balanced Binary Search Tree (BST).


3. **O(n) - Linear Time:** The runtime grows 1:1 with input.
* *Examples:* Looping through an array, searching a Linked List.


4. **O(n log n) - Linearithmic Time:** Slightly worse than linear, but the best we can do for sorting.
* *Examples:* Merge Sort, Quick Sort, Heap Sort.


5. **O(n²) - Quadratic Time:** Performance degrades rapidly. Avoid this for large inputs.
* *Examples:* Nested loops (Bubble Sort, comparing every element with every other element).



### Space Complexity

How much **memory** does the algorithm use?

* **O(1):** Using a few variables (counters, pointers). *Preferred.*
* **O(n):** Creating a new array or object that grows with the input.
* **Recursion:** Remember that recursion adds to the **Call Stack**, often making space complexity O(n).

---

## Part 2: Problem-Solving Patterns

Recognizing these patterns instantly solves 60-70% of "Easy" and "Medium" LeetCode questions.

### 1. Frequency Counter Pattern

**Use Case:** Comparing two arrays/strings to see if they have the same frequency of elements (Anagrams, checking for squared values).
**Naive Approach:** Nested loops ().
**Optimized Approach:** Two Hash Maps ().

**Problem:** *Write a function `same(arr1, arr2)` that returns true if every value in `arr1` has its corresponding value squared in `arr2`. Frequency must be the same.*

```javascript
function same(arr1, arr2) {
    if (arr1.length !== arr2.length) return false;

    let frequencyCounter1 = {};
    let frequencyCounter2 = {};

    // O(n) - Build maps
    for (let val of arr1) {
        frequencyCounter1[val] = (frequencyCounter1[val] || 0) + 1;
    }
    for (let val of arr2) {
        frequencyCounter2[val] = (frequencyCounter2[val] || 0) + 1;
    }

    // O(n) - Compare maps
    for (let key in frequencyCounter1) {
        // Is the squared key in the second map?
        if (!(key ** 2 in frequencyCounter2)) {
            return false;
        }
        // Is the count the same?
        if (frequencyCounter2[key ** 2] !== frequencyCounter1[key]) {
            return false;
        }
    }
    return true;
}
// Time: O(n) | Space: O(n)

```

### 2. Multiple Pointers Pattern

**Use Case:** Working on **Sorted** arrays/lists. You create pointers (values that correspond to an index) and move them towards the beginning, end, or middle based on a condition.
**Why:** Converts nested loops () into a single loop ().

**Problem:** *`countUniqueValues`. Given a sorted array, count the unique values.*

```javascript
function countUniqueValues(arr) {
    if (arr.length === 0) return 0;
    
    let i = 0; // First pointer (tracker)
    
    // j is the Second pointer (scout)
    for (let j = 1; j < arr.length; j++) {
        if (arr[i] !== arr[j]) {
            i++; 
            arr[i] = arr[j]; // Move unique value next to the last unique value found
        }
    }
    
    return i + 1;
}

// [1, 1, 2, 3, 3, 4]
//        ^  ^
//        i  j
// Output: 4

```

### 3. Sliding Window Pattern

**Use Case:** Keeping track of a subset of data in an array/string (e.g., "Longest substring with distinct characters", "Max sum of 3 consecutive numbers").

**Problem:** *`minSubArrayLen`. Find the minimal length of a contiguous subarray of which the sum is greater than or equal to the integer passed.*

```javascript
function minSubArrayLen(nums, sum) {
    let total = 0;
    let start = 0;
    let end = 0;
    let minLen = Infinity;

    while (start < nums.length) {
        // If current window doesn't add up to sum, move 'end' to right
        if (total < sum && end < nums.length) {
            total += nums[end];
            end++;
        }
        // If current window can shrink, move 'start' to right
        else if (total >= sum) {
            minLen = Math.min(minLen, end - start);
            total -= nums[start];
            start++;
        }
        // Break if we hit the end
        else {
            break;
        }
    }
    return minLen === Infinity ? 0 : minLen;
}

```

---

## Part 3: Advanced Sorting Algorithms

You know `.sort()`, but interviewers ask you to *implement* sorts to test your grasp of recursion and logic.

### 1. Merge Sort

**Logic:** Divide and Conquer. Split array into halves until you have empty or single-element arrays. Then merge them back together in sorted order.
**Complexity:**  time,  space.

```javascript
// Helper: Merges two already sorted arrays
function merge(arr1, arr2) {
    let results = [];
    let i = 0;
    let j = 0;
    
    while (i < arr1.length && j < arr2.length) {
        if (arr2[j] > arr1[i]) {
            results.push(arr1[i]);
            i++;
        } else {
            results.push(arr2[j]);
            j++;
        }
    }
    // Push remaining elements
    while (i < arr1.length) results.push(arr1[i++]);
    while (j < arr2.length) results.push(arr2[j++]);
    
    return results;
}

// Main Algorithm
function mergeSort(arr) {
    if (arr.length <= 1) return arr;
    
    let mid = Math.floor(arr.length / 2);
    let left = mergeSort(arr.slice(0, mid));
    let right = mergeSort(arr.slice(mid));
    
    return merge(left, right);
}

```

### 2. Quick Sort

**Logic:** Pick a "pivot" element. Move all numbers smaller than the pivot to the left, and all larger to the right. Recursively repeat.
**Complexity:**  average. Worst case  (if data is already sorted and pivot is chosen poorly).

```javascript
function pivot(arr, start = 0, end = arr.length + 1) {
    let pivot = arr[start];
    let swapIdx = start;

    for (let i = start + 1; i < arr.length; i++) {
        if (pivot > arr[i]) {
            swapIdx++;
            // Swap current element with the element at swapIdx
            [arr[swapIdx], arr[i]] = [arr[i], arr[swapIdx]];
        }
    }
    // Swap pivot with the swapIdx to put pivot in correct place
    [arr[start], arr[swapIdx]] = [arr[swapIdx], arr[start]];
    return swapIdx;
}

function quickSort(arr, left = 0, right = arr.length - 1) {
    if (left < right) {
        let pivotIndex = pivot(arr, left, right);
        // Left
        quickSort(arr, left, pivotIndex - 1);
        // Right
        quickSort(arr, pivotIndex + 1, right);
    }
    return arr;
}

```

---

## Part 4: Essential Data Structures

### 1. Singly Linked Lists

Often used to test if you understand references and pointers without the built-in ease of Arrays.

**Key Operations:**

* `push(val)`: 
* `pop()`:  (We have to traverse to the end to find the new tail)
* `unshift(val)`: 
* `shift()`: 

```javascript
// Reversing a Linked List in Place (Famous Interview Q)
// Logic: Swap head and tail, then reverse 'next' pointers node by node.
reverse() {
    let node = this.head;
    this.head = this.tail;
    this.tail = node;
    
    let next;
    let prev = null;
    
    for (let i = 0; i < this.length; i++) {
        next = node.next; // Save the connection to the rest of the list
        node.next = prev; // Reverse the pointer
        prev = node;      // Advance prev
        node = next;      // Advance node
    }
    return this;
}

```

### 2. Trees (Binary Search Trees)

BSTs are trees where every node to the left is smaller, and every node to the right is larger.
**Complexity:** Search/Insertion is , assuming the tree is balanced.

**Traversal (DFS vs BFS):**

* **BFS (Breadth First):** Uses a **Queue**. Visits every sibling on a level before going down. Good for finding the shortest path in unweighted graphs.
* **DFS (Depth First):** Uses a **Stack** (or recursion). Go deep before going wide.

```javascript
class Node {
    constructor(value) {
        this.value = value;
        this.left = null;
        this.right = null;
    }
}

class BST {
    constructor() { this.root = null; }

    insert(value) {
        const newNode = new Node(value);
        if (!this.root) {
            this.root = newNode;
            return this;
        }
        let current = this.root;
        while (true) {
            if (value === current.value) return undefined;
            if (value < current.value) {
                if (!current.left) {
                    current.left = newNode;
                    return this;
                }
                current = current.left;
            } else {
                if (!current.right) {
                    current.right = newNode;
                    return this;
                }
                current = current.right;
            }
        }
    }
}

```

### 3. Graphs

The most intimidating topic, but essential for social networking questions (friends of friends) or routing (GPS).

**Representation:** Use an **Adjacency List** (Hash Map where keys are nodes, values are arrays of connections). It saves space compared to a Matrix.

```javascript
class Graph {
    constructor() {
        this.adjacencyList = {};
    }

    addVertex(vertex) {
        if (!this.adjacencyList[vertex]) this.adjacencyList[vertex] = [];
    }

    addEdge(v1, v2) {
        this.adjacencyList[v1].push(v2);
        this.adjacencyList[v2].push(v1); // Undirected graph
    }

    // Depth First Traversal (Recursive)
    depthFirstRecursive(start) {
        const result = [];
        const visited = {};
        const adjacencyList = this.adjacencyList; // Context helper

        (function dfs(vertex) {
            if (!vertex) return null;
            visited[vertex] = true;
            result.push(vertex);
            
            adjacencyList[vertex].forEach(neighbor => {
                if (!visited[neighbor]) {
                    return dfs(neighbor);
                }
            });
        })(start);

        return result;
    }
}

```

---

## Part 5: "Implement This" (Polyfills and Utilities)

Senior interviews often ask you to implement standard library functions to prove you understand how JS works under the hood.

### 1. `Promise.all` Polyfill

**Challenge:** Write a function that takes an array of promises and returns a single promise that resolves when all resolve, or rejects if one rejects.

```javascript
function myPromiseAll(promises) {
    return new Promise((resolve, reject) => {
        let results = [];
        let completed = 0;
        
        if (promises.length === 0) resolve(results);

        promises.forEach((promise, index) => {
            // Use Promise.resolve in case the array contains raw values (non-promises)
            Promise.resolve(promise)
                .then(value => {
                    results[index] = value; // Store in correct order, not arrival order!
                    completed++;
                    if (completed === promises.length) {
                        resolve(results);
                    }
                })
                .catch(err => reject(err)); // Fail fast behavior
        });
    });
}

```

### 2. Deep Clone

**Challenge:** Clone an object deeply (nested objects), avoiding reference copies.

```javascript
function deepClone(obj) {
    // 1. Handle primitives and null
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    // 2. Handle Arrays
    if (Array.isArray(obj)) {
        return obj.map(item => deepClone(item));
    }

    // 3. Handle Objects
    const clonedObj = {};
    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            clonedObj[key] = deepClone(obj[key]);
        }
    }
    return clonedObj;
}

```

---

## Part 6: Behavioral and System Design

### 1. Thinking Aloud

Never code in silence.

* **Phase 1: Clarify.** "Is the input sorted? Can the array contain negative numbers? What should happen if input is null?"
* **Phase 2: Naive Solution.** "I could solve this with nested loops, giving O(N^2). Let me get that working first."
* **Phase 3: Refactor.** "We can optimize this to O(N) using a Hash Map."

### 2. Common JS System Design

**Question:** *Design an Infinite Scroll.*

* **Event Listener:** Scroll event on `window`.
* **Optimization:** **Throttle** the event listener (don't fire every pixel).
* **Calculation:** `window.innerHeight + window.scrollY >= document.body.offsetHeight - 100px`.
* **Fetching:** Async fetch of next page.
* **DOM:** Append elements to container.

---

## Part 7: Cheat Sheet - The "Must Memorize"

1. **Map vs Object:** Use Map when keys are not strings or you need ordered iteration.
2. **`array.sort()`:** By default sorts alphabetically (`1, 10, 2`). Always pass a comparator: `.sort((a,b) => a - b)`.
3. **Hoisting:** Function *declarations* are hoisted fully. `var` is hoisted as undefined. `let`/`const` are hoisted but stay in the "Temporal Dead Zone".
4. **Closures:** A function "remembering" its outer variables even after the outer function has returned. Used for data privacy (e.g., standardizing IDs).
5. **Event Loop:** Microtasks (Promises) run before Macrotasks (setTimeout).

**Final Tip:** If you are stuck, check if using a **Hash Map** can turn your  solution into . It is the most common optimization.
