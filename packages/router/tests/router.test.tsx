import { createRoot, render, useRenderEffect } from '@zessjs/core'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  Link,
  Route,
  Router,
  useBeforeLeave,
  useLocation,
  useNavigate,
  useSearchParams,
} from '../src/router'

function waitFor(
  type: 'hashchange' | 'popstate',
): Promise<HashChangeEvent | PopStateEvent> {
  return new Promise((resolve) =>
    globalThis.addEventListener(type, resolve, { once: true }),
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
    it('should navigate to absolute path without basePath when relative prop is false', () => {
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
    it('should not scroll to top when using noScroll prop', () => {
      container.style.height = '2000px'
      container.style.overflow = 'auto'
      dispose = render(
        () => (
          <Router
            root={(props) => (
              <>
                <Link to="/test" noScroll />
                {props.children}
              </>
            )}
          >
            <Route path="/test" component={() => <div>Test</div>} />
          </Router>
        ),
        container,
      )
      expect(window.scrollY).toBe(0)
      window.scrollTo(0, 1000)
      expect(window.scrollY).toBe(1000)
      ;(container.firstElementChild as HTMLAnchorElement).click()
      expect(window.scrollY).toBe(1000)
      expect(container.textContent).toBe('Test')
      container.style.height = container.style.overflow = ''
    })
    it('should pass state to history when using state prop', () => {
      const testState = { from: 'link-test', timestamp: Date.now() }
      dispose = render(
        () => (
          <Router
            root={(props) => (
              <>
                <Link to="/test" state={testState} />
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
      expect(history.state).toEqual(testState)
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
    it('should apply activeClass when link is active', () => {
      dispose = render(
        () => (
          <Router
            root={(props) => (
              <>
                <Link to="/test" activeClass="active-link" />
                {props.children}
              </>
            )}
          >
            <Route path="/test" component={() => <div>Test</div>} />
          </Router>
        ),
        container,
      )
      const link = container.firstElementChild as HTMLAnchorElement
      expect(link.classList.contains('active-link')).toBe(false)
      link.click()
      expect(link.classList.contains('active-link')).toBe(true)
    })
    it('should apply activeClass only on exact path match when end prop is true', () => {
      dispose = render(
        () => (
          <Router
            root={(props) => (
              <>
                <Link to="/parent" activeClass="active" />
                <Link to="/parent" end activeClass="active-end" />
                <Link to="/parent/child" activeClass="active-child" />
                {props.children}
              </>
            )}
          >
            <Route path="/parent" component={() => <div>Parent</div>} />
            <Route path="/parent/child" component={() => <div>Child</div>} />
          </Router>
        ),
        container,
      )
      const { children } = container
      ;(children[0] as HTMLAnchorElement).click()
      expect(children[0].classList.contains('active')).toBe(true)
      expect(children[1].classList.contains('active-end')).toBe(true)
      expect(children[2].classList.contains('active-child')).toBe(false)
      ;(children[2] as HTMLAnchorElement).click()
      expect(children[0].classList.contains('active')).toBe(true)
      expect(children[1].classList.contains('active-end')).toBe(false)
      expect(children[2].classList.contains('active-child')).toBe(true)
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
      expect(location.hash).toBe('')
      expect(container.textContent).toBe('')
    })
    it('should not scroll to top when noScroll option is true', () => {
      let navigate: ReturnType<typeof useNavigate>
      container.style.height = '2000px'
      container.style.overflow = 'auto'
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
      window.scrollTo(0, 1000)
      navigate!('/page1')
      expect(container.textContent).toBe('Page 1')
      expect(window.scrollY).toBe(0)
      window.scrollTo(0, 1000)
      navigate!('/page2', { noScroll: true })
      expect(container.textContent).toBe('Page 2')
      expect(window.scrollY).toBe(1000)
      container.style.height = container.style.overflow = ''
    })
    it('should pass state to history when using state option', () => {
      let navigate: ReturnType<typeof useNavigate>
      const testState = { from: 'navigate-test', data: { id: 123 } }
      dispose = render(
        () => (
          <Router
            root={(props) => {
              navigate = useNavigate()
              return props.children
            }}
          >
            <Route path="/test" component={() => <div>Test</div>} />
          </Router>
        ),
        container,
      )
      navigate!('/test', { state: testState })
      expect(location.hash).toBe('#/test')
      expect(container.textContent).toBe('Test')
      expect(history.state).toEqual(testState)
    })
  })
  describe('useSearchParams hook', () => {
    it('should update searchParams when setSearchParams is called', () => {
      const effectSpy = vi.fn()
      const navigate = useNavigate()
      const testState = { from: 'search-test' }
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
      setSearchParams({ name: 'Eric' })
      expect(location.search).toBe('?name=Eric&age=20')
      expect(effectSpy).toHaveBeenCalledTimes(2)
      expect(effectSpy).toHaveBeenCalledWith('Eric', '20')
      setSearchParams({ name: 'Henry' }, { replace: true })
      history.back()
      expect(location.search).toBe('?name=Henry&age=20')
      expect(effectSpy).toHaveBeenCalledTimes(3)
      expect(effectSpy).toHaveBeenCalledWith('Henry', '20')
      setSearchParams({ gender: 'male' }, { state: testState })
      expect(location.search).toBe('?gender=male&name=Henry&age=20')
      expect(searchParams.gender).toBe('male')
      expect(history.state).toEqual(testState)
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
  describe('useBeforeLeave hook', () => {
    it('should prevent navigation when before leave listener calls preventDefault', () => {
      let preventNavigation = false
      let navigate: ReturnType<typeof useNavigate>
      dispose = render(
        () => (
          <Router
            root={(props) => {
              navigate = useNavigate()
              return props.children
            }}
          >
            <Route
              path="/home"
              component={() => {
                useBeforeLeave((event) => {
                  if (preventNavigation) {
                    event.preventDefault()
                  }
                })
                return <div>Home Page</div>
              }}
            />
            <Route path="/about" component={() => <div>About Page</div>} />
          </Router>
        ),
        container,
      )
      navigate!('/home')
      expect(container.textContent).toBe('Home Page')
      preventNavigation = true
      navigate!('/about')
      expect(container.textContent).toBe('Home Page')
      expect(location.hash).toBe('#/home')
      preventNavigation = false
      navigate!('/about')
      expect(container.textContent).toBe('About Page')
      expect(location.hash).toBe('#/about')
    })
    it('should allow retry navigation with force parameter', () => {
      let navigate: ReturnType<typeof useNavigate>
      let blockCount = 0
      dispose = render(
        () => (
          <Router
            root={(props) => {
              navigate = useNavigate()
              return props.children
            }}
          >
            <Route
              path="/page1"
              component={() => {
                useBeforeLeave((event) => {
                  if (blockCount++ < 2) {
                    event.preventDefault()
                    event.retry(blockCount === 2)
                  }
                })
                return <div>Page 1</div>
              }}
            />
            <Route path="/page2" component={() => <div>Page 2</div>} />
          </Router>
        ),
        container,
      )
      navigate!('/page1')
      expect(container.textContent).toBe('Page 1')
      navigate!('/page2')
      expect(container.textContent).toBe('Page 2')
      expect(location.hash).toBe('#/page2')
      expect(blockCount).toBe(2)
    })
    it('should only trigger guards for matching routes', () => {
      const guardSpy1 = vi.fn()
      const guardSpy2 = vi.fn()
      let navigate: ReturnType<typeof useNavigate>
      dispose = render(
        () => (
          <Router
            root={(props) => {
              navigate = useNavigate()
              return props.children
            }}
          >
            <Route
              path="/parent"
              component={(props) => {
                useBeforeLeave(guardSpy1)
                return <div>Parent{props.children}</div>
              }}
            >
              <Route
                path="/child"
                component={() => {
                  useBeforeLeave(guardSpy2)
                  return <div>Child</div>
                }}
              />
            </Route>
            <Route path="/other" component={() => <div>Other</div>} />
          </Router>
        ),
        container,
      )
      navigate!('/parent/child')
      expect(container.textContent).toBe('ParentChild')
      navigate!('/other')
      expect(guardSpy1).toHaveBeenCalledTimes(1)
      expect(guardSpy2).toHaveBeenCalledTimes(1)
      guardSpy1.mockClear()
      guardSpy2.mockClear()
      navigate!('/parent/child')
      navigate!('/parent/other-child')
      expect(guardSpy1).toHaveBeenCalledTimes(0)
      expect(guardSpy2).toHaveBeenCalledTimes(1)
    })
    it('should pass correct event data to before leave listener', () => {
      let capturedEvent
      let navigate: ReturnType<typeof useNavigate>
      dispose = render(
        () => (
          <Router
            root={(props) => {
              navigate = useNavigate()
              return props.children
            }}
          >
            <Route
              path="/source"
              component={() => {
                useBeforeLeave((event) => {
                  capturedEvent = {
                    to: event.to,
                    from: event.from,
                    options: event.options,
                    defaultPrevented: event.defaultPrevented,
                  }
                  event.preventDefault()
                })
                return <div>Source Page</div>
              }}
            />
            <Route path="/target" component={() => <div>Target Page</div>} />
          </Router>
        ),
        container,
      )
      navigate!('/source')
      expect(container.textContent).toBe('Source Page')
      navigate!('/target', { replace: true, noScroll: true })
      expect(capturedEvent).toEqual({
        to: '/target',
        from: '/source',
        options: { replace: true, noScroll: true, state: null },
        defaultPrevented: false,
      })
      expect(container.textContent).toBe('Source Page')
      expect(capturedEvent!.defaultPrevented).toBe(false)
    })
    it('should handle multiple before leave listeners', () => {
      const listener1 = vi.fn()
      const listener2 = vi.fn()
      let navigate: ReturnType<typeof useNavigate>
      dispose = render(
        () => (
          <Router
            root={(props) => {
              navigate = useNavigate()
              return props.children
            }}
          >
            <Route
              path="/multi"
              component={() => {
                useBeforeLeave(listener1)
                useBeforeLeave(listener2)
                return <div>Multi Guard Page</div>
              }}
            />
            <Route path="/next" component={() => <div>Next Page</div>} />
          </Router>
        ),
        container,
      )
      navigate!('/multi')
      expect(container.textContent).toBe('Multi Guard Page')
      navigate!('/next')
      expect(listener1).toHaveBeenCalledTimes(1)
      expect(listener2).toHaveBeenCalledTimes(1)
      const event1 = listener1.mock.calls[0][0]
      const event2 = listener2.mock.calls[0][0]
      expect(event1.to).toBe('/next')
      expect(event2.to).toBe('/next')
      expect(event1.from).toBe('/multi')
      expect(event2.from).toBe('/multi')
    })
    it('should cleanup before leave listeners when component unmounts', () => {
      const guardSpy = vi.fn()
      let navigate: ReturnType<typeof useNavigate>
      dispose = render(
        () => (
          <Router
            root={(props) => {
              navigate = useNavigate()
              return props.children
            }}
          >
            <Route
              path="/guard"
              component={() => {
                useBeforeLeave(guardSpy)
                return <div>Guarded Page</div>
              }}
            />
            <Route path="/second" component={() => <div>Second Page</div>} />
            <Route path="/third" component={() => <div>Third Page</div>} />
          </Router>
        ),
        container,
      )
      navigate!('/guard')
      expect(container.textContent).toContain('Guarded Page')
      navigate!('/second')
      expect(guardSpy).toHaveBeenCalledTimes(1)
      expect(container.textContent).toContain('Second Page')
      navigate!('/third')
      expect(guardSpy).toHaveBeenCalledTimes(1)
      expect(container.textContent).toContain('Third Page')
      navigate!('/guard')
      navigate!('/second')
      expect(guardSpy).toHaveBeenCalledTimes(2)
    })
  })
  describe('useLocation hook', () => {
    it('should detect hash changes in hash mode', () => {
      let location: ReturnType<typeof useLocation>
      let navigate: ReturnType<typeof useNavigate>
      dispose = render(
        () => (
          <Router
            mode="hash"
            root={(props) => {
              location = useLocation()
              navigate = useNavigate()
              return props.children
            }}
          >
            <Route path="/test" component={() => <div>Test</div>} />
          </Router>
        ),
        container,
      )
      expect(location!.hash).toBe('')
      navigate!('/test')
      expect(location!.hash).toBe('#/test')
      expect(container.textContent).toBe('Test')
    })
    it('should detect pathname changes in history mode', () => {
      let location: ReturnType<typeof useLocation>
      let navigate: ReturnType<typeof useNavigate>
      dispose = render(
        () => (
          <Router
            mode="history"
            root={(props) => {
              location = useLocation()
              navigate = useNavigate()
              return props.children
            }}
          >
            <Route path="/test" component={() => <div>Test</div>} />
          </Router>
        ),
        container,
      )
      expect(location!.pathname).toBe('/')
      navigate!('/test')
      expect(location!.pathname).toBe('/test')
      expect(container.textContent).toBe('Test')
    })
    it('should detect search, state and query changes using navigate', () => {
      const navigate = useNavigate()
      const location = useLocation()
      expect(location.search).toBe('')
      expect(location.state).toBeNull()
      expect(location.query).toEqual({})
      navigate('/?name=test', { state: { initial: true } })
      expect(location.search).toBe('?name=test')
      expect(location.state).toEqual({ initial: true })
      expect(location.query).toEqual({ name: 'test' })
      navigate('/?filter=active&filter=important&id=123')
      expect(location.search).toBe('?filter=active&filter=important&id=123')
      expect(location.query.filter).toEqual(['active', 'important'])
      expect(location.query.id).toBe('123')
    })
  })
})
