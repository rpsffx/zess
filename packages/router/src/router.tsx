import {
  getOwner,
  on,
  onCleanup,
  untrack,
  useMemo,
  useRenderEffect,
  useStore,
  type Component,
  type Owner,
  type SetStoreFunction,
} from '@zess/core'

type RouterProps = {
  mode?: RouteMode
  root?: RouteComponent
  children?: JSX.Element
}
type RouteProps = {
  path: string
  sensitive?: boolean
  component?: RouteComponent
  children?: JSX.Element
}
type LinkProps = NavigateOptions & {
  to: string
  end?: boolean
  style?: JSX.CSSProperties | string | null
  class?: JSX.ClassList | string | null
  activeClass?: string | null
  children?: JSX.Element
}
type RouteOwner = Owner & {
  routeContext?: RouteContext
  routerContext?: RouterContext
}
type RouteNode = {
  isMatched: boolean
  component: JSX.Element
}
type RouteContext = {
  isMatched: boolean
  match: JSX.Element
  patternPath: string
  resolvedPath: string
}
type RouterContext = {
  path: string
  mode: RouteMode
}
type NavigateOptions = {
  relative?: boolean
  replace?: boolean
  noScroll?: boolean
}
type RouteMode = 'hash' | 'history'
type RouteEventListener = (path: string) => void
type RouteComponent = Component<{ children?: JSX.Element }>
type SearchParams = Record<string, string | string[]>

let searchParamsStore: [SearchParams, SetStoreFunction<SearchParams>]
const hashchangeListeners = new Set<RouteEventListener>()
const popstateListeners = new Set<RouteEventListener>()

export function Router(props: RouterProps): JSX.Element {
  if (getRouterContext()) return
  const Root = props.root
  const mode = props.mode ?? 'hash'
  const isHashMode = mode === 'hash'
  const [context, setContext] = useStore<RouterContext>({
    mode,
    path: getCurrentPath(isHashMode),
  })
  const childRoutes = useMemo(() => {
    setRouterContext(context)
    return props.children
  })
  const routeNodes = useMemo(() => getRouteNodes(childRoutes()))
  const match = useMemo(() => {
    for (const routeNode of routeNodes()) {
      if (routeNode.isMatched) return routeNode.component
    }
  }) as unknown as JSX.Element
  if (isHashMode && !location.hash) history.replaceState(null, '', '#/')
  onCleanup(addRouteEvent((path) => setContext({ path }), isHashMode))
  if (!Root) return match
  return useMemo(() =>
    untrack(() => {
      setRouterContext(context)
      return <Root>{match}</Root>
    }),
  )()
}

export function Route(props: RouteProps): JSX.Element {
  const routerContext = getRouterContext()
  if (!routerContext) return
  const routeContext = getRouteContext()
  const [context, setContext] = useStore<RouteContext>({
    isMatched: false,
    match: null,
    get patternPath() {
      return getFullPath(
        props.path,
        routeContext?.patternPath,
        true,
        !props.sensitive,
      )
    },
    get resolvedPath() {
      return getFullPath(props.path, routeContext?.resolvedPath)
    },
  })
  const childRoutes = useMemo(() => {
    setRouterContext(routerContext)
    setRouteContext(context)
    return props.children
  })
  const routeNodes = useMemo(() => getRouteNodes(childRoutes()))
  useRenderEffect(() => {
    const isWildcard = props.path === '*'
    const patternPath = context.patternPath
    const currentPath = routerContext.path
    for (const routeNode of routeNodes()) {
      if (routeNode.isMatched) {
        return setContext({ isMatched: true, match: routeNode.component })
      }
    }
    setContext({
      isMatched: isWildcard || matchPath(patternPath, currentPath, true),
      match: null,
    })
  })
  const match = useMemo(() => context.match) as unknown as JSX.Element
  const routeComponent = useMemo(
    on(
      () => context.isMatched,
      (isMatched) => {
        if (!isMatched) return
        if (!props.component) return match
        setRouterContext(routerContext)
        setRouteContext(context)
        return <props.component>{match}</props.component>
      },
    ),
  )
  return {
    get isMatched() {
      return context.isMatched
    },
    get component() {
      return routeComponent()
    },
  } as unknown as JSX.Element
}

export function Link(props: LinkProps): JSX.Element {
  const routeContext = getRouteContext()
  const routerContext = getRouterContext()
  const isHashMode = !routerContext || routerContext.mode === 'hash'
  const to = useMemo(() =>
    getParsedPath(props.to, routeContext, isHashMode, props.relative),
  )
  const isActive = useMemo(() => {
    if (!routerContext) return false
    return matchPath(getFullPath(to()), routerContext.path, props.end, true)
  })
  const classList = useMemo(() => {
    const isActiveLink = isActive()
    const baseClass = props.class
    const activeClass = props.activeClass
    if (!activeClass) return baseClass
    if (typeof baseClass === 'string') {
      return isActiveLink ? `${baseClass} ${activeClass}` : baseClass
    }
    return { ...baseClass, [activeClass]: isActiveLink }
  })
  const handleNavigate = (event: MouseEvent) => {
    event.preventDefault()
    navigate(to(), isHashMode, props.replace, props.noScroll)
  }
  return (
    <a
      href={to()}
      onClick={handleNavigate}
      style={props.style}
      class={classList()}
    >
      {props.children}
    </a>
  )
}

export function useNavigate(): (
  href: string,
  options?: NavigateOptions,
) => void {
  const routeContext = getRouteContext()
  const routerContext = getRouterContext()
  const isHashMode = !routerContext || routerContext.mode === 'hash'
  return (href, options) => {
    navigate(
      getParsedPath(href, routeContext, isHashMode, options?.relative),
      isHashMode,
      options?.replace,
      options?.noScroll,
    )
  }
}

export function useSearchParams(): [SearchParams, typeof setSearchParams] {
  searchParamsStore ??= useStore(getSearchParams())
  return [searchParamsStore[0], setSearchParams]
}

function getRouterContext(): RouterContext | undefined {
  return getContext('routerContext')
}

function getRouteContext(): RouteContext | undefined {
  return getContext('routeContext')
}

function setRouterContext(routerContext: RouterContext): void {
  ;(getOwner() as RouteOwner).routerContext = routerContext
}

function setRouteContext(routeContext: RouteContext): void {
  ;(getOwner() as RouteOwner).routeContext = routeContext
}

function getContext<T extends 'routeContext' | 'routerContext'>(
  prop: T,
): RouteOwner[T] {
  for (let owner = getOwner(); owner; owner = owner.owner) {
    if (prop in owner) return (owner as RouteOwner)[prop]
  }
}

function navigate(
  href: string,
  isHashMode: boolean,
  replace?: boolean,
  noScroll?: boolean,
): void {
  history[replace ? 'replaceState' : 'pushState'](null, '', href)
  handleRouteEvent(isHashMode)
  if (!noScroll) window.scrollTo(0, 0)
}

function getCurrentPath(isHashMode: boolean): string {
  const { hash, pathname } = location
  const path = isHashMode ? hash.slice(1) : pathname
  return path ? decodeURIComponent(path) : '/'
}

function addRouteEvent(
  fn: RouteEventListener,
  isHashMode: boolean,
): () => void {
  const listeners = getRouteEventListeners(isHashMode)
  const event = isHashMode ? 'hashchange' : 'popstate'
  if (listeners.add(fn).size === 1) {
    window.addEventListener(event, routeEventListener)
  }
  return function () {
    listeners.delete(fn)
    if (!listeners.size) {
      window.removeEventListener(event, routeEventListener)
    }
  }
}

function getFullPath(
  path: string,
  basePath?: string,
  toRegexPattern?: boolean,
  ignoreCase?: boolean,
): string {
  path = formatPath(path, toRegexPattern, ignoreCase, true)
  return basePath ? joinPaths(basePath, path) : path
}

function matchPath(
  path: string,
  href: string,
  end?: boolean,
  ignoreCase?: boolean,
): boolean {
  return RegExp(`^${path}${end ? '$' : ''}`, ignoreCase ? 'i' : '').test(href)
}

function getParsedPath(
  path: string,
  routeContext?: RouteContext,
  isHashMode?: boolean,
  relative = true,
): string {
  let parsedPath = formatPath(path)
  const altPath = getCurrentPath(!isHashMode)
  if (routeContext && relative) {
    parsedPath = joinPaths(routeContext.resolvedPath, parsedPath)
  }
  if (isHashMode) {
    const index = parsedPath.indexOf('?')
    const search = index !== -1 ? parsedPath.slice(index) : ''
    return `${altPath}${search}#${parsedPath}`
  }
  return altPath === '/' ? parsedPath : `${parsedPath}#${altPath}`
}

function getSearchParams(): SearchParams {
  let { search } = location
  if (!search) return {}
  let key = ''
  let value = ''
  const searchParams: SearchParams = {}
  search = decodeURIComponent(search)
  for (let i = 1; i < search.length; ++i) {
    const char = search[i]
    if (char === '=') {
      key = value
      value = ''
      continue
    }
    if (char === '&') {
      appendSearchParam(searchParams, key, value)
      key = value = ''
      continue
    }
    value += char
  }
  if (key || value) {
    if (!key) {
      key = value
      value = ''
    }
    appendSearchParam(searchParams, key, value)
  }
  return searchParams
}

function setSearchParams(params: Record<string, any>, replace?: boolean): void {
  let search = ''
  const keys = Object.keys(params)
  const searchParams: SearchParams = {}
  for (let i = 0; i < keys.length; ++i) {
    const key = keys[i]
    const value = params[key]
    if (value === '' || value == null) {
      searchParams[key] = undefined!
    } else if (Array.isArray(value)) {
      const values = []
      for (let j = 0; j < value.length; ++j) {
        if (value[j] != null && value[j] !== '') {
          values.push(value[j].toString())
          search += `${search ? '&' : ''}${key}=${value[j]}`
        }
      }
      searchParams[key] = values.length ? values : undefined!
    } else {
      searchParams[key] = value.toString()
      search += `${search ? '&' : ''}${key}=${value}`
    }
  }
  if (search) search = `?${search}`
  const href = `${location.pathname}${search}${location.hash}`
  history[replace ? 'replaceState' : 'pushState'](null, '', href)
  handleSearchParamsChange(searchParams)
}

function appendSearchParam(
  searchParams: SearchParams,
  key: string,
  value: string,
): void {
  const prevValue = searchParams[key]
  if (prevValue === undefined) {
    searchParams[key] = value
  } else if (typeof prevValue === 'string') {
    searchParams[key] = [prevValue, value]
  } else {
    prevValue.push(value)
  }
}

function routeEventListener({ type }: Event): void {
  handleRouteEvent(type === 'hashchange')
}

function handleRouteEvent(isHashMode: boolean): void {
  const currentPath = getCurrentPath(isHashMode)
  const listeners = getRouteEventListeners(isHashMode)
  for (const listener of listeners) listener(currentPath)
  handleSearchParamsChange(getSearchParams())
}

function handleSearchParamsChange(searchParams: SearchParams): void {
  searchParamsStore?.[1]((prevSearchParams) => {
    const keys = Object.keys(prevSearchParams)
    for (let i = 0; i < keys.length; ++i) {
      const key = keys[i]
      if (!(key in searchParams)) {
        searchParams[key] = undefined!
      }
    }
    return searchParams
  })
}

function getRouteEventListeners(isHashMode: boolean): Set<RouteEventListener> {
  return isHashMode ? hashchangeListeners : popstateListeners
}

function getRouteNodes(childRoute: JSX.Element): RouteNode[] {
  if (childRoute == null) return []
  if (typeof childRoute === 'function' && !(childRoute as any).length) {
    return getRouteNodes((childRoute as () => JSX.Element)())
  }
  if (Array.isArray(childRoute)) return childRoute.flatMap(getRouteNodes)
  return [childRoute as unknown as RouteNode]
}

function joinPaths(basePath: string, path: string): string {
  if (basePath === '/') return path || basePath
  if (path === '/') return basePath || path
  return `${basePath}${path}`
}

function formatPath(
  path: string,
  toRegexPattern?: boolean,
  ignoreCase?: boolean,
  stripSearch?: boolean,
): string {
  let formattedPath = ''
  let hasSlash = false
  let hasWildcard = false
  if (toRegexPattern) {
    stripSearch = true
  } else {
    ignoreCase = false
  }
  for (let i = 0; i < path.length; ++i) {
    const char = path[i]
    if (char === '#') continue
    if (char === '/') {
      hasSlash = true
      continue
    }
    if (char === '*') {
      if (toRegexPattern) {
        hasWildcard = hasSlash = true
      }
      continue
    }
    if (hasWildcard) {
      hasWildcard = false
      formattedPath += '/?.*'
    }
    if (char === '?') {
      if (!stripSearch) {
        formattedPath += path.slice(i)
      }
      break
    }
    if (hasSlash) {
      hasSlash = false
      formattedPath += '/'
    }
    if (ignoreCase) {
      const upperChar = char.toUpperCase()
      const lowerChar = char.toLowerCase()
      if (upperChar !== lowerChar) {
        formattedPath += `[${upperChar}${lowerChar}]`
        continue
      }
    }
    formattedPath += char
  }
  if (hasWildcard) formattedPath += '/?.*'
  if (!formattedPath.startsWith('/')) {
    formattedPath = `/${formattedPath}`
  }
  return formattedPath
}
