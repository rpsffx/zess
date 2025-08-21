import { indexArray, mapArray } from './array'
import {
  catchError,
  onCleanup,
  untrack,
  useMemo,
  useSignal,
  type Getter,
  type Setter,
} from './signal'

type MatchedCondition = readonly [number, Getter<unknown>, MatchProps<unknown>]
type ShowProps<T> = Fallback & MatchProps<T>
type SwitchProps = Fallback & Children
type MatchProps<T> = {
  when?: T | false | null
  keyed?: boolean
  children: JSX.Element | ((item: ResolvedParameter<T>) => JSX.Element)
}
type ErrorBoundaryProps = Children & {
  fallback: JSX.Element | ((error: any, reset: () => void) => JSX.Element)
}
type ForProps<T extends readonly any[], U> = ListProps<T> & {
  children: (item: T[number], index: Getter<number>) => U
}
type IndexProps<T extends readonly any[], U> = ListProps<T> & {
  children: (item: Getter<T[number]>, index: number) => U
}
type ListProps<T> = Fallback & { each?: T | false | null }
type Fallback = { fallback?: JSX.Element }
type Children = { children: JSX.Element }
type ResolvedParameter<T> =
  T extends Getter<infer R>
    ? ResolvedParameter<R>
    : T extends false | null | undefined
      ? never
      : T

let currentErrors: Set<Setter<any>> | undefined
const eq = <T>(a: T, b: T) => Boolean(a) === Boolean(b)

export function For<T extends readonly any[], U extends JSX.Element>(
  props: ForProps<T, U>,
): JSX.Element {
  return useMemo(
    mapArray(
      () => props.each,
      props.children,
      'fallback' in props ? () => props.fallback : undefined,
    ),
  ) as unknown as JSX.Element
}

export function Index<T extends readonly any[], U extends JSX.Element>(
  props: IndexProps<T, U>,
): JSX.Element {
  return useMemo(
    indexArray(
      () => props.each,
      props.children,
      'fallback' in props ? () => props.fallback : undefined,
    ),
  ) as unknown as JSX.Element
}

export function Match<T>(props: MatchProps<T>): JSX.Element {
  return props as unknown as JSX.Element
}

export function Show<T>(props: ShowProps<T>): JSX.Element {
  const keyed = props.keyed
  const when = useMemo<T | boolean | null | undefined>(() => props.when)
  const condition = keyed ? when : useMemo(when, undefined, eq)
  return useMemo(() => {
    const value = condition()
    if (!value) return props.fallback
    const child = props.children
    return typeof child === 'function' && child.length
      ? untrack(() =>
          child(
            keyed
              ? (value as any)
              : () => {
                  if (untrack(condition)) return when()
                  throw new Error('Stale value access in <Show>')
                },
          ),
        )
      : child
  }) as unknown as JSX.Element
}

export function Switch(props: SwitchProps): JSX.Element {
  const children = useMemo(() => props.children)
  const resolvedChildren = useMemo(() => {
    const flattenedChildren = []
    const stack = [children()]
    do {
      const child = stack.pop()
      if (typeof child === 'function' && !(child as Getter<any>).length) {
        stack.push((child as Getter<any>)())
        continue
      }
      if (Array.isArray(child)) {
        for (let i = child.length - 1; i >= 0; --i) {
          stack.push(child[i])
        }
        continue
      }
      flattenedChildren.push(child)
    } while (stack.length)
    return flattenedChildren
  })
  const switchFn = useMemo(() => {
    const matches = resolvedChildren() as unknown as MatchProps<unknown>[]
    let fn: Getter<MatchedCondition | null> = () => null
    for (let i = 0; i < matches.length; ++i) {
      const index = i
      const prevFn = fn
      const matchProps = matches[i]
      const when = useMemo(() => (prevFn() ? null : matchProps.when))
      const condition = matchProps.keyed ? when : useMemo(when, undefined, eq)
      fn = () => prevFn() ?? (condition() ? [index, when, matchProps] : null)
    }
    return fn
  })
  return useMemo(() => {
    const selection = switchFn()()
    if (!selection) return props.fallback
    const [index, condition, matchProps] = selection
    const child = matchProps.children
    return typeof child === 'function' && child.length
      ? untrack(() =>
          child(
            matchProps.keyed
              ? condition()
              : () => {
                  if (untrack(switchFn)()?.[0] === index) return condition()
                  throw new Error('Stale value access in <Match>')
                },
          ),
        )
      : child
  }) as unknown as JSX.Element
}

export function ErrorBoundary(props: ErrorBoundaryProps): JSX.Element {
  const [errored, setErrored] = useSignal()
  if (currentErrors) {
    currentErrors.add(setErrored)
  } else {
    currentErrors = new Set([setErrored])
  }
  onCleanup(() => currentErrors!.delete(setErrored))
  return useMemo(() => {
    const error = errored()
    if (error) {
      const fallback = props.fallback
      return typeof fallback === 'function' && fallback.length
        ? untrack(() => fallback(error, () => setErrored(undefined)))
        : fallback
    }
    return catchError(() => props.children, setErrored)
  }) as unknown as JSX.Element
}
