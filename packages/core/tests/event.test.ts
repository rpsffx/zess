import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  delegateEvents,
  type DelegationEvent,
  type DelegationEventListener,
} from '../src/event'

type DelegationTarget = HTMLElement & {
  $$click?: DelegationEventListener
  $$focus?: DelegationEventListener
  $$touchstart?: DelegationEventListener
}

describe('delegateEvents', () => {
  let target: DelegationTarget
  let parent: DelegationTarget
  beforeEach(() => {
    target = document.createElement('div')
    parent = document.createElement('div')
    parent.append(target)
    document.body.append(parent)
  })
  afterEach(() => {
    target.remove()
    parent.remove()
  })
  it('should delegate events to the target element', () => {
    const eventName = 'click'
    const handler = vi.fn()
    target[`$$${eventName}`] = handler
    delegateEvents([eventName])
    const event = new Event(eventName, { bubbles: true })
    target.dispatchEvent(event)
    expect(handler).toHaveBeenCalledWith(event)
  })
  it('should handle non-bubbling events with capture', () => {
    const eventName = 'focus'
    const handler = vi.fn()
    target[`$$${eventName}`] = handler
    delegateEvents([eventName])
    const event = new Event(eventName, { bubbles: false })
    target.dispatchEvent(event)
    expect(handler).toHaveBeenCalledWith(event)
  })
  it('should stop propagation when stopPropagation is called', () => {
    const eventName = 'click'
    const handler = vi.fn((e) => e.stopPropagation())
    target[`$$${eventName}`] = handler
    delegateEvents([eventName])
    const event = new Event(eventName, { bubbles: true }) as DelegationEvent
    target.dispatchEvent(event)
    expect(handler).toHaveBeenCalledWith(event)
    expect(event.propagationStopped).toBe(true)
  })
  it('should prevent default for passive events', () => {
    const eventName = 'touchstart'
    const handler = vi.fn((e) => e.preventDefault())
    target[`$$${eventName}`] = handler
    delegateEvents([eventName])
    const event = new Event(eventName, { bubbles: true })
    event.preventDefault = vi.fn()
    target.dispatchEvent(event)
    expect(handler).toHaveBeenCalledWith(event)
    expect(event.defaultPrevented).toBe(false)
  })
  it('should remove event listener if no handler is found', () => {
    const eventName = 'click'
    const handler = vi.fn()
    target[`$$${eventName}`] = handler
    delegateEvents([eventName])
    delete target[`$$${eventName}`]
    const event = new Event(eventName, { bubbles: true })
    target.dispatchEvent(event)
    expect(handler).not.toHaveBeenCalled()
  })
  it('should bind this to the target element in the handler', () => {
    let context: DelegationTarget | undefined
    const eventName = 'click'
    const handler = function (this: DelegationTarget) {
      context = this
    }
    target[`$$${eventName}`] = handler
    delegateEvents([eventName])
    const event = new Event(eventName, { bubbles: true })
    target.dispatchEvent(event)
    expect(context).toBe(target)
  })
})
