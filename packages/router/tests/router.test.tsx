import { createRoot, render, useRenderEffect } from '@zess/core'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  Link,
  Route,
  Router,
  useNavigate,
  useSearchParams,
} from '../src/router'

function waitFor(
  type: 'hashchange' | 'popstate',
): Promise<HashChangeEvent | PopStateEvent> {
  return new Promise((resolve) =>
    window.addEventListener(type, resolve, { once: true }),
  )
}

describe('Router', () => {
  let container: HTMLElement
  let dispose: () => void
  beforeEach(() => {
    history.replaceState(null, '', '/')
    container = document.createElement('div')
    document.body.append(container)
  })
  afterEach(() => {
    dispose!()
    container.remove()
  })
  describe('Link component', () => {
    it('should update URL and render content when clicked (hash mode)', () => {
      dispose = render(
        () => (
          <Router
            mode="hash"
            root={(props) => (
              <>
                <Link to="/test" />
                {props.children}
              </>
            )}
          >
            <Route path="/test" component={() => <div>Test</div>} />
          </Router>
        ),
        container,
      )
      ;(container.firstElementChild as HTMLAnchorElement).click()
      expect(location.hash).toBe('#/test')
      expect(container.textContent).toBe('Test')
    })
    it('should update URL and render content when clicked (history mode)', () => {
      dispose = render(
        () => (
          <Router
            mode="history"
            root={(props) => (
              <>
                <Link to="/test" />
                {props.children}
              </>
            )}
          >
            <Route path="/test" component={() => <div>Test</div>} />
          </Router>
        ),
        container,
      )
      ;(container.firstElementChild as HTMLAnchorElement).click()
      expect(location.pathname).toBe('/test')
      expect(container.textContent).toBe('Test')
    })
    it('should navigate to absolute path without basePath when using relative prop', () => {
      dispose = render(
        () => (
          <Router
            root={(props) => (
              <>
                <Link to="/home" />
                {props.children}
              </>
            )}
          >
            <Route
              path="/home"
              component={() => (
                <>
                  Home
                  <Link to="/about" relative={false} />
                </>
              )}
            />
            <Route path="/about" component={() => <div>About</div>} />
          </Router>
        ),
        container,
      )
      ;(container.firstElementChild as HTMLAnchorElement).click()
      expect(container.textContent).toBe('Home')
      ;(container.lastElementChild as HTMLAnchorElement).click()
      expect(container.textContent).toBe('About')
    })
    it('should replace history entry when using replace prop', async () => {
      dispose = render(
        () => (
          <Router
            root={(props) => (
              <>
                <Link to="/test" replace />
                {props.children}
              </>
            )}
          >
            <Route path="/test" component={() => <div>Test</div>} />
          </Router>
        ),
        container,
      )
      const initialHistoryLength = history.length
      ;(container.firstElementChild as HTMLAnchorElement).click()
      expect(container.textContent).toBe('Test')
      expect(history.length).toBe(initialHistoryLength)
      history.back()
      await waitFor('hashchange')
      expect(container.textContent).toBe('')
    })
    it('should apply style to link when using style prop', () => {
      dispose = render(
        () => (
          <Router
            root={(props) => (
              <>
                <Link to="/test" style={{ color: 'red' }} />
                {props.children}
              </>
            )}
          />
        ),
        container,
      )
      expect(
        (container.firstElementChild as HTMLAnchorElement).style.color,
      ).toBe('red')
    })
    it('should apply className to link when using class prop', () => {
      dispose = render(
        () => (
          <Router
            root={(props) => (
              <>
                <Link to="/test" class="custom-class" />
                {props.children}
              </>
            )}
          />
        ),
        container,
      )
      expect(
        (container.firstElementChild as HTMLAnchorElement).classList.contains(
          'custom-class',
        ),
      ).toBe(true)
    })
  })
  describe('Route Component', () => {
    it('should be case sensitive when sensitive prop is true', () => {
      dispose = render(
        () => (
          <Router
            root={(props) => (
              <>
                <Link to="/Test" />
                {props.children}
              </>
            )}
          >
            <Route path="/test" sensitive component={() => <div>Test</div>} />
          </Router>
        ),
        container,
      )
      ;(container.firstElementChild as HTMLAnchorElement).click()
      expect(container.textContent).not.toBe('Test')
    })
    it('should be case insensitive when sensitive prop is false or not set', () => {
      dispose = render(
        () => (
          <Router
            root={(props) => (
              <>
                <Link to="/Test" />
                {props.children}
              </>
            )}
          >
            <Route path="/test" component={() => <div>Test</div>} />
          </Router>
        ),
        container,
      )
      ;(container.firstElementChild as HTMLAnchorElement).click()
      expect(container.textContent).toBe('Test')
    })
    it('should match any path when using wildcard path', () => {
      dispose = render(
        () => (
          <Router
            root={(props) => (
              <>
                <Link to="/test" />
                {props.children}
              </>
            )}
          >
            <Route path="/" component={() => <div>Home</div>} />
            <Route
              path="/test"
              component={() => (
                <>
                  Test
                  <Link to="/nonexistent" />
                </>
              )}
            />
            <Route path="*" component={() => <div>404 Not Found</div>} />
          </Router>
        ),
        container,
      )
      expect(container.textContent).toBe('Home')
      ;(container.firstElementChild as HTMLAnchorElement).click()
      expect(container.textContent).toBe('Test')
      ;(container.lastElementChild as HTMLAnchorElement).click()
      expect(container.textContent).toBe('404 Not Found')
    })
  })
  describe('Nested routes', () => {
    it('should render nested route content', () => {
      dispose = render(
        () => (
          <Router
            root={(props) => (
              <>
                <Link to="/parent/child" />
                {props.children}
              </>
            )}
          >
            <Route
              path="/parent"
              component={(props) => <div>Parent{props.children}</div>}
            >
              <Route path="/child" component={() => <div>Child</div>} />
            </Route>
          </Router>
        ),
        container,
      )
      ;(container.firstElementChild as HTMLAnchorElement).click()
      expect(container.textContent).toBe('ParentChild')
    })
    it('should render child route content when parent route has no component', () => {
      dispose = render(
        () => (
          <Router
            root={(props) => (
              <>
                <Link to="/parent/child" />
                {props.children}
              </>
            )}
          >
            <Route path="/parent">
              <Route path="/child" component={() => <div>Test</div>} />
            </Route>
          </Router>
        ),
        container,
      )
      ;(container.firstElementChild as HTMLAnchorElement).click()
      expect(container.textContent).toBe('Test')
    })
    it('should render three levels nested route content and handle navigation between routes', () => {
      dispose = render(
        () => (
          <Router
            root={(props) => (
              <>
                <Link to="/level1/level2/level3" />
                <Link to="/level1/level2/level3-2" />
                <Link to="/level1/level2" />
                {props.children}
              </>
            )}
          >
            <Route
              path="/level1"
              component={(props) => <div>Level1{props.children}</div>}
            >
              <Route
                path="/level2"
                component={(props) => <div>Level2{props.children}</div>}
              >
                <Route path="/level3" component={() => <div>Level3</div>} />
                <Route path="/level3-2" component={() => <div>Level3-2</div>} />
              </Route>
            </Route>
          </Router>
        ),
        container,
      )
      const { children } = container
      expect(container.textContent).not.toBe('Level1')
      ;(children[0] as HTMLAnchorElement).click()
      expect(container.textContent).toBe('Level1Level2Level3')
      ;(children[1] as HTMLAnchorElement).click()
      expect(container.textContent).toBe('Level1Level2Level3-2')
      ;(children[2] as HTMLAnchorElement).click()
      expect(container.textContent).toBe('Level1Level2')
    })
  })
  describe('History navigation', () => {
    it('should handle back/forward navigation (hash mode)', async () => {
      dispose = render(
        () => (
          <Router
            mode="hash"
            root={(props) => (
              <>
                <Link to="/about" />
                {props.children}
              </>
            )}
          >
            <Route path="/" component={() => <div>Home</div>} />
            <Route path="/about" component={() => <div>About</div>} />
          </Router>
        ),
        container,
      )
      ;(container.firstElementChild as HTMLAnchorElement).click()
      expect(container.textContent).toBe('About')
      history.back()
      await waitFor('hashchange')
      expect(container.textContent).toBe('Home')
      history.forward()
      await waitFor('hashchange')
      expect(container.textContent).toBe('About')
    })
    it('should handle go navigation (history mode)', async () => {
      dispose = render(
        () => (
          <Router
            mode="history"
            root={(props) => (
              <>
                <Link to="/contact" />
                {props.children}
              </>
            )}
          >
            <Route path="/" component={() => <div>Home</div>} />
            <Route path="/contact" component={() => <div>Contact</div>} />
          </Router>
        ),
        container,
      )
      ;(container.firstElementChild as HTMLAnchorElement).click()
      expect(container.textContent).toBe('Contact')
      history.go(-1)
      await waitFor('popstate')
      expect(container.textContent).toBe('Home')
    })
  })
  describe('useNavigate hook', () => {
    it('should navigate correctly without options', () => {
      let navigate: ReturnType<typeof useNavigate>
      dispose = render(
        () => (
          <Router
            root={(props) => {
              navigate = useNavigate()
              return props.children
            }}
          >
            <Route path="/" component={() => <div>Home</div>} />
            <Route path="/test" component={() => <div>Test</div>} />
          </Router>
        ),
        container,
      )
      expect(container.textContent).toBe('Home')
      navigate!('/test')
      expect(location.hash).toBe('#/test')
      expect(container.textContent).toBe('Test')
    })
    it('should navigate to absolute path when relative option is false', () => {
      let navigate: ReturnType<typeof useNavigate>
      dispose = render(
        () => (
          <Router
            root={(props) => (
              <>
                <Link to="/parent/child" />
                {props.children}
              </>
            )}
          >
            <Route
              path="/parent"
              component={(props) => <div>Parent{props.children}</div>}
            >
              <Route
                path="/child"
                component={() => {
                  navigate = useNavigate()
                  return <div>Child</div>
                }}
              />
            </Route>
            <Route path="/sibling" component={() => <div>Sibling</div>} />
          </Router>
        ),
        container,
      )
      ;(container.firstElementChild as HTMLAnchorElement).click()
      expect(location.hash).toBe('#/parent/child')
      expect(container.textContent).toBe('ParentChild')
      navigate!('/sibling', { relative: false })
      expect(location.hash).toBe('#/sibling')
      expect(container.textContent).toBe('Sibling')
    })
    it('should replace history entry when replace option is true', async () => {
      let navigate: ReturnType<typeof useNavigate>
      dispose = render(
        () => (
          <Router
            root={(props) => {
              navigate = useNavigate()
              return props.children
            }}
          >
            <Route path="/page1" component={() => <div>Page 1</div>} />
            <Route path="/page2" component={() => <div>Page 2</div>} />
          </Router>
        ),
        container,
      )
      navigate!('/page1')
      expect(location.hash).toBe('#/page1')
      expect(container.textContent).toBe('Page 1')
      navigate!('/page2', { replace: true })
      expect(location.hash).toBe('#/page2')
      expect(container.textContent).toBe('Page 2')
      history.back()
      await waitFor('hashchange')
      expect(location.hash).toBe('#/')
      expect(container.textContent).toBe('')
    })
  })
  describe('useSearchParams hook', () => {
    it('should update searchParams when setSearchParams is called', () => {
      const effectSpy = vi.fn()
      const navigate = useNavigate()
      navigate('?name=John&age=20')
      const [searchParams, setSearchParams] = useSearchParams()
      createRoot(() => {
        useRenderEffect(() => {
          effectSpy(searchParams.name, searchParams.age)
        })
      })
      expect(effectSpy).toHaveBeenCalledTimes(1)
      expect(effectSpy).toHaveBeenCalledWith('John', '20')
      expect(useSearchParams()).toEqual([searchParams, setSearchParams])
      setSearchParams({ name: 'Eric', age: '30' })
      expect(location.search).toBe('?name=Eric&age=30')
      expect(effectSpy).toHaveBeenCalledTimes(2)
      expect(effectSpy).toHaveBeenCalledWith('Eric', '30')
      setSearchParams({ name: 'Henry', age: '40' }, true)
      history.back()
      expect(location.search).toBe('?name=Henry&age=40')
      expect(effectSpy).toHaveBeenCalledTimes(3)
      expect(effectSpy).toHaveBeenCalledWith('Henry', '40')
      setSearchParams({ name: 'Henry', gender: 'male' })
      expect(location.search).toBe('?name=Henry&gender=male')
      expect(searchParams.gender).toBe('male')
    })
    it('should refresh searchParams when location.search changes', () => {
      const effectSpy = vi.fn()
      const navigate = useNavigate()
      navigate('?name=Alice&age=20')
      const [searchParams] = useSearchParams()
      createRoot(() => {
        useRenderEffect(() => {
          effectSpy(searchParams.name, searchParams.age)
        })
      })
      expect(effectSpy).toHaveBeenCalledTimes(1)
      expect(effectSpy).toHaveBeenCalledWith('Alice', '20')
      navigate('?name=Tina&age=30')
      expect(effectSpy).toHaveBeenCalledTimes(2)
      expect(effectSpy).toHaveBeenCalledWith('Tina', '30')
      navigate('?name=Tina')
      expect(effectSpy).toHaveBeenCalledTimes(3)
      expect(effectSpy).toHaveBeenCalledWith('Tina', undefined)
      navigate('?name=Tina&gender=female')
      expect(searchParams.gender).toBe('female')
    })
  })
})
