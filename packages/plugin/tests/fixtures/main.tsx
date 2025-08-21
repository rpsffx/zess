import { render, useSignal, type Component } from '@zess/core'

const Counter: Component = () => {
  const [count, setCount] = useSignal(1)
  const increment = () => setCount((count) => count + 1)

  return (
    <button type="button" onClick={increment}>
      {count()}
    </button>
  )
}

render(() => <Counter />, document.getElementById('app')!)
