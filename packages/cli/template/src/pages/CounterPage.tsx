import { useMemo, useSignal, type Component } from '@zess/core'
import { Link } from '@zess/router'

const CounterPage: Component = () => {
  const [count, setCount] = useSignal(0)
  const doubleCount = useMemo(() => count() * 2)

  return (
    <div class="w-full text-center pb-8">
      <header class="mb-8">
        <h1 class="text-2xl font-bold mb-2">Counter Example</h1>
        <p class="text-gray-600">
          This is a simple counter demonstrating Zess's signal system
        </p>
      </header>
      <div class="flex justify-center items-center gap-4 mb-8">
        <button
          class="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded transition-all"
          onClick={() => setCount((prevCount) => prevCount - 1)}
        >
          -
        </button>
        <span class="text-3xl font-bold min-w-16">{count()}</span>
        <button
          class="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded transition-all"
          onClick={() => setCount((prevCount) => prevCount + 1)}
        >
          +
        </button>
      </div>
      <div class="mb-8">
        <p class="text-gray-700">
          Double the count is: <strong>{doubleCount()}</strong>
        </p>
      </div>
      <div>
        <Link
          to="/"
          relative={false}
          class="inline-block px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded transition-all"
        >
          Back to Home
        </Link>
      </div>
    </div>
  )
}

export default CounterPage
