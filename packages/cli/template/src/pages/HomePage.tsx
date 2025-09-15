import { Link } from '@zess/router'
import type { Component } from '@zess/core'

const HomePage: Component = () => {
  return (
    <div class="w-full text-center pb-8">
      <section>
        <h2 class="text-2xl font-semibold mb-6">Explore Examples</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            to="/counter"
            class="block p-4 border border-gray-200 rounded hover:border-indigo-500 transition-all bg-white"
          >
            <h3 class="text-lg font-medium mb-2">Counter Example</h3>
            <p class="text-sm text-gray-600">
              Signal system and reactive updates
            </p>
          </Link>
          <Link
            to="/list"
            class="block p-4 border border-gray-200 rounded hover:border-purple-500 transition-all bg-white"
          >
            <h3 class="text-lg font-medium mb-2">List Example</h3>
            <p class="text-sm text-gray-600">
              Render lists and handle user input
            </p>
          </Link>
          <Link
            to="/conditional"
            class="block p-4 border border-gray-200 rounded hover:border-pink-500 transition-all bg-white"
          >
            <h3 class="text-lg font-medium mb-2">Conditional Rendering</h3>
            <p class="text-sm text-gray-600">
              {'<Show>'} and {'<Switch>'} components
            </p>
          </Link>
        </div>
      </section>
    </div>
  )
}

export default HomePage
