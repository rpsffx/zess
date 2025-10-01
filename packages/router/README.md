<div align="center">
  <img src="https://pic1.imgdb.cn/item/68c7c093c5157e1a8804fb52.svg" alt="Zess Logo">
</div>

# @zess/router

[![NPM Version](https://img.shields.io/npm/v/@zess/router.svg?style=flat-square&color=lightblue)](https://www.npmjs.com/package/@zess/router) [![License](https://img.shields.io/npm/l/@zess/router.svg?style=flat-square&color=lightblue)](https://github.com/rpsffx/zess/blob/main/LICENSE)

Zess router 📍 Client-side navigation, dynamic & nested routing for web apps.

## ✨ Features

- **🎯 Simple and Lightweight**: Easy-to-use API with minimal configuration required
- **⚡ Performance Optimized**: Caches each route component for excellent rendering performance
- **🔄 Multiple Modes**: Supports both hash mode and history mode for different deployment environments
- **🧩 Nested Routes**: Create complex route hierarchies with nested components
- **🚀 Dynamic Navigation**: Programmatically navigate between routes using hooks
- **🔍 Search Params Handling**: Built-in support for managing query parameters
- **🔒 Type Safety**: Complete TypeScript type definitions
- **🔄 Seamless Integration**: Works perfectly with @zess/core reactive system

## 📦 Installation

```bash
# Using npm
npm install @zess/router

# Using yarn
yarn add @zess/router

# Using pnpm
pnpm add @zess/router
```

## 🚀 Basic Usage

### Setting Up the Router

```jsx
import { render } from '@zess/core'
import { Router, Route } from '@zess/router'

function RootLayout(props) {
  return <div>{props.children}</div>
}

function HomePage() {
  return <h1>Welcome to Home Page</h1>
}

function AboutPage() {
  return <h1>About Us</h1>
}

render(
  () => (
    <Router root={RootLayout}>
      <Route path="/" component={HomePage} />
      <Route path="/about" component={AboutPage} />
    </Router>
  ),
  document.getElementById('app'),
)
```

### Using Navigation Links

```jsx
import { Link } from '@zess/router'

function Navigation() {
  return (
    <nav>
      <Link to="/" class="nav-link">
        Home
      </Link>
      <Link to="/about" class="nav-link">
        About
      </Link>
    </nav>
  )
}
```

### Programmatically Navigating

```jsx
import { useNavigate } from '@zess/router'

function NavigationButtons() {
  const navigate = useNavigate()

  return (
    <div>
      <button onClick={() => navigate('/')}>Go to Home</button>
      <button onClick={() => navigate('/about', { replace: true })}>
        Go to About
      </button>
    </div>
  )
}
```

## 🔧 Advanced Usage

### Nested Routes

```jsx
import { Router, Route } from '@zess/router'

function AppLayout(props) {
  return (
    <div class="app">
      <header>Zess Application</header>
      <main>{props.children}</main>
    </div>
  )
}

function UserLayout(props) {
  return (
    <div class="user-section">
      <nav class="user-nav">User Navigation</nav>
      <div class="user-content">{props.children}</div>
    </div>
  )
}

function HomePage() {
  return <h1>Welcome to Home Page</h1>
}

function UserList() {
  return <h2>User List</h2>
}

function UserProfile() {
  return <h2>User Profile</h2>
}

render(
  () => (
    <Router root={AppLayout}>
      <Route path="/" component={HomePage} />
      {/* Nested routes */}
      <Route path="/users" component={UserLayout}>
        <Route path="/" component={UserList} />
        <Route path="/profile" component={UserProfile} />
      </Route>
    </Router>
  ),
  document.getElementById('app'),
)
```

### Working with Search Parameters

```jsx
import { useSearchParams } from '@zess/router'

function SearchComponent() {
  const [searchParams, setSearchParams] = useSearchParams()
  const handleSearch = (event) => {
    event.preventDefault()
    const formData = new FormData(event.target)
    const query = formData.get('query')
    setSearchParams({ query })
  }

  return (
    <div>
      <form onSubmit={handleSearch}>
        <input type="text" name="query" defaultValue={searchParams.query} />
        <button type="submit">Search</button>
      </form>
      {searchParams.query && <p>Searching for: {searchParams.query}</p>}
    </div>
  )
}
```

### Using Different Router Modes

```jsx
// Hash mode (default)
render(
  () => (
    <Router mode="hash" root={RootLayout}>
      <Route path="/" component={HomePage} />
    </Router>
  ),
  document.getElementById('app'),
)

// History mode
render(
  () => (
    <Router mode="history" root={RootLayout}>
      <Route path="/" component={HomePage} />
    </Router>
  ),
  document.getElementById('app'),
)
```

## 📚 API Reference

### Components

#### `Router(props: RouterProps): JSX.Element`

The main router component that wraps all your routes and provides the routing context.

**Parameters:**

- `mode`: Optional routing mode, either `'hash'` or `'history'`. Defaults to `'hash'`
- `root`: Optional component that wraps the rendered component for all routes
- `children`: `<Route>` components to be rendered

**Example:**

```jsx
<Router mode="hash" root={RootLayout}>
  <Route path="/" component={HomePage} />
  <Route path="/about" component={AboutPage} />
</Router>
```

#### `Route(props: RouteProps): JSX.Element`

Defines a route and its corresponding component.

**Parameters:**

- `path`: The path pattern for this route
- `sensitive`: Optional flag to make the path matching case-sensitive. Defaults to `false`
- `component`: Optional component to render when the route is matched
- `children`: Optional nested `<Route>` components

**Example:**

```jsx
// Basic route
<Route path="/about" component={AboutPage} />

// Case-sensitive route
<Route path="/API" sensitive component={ApiPage} />

// Route with nested routes
<Route path="/dashboard" component={DashboardLayout}>
  <Route path="/stats" component={StatsPage} />
  <Route path="/settings" component={SettingsPage} />
</Route>

// Wildcard route (matches any path)
<Route path="*" component={NotFoundPage} />
```

#### `Link(props: LinkProps): JSX.Element`

Creates a navigable link to another route.

**Parameters:**

- `to`: The destination path, can include query strings
- `relative`: Optional flag to navigate to the relative path. Defaults to `true`
- `replace`: Optional flag to replace the current history entry instead of pushing a new one
- `noScroll`: Optional flag to prevent scrolling to top when navigating
- `style`: Optional CSS styles
- `class`: Optional CSS class name
- `activeClass`: Optional CSS class name to apply when the link is active
- `end`: Optional flag to match the path exactly. When set to `true`, the link will only be active if the current path matches exactly
- `children`: Optional content for the link

**Example:**

```jsx
// Basic link
<Link to="/home">Home</Link>

// Link with absolute path
<Link to="/about" relative={false}>About (Exact)</Link>

// Link with replace
<Link to="/login" replace>Login</Link>

// Link with noScroll
<Link to="/details" noScroll>View Details (No Scroll)</Link>

// Link with styles
<Link to="/contact" style={{ color: 'blue' }}>Contact</Link>

// Link with className
<Link to="/profile" class="user-link">Profile</Link>

// Link with activeClass
<Link to="/dashboard" activeClass="active-nav">Dashboard</Link>

// Link with end prop
<Link to="/settings" end>Settings (Exact Match)</Link>

// Link with query parameters
<Link to="/products?category=electronics&sort=price">Products (Electronics)</Link>
```

### Primitives

#### `useNavigate(): (href: string, options?: NavigateOptions) => void`

Hook that returns a function to programmatically navigate between routes.

**Returns:** A function that accepts a path and optional navigation options

- `href`: The destination path, can include query strings
- `options`: Optional configuration
  - `relative`: If `false`, navigates to the absolute path without relative base. Defaults to `true`
  - `replace`: If `true`, replaces the current history entry
  - `noScroll`: If `true`, prevents scrolling to top when navigating

**Example:**

```jsx
function NavigationComponent() {
  const navigate = useNavigate()

  return (
    <>
      <button onClick={() => navigate('/')}>Home</button>
      <button onClick={() => navigate('/products', { relative: false })}>
        Products
      </button>
      <button onClick={() => navigate('/login', { replace: true })}>
        Login
      </button>
      <button onClick={() => navigate('/details', { noScroll: true })}>
        View Details (No Scroll)
      </button>
      <button onClick={() => navigate('/search?q=zess&page=1')}>
        Search Zess (Page 1)
      </button>
    </>
  )
}
```

#### `useSearchParams(): [SearchParams, (params: Record<string, any>, replace?: boolean) => void]`

Hook that provides access to search parameters and a function to update them.

**Returns:** An array containing

- `searchParams`: A reactive object with current search parameters that auto-updates when `location.search` changes or when modified via `setSearchParams`
- `setSearchParams`: A function to update search parameters
  - `params`: Search parameters to merge with existing ones. Setting a property value to `undefined`, `null` or an empty string removes that property
  - `replace`: Optional flag to replace the current history entry

**Example:**

```jsx
function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const handleFilterChange = (category) => {
    setSearchParams({ category })
  }
  const resetFilters = () => {
    setSearchParams({ category: undefined })
  }

  return (
    <div>
      <p>Current filters: {searchParams.category || 'All'}</p>
      <button onClick={() => handleFilterChange('electronics')}>
        Electronics
      </button>
      <button onClick={() => handleFilterChange('clothing')}>Clothing</button>
      <button onClick={resetFilters}>Reset</button>
    </div>
  )
}
```

#### `useBeforeLeave(listener: RouteGuardListener): void`

Hook that registers a listener to be called before leaving the current route. This allows you to intercept navigation attempts and potentially prevent them, for example, to warn users about unsaved changes.

**Parameters:**

- `listener`: A function that will be called with a `RouteGuardEvent` object when navigation away from the current route is attempted
  - `event`: The route guard event object containing:
    - `to`: The destination path being navigated to
    - `from`: The current path being navigated from
    - `options`: Navigation options including `relative`, `replace`, and `noScroll`
    - `defaultPrevented`: Boolean indicating if the navigation has been prevented
    - `preventDefault`: Function to call to prevent the navigation
    - `retry`: Function to retry the navigation later, with an optional `force` parameter to bypass guards

**Example:**

```jsx
function FormEditor() {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useSignal(false)
  useBeforeLeave((event) => {
    if (hasUnsavedChanges()) {
      const confirmed = window.confirm(
        'You have unsaved changes. Are you sure you want to leave?',
      )
      if (!confirmed) {
        event.preventDefault()
      }
    }
  })

  return (
    <div>
      <input type="text" onChange={() => setHasUnsavedChanges(true)} />
      <button onClick={() => setHasUnsavedChanges(false)}>Save</button>
    </div>
  )
}
```

## 🔄 Compatibility

The Zess router is compatible with:

- Node.js >=18.12.0
- Modern browsers (Chrome, Firefox, Safari, Edge)

## 📝 License

[MIT](https://github.com/rpsffx/zess/blob/main/LICENSE)
