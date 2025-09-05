export type DelegationEventListener = (e: DelegationEvent) => void
export type DelegationEvent = Event & {
  propagationStopped?: boolean
}

const delegationEvents = new Set<string>()
const passiveEvents = new Set(['touchmove', 'touchstart', 'wheel'])
const nonBubblingEvents = new Set([
  'abort',
  'blur',
  'canplay',
  'canplaythrough',
  'change',
  'durationchange',
  'emptied',
  'ended',
  'error',
  'focus',
  'invalid',
  'load',
  'loadeddata',
  'loadedmetadata',
  'loadstart',
  'mouseenter',
  'mouseleave',
  'pause',
  'play',
  'playing',
  'pointerenter',
  'pointerleave',
  'progress',
  'ratechange',
  'scroll',
  'seeked',
  'seeking',
  'stalled',
  'suspend',
  'timeupdate',
  'toggle',
  'volumechange',
  'waiting',
])
const {
  stopPropagation: originalStopPropagation,
  stopImmediatePropagation: originalStopImmediatePropagation,
} = Event.prototype
const preventDefault = () => {}

export function delegateEvents(events: string[]): void {
  for (let i = 0; i < events.length; ++i) {
    const event = events[i]
    if (delegationEvents.has(event)) continue
    const passive = passiveEvents.has(event)
    const capture = nonBubblingEvents.has(event)
    const options = { passive, capture }
    const eventKey = `$$${event}`
    const listener: DelegationEventListener = (e) => {
      const path = e.composedPath()
      const endIndex = path.length - 3
      const step = capture ? 1 : -1
      let startIndex = capture ? 0 : endIndex
      e.stopPropagation = () => {
        e.propagationStopped = true
        originalStopPropagation.call(e)
      }
      e.stopImmediatePropagation = () => {
        e.propagationStopped = true
        originalStopImmediatePropagation.call(e)
      }
      if (passive) e.preventDefault = preventDefault
      while (startIndex >= 0 && startIndex <= endIndex) {
        const node = path[startIndex]
        const handler = node[eventKey as keyof EventTarget]
        if (handler && !(node as HTMLInputElement).disabled) {
          ;(handler as DelegationEventListener).call(node, e)
          if (e.propagationStopped) break
        }
        startIndex += step
      }
    }
    delegationEvents.add(event)
    document.addEventListener(event, listener, options)
  }
}
