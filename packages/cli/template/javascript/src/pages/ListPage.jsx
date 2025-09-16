import { For, Show, useSignal } from '@zess/core'
import { Link } from '@zess/router'

const ListPage = () => {
  const [items, setItems] = useSignal([
    'Zess Compiler',
    'Zess Core',
    'Zess Router',
  ])
  const [newItem, setNewItem] = useSignal('')
  const addItem = () => {
    const item = newItem().trim()
    if (item) {
      setItems((prevItems) => [...prevItems, item])
      setNewItem('')
    }
  }
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') addItem()
  }

  return (
    <div class="w-full text-center pb-8">
      <header class="mb-8">
        <h1 class="text-2xl font-bold mb-2">List Example</h1>
        <p class="text-gray-600">
          This shows how to render lists with {'<For>'} component
        </p>
      </header>
      <div class="mb-8">
        <div class="flex flex-col sm:flex-row gap-2 justify-center">
          <input
            type="text"
            value={newItem()}
            onInput={(e) => setNewItem(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter new item..."
            class="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <button
            onClick={addItem}
            class="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded transition-all"
          >
            Add Item
          </button>
        </div>
      </div>
      <div class="mb-8">
        {/* Conditionally render the list or an empty state message */}
        <Show
          when={items().length > 0}
          fallback={<p class="text-gray-500 py-4">No items in the list yet.</p>}
        >
          <ul class="space-y-2 max-w-md mx-auto">
            {/* Zess For component for efficiently rendering lists */}
            <For each={items()}>
              {(item, index) => (
                <li class="flex items-center p-2 border-b border-gray-200 bg-white">
                  <span class="mr-2 text-gray-500 font-medium">
                    {index() + 1}.
                  </span>
                  <span class="text-left flex-1">{item}</span>
                </li>
              )}
            </For>
          </ul>
        </Show>
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

export default ListPage
