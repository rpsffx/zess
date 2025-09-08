<div align="center">
  <picture>
    <img src="https://pic1.imgdb.cn/item/68b4736558cb8da5c867a867.png" alt="Zess Logo" width="300" style="height: auto;">
  </picture>
</div>

# @zess/core

[![NPM Version](https://img.shields.io/npm/v/@zess/core.svg?style=flat-square&color=lightblue)](https://www.npmjs.com/package/@zess/core) [![License](https://img.shields.io/npm/l/@zess/core.svg?style=flat-square&color=lightblue)](https://github.com/rpsffx/zess/blob/main/LICENSE)

Zess core module ⚙️ Provides powerful runtime functionality for high - performance web applications.

## Features

- **Efficient Reactivity**: Optimized signals implementation with automatic dependency tracking
- **Component Rendering**: Lightweight component system with JSX support
- **Performance Optimization**: Memoization, batching updates, and fine-grained reactivity
- **Lifecycle Management**: Complete lifecycle hooks for component initialization and cleanup
- **Reactive Utilities**: Helpers for working with arrays, objects, and reactive values
- **Store API**: Reactive state management for complex data structures with nested object support
- **Error Boundaries**: Graceful error handling in component trees
- **Type Safety**: Complete TypeScript type definitions

## Installation

```bash
# Using npm
npm install @zess/core

# Using yarn
yarn add @zess/core

# Using pnpm
pnpm add @zess/core
```

## Basic Usage

### Creating a Reactive Signal

```jsx
import { useSignal } from '@zess/core'

function Counter() {
  const [count, setCount] = useSignal(0)

  return (
    <div>
      <p>Count: {count()}</p>
      <button onClick={() => setCount((prev) => prev + 1)}>Increment</button>
    </div>
  )
}
```

### Using Effects

```jsx
import { useSignal, useEffect } from '@zess/core'

function EffectExample() {
  const [count, setCount] = useSignal(0)

  useEffect(() => {
    console.log(`Count has changed: ${count()}`)
  })

  return (
    <div>
      <p>Count: {count()}</p>
      <button onClick={() => setCount((prev) => prev + 1)}>Increment</button>
    </div>
  )
}
```

### Creating Computed Values

```jsx
import { useSignal, useMemo } from '@zess/core'

function FormattedCounter() {
  const [count, setCount] = useSignal(0)
  const formattedCount = useMemo(() => `Current count: ${count()}`)

  return (
    <div>
      <p>{formattedCount()}</p>
      <button onClick={() => setCount((prev) => prev + 1)}>Increment</button>
    </div>
  )
}
```

## Advanced Usage

### Using Conditional Rendering

```jsx
import { useSignal, Show } from '@zess/core'

function ConditionalContent() {
  const [isLoggedIn, setIsLoggedIn] = useSignal(false)

  return (
    <div>
      <button onClick={() => setIsLoggedIn((prev) => !prev)}>
        Toggle Login
      </button>
      <Show when={isLoggedIn()}>
        <p>Welcome, user!</p>
      </Show>
      <Show when={!isLoggedIn()}>
        <p>Please log in</p>
      </Show>
    </div>
  )
}
```

### Rendering Lists

```jsx
import { useSignal, For } from '@zess/core'

function TodoList() {
  const [todos, setTodos] = useSignal([
    { id: 1, text: 'Learn Zess' },
    { id: 2, text: 'Build amazing apps' },
  ])

  return (
    <div>
      <h2>Todos</h2>
      <For each={todos()}>
        {(todo, index) => (
          <div key={todo.id}>
            {index() + 1}. {todo.text}
          </div>
        )}
      </For>
    </div>
  )
}
```

### Managing Complex State with Store

```jsx
import { useStore } from '@zess/core'

function UserProfile() {
  const [user, setUser] = useStore({
    name: 'John Doe',
    email: 'john@example.com',
    address: {
      city: 'New York',
      country: 'USA',
    },
  })

  return (
    <div>
      <h2>{user.name}</h2>
      <p>Email: {user.email}</p>
      <p>
        Location: {user.address.city}, {user.address.country}
      </p>
      <button onClick={() => setUser({ name: 'Jane Doe' })}>Change Name</button>
    </div>
  )
}
```

## API Reference

### Basic Reactivity

#### `useSignal<T>(value?: T, equals?: Equals<T>): [Getter<T>, Setter<T>]`

Creates a reactive signal that holds a value and notifies dependents when the value changes.

**Parameters:**

- `value`: The initial value of the signal
- `equals`: Optional custom equality comparator function to determine when the value has changed. Defaults to strict equality (`===`)

**Returns:** An array containing a getter function and a setter function

- `Getter<T>`: A function that returns the current value of the signal
- `Setter<T>`: A function that accepts either a new value or a function that takes the previous value and returns a new value

**Example:**

```jsx
const [count, setCount] = useSignal(0)
console.log(count()) // 0
setCount(1) // Updates the signal value with a direct value
setCount((prev) => prev + 1) // Updates the signal value based on the previous value

// With custom equality comparison
const [user, setUser] = useSignal(
  { id: 1, name: 'Alice' },
  (a, b) => a.id === b.id, // Only consider ID for equality
)
```

#### `useEffect<T>(fn: Callback<T>, value?: T): void`

Runs a function when dependencies change. Effects are batched and run after rendering, making them suitable for side effects that don't need to block the render cycle.

**Parameters:**

- `fn`: A function to run when dependencies change. It receives the previous value returned by the effect and returns a new value to be used in the next run
- `value`: Optional initial value to pass to the first effect run

**Example:**

```jsx
const [count, setCount] = useSignal(0)
const [prevCount, setPrevCount] = useSignal(null)

useEffect((prev) => {
  // The effect will run whenever count() is accessed and changes
  setPrevCount(prev)
  document.title = `Count: ${count()}`
  return count() // This value will be passed as 'prev' to the next effect run
})
```

#### `useMemo<T>(fn: Callback<T>, value?: T, equals?: Equals<T>): Getter<T>`

Memoizes a value based on dependencies, only recalculating when dependencies change. Useful for expensive calculations that depend on reactive values.

**Parameters:**

- `fn`: A function that computes the memoized value. It receives the previous memoized value as an argument
- `value`: Optional initial value
- `equals`: Optional custom equality comparator function to determine when the computed value has changed. Defaults to strict equality (`===`)

**Returns:** A getter function that returns the memoized value

**Example:**

```jsx
const [name, setName] = useSignal('John')
const greeting = useMemo(() => {
  console.log('Computing greeting')
  return `Hello, ${name()}!`
})

console.log(greeting()) // 'Hello, John!' and logs 'Computing greeting'
setName('Jane') // Triggers recalculation and logs 'Computing greeting' again
```

### Components

#### `For<T extends readonly any[], U extends JSX.Element>(props: ForProps<T, U>): JSX.Element`

Renders a list of items efficiently, with keyed updates based on the identity of the items themselves. This makes it efficient for lists where items are added, removed, or reordered.

**Parameters:**

- `each`: An array of items to render or a falsy value
- `children`: A function that returns the component for each item, receiving the item and a reactive index
- `fallback`: Optional fallback content when the array is empty

**Example:**

```jsx
function ListComponent() {
  const [items, setItems] = useSignal([1, 2, 3])

  return (
    <For each={items()}>
      {(item, index) => (
        <div key={item}>
          Item {index() + 1}: {item}
        </div>
      )}
    </For>
  )
}
```

#### `Index<T extends readonly any[], U extends JSX.Element>(props: IndexProps<T, U>): JSX.Element`

Renders a list with index-based tracking for efficient updates. Unlike `<For>`, it tracks items by their position in the array rather than their identity, which can be more efficient for lists that are frequently updated but not reordered.

**Parameters:**

- `each`: An array of items to render or a falsy value
- `children`: A function that returns the component for each item, receiving a reactive getter for the item and the static index
- `fallback`: Optional fallback content when the array is empty

**Example:**

```jsx
function IndexListComponent() {
  const [items, setItems] = useSignal(['a', 'b', 'c'])

  return (
    <Index each={items()}>
      {(item, index) => (
        <div>
          {index}: {item()}
        </div>
      )}
    </Index>
  )
}
```

#### `Show<T>(props: ShowProps<T>): JSX.Element`

Conditionally renders content based on a boolean value. Provides efficient updates when the condition changes.

**Parameters:**

- `when`: A boolean value determining whether to show the content
- `children`: The content to show when `when` is true. Can be a JSX element or a function that takes the resolved value of `when`
- `fallback`: Optional content to show when `when` is false
- `keyed`: Optional flag to associate the block with the value of `when`, useful when `when` is an object reference

**Example:**

```jsx
function ConditionalComponent() {
  const [isVisible, setIsVisible] = useSignal(true)
  const [user, setUser] = useSignal({ name: 'John' })
  const [theme, setTheme] = useSignal('light')

  return (
    <>
      {/* Basic usage */}
      <Show when={isVisible()} fallback={<p>Not visible</p>}>
        <p>Visible content</p>
      </Show>

      {/* With function children */}
      <Show when={user()}>
        {(userData) => <p>Welcome, {userData().name}!</p>}
      </Show>

      {/* With keyed mode */}
      <Show when={theme()} keyed>
        {(currentTheme) => (
          <div>{currentTheme === 'dark' ? 'Dark Theme' : 'Light Theme'}</div>
        )}
      </Show>
    </>
  )
}
```

#### `Switch(props: SwitchProps): JSX.Element`

Renders the first matching case component. Similar to a switch statement, but for JSX content.

**Parameters:**

- `fallback`: Optional content to show when no cases match
- `children`: A list of `<Match>` components

**Example:**

```jsx
function SwitchComponent() {
  const [value, setValue] = useSignal('b')

  return (
    <Switch fallback={<p>Value is something else</p>}>
      <Match when={value() === 'a'}>
        <p>Value is A</p>
      </Match>
      <Match when={value() === 'b'}>
        <p>Value is B</p>
      </Match>
      <Match when={value() === 'c'}>
        <p>Value is C</p>
      </Match>
    </Switch>
  )
}
```

#### `Match<T>(props: MatchProps<T>): JSX.Element`

A component used with `<Switch>` to define conditional cases.

**Parameters:**

- `when`: A boolean condition determining if this case should be rendered
- `keyed`: Optional flag to enable keyed mode
- `children`: The content to render if the condition is true. Can be a JSX element or a function

**Example:**

```jsx
function MatchExample(props) {
  return (
    <Match when={props.value === 'a'}>
      <p>Value is A</p>
    </Match>
  )
}
```

#### `ErrorBoundary(props: ErrorBoundaryProps): JSX.Element`

Catches errors in child components and renders a fallback UI. Prevents errors from propagating up the component tree.

**Parameters:**

- `fallback`: A function that returns the fallback UI when an error occurs. It receives the error and a reset function
- `children`: The child components to wrap

**Example:**

```jsx
function ErrorProneComponent() {
  const [triggerError, setTriggerError] = useSignal(false)

  if (triggerError()) {
    throw new Error('Something went wrong!')
  }

  return <button onClick={() => setTriggerError(true)}>Trigger Error</button>
}

function ErrorBoundaryExample() {
  return (
    <ErrorBoundary
      fallback={(error, reset) => (
        <div>
          <p>Error: {error.message}</p>
          <button onClick={reset}>Reset</button>
        </div>
      )}
    >
      <ErrorProneComponent />
    </ErrorBoundary>
  )
}
```

### Lifecycle

#### `onMount(fn: () => void): void`

Registers a function to run when the component mounts. Useful for setting up subscriptions or initializing non-reactive state.

**Parameters:**

- `fn`: The function to run on mount

**Example:**

```jsx
onMount(() => {
  console.log('Component mounted')
  // Set up subscriptions or perform initializations
})
```

#### `onCleanup(fn: () => void): void`

Registers a cleanup function to run when the component unmounts or the effect reruns. Used to clean up resources like event listeners, timers, or subscriptions.

**Parameters:**

- `fn`: The cleanup function to run

**Example:**

```jsx
useEffect(() => {
  // Get event name from signal using getter function
  const eventToListen = currentEvent()

  // Define event handler function
  const handleEvent = (event) => {
    console.log(`Event triggered: ${eventToListen}`, event)
  }

  // Add event listener to window object
  window.addEventListener(eventToListen, handleEvent)

  // Clean up event listener when effect reruns or component unmounts
  onCleanup(() => {
    window.removeEventListener(eventToListen, handleEvent)
  })
})
```

#### `onError(fn: (error: unknown) => void): void`

Registers an error handler for the nearest Owner scope. Handles errors that occur during rendering or in effects within the current owner context. If an error is rethrown in the callback, it will propagate to the parent owner's error handler.

**Parameters:**

- `fn`: A function to handle errors

**Example:**

```jsx
onError((error) => {
  console.error('Caught an error:', error)
  // Handle error gracefully
})
```

### Reactive Utilities

#### `untrack<T>(fn: Getter<T>): T`

Runs a function without tracking dependencies. This means that any signal accesses within the function won't create dependencies for the current tracking context.

**Parameters:**

- `fn`: The function to run without tracking

**Returns:** The return value of `fn`

**Example:**

```jsx
const [count, setCount] = useSignal(0)

useEffect(() => {
  // This won't trigger a re-run when count changes
  const value = untrack(() => count())
  console.log('Count at effect start:', value)
})
```

#### `batch<T>(fn: Getter<T>): T`

Batches multiple state updates into a single re-render. This optimizes performance by ensuring that multiple changes to reactive values don't trigger multiple re-renders.

**Parameters:**

- `fn`: A function containing multiple state updates

**Returns:** The return value of `fn`

**Example:**

```jsx
const [count, setCount] = useSignal(0)
const [message, setMessage] = useSignal('')

function updateMultiple() {
  batch(() => {
    setCount(count() + 1)
    setMessage(`Count is now ${count() + 1}`)
    // Both updates are batched into a single re-render
  })
}
```

#### `on<T extends Getter<any> | Getter<any>[], U>(deps: T, fn: OnEffectFunction<T, U>, defer?: boolean): Callback<U>`

Creates a function that runs when specified dependencies change. Similar to `useEffect` but returns a function that can be used in other contexts.

**Parameters:**

- `deps`: A single getter or an array of getters that the effect depends on
- `fn`: A function that runs when dependencies change. It receives the current values, previous values, and previous return value
- `defer`: Optional flag to defer the first run until the next update cycle

**Returns:** A function that can be used as a callback in other effects or computations

**Example:**

```jsx
const [count, setCount] = useSignal(0)
const [multiplier, setMultiplier] = useSignal(2)

const effectFn = on(
  [count, multiplier],
  ([currentCount, currentMultiplier]) => {
    console.log(`Result: ${currentCount * currentMultiplier}`)
  },
)

// Use the effect function in another effect
useEffect(effectFn)
```

#### `createRoot<T>(fn: (dispose: () => void) => T, detachedOwner?: Owner): T`

Creates a new untracked owner scope that doesn't automatically dispose. Useful for nested reactive scopes that shouldn't be disposed when their parent recomputes. Ensures all memory and computations are properly managed.

**Parameters:**

- `fn`: The function to execute within the root context. It receives a dispose function as an argument
- `detachedOwner`: Optional owner context to attach to

**Returns:** The return value of `fn`

**Example:**

```jsx
const root = createRoot((dispose) => {
  const [count, setCount] = useSignal(0)

  // Do something with the signal
  setCount(10)
  console.log(count()) // 10

  // Return any values you want to access outside the root
  return { count, setCount, dispose }
})

// Later, when you want to clean up the root
root.dispose() // Cleans up the root and all its dependencies
```

#### `getOwner(): Owner | undefined`

Gets the current owner context. The owner context is responsible for managing the lifecycle of computations and effects.

**Returns:** The current owner or undefined if none

**Example:**

```jsx
const owner = getOwner()
if (owner) {
  // Do something with the owner, like attaching effects or computations
}
```

#### `runWithOwner<T>(owner: Owner, fn: Getter<T>): T`

Runs a function within a specific owner context. This allows you to create computations or effects that are managed by a specific owner.

**Parameters:**

- `owner`: The owner context to use
- `fn`: The function to run

**Returns:** The return value of `fn`

**Example:**

```jsx
const owner = getOwner()
if (owner) {
  runWithOwner(owner, () => {
    // Code executed within the owner context
    const [count] = useSignal(0)
    // This signal will be managed by the specified owner
  })
}
```

#### `mapArray<T, U>(list: Getter<readonly T[] | false | null | undefined>, mapFn: (v: T, i: Getter<number>) => U, fallback?: Getter<any>): Getter<U[]>`

Maps an array to a new array with efficient updates by tracking each value's identity. This is the underlying function for the `<For>` component.

**Parameters:**

- `list`: A getter function that returns the array to map or a falsy value
- `mapFn`: A function that maps each item to a new value, receiving the item and a reactive index
- `fallback`: Optional function that returns fallback content when the array is empty

**Returns:** A getter function that returns the mapped array

**Example:**

```jsx
const [numbers, setNumbers] = useSignal([1, 2, 3])
const doubledNumbers = mapArray(
  () => numbers(),
  (num) => num * 2,
  () => [0], // Fallback when array is empty
)
console.log(doubledNumbers()) // [2, 4, 6]
```

#### `indexArray<T, U>(list: Getter<readonly T[] | false | null | undefined>, mapFn: (v: Getter<T>, i: number) => U, fallback?: Getter<any>): Getter<U[]>`

Maps an array to a new array with efficient updates by tracking changes to array indices. This is the underlying function for the `<Index>` component.

**Parameters:**

- `list`: A getter function that returns the array to map or a falsy value
- `mapFn`: A function that maps each item to a new value, receiving a reactive getter for the item and the static index
- `fallback`: Optional function that returns fallback content when the array is empty

**Returns:** A getter function that returns the mapped array

**Example:**

```jsx
const [items, setItems] = useSignal(['a', 'b', 'c'])
const indexedItems = indexArray(
  () => items(),
  (item, index) => ({ value: item(), position: index }),
)
console.log(indexedItems()) // [{ value: 'a', position: 0 }, ...]
```

#### `mergeProps<T extends any[]>(...sources: T): MergeResult<T>`

Merges multiple props objects into a single reactive object. Properties from later sources override earlier ones. Useful for setting default properties for components when callers don't provide them.

**Parameters:**

- `sources`: Multiple props objects or functions that return props objects

**Returns:** A merged object with reactive properties

**Example:**

```jsx
const defaults = { color: 'blue', size: 'medium' }
const userProps = { color: 'red', fontWeight: 'bold' }
const merged = mergeProps(defaults, userProps)

console.log(merged.color) // 'red'
console.log(merged.size) // 'medium'
console.log(merged.fontWeight) // 'bold'

// Sources can also be functions
const dynamicProps = mergeProps(defaults, () => ({
  color: isDarkMode() ? 'white' : 'black',
}))
```

#### `splitProps<T extends object, const U extends (keyof any)[][]>(props: T, ...keys: U): SplitResult<T, U>`

Splits a props object into multiple objects based on specified keys. Useful for separating props for different components or hooks.

**Parameters:**

- `props`: The props object to split
- `keys`: Arrays of keys to extract into separate objects

**Returns:** An array of objects with the extracted props and remaining props

**Example:**

```jsx
const props = { id: 1, name: 'John', age: 30, city: 'New York' }
const [userInfo, location, rest] = splitProps(props, ['id', 'name'], ['city'])

console.log(userInfo) // { id: 1, name: 'John' }
console.log(location) // { city: 'New York' }
console.log(rest) // { age: 30 }
```

#### `catchError<T>(fn: Getter<T>, handler: (error: unknown) => void): T`

Executes a function and catches any errors that occur, passing them to an error handler. Useful for isolating error handling within specific parts of your application.

**Parameters:**

- `fn`: The function to execute
- `handler`: A function to handle any errors

**Returns:** The return value of `fn` if no error occurs

**Example:**

```jsx
const result = catchError(
  () => {
    if (Math.random() > 0.5) throw new Error('Random error')
    return 'Success'
  },
  (error) => {
    console.log('Caught error:', error.message)
  },
)
```

### Rendering

#### `render(code: Getter<JSX.Element>, el: Element | Document): () => void`

Renders a component into a DOM element. Creates a reactive root and handles mounting and unmounting.

**Parameters:**

- `code`: A function that returns the JSX element to render
- `el`: The DOM element or document to render into

**Returns:** A dispose function that cleans up the rendered component

**Example:**

```jsx
function App() {
  const [count, setCount] = useSignal(0)
  return (
    <div>
      <p>Count: {count()}</p>
      <button onClick={() => setCount((prev) => prev + 1)}>Increment</button>
    </div>
  )
}

const dispose = render(() => <App />, document.getElementById('app'))

// Later, to unmount and clean up
// dispose()
```

### Secondary Primitives

#### `useComputed<T>(fn: Callback<T>, value?: T): void`

Creates a computed value that derives its value from other signals and recalculates only when dependencies change. Similar to `useMemo` but designed to be used for side effects that depend on reactive values.

**Parameters:**

- `fn`: A function that computes the derived value. It receives the previous computed value as an argument
- `value`: Optional initial value

**Example:**

```jsx
const [count, setCount] = useSignal(10)

useComputed(() => {
  console.log(`Computed double: ${count() * 2}`)
})
```

#### `useRenderEffect<T>(fn: Callback<T>, value?: T): void`

Similar to `useEffect` but runs immediately after rendering before the DOM is fully updated, useful for DOM manipulations that need to happen right after rendering. Like `useEffect`, render effects support batching of updates.

**Parameters:**

- `fn`: A function to run after rendering. It receives the previous value returned by the effect and returns a new value to be used in the next run
- `value`: Optional initial value to pass to the first effect run

**Example:**

```jsx
function InputFocusComponent() {
  const [ref, setRef] = useSignal(null)

  useRenderEffect(() => {
    const element = ref()
    if (element) {
      element.focus() // This will happen synchronously after render
    }
  })

  return <input ref={setRef} />
}
```

#### `useSelector<T, U = T>(source: Getter<T>, fn?: Equals<T, U>): (key: U) => boolean`

Creates an optimized conditional selector that efficiently manages subscriptions by only notifying subscribers when their specific key starts or stops matching the source value. This optimization drastically improves update performance by minimizing the number of subscribers that need to be notified when the source value changes.

**Parameters:**

- `source`: A getter function that returns the source value to compare against keys
- `fn`: Optional custom equality function that receives a key and the source value, returning whether they should be treated as equal. Defaults to strict equality (`===`)

**Returns:** A function that takes a key and returns whether it matches the current source value

**Example:**

```jsx
function SelectableItemList() {
  const [selectedIndex, setSelectedIndex] = useSignal(0)
  const items = useSignal([0, 1, 2])
  const isActive = useSelector(selectedIndex)

  return (
    <For each={items()}>
      {(index) => (
        <div
          class={{ active: isActive(index) }}
          onClick={() => setSelectedIndex(index)}
        >
          Item {index + 1}
        </div>
      )}
    </For>
  )
}
```

### Store Utilities

#### `useStore<T extends ObjectLike>(state: T | Store<T>): [Store<T>, SetStoreFunction<T>]`

Creates a reactive store from an initial state object or array. Stores provide a way to work with nested reactive data structures more conveniently than using multiple individual signals.

**Parameters:**

- `state`: The initial state object/array or an existing store

**Returns:** An array containing the reactive store object and a setter function

- `Store<T>`: The reactive store object with getters for each property
- `SetStoreFunction<T>`: A function that updates the store, accepting either a new partial state object (merged with existing state) or a function that takes the current state and returns a new partial state. Properties set to `undefined` will be removed from the store

**Example:**

```jsx
const [user, setUser] = useStore({
  name: 'John Doe',
  age: 30,
  address: {
    city: 'New York',
    country: 'USA',
  },
})

// Access properties directly
console.log(user.name) // 'John Doe'

// Update with a partial object
setUser({ name: 'Jane Doe' })

// Update with a function
setUser((current) => ({
  age: current.age + 1,
}))

// Nested properties are also reactive
console.log(user.address.city) // 'New York'
```

## Compatibility

The Zess core runtime is compatible with:

- Node.js >=18.12.0
- Modern browsers (Chrome, Firefox, Safari, Edge)

## License

[MIT](https://github.com/rpsffx/zess/blob/main/LICENSE)
