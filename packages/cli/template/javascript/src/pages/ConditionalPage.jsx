import { Match, Show, Switch, useMemo, useSignal } from '@zess/core'
import { Link } from '@zess/router'

const ConditionalPage = () => {
  const [count, setCount] = useSignal(0)
  const status = useMemo(() => {
    const currentCount = count()
    if (currentCount > 10) return 'success'
    if (currentCount > 5) return 'warning'
    return 'info'
  })

  return (
    <div class="w-full text-center pb-8">
      <header class="mb-8">
        <h1 class="text-2xl font-bold mb-2">Conditional Rendering</h1>
        <p class="text-gray-600">
          This demonstrates Zess's conditional rendering components
        </p>
      </header>
      <div class="flex justify-center items-center gap-4 mb-8">
        <button
          class="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded transition-all"
          onClick={() => setCount((prevCount) => Math.max(0, prevCount - 1))}
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
      <div class="mb-8 space-y-4 max-w-md mx-auto">
        <div class="p-4 border border-gray-200 rounded bg-white">
          <h3 class="text-lg font-semibold mb-2">Using Show Component</h3>
          {/* Show component renders content conditionally based on the 'when' prop */}
          {/* Falls back to the fallback content when condition is false */}
          <Show
            when={count() > 5}
            fallback={
              <p class="text-gray-600">Count is less than or equal to 5</p>
            }
          >
            <p class="text-green-600 font-medium">
              Count is greater than 5! 🎉
            </p>
          </Show>
        </div>
        <div class="p-4 border border-gray-200 rounded bg-white">
          <h3 class="text-lg font-semibold mb-2">
            Using {'<Switch>'} and {'<Match>'}
          </h3>
          {/* Switch component acts like a switch statement for rendering */}
          {/* Only the first matching Match component within Switch is rendered */}
          <Switch>
            <Match when={status() === 'success'}>
              <p class="text-green-600 font-medium">Status: Success</p>
            </Match>
            <Match when={status() === 'warning'}>
              <p class="text-yellow-600 font-medium">Status: Warning</p>
            </Match>
            <Match when={status() === 'info'}>
              <p class="text-blue-600 font-medium">Status: Info</p>
            </Match>
          </Switch>
        </div>
      </div>
      <div>
        {/* Link back to home page */}
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

export default ConditionalPage
