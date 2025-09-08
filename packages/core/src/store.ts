import { batch, useMemo, useSignal } from './signal'

export type Store<T> = T
export type SetStoreFunction<T> = (
  state: DeepPartial<T> | ((prevState: T) => DeepPartial<T>),
) => void
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}
type ObjectLike = Record<PropertyKey, any> | any[]

export function useStore<T extends ObjectLike>(
  state: T | Store<T>,
): [Store<T>, SetStoreFunction<T>] {
  let store: Store<T>
  let isArray = false
  let allowUpdates = false
  if (state !== null && typeof state === 'object') {
    isArray = Array.isArray(state)
    store = (isArray ? [] : {}) as Store<T>
    const keys = Reflect.ownKeys(state)
    for (let i = 0; i < keys.length; ++i) {
      const key = keys[i]
      if (isArray && key === 'length') continue
      const descriptor = Reflect.getOwnPropertyDescriptor(state, key)!
      if (isReadOnly(descriptor)) {
        defineProperty(store, key, {
          get: useMemo(descriptor.get!.bind(store)),
        })
      } else {
        const [getValue, setValue] = useSignal(Reflect.get(state, key))
        defineProperty(store, key, {
          get: getValue,
          set(newValue) {
            if (allowUpdates) setValue(() => newValue)
          },
        })
      }
    }
  } else {
    store = {} as Store<T>
  }
  return [
    store,
    (newState) => {
      batch(() => {
        if (typeof newState === 'function') {
          newState = newState(store)
        }
        if (newState !== null && typeof newState === 'object') {
          allowUpdates = true
          if (isArray && Array.isArray(newState)) {
            let i = 0
            while (i < store.length) {
              Reflect.set(store, i, newState[i++])
            }
            if (i > newState.length) {
              store.length = newState.length
            } else {
              while (i < newState.length) {
                const [getValue, setValue] = useSignal(newState[i])
                defineProperty(store, i++, {
                  get: getValue,
                  set(newValue) {
                    if (allowUpdates) setValue(() => newValue)
                  },
                })
              }
            }
          } else {
            const keys = Reflect.ownKeys(newState)
            for (let i = 0; i < keys.length; ++i) {
              const key = keys[i]
              if (isArray && key === 'length') continue
              const value = Reflect.get(newState, key)
              if (Reflect.has(store, key)) {
                Reflect.set(store, key, value)
                if (value === undefined) {
                  Reflect.deleteProperty(store, key)
                }
              } else if (value !== undefined) {
                const descriptor = Reflect.getOwnPropertyDescriptor(
                  newState,
                  key,
                )!
                if (isReadOnly(descriptor)) {
                  defineProperty(store, key, {
                    get: useMemo(descriptor.get!.bind(store)),
                  })
                } else {
                  const [getValue, setValue] = useSignal(value)
                  defineProperty(store, key, {
                    get: getValue,
                    set(newValue) {
                      if (allowUpdates) setValue(() => newValue)
                    },
                  })
                }
              }
            }
          }
          allowUpdates = false
        }
      })
    },
  ]
}

function isReadOnly(descriptor: PropertyDescriptor): boolean {
  return (
    typeof descriptor.get === 'function' && typeof descriptor.set !== 'function'
  )
}

function defineProperty(
  target: ObjectLike,
  key: PropertyKey,
  attributes: PropertyDescriptor,
): void {
  Reflect.defineProperty(target, key, {
    configurable: true,
    enumerable: true,
    ...attributes,
  })
}
