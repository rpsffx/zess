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
} from '@zessjs/core'

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
type RouterRegistry = {
  hash?: RouterContext
  history?: RouterContext
}
type RouterContext = {
  path: string
  mode: RouteMode
  count: number
  event: 'hashchange' | 'popstate'
}
type RouteGuard = {
  listener: RouteGuardListener
  routeContext: RouteContext
}
type RouteGuardEvent = {
  to: string
  from: string
  options: NavigateOptions
  defaultPrevented: boolean
  preventDefault: () => void
  retry: (force?: boolean) => void
}
type NavigateOptions = SearchParamsOptions & {
  relative?: boolean
  noScroll?: boolean
}
type SearchParamsOptions = {
  replace?: boolean
  state?: any
}
type Location = {
  pathname: string
  search: string
  hash: string
  state: any
  query: SearchParams
}
type RouteMode = 'hash' | 'history'
type RouteGuardListener = (event: RouteGuardEvent) => void
type RouteComponent = Component<{ children?: JSX.Element }>
type SearchParams = Record<string, string | string[]>

const routerRegistry: RouterRegistry = {}
const hashRouteGuards = new Set<RouteGuard>()
const historyRouteGuards = new Set<RouteGuard>()
let locationStore: [Location, SetStoreFunction<Location>]
let searchParamsStore: [SearchParams, SetStoreFunction<SearchParams>]

export function Router(props: RouterProps): JSX.Element {
  if (getRouterContext()) return
  const Root = props.root
  const context = createRouterContext(props.mode)
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
  onCleanup(listenRouteUpdate(context))
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
    navigate(
      to(),
      isHashMode,
      props.relative,
      props.replace,
      props.noScroll,
      props.state,
      routerContext?.path,
    )
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
      options?.relative,
      options?.replace,
      options?.noScroll,
      options?.state,
      routerContext?.path,
    )
  }
}

export function useSearchParams(): [SearchParams, typeof setSearchParams] {
  searchParamsStore ??= useStore(getSearchParams())
  return [searchParamsStore[0], setSearchParams]
}

export function useBeforeLeave(listener: RouteGuardListener): void {
  const routeContext = getRouteContext()
  if (!routeContext) return
  const routeGuards = getRouteGuards(getRouterContext()!.mode === 'hash')
  const routeGuard: RouteGuard = { listener, routeContext }
  routeGuards.add(routeGuard)
  onCleanup(() => routeGuards.delete(routeGuard))
}

export function useLocation(): Location {
  locationStore ??= useStore({ ...getLocation(), query: useSearchParams()[0] })
  return locationStore[0]
}

function getRouterContext(): RouterContext | undefined {
  for (let context, owner = getOwner(); owner; owner = owner.owner) {
    if ((context = (owner as RouteOwner).routerContext)) return context
  }
}

function getRouteContext(): RouteContext | undefined {
  for (let context, owner = getOwner(); owner; owner = owner.owner) {
    if ((context = (owner as RouteOwner).routeContext)) return context
  }
}

function setRouterContext(routerContext: RouterContext): void {
  ;(getOwner() as RouteOwner).routerContext = routerContext
}

function setRouteContext(routeContext: RouteContext): void {
  ;(getOwner() as RouteOwner).routeContext = routeContext
}

function createRouterContext(mode: RouteMode = 'hash'): RouterContext {
  if (!routerRegistry[mode]) {
    const isHashMode = mode === 'hash'
    const event = isHashMode ? 'hashchange' : 'popstate'
    if (!routerRegistry[isHashMode ? 'history' : 'hash']) updateRoute()
    const location = useLocation()
    const currentPath = useMemo(() => {
      const path = isHashMode ? location.hash.slice(1) : location.pathname
      return path.length > 1 ? decodeURIComponent(path) : '/'
    })
    routerRegistry[mode] = {
      mode,
      event,
      count: 0,
      get path() {
        return currentPath()
      },
    }
  }
  return routerRegistry[mode]
}

function getRouteNodes(childRoute: JSX.Element): RouteNode[] {
  if (childRoute == null) return []
  if (typeof childRoute === 'function' && !(childRoute as any).length) {
    return getRouteNodes((childRoute as () => JSX.Element)())
  }
  if (Array.isArray(childRoute)) return childRoute.flatMap(getRouteNodes)
  return [childRoute as unknown as RouteNode]
}

function listenRouteUpdate(routerContext: RouterContext): () => void {
  if (!routerContext.count++) {
    globalThis.addEventListener(routerContext.event, updateRoute)
  }
  return () => {
    if (!--routerContext.count) {
      globalThis.removeEventListener(routerContext.event, updateRoute)
      routerRegistry[routerContext.mode] = undefined
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
  let altPath = location[isHashMode ? 'pathname' : 'hash']
  if (altPath.length > 1) altPath = decodeURIComponent(altPath)
  if (routeContext && relative) {
    parsedPath = joinPaths(routeContext.resolvedPath, parsedPath)
  }
  if (isHashMode) {
    const index = parsedPath.indexOf('?')
    const search = index === -1 ? '' : parsedPath.slice(index)
    return `${altPath}${search}#${parsedPath}`
  }
  return `${parsedPath}${altPath}`
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

function navigate(
  href: string,
  isHashMode: boolean,
  relative?: boolean,
  replace?: boolean,
  noScroll?: boolean,
  state: any = null,
  from = '/',
  skipGuards?: boolean,
): void {
  const routeGuards = getRouteGuards(isHashMode)
  if (routeGuards.size && !skipGuards) {
    const options = { relative, replace, noScroll, state }
    const event: RouteGuardEvent = {
      to: getFullPath(href),
      from,
      options,
      defaultPrevented: false,
      preventDefault() {
        event.defaultPrevented = true
      },
      retry(force) {
        navigate(
          href,
          isHashMode,
          options.relative,
          options.replace,
          options.noScroll,
          options.state,
          from,
          force,
        )
      },
    }
    for (const { routeContext, listener } of routeGuards) {
      if (!matchPath(routeContext.patternPath, event.to)) listener(event)
    }
    if (event.defaultPrevented) return
  }
  history[replace ? 'replaceState' : 'pushState'](state, '', href)
  updateRoute()
  if (!noScroll) window.scrollTo(0, 0)
}

function updateRoute(): void {
  locationStore?.[1](getLocation())
  searchParamsStore?.[1]((prevSearchParams) => {
    const searchParams = getSearchParams()
    const keys = Object.keys(prevSearchParams)
    for (let i = 0; i < keys.length; ++i) {
      searchParams[keys[i]] ??= undefined!
    }
    return searchParams
  })
}

function getSearchParams(): SearchParams {
  const searchParams: SearchParams = {}
  forEachSearchParam((key, value) =>
    appendSearchParam(searchParams, key, value),
  )
  return searchParams
}

function setSearchParams(
  params: Record<string, any>,
  options?: SearchParamsOptions,
): void {
  const keys = Object.keys(params)
  if (!keys.length) return
  let search = ''
  const state = options?.state ?? null
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
  forEachSearchParam((key, value) => {
    if (!(key in searchParams)) {
      let param = key
      if (value) param += `=${value}`
      search += `${search ? '&' : ''}${param}`
    }
  })
  search &&= `?${search}`
  history[options?.replace ? 'replaceState' : 'pushState'](
    state,
    '',
    `${location.pathname}${search}${location.hash}`,
  )
  locationStore?.[1]({ search, state })
  searchParamsStore[1](searchParams)
}

function forEachSearchParam(fn: (key: string, value: string) => void): void {
  let { search } = location
  if (search.length <= 1) return
  let key = ''
  let value = ''
  search = decodeURIComponent(search)
  for (let i = 1; i < search.length; ++i) {
    const char = search[i]
    if (char === '=') {
      key = value
      value = ''
      continue
    }
    if (char === '&') {
      fn(key, value)
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
    fn(key, value)
  }
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

function getRouteGuards(isHashMode: boolean): Set<RouteGuard> {
  return isHashMode ? hashRouteGuards : historyRouteGuards
}

function getLocation(): Omit<Location, 'query'> {
  return {
    pathname: location.pathname,
    search: location.search,
    hash: location.hash,
    state: history.state,
  }
}
