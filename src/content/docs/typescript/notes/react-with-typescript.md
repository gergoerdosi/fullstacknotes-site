---
title: "React with TypeScript"
description: "The final step. Learn how to type React Props, handle State and Refs, manage Form Events, and create Generic Components."
tags: ["typescript", "react", "hooks", "frontend"]
sidebar:
  order: 4
---

## 1. Typing Components and Props

There are two main ways to type Functional Components.

### A. The Modern Standard (Recommended)

You define the props as an interface and destructure them in the function arguments. This is cleaner and behaves exactly like a normal function.

```tsx
interface ButtonProps {
    label: string;
    onClick: () => void;
    disabled?: boolean; // Optional prop
}

// Return type ': JSX.Element' is optional (TS infers it)
export const MyButton = ({ label, onClick, disabled = false }: ButtonProps) => {
    return (
        <button onClick={onClick} disabled={disabled}>
            {label}
        </button>
    );
};

```

### B. The `React.FC` Type (Legacy/Alternative)

Stands for "Functional Component". It used to automatically include `children`, but in React 18+ it does not. It is still common in older codebases.

```tsx
// Explicitly typing the function itself
export const MyButton: React.FC<ButtonProps> = ({ label, onClick }) => {
    return <button onClick={onClick}>{label}</button>;
};

```

### Typing `children`

If your component wraps other elements, you must explicitly type `children`.

```tsx
interface CardProps {
    title: string;
    children: React.ReactNode; // The standard type for anything renderable
}

export const Card = ({ title, children }: CardProps) => (
    <div className="card">
        <h1>{title}</h1>
        {children}
    </div>
);

```

---

## 2. Typing Hooks

### A. `useState`

TS is very good at inferring simple states.

```tsx
// TS infers 'count' is number
const [count, setCount] = useState(0); 

// TS infers 'name' is string
const [name, setName] = useState("Alice");

```

**The "Initial Null" Problem:**
When data loads later (like fetching a user), the initial state is `null`. You must use a Generic.

```tsx
interface User {
    id: number;
    name: string;
}

// State can be User OR null
const [user, setUser] = useState<User | null>(null);

// later...
// user.name; // Error: Object is possibly 'null'.
if (user) {
    console.log(user.name); // OK
}

```

### B. `useRef`

`useRef` has two modes: **DOM references** and **Mutable values**.

```tsx
// 1. DOM Reference (starts null)
// We provide the specific element type (e.g., HTMLInputElement, HTMLDivElement)
const inputRef = useRef<HTMLInputElement>(null);

const focusInput = () => {
    // Must check if current exists (it's null on first render)
    inputRef.current?.focus();
};

// 2. Mutable Value (like an instance variable)
const timerId = useRef<number>(0);

```

### C. `useReducer`

This uses the **Discriminated Union** pattern we learned in Part 3.

```tsx
// 1. Define State
interface State { count: number; }

// 2. Define Actions (Discriminated Union)
type Action = 
    | { type: 'increment' } 
    | { type: 'decrement' } 
    | { type: 'set'; payload: number };

// 3. The Reducer
function reducer(state: State, action: Action): State {
    switch (action.type) {
        case 'increment': return { count: state.count + 1 };
        case 'decrement': return { count: state.count - 1 };
        case 'set': return { count: action.payload };
        default: return state;
    }
}

```

---

## 3. Handling Events

This is often the most confusing part for beginners: "What type is `e`?"

### Form Events

You often need specific types like `ChangeEvent`.

```tsx
import React, { useState } from 'react';

export const Form = () => {
    const [text, setText] = useState("");

    // 1. Change Event (Typing in inputs)
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setText(e.target.value);
    };

    // 2. Submit Event (Form submission)
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log(text);
    };

    return (
        <form onSubmit={handleSubmit}>
            <input type="text" onChange={handleChange} />
            <button type="submit">Submit</button>
        </form>
    );
};

```

*Pro Tip: If you forget the event name, hover over the `onChange` prop in your IDE. It will show you the expected type!*

---

## 4. Context API

Creating a Context requires handling the default value, which is usually missing until a Provider is rendered.

```tsx
interface ThemeContextType {
    theme: 'light' | 'dark';
    toggleTheme: () => void;
}

// Problem: What is the default value? We don't have the toggle function yet.
// Solution: Allow 'undefined' initially.
const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
    const context = React.useContext(ThemeContext);
    
    // Safety check: Ensure hook is used inside a Provider
    if (!context) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    
    return context; // Now it's guaranteed to be ThemeContextType
};

```

---

## 5. Generic Components

Just like functions, components can be generic. Useful for Lists, Tables, or Dropdowns.

```tsx
interface ListProps<T> {
    items: T[];
    // A function to tell the component how to get a unique ID from an item
    getKey: (item: T) => string | number;
    // A function to render the row
    renderItem: (item: T) => React.ReactNode;
}

// <T,> needs the comma so TS knows it's a generic, not a JSX tag
export const List = <T,>({ items, getKey, renderItem }: ListProps<T>) => {
    return (
        <ul>
            {items.map(item => (
                <li key={getKey(item)}>
                    {renderItem(item)}
                </li>
            ))}
        </ul>
    );
};

// Usage
<List 
    items={[{ id: 1, name: "Alice" }, { id: 2, name: "Bob" }]} 
    getKey={(user) => user.id}
    renderItem={(user) => <span>{user.name}</span>}
/>

```

---

## Review Challenge

Create a `UserSearch` component.

1. **State:** Use `useState` to hold a user object `User | null`.
2. **Refs:** Use `useRef` to hold a reference to an `<input>` element.
3. **Events:** Add a button with an `onClick` handler.
4. **Logic:** When clicked, the handler should:
* Find the input value (`ref.current.value`).
* Set the user state to `{ name: inputValue }`.
* Clear the input.

<details>
<summary>Click to see the solution</summary>

This solution brings together `useState` (with Union types), `useRef` (typed as `HTMLInputElement`), and Event Handling in a functional React component.

```tsx
import React, { useState, useRef } from 'react';

// 1. Define the User interface
interface User {
    name: string;
    age?: number;
}

export const UserSearch: React.FC = () => {
    // 2. State: User OR null (starts as null)
    const [user, setUser] = useState<User | null>(null);

    // 3. Ref: Holds an HTML Input Element (starts as null)
    const inputRef = useRef<HTMLInputElement>(null);

    // 4. Event Handler
    const handleFindUser = () => {
        // Safety check: Ensure the DOM element exists
        if (!inputRef.current) return;

        const foundName = inputRef.current.value;

        // Update state
        setUser({ name: foundName, age: 25 }); // hardcoded age for demo

        // Clear input
        inputRef.current.value = "";
        
        // Optional: Focus back on input
        inputRef.current.focus();
    };

    return (
        <div>
            <h3>User Search</h3>
            
            <input 
                ref={inputRef} 
                type="text" 
                placeholder="Enter user name..." 
            />
            
            <button onClick={handleFindUser}>Find User</button>

            <div style={{ marginTop: '20px' }}>
                {/* Conditional Rendering based on state */}
                {user ? (
                    <p>Found User: <strong>{user.name}</strong></p>
                ) : (
                    <p>No user selected.</p>
                )}
            </div>
        </div>
    );
};

```

</details>
