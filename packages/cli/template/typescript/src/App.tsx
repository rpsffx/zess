import { render, type Component } from '@zessjs/core'
import { Link, Route, Router } from '@zessjs/router'
import viteLogo from './assets/vite.svg'
import ConditionalPage from './pages/ConditionalPage'
import CounterPage from './pages/CounterPage'
import HomePage from './pages/HomePage'
import ListPage from './pages/ListPage'
import './assets/style.css'
import zessLogo from '/zess.svg'

const AppLayout: Component<{ children?: JSX.Element }> = (props) => (
  <div class="min-h-screen flex flex-col items-center bg-gradient-to-br from-blue-100 via-white to-yellow-100">
    <nav class="w-full py-4 flex justify-center">
      <div class="flex space-x-6 md:space-x-8">
        {/* Home page link - active when at root URL */}
        <Link
          end
          to="/"
          class="text-gray-700 hover:text-indigo-600 transition-all duration-200"
          activeClass="text-indigo-600 font-semibold"
        >
          Home
        </Link>
        {/* Counter page link */}
        <Link
          end
          to="counter"
          class="text-gray-700 hover:text-indigo-600 transition-all duration-200"
          activeClass="text-indigo-600 font-semibold"
        >
          Counter
        </Link>
        {/* List page link */}
        <Link
          end
          to="list"
          class="text-gray-700 hover:text-indigo-600 transition-all duration-200"
          activeClass="text-indigo-600 font-semibold"
        >
          List
        </Link>
        {/* Conditional page link */}
        <Link
          end
          to="conditional"
          class="text-gray-700 hover:text-indigo-600 transition-all duration-200"
          activeClass="text-indigo-600 font-semibold"
        >
          Conditional
        </Link>
      </div>
    </nav>
    <div class="flex flex-col md:flex-row items-center justify-center my-8 md:my-12 space-y-4 md:space-y-0 md:space-x-12">
      <img
        src={zessLogo}
        class="h-32 md:h-40 transition-all duration-300 hover:drop-shadow-[0_0_2em_#646cffaa]"
        alt="Zess logo"
      />
      <img
        src={viteLogo}
        class="h-32 md:h-40 transition-all duration-300 hover:drop-shadow-[0_0_2em_#646cffaa]"
        alt="Vite logo"
      />
    </div>
    <h1 class="text-5xl md:text-6xl font-bold mb-8 md:mb-12">Hello Zess!</h1>
    <main class="w-full max-w-4xl px-4 pb-12">{props.children}</main>
  </div>
)

const ZessApp: Component = () => (
  <Router root={AppLayout} mode="history">
    {/* Route for Home page */}
    <Route path="/" component={HomePage} />
    {/* Route for Counter page */}
    <Route path="counter" component={CounterPage} />
    {/* Route for List page */}
    <Route path="list" component={ListPage} />
    {/* Route for Conditional page */}
    <Route path="conditional" component={ConditionalPage} />
    {/* Catch-all route for 404 page not found */}
    <Route
      path="*"
      component={() => (
        <div class="text-center py-16">
          <h1 class="text-4xl font-bold mb-4">404</h1>
          <p class="text-xl text-gray-600 mb-8">Page not found</p>
          {/* Link to home page */}
          <Link
            to="/"
            relative={false}
            class="inline-block px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded transition-all"
          >
            Go back to Home
          </Link>
        </div>
      )}
    />
  </Router>
)

render(() => <ZessApp />, document.querySelector('#app')!)
