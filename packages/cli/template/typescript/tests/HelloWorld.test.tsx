import { render } from '@zess/core'
import { describe, expect, it } from 'vitest'

function HelloWorld() {
  return <div>Hello World</div>
}

describe('HelloWorld', () => {
  it('should render a <HelloWorld> component', () => {
    const container = document.createElement('div')
    const dispose = render(() => <HelloWorld />, container)
    expect(container.textContent).toBe('Hello World')
    dispose()
  })
})
