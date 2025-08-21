import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { render } from '../src/dom'
import { ErrorBoundary, For, Index, Match, Show, Switch } from '../src/flow'
import { useEffect, useSignal } from '../src/signal'

describe('Flow Components', () => {
  let container: HTMLElement
  beforeEach(() => {
    container = document.createElement('div')
    document.body.append(container)
  })
  afterEach(() => container.remove())
  describe('<For>', () => {
    it('should render static list', () => {
      render(
        () => <For each={['A', 'B']}>{(item) => <div>{item}</div>}</For>,
        container,
      )
      expect(container.innerHTML).toBe('<div>A</div><div>B</div>')
    })
    it('should show fallback when empty', () => {
      render(
        () => (
          <For each={[]} fallback={<div>No items</div>}>
            {(item) => <div>{item}</div>}
          </For>
        ),
        container,
      )
      expect(container.innerHTML).toBe('<div>No items</div>')
    })
    it('should update dynamic list', () => {
      const [list, setList] = useSignal(['X'])
      render(
        () => <For each={list()}>{(item) => <span>{item}</span>}</For>,
        container,
      )
      setList(['Y', 'Z'])
      expect(container.innerHTML).toBe('<span>Y</span><span>Z</span>')
    })
  })
  describe('<Index>', () => {
    it('should handle static indexes', () => {
      render(
        () => <Index each={[5, 10]}>{(item) => <div>{item()}</div>}</Index>,
        container,
      )
      expect(container.innerHTML).toBe('<div>5</div><div>10</div>')
    })
    it('should show empty state', () => {
      render(
        () => (
          <Index each={null} fallback={<div>Empty</div>}>
            {(item) => <div>{item()}</div>}
          </Index>
        ),
        container,
      )
      expect(container.innerHTML).toBe('<div>Empty</div>')
    })
    it('should track position changes', () => {
      const [list, setList] = useSignal(['a', 'b'])
      render(
        () => (
          <Index each={list()}>
            {(item, index) => (
              <div>
                {index}:{item()}
              </div>
            )}
          </Index>
        ),
        container,
      )
      setList(['c', 'a'])
      expect(container.innerHTML).toBe('<div>0:c</div><div>1:a</div>')
    })
  })
  describe('<Show>', () => {
    it('should display static content', () => {
      render(
        () => (
          <Show when={true} fallback={<div>Loading</div>}>
            <span>Ready</span>
          </Show>
        ),
        container,
      )
      expect(container.innerHTML).toBe('<span>Ready</span>')
    })
    it('should show fallback when false', () => {
      render(
        () => (
          <Show when={false} fallback={<div>Off</div>}>
            <span>On</span>
          </Show>
        ),
        container,
      )
      expect(container.innerHTML).toBe('<div>Off</div>')
    })
    it('should toggle visibility', () => {
      const [cond, setCond] = useSignal(true)
      render(
        () => (
          <Show when={cond()} fallback={<div>Hidden</div>}>
            <div>Visible</div>
          </Show>
        ),
        container,
      )
      setCond(false)
      expect(container.innerHTML).toBe('<div>Hidden</div>')
      setCond(true)
      expect(container.innerHTML).toBe('<div>Visible</div>')
    })
  })
  describe('<Switch>', () => {
    it('should match first truthy condition', () => {
      render(
        () => (
          <Switch fallback="Default">
            <Match when={false}>A</Match>
            <Match when={true}>B</Match>
          </Switch>
        ),
        container,
      )
      expect(container.textContent).toBe('B')
    })
    it('should show fallback when no matches', () => {
      render(
        () => (
          <Switch fallback={<div>No match</div>}>
            <Match when={false}>A</Match>
          </Switch>
        ),
        container,
      )
      expect(container.innerHTML).toBe('<div>No match</div>')
    })
    it('should update when conditions change', () => {
      const [value, setValue] = useSignal(1)
      render(
        () => (
          <Switch fallback="Default">
            <Match when={value() === 1}>One</Match>
            <Match when={value() === 2}>Two</Match>
          </Switch>
        ),
        container,
      )
      setValue(2)
      expect(container.textContent).toBe('Two')
    })
  })
  describe('<ErrorBoundary>', () => {
    const ChildComponent = (props: {
      shouldThrow?: boolean
      errorMessage?: string
    }) => {
      useEffect(() => {
        if (props.shouldThrow) {
          throw new Error(props.errorMessage)
        }
      })
      return <div>Normal</div>
    }
    it('should catch child component errors', () => {
      render(
        () => (
          <ErrorBoundary fallback={(error) => <div>{error.message}</div>}>
            <ChildComponent shouldThrow={true} errorMessage="Test error" />
          </ErrorBoundary>
        ),
        container,
      )
      expect(container.innerHTML).toBe('<div>Test error</div>')
    })
    it('should recover after error', () => {
      const [hasError, setHasError] = useSignal(false)
      let recover: () => void
      render(
        () => (
          <ErrorBoundary
            fallback={(_, reset) => {
              recover = reset
              return <div>Error</div>
            }}
          >
            <ChildComponent
              shouldThrow={hasError()}
              errorMessage="Simulated error"
            />
          </ErrorBoundary>
        ),
        container,
      )
      setHasError(true)
      expect(container.innerHTML).toContain('Error')
      setHasError(false)
      recover!()
      expect(container.innerHTML).toBe('<div>Normal</div>')
    })
    it('should handle nested errors', () => {
      render(
        () => (
          <ErrorBoundary fallback={<div>Root error</div>}>
            <ErrorBoundary fallback={<div>Child error</div>}>
              <ChildComponent shouldThrow={true} errorMessage="Test error" />
            </ErrorBoundary>
          </ErrorBoundary>
        ),
        container,
      )
      expect(container.innerHTML).toBe('<div>Child error</div>')
    })
  })
})
