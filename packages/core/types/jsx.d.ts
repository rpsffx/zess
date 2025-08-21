/**
 * Based on JSX types from Surplus, Inferno and dom-expressions versions, modified for Zess.
 *
 * https://github.com/adamhaile/surplus/blob/master/index.d.ts
 * https://github.com/infernojs/inferno/blob/master/packages/inferno/src/core/types.ts
 * https://github.com/ryansolid/dom-expressions/blob/main/packages/dom-expressions/src/jsx.d.ts
 */
import type { PropertiesHyphen } from 'csstype'

declare global {
  namespace JSX {
    type Element =
      | Node
      | ArrayElement
      | (string & {})
      | string
      | number
      | boolean
      | null
      | undefined
    interface ArrayElement extends Array<Element> {}
    interface ElementClass {}
    interface ElementAttributesProperty {}
    interface ElementChildrenAttribute {
      children: {}
    }
    interface EventHandler<T, E extends Event> {
      (ev: E & { target: T; currentTarget: T }): void
    }
    interface DelegationEventHandler<T, E extends Event> {
      (
        ev: E & {
          target: T & Delegation<T, E>
          currentTarget: T & Delegation<T, E>
          propagationStopped?: boolean
        },
      ): void
    }
    interface Delegation<T, E extends Event> {
      [type: `$$${string}`]: DelegationEventHandler<T, E>
    }
    const SERIALIZABLE: unique symbol
    type ClassList = { [className: string]: boolean }
    interface SerializableAttributeValue {
      toString: () => string
      [SERIALIZABLE]: never
    }
    interface IntrinsicAttributes {
      ref?: unknown | ((el: unknown) => void) | null
    }
    interface CustomAttributes<T> {
      ref?: T | ((el: T) => void) | null
      className?: ClassList | string | null
    }
    interface CustomEventHandlersLowerCase<T> {
      onbeforecopy?: EventHandler<T, ClipboardEvent> | null
      onbeforecut?: EventHandler<T, ClipboardEvent> | null
      onbeforepaste?: EventHandler<T, ClipboardEvent> | null
      oncopy?: EventHandler<T, ClipboardEvent> | null
      oncut?: EventHandler<T, ClipboardEvent> | null
      onpaste?: EventHandler<T, ClipboardEvent> | null
      oncompositionend?: EventHandler<T, CompositionEvent> | null
      oncompositionstart?: EventHandler<T, CompositionEvent> | null
      oncompositionupdate?: EventHandler<T, CompositionEvent> | null
      onblur?: EventHandler<T, FocusEvent> | null
      onfocus?: EventHandler<T, FocusEvent> | null
      onchange?: EventHandler<T, Event> | null
      onformdata?: EventHandler<T, FormDataEvent> | null
      oninput?: EventHandler<T, InputEvent> | null
      oninvalid?: EventHandler<T, Event> | null
      onreset?: EventHandler<T, Event> | null
      onsearch?: EventHandler<T, Event> | null
      onselect?: EventHandler<T, Event> | null
      onsubmit?: EventHandler<T, Event> | null
      onkeydown?: EventHandler<T, KeyboardEvent> | null
      onkeypress?: EventHandler<T, KeyboardEvent> | null
      onkeyup?: EventHandler<T, KeyboardEvent> | null
      onabort?: EventHandler<T, Event> | null
      oncanplay?: EventHandler<T, Event> | null
      oncanplaythrough?: EventHandler<T, Event> | null
      ondurationchange?: EventHandler<T, Event> | null
      onemptied?: EventHandler<T, Event> | null
      onended?: EventHandler<T, Event> | null
      onloadeddata?: EventHandler<T, Event> | null
      onloadedmetadata?: EventHandler<T, Event> | null
      onloadstart?: EventHandler<T, Event> | null
      onpause?: EventHandler<T, Event> | null
      onplay?: EventHandler<T, Event> | null
      onplaying?: EventHandler<T, Event> | null
      onprogress?: EventHandler<T, Event> | null
      onratechange?: EventHandler<T, Event> | null
      onseeked?: EventHandler<T, Event> | null
      onseeking?: EventHandler<T, Event> | null
      onstalled?: EventHandler<T, Event> | null
      onsuspend?: EventHandler<T, Event> | null
      ontimeupdate?: EventHandler<T, Event> | null
      onvolumechange?: EventHandler<T, Event> | null
      onwaiting?: EventHandler<T, Event> | null
      onauxclick?: EventHandler<T, MouseEvent> | null
      onclick?: EventHandler<T, MouseEvent> | null
      oncontextmenu?: EventHandler<T, MouseEvent> | null
      ondblclick?: EventHandler<T, MouseEvent> | null
      onmousedown?: EventHandler<T, MouseEvent> | null
      onmouseenter?: EventHandler<T, MouseEvent> | null
      onmouseleave?: EventHandler<T, MouseEvent> | null
      onmousemove?: EventHandler<T, MouseEvent> | null
      onmouseout?: EventHandler<T, MouseEvent> | null
      onmouseover?: EventHandler<T, MouseEvent> | null
      onmouseup?: EventHandler<T, MouseEvent> | null
      onmousewheel?: EventHandler<T, WheelEvent> | null
      ondrag?: EventHandler<T, DragEvent> | null
      ondragend?: EventHandler<T, DragEvent> | null
      ondragenter?: EventHandler<T, DragEvent> | null
      ondragleave?: EventHandler<T, DragEvent> | null
      ondragover?: EventHandler<T, DragEvent> | null
      ondragstart?: EventHandler<T, DragEvent> | null
      ondrop?: EventHandler<T, DragEvent> | null
      ongotpointercapture?: EventHandler<T, PointerEvent> | null
      onlostpointercapture?: EventHandler<T, PointerEvent> | null
      onpointercancel?: EventHandler<T, PointerEvent> | null
      onpointerdown?: EventHandler<T, PointerEvent> | null
      onpointerenter?: EventHandler<T, PointerEvent> | null
      onpointerleave?: EventHandler<T, PointerEvent> | null
      onpointermove?: EventHandler<T, PointerEvent> | null
      onpointerout?: EventHandler<T, PointerEvent> | null
      onpointerover?: EventHandler<T, PointerEvent> | null
      onpointerrawupdate?: EventHandler<T, PointerEvent> | null
      onpointerup?: EventHandler<T, PointerEvent> | null
      ontouchcancel?: EventHandler<T, TouchEvent> | null
      ontouchend?: EventHandler<T, TouchEvent> | null
      ontouchmove?: EventHandler<T, TouchEvent> | null
      ontouchstart?: EventHandler<T, TouchEvent> | null
      onscroll?: EventHandler<T, UIEvent> | null
      onscrollend?: EventHandler<T, UIEvent> | null
      onscrollsnapchange?: EventHandler<T, UIEvent> | null
      onscrollsnapchanging?: EventHandler<T, UIEvent> | null
      onresize?: EventHandler<T, UIEvent> | null
      onanimationend?: EventHandler<T, AnimationEvent> | null
      onanimationiteration?: EventHandler<T, AnimationEvent> | null
      onanimationstart?: EventHandler<T, AnimationEvent> | null
      ontransitioncancel?: EventHandler<T, TransitionEvent> | null
      ontransitionend?: EventHandler<T, TransitionEvent> | null
      ontransitionrun?: EventHandler<T, TransitionEvent> | null
      ontransitionstart?: EventHandler<T, TransitionEvent> | null
      onfullscreenchange?: EventHandler<T, Event> | null
      onfullscreenerror?: EventHandler<T, Event> | null
      onwebkitfullscreenchange?: EventHandler<T, Event> | null
      onwebkitfullscreenerror?: EventHandler<T, Event> | null
      onbeforematch?: EventHandler<T, Event> | null
      onbeforetoggle?: EventHandler<T, Event> | null
      onbeforexrselect?: EventHandler<T, Event> | null
      oncancel?: EventHandler<T, Event> | null
      onclose?: EventHandler<T, Event> | null
      oncontentvisibilityautostatechange?: EventHandler<T, Event> | null
      oncuechange?: EventHandler<T, Event> | null
      onsecuritypolicyviolation?: EventHandler<
        T,
        SecurityPolicyViolationEvent
      > | null
      onslotchange?: EventHandler<T, Event> | null
      ontoggle?: EventHandler<T, Event> | null
      onselectionchange?: EventHandler<T, Event> | null
      onselectstart?: EventHandler<T, Event> | null
      onwebkitanimationend?: EventHandler<T, AnimationEvent> | null
      onwebkitanimationiteration?: EventHandler<T, AnimationEvent> | null
      onwebkitanimationstart?: EventHandler<T, AnimationEvent> | null
      onwebkittransitionend?: EventHandler<T, TransitionEvent> | null
    }
    interface CustomEventHandlersCamelCase<T> {
      onBeforeCopy?: DelegationEventHandler<T, ClipboardEvent> | null
      onCopy?: DelegationEventHandler<T, ClipboardEvent> | null
      onCut?: DelegationEventHandler<T, ClipboardEvent> | null
      onBeforeCut?: DelegationEventHandler<T, ClipboardEvent> | null
      onBeforePaste?: DelegationEventHandler<T, ClipboardEvent> | null
      onPaste?: DelegationEventHandler<T, ClipboardEvent> | null
      onCompositionEnd?: DelegationEventHandler<T, CompositionEvent> | null
      onCompositionStart?: DelegationEventHandler<T, CompositionEvent> | null
      onCompositionUpdate?: DelegationEventHandler<T, CompositionEvent> | null
      onBlur?: DelegationEventHandler<T, FocusEvent> | null
      onFocus?: DelegationEventHandler<T, FocusEvent> | null
      onChange?: DelegationEventHandler<T, Event> | null
      onFormData?: DelegationEventHandler<T, FormDataEvent> | null
      onInput?: DelegationEventHandler<T, InputEvent> | null
      onInvalid?: DelegationEventHandler<T, Event> | null
      onReset?: DelegationEventHandler<T, Event> | null
      onSearch?: DelegationEventHandler<T, Event> | null
      onSelect?: DelegationEventHandler<T, Event> | null
      onSubmit?: DelegationEventHandler<T, Event> | null
      onKeyDown?: DelegationEventHandler<T, KeyboardEvent> | null
      onKeyPress?: DelegationEventHandler<T, KeyboardEvent> | null
      onKeyUp?: DelegationEventHandler<T, KeyboardEvent> | null
      onAbort?: DelegationEventHandler<T, Event> | null
      onCanPlay?: DelegationEventHandler<T, Event> | null
      onCanPlayThrough?: DelegationEventHandler<T, Event> | null
      onDurationChange?: DelegationEventHandler<T, Event> | null
      onEmptied?: DelegationEventHandler<T, Event> | null
      onEnded?: DelegationEventHandler<T, Event> | null
      onLoadedData?: DelegationEventHandler<T, Event> | null
      onLoadedMetadata?: DelegationEventHandler<T, Event> | null
      onLoadStart?: DelegationEventHandler<T, Event> | null
      onPause?: DelegationEventHandler<T, Event> | null
      onPlay?: DelegationEventHandler<T, Event> | null
      onPlaying?: DelegationEventHandler<T, Event> | null
      onProgress?: DelegationEventHandler<T, Event> | null
      onRateChange?: DelegationEventHandler<T, Event> | null
      onSeeked?: DelegationEventHandler<T, Event> | null
      onSeeking?: DelegationEventHandler<T, Event> | null
      onStalled?: DelegationEventHandler<T, Event> | null
      onSuspend?: DelegationEventHandler<T, Event> | null
      onTimeUpdate?: DelegationEventHandler<T, Event> | null
      onVolumeChange?: DelegationEventHandler<T, Event> | null
      onWaiting?: DelegationEventHandler<T, Event> | null
      onAuxClick?: DelegationEventHandler<T, MouseEvent> | null
      onClick?: DelegationEventHandler<T, MouseEvent> | null
      onContextMenu?: DelegationEventHandler<T, MouseEvent> | null
      onDoubleClick?: DelegationEventHandler<T, MouseEvent> | null
      onMouseDown?: DelegationEventHandler<T, MouseEvent> | null
      onMouseEnter?: DelegationEventHandler<T, MouseEvent> | null
      onMouseLeave?: DelegationEventHandler<T, MouseEvent> | null
      onMouseMove?: DelegationEventHandler<T, MouseEvent> | null
      onMouseOut?: DelegationEventHandler<T, MouseEvent> | null
      onMouseOver?: DelegationEventHandler<T, MouseEvent> | null
      onMouseUp?: DelegationEventHandler<T, MouseEvent> | null
      onMouseWheel?: DelegationEventHandler<T, WheelEvent> | null
      onDrag?: DelegationEventHandler<T, DragEvent> | null
      onDragEnd?: DelegationEventHandler<T, DragEvent> | null
      onDragEnter?: DelegationEventHandler<T, DragEvent> | null
      onDragLeave?: DelegationEventHandler<T, DragEvent> | null
      onDragOver?: DelegationEventHandler<T, DragEvent> | null
      onDragStart?: DelegationEventHandler<T, DragEvent> | null
      onDrop?: DelegationEventHandler<T, DragEvent> | null
      onGotPointerCapture?: DelegationEventHandler<T, PointerEvent> | null
      onLostPointerCapture?: DelegationEventHandler<T, PointerEvent> | null
      onPointerCancel?: DelegationEventHandler<T, PointerEvent> | null
      onPointerDown?: DelegationEventHandler<T, PointerEvent> | null
      onPointerEnter?: DelegationEventHandler<T, PointerEvent> | null
      onPointerLeave?: DelegationEventHandler<T, PointerEvent> | null
      onPointerMove?: DelegationEventHandler<T, PointerEvent> | null
      onPointerOut?: DelegationEventHandler<T, PointerEvent> | null
      onPointerOver?: DelegationEventHandler<T, PointerEvent> | null
      onPointerRawUpdate?: DelegationEventHandler<T, PointerEvent> | null
      onPointerUp?: DelegationEventHandler<T, PointerEvent> | null
      onTouchCancel?: DelegationEventHandler<T, TouchEvent> | null
      onTouchEnd?: DelegationEventHandler<T, TouchEvent> | null
      onTouchMove?: DelegationEventHandler<T, TouchEvent> | null
      onTouchStart?: DelegationEventHandler<T, TouchEvent> | null
      onScroll?: DelegationEventHandler<T, UIEvent> | null
      onScrollEnd?: DelegationEventHandler<T, UIEvent> | null
      onScrollSnapChange?: DelegationEventHandler<T, UIEvent> | null
      onScrollSnapChanging?: DelegationEventHandler<T, UIEvent> | null
      onResize?: DelegationEventHandler<T, UIEvent> | null
      onAnimationEnd?: DelegationEventHandler<T, AnimationEvent> | null
      onAnimationIteration?: DelegationEventHandler<T, AnimationEvent> | null
      onAnimationStart?: DelegationEventHandler<T, AnimationEvent> | null
      onTransitionCancel?: DelegationEventHandler<T, TransitionEvent> | null
      onTransitionEnd?: DelegationEventHandler<T, TransitionEvent> | null
      onTransitionRun?: DelegationEventHandler<T, TransitionEvent> | null
      onTransitionStart?: DelegationEventHandler<T, TransitionEvent> | null
      onFullscreenChange?: DelegationEventHandler<T, Event> | null
      onFullscreenError?: DelegationEventHandler<T, Event> | null
      onWebkitFullscreenChange?: DelegationEventHandler<T, Event> | null
      onWebkitFullscreenError?: DelegationEventHandler<T, Event> | null
      onBeforeMatch?: DelegationEventHandler<T, Event> | null
      onBeforeToggle?: DelegationEventHandler<T, Event> | null
      onBeforeXrSelect?: DelegationEventHandler<T, Event> | null
      onCancel?: DelegationEventHandler<T, Event> | null
      onClose?: DelegationEventHandler<T, Event> | null
      onContentVisibilityAutoStateChange?: DelegationEventHandler<
        T,
        Event
      > | null
      onCueChange?: DelegationEventHandler<T, Event> | null
      onSecurityPolicyViolation?: DelegationEventHandler<
        T,
        SecurityPolicyViolationEvent
      > | null
      onSlotChange?: DelegationEventHandler<T, Event> | null
      onToggle?: DelegationEventHandler<T, Event> | null
      onSelectionChange?: DelegationEventHandler<T, Event> | null
      onSelectStart?: DelegationEventHandler<T, Event> | null
      onWebkitAnimationEnd?: DelegationEventHandler<T, AnimationEvent> | null
      onWebkitAnimationIteration?: DelegationEventHandler<
        T,
        AnimationEvent
      > | null
      onWebkitAnimationStart?: DelegationEventHandler<T, AnimationEvent> | null
      onWebkitTransitionEnd?: DelegationEventHandler<T, TransitionEvent> | null
    }
    interface DOMAttributes<T>
      extends CustomAttributes<T>,
        CustomEventHandlersLowerCase<T>,
        CustomEventHandlersCamelCase<T> {
      children?: Element | null
      innerHTML?: string | null
      innerText?: string | null
      textContent?: string | null
    }
    interface CSSProperties extends PropertiesHyphen {
      [key: `-${string}`]: string | number | null | undefined
    }
    type HTMLAutocapitalize =
      | 'off'
      | 'none'
      | 'on'
      | 'sentences'
      | 'words'
      | 'characters'
    type HTMLDir = 'ltr' | 'rtl' | 'auto'
    type HTMLFormEncType =
      | 'application/x-www-form-urlencoded'
      | 'multipart/form-data'
      | 'text/plain'
    type HTMLFormMethod = 'post' | 'get' | 'dialog'
    type HTMLCrossorigin = 'anonymous' | 'use-credentials' | ''
    type HTMLReferrerPolicy =
      | 'no-referrer'
      | 'no-referrer-when-downgrade'
      | 'origin'
      | 'origin-when-cross-origin'
      | 'same-origin'
      | 'strict-origin'
      | 'strict-origin-when-cross-origin'
      | 'unsafe-url'
    type HTMLIframeSandbox =
      | 'allow-downloads-without-user-activation'
      | 'allow-forms'
      | 'allow-modals'
      | 'allow-orientation-lock'
      | 'allow-pointer-lock'
      | 'allow-popups'
      | 'allow-popups-to-escape-sandbox'
      | 'allow-presentation'
      | 'allow-same-origin'
      | 'allow-scripts'
      | 'allow-storage-access-by-user-activation'
      | 'allow-top-navigation'
      | 'allow-top-navigation-by-user-activation'
    type HTMLLinkAs =
      | 'audio'
      | 'document'
      | 'embed'
      | 'fetch'
      | 'font'
      | 'image'
      | 'object'
      | 'script'
      | 'style'
      | 'track'
      | 'video'
      | 'worker'
    interface AriaAttributes {
      'aria-activedescendant'?: string | null
      'aria-atomic'?: boolean | 'false' | 'true' | null
      'aria-autocomplete'?: 'none' | 'inline' | 'list' | 'both' | null
      'aria-busy'?: boolean | 'false' | 'true' | null
      'aria-checked'?: boolean | 'false' | 'mixed' | 'true' | null
      'aria-colcount'?: number | string | null
      'aria-colindex'?: number | string | null
      'aria-colspan'?: number | string | null
      'aria-controls'?: string | null
      'aria-current'?:
        | boolean
        | 'false'
        | 'true'
        | 'page'
        | 'step'
        | 'location'
        | 'date'
        | 'time'
        | null
      'aria-describedby'?: string | null
      'aria-details'?: string | null
      'aria-disabled'?: boolean | 'false' | 'true' | null
      'aria-dropeffect'?:
        | 'none'
        | 'copy'
        | 'execute'
        | 'link'
        | 'move'
        | 'popup'
        | null
      'aria-errormessage'?: string | null
      'aria-expanded'?: boolean | 'false' | 'true' | null
      'aria-flowto'?: string | null
      'aria-grabbed'?: boolean | 'false' | 'true' | null
      'aria-haspopup'?:
        | boolean
        | 'false'
        | 'true'
        | 'menu'
        | 'listbox'
        | 'tree'
        | 'grid'
        | 'dialog'
        | null
      'aria-hidden'?: boolean | 'false' | 'true' | null
      'aria-invalid'?:
        | boolean
        | 'false'
        | 'true'
        | 'grammar'
        | 'spelling'
        | null
      'aria-keyshortcuts'?: string | null
      'aria-label'?: string | null
      'aria-labelledby'?: string | null
      'aria-level'?: number | string | null
      'aria-live'?: 'off' | 'assertive' | 'polite' | null
      'aria-modal'?: boolean | 'false' | 'true' | null
      'aria-multiline'?: boolean | 'false' | 'true' | null
      'aria-multiselectable'?: boolean | 'false' | 'true' | null
      'aria-orientation'?: 'horizontal' | 'vertical' | null
      'aria-owns'?: string | null
      'aria-placeholder'?: string | null
      'aria-posinset'?: number | string | null
      'aria-pressed'?: boolean | 'false' | 'mixed' | 'true' | null
      'aria-readonly'?: boolean | 'false' | 'true' | null
      'aria-relevant'?:
        | 'additions'
        | 'additions removals'
        | 'additions text'
        | 'all'
        | 'removals'
        | 'removals additions'
        | 'removals text'
        | 'text'
        | 'text additions'
        | 'text removals'
        | null
      'aria-required'?: boolean | 'false' | 'true' | null
      'aria-roledescription'?: string | null
      'aria-rowcount'?: number | string | null
      'aria-rowindex'?: number | string | null
      'aria-rowspan'?: number | string | null
      'aria-selected'?: boolean | 'false' | 'true' | null
      'aria-setsize'?: number | string | null
      'aria-sort'?: 'none' | 'ascending' | 'descending' | 'other' | null
      'aria-valuemax'?: number | string | null
      'aria-valuemin'?: number | string | null
      'aria-valuenow'?: number | string | null
      'aria-valuetext'?: string | null
      role?:
        | 'alert'
        | 'alertdialog'
        | 'application'
        | 'article'
        | 'banner'
        | 'button'
        | 'cell'
        | 'checkbox'
        | 'columnheader'
        | 'combobox'
        | 'complementary'
        | 'contentinfo'
        | 'definition'
        | 'dialog'
        | 'directory'
        | 'document'
        | 'feed'
        | 'figure'
        | 'form'
        | 'grid'
        | 'gridcell'
        | 'group'
        | 'heading'
        | 'img'
        | 'link'
        | 'list'
        | 'listbox'
        | 'listitem'
        | 'log'
        | 'main'
        | 'marquee'
        | 'math'
        | 'menu'
        | 'menubar'
        | 'menuitem'
        | 'menuitemcheckbox'
        | 'menuitemradio'
        | 'meter'
        | 'navigation'
        | 'none'
        | 'note'
        | 'option'
        | 'presentation'
        | 'progressbar'
        | 'radio'
        | 'radiogroup'
        | 'region'
        | 'row'
        | 'rowgroup'
        | 'rowheader'
        | 'scrollbar'
        | 'search'
        | 'searchbox'
        | 'separator'
        | 'slider'
        | 'spinbutton'
        | 'status'
        | 'switch'
        | 'tab'
        | 'table'
        | 'tablist'
        | 'tabpanel'
        | 'term'
        | 'textbox'
        | 'timer'
        | 'toolbar'
        | 'tooltip'
        | 'tree'
        | 'treegrid'
        | 'treeitem'
        | null
    }
    interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
      accessKey?: string | null
      class?: ClassList | string | null
      contenteditable?: boolean | 'plaintext-only' | 'inherit' | null
      contextmenu?: string | null
      dir?: HTMLDir | null
      draggable?: boolean | 'false' | 'true' | null
      hidden?: boolean | 'hidden' | 'until-found' | null
      id?: string | null
      is?: string | null
      inert?: boolean | null
      lang?: string | null
      spellcheck?: boolean | null
      style?: CSSProperties | string | null
      tabindex?: number | string | null
      title?: string | null
      translate?: 'yes' | 'no' | null
      about?: string | null
      datatype?: string | null
      inlist?: any | null
      popover?: boolean | 'manual' | 'auto' | null
      prefix?: string | null
      property?: string | null
      resource?: string | null
      typeof?: string | null
      vocab?: string | null
      autocapitalize?: HTMLAutocapitalize | null
      slot?: string | null
      color?: string | null
      itemprop?: string | null
      itemscope?: boolean | null
      itemtype?: string | null
      itemid?: string | null
      itemref?: string | null
      part?: string | null
      exportparts?: string | null
      inputmode?:
        | 'none'
        | 'text'
        | 'tel'
        | 'url'
        | 'email'
        | 'numeric'
        | 'decimal'
        | 'search'
        | null
      contentEditable?: boolean | 'plaintext-only' | 'inherit' | null
      contextMenu?: string | null
      tabIndex?: number | string | null
      autoCapitalize?: HTMLAutocapitalize | null
      itemProp?: string | null
      itemScope?: boolean | null
      itemType?: string | null
      itemId?: string | null
      itemRef?: string | null
      exportParts?: string | null
      inputMode?:
        | 'none'
        | 'text'
        | 'tel'
        | 'url'
        | 'email'
        | 'numeric'
        | 'decimal'
        | 'search'
        | null
    }
    interface AnchorHTMLAttributes<T> extends HTMLAttributes<T> {
      download?: any
      href?: string | null
      hreflang?: string | null
      media?: string | null
      ping?: string | null
      referrerpolicy?: HTMLReferrerPolicy | null
      rel?: string | null
      target?: '_self' | '_blank' | '_parent' | '_top' | (string & {}) | null
      type?: string | null
      referrerPolicy?: HTMLReferrerPolicy | null
    }
    interface AudioHTMLAttributes<T> extends MediaHTMLAttributes<T> {}
    interface AreaHTMLAttributes<T> extends HTMLAttributes<T> {
      alt?: string | null
      coords?: string | null
      download?: any
      href?: string | null
      hreflang?: string | null
      ping?: string | null
      referrerpolicy?: HTMLReferrerPolicy | null
      rel?: string | null
      shape?: 'rect' | 'circle' | 'poly' | 'default' | null
      target?: string | null
      referrerPolicy?: HTMLReferrerPolicy | null
    }
    interface BaseHTMLAttributes<T> extends HTMLAttributes<T> {
      href?: string | null
      target?: string | null
    }
    interface BlockquoteHTMLAttributes<T> extends HTMLAttributes<T> {
      cite?: string | null
    }
    interface ButtonHTMLAttributes<T> extends HTMLAttributes<T> {
      autofocus?: boolean | null
      disabled?: boolean | null
      form?: string | null
      formaction?: string | SerializableAttributeValue | null
      formenctype?: HTMLFormEncType | null
      formmethod?: HTMLFormMethod | null
      formnovalidate?: boolean | null
      formtarget?: string | null
      popovertarget?: string | null
      popovertargetaction?: 'hide' | 'show' | 'toggle' | null
      name?: string | null
      type?: 'submit' | 'reset' | 'button' | null
      value?: string | null
      formAction?: string | SerializableAttributeValue | null
      formEnctype?: HTMLFormEncType | null
      formMethod?: HTMLFormMethod | null
      formNoValidate?: boolean | null
      formTarget?: string | null
      popoverTarget?: string | null
      popoverTargetAction?: 'hide' | 'show' | 'toggle' | null
    }
    interface CanvasHTMLAttributes<T> extends HTMLAttributes<T> {
      width?: number | string | null
      height?: number | string | null
    }
    interface ColHTMLAttributes<T> extends HTMLAttributes<T> {
      span?: number | string | null
      width?: number | string | null
    }
    interface ColgroupHTMLAttributes<T> extends HTMLAttributes<T> {
      span?: number | string | null
    }
    interface DataHTMLAttributes<T> extends HTMLAttributes<T> {
      value?: string | string[] | number | null
    }
    interface DetailsHtmlAttributes<T> extends HTMLAttributes<T> {
      open?: boolean | null
      onToggle?: DelegationEventHandler<T, Event> | null
      ontoggle?: EventHandler<T, Event> | null
    }
    interface DialogHtmlAttributes<T> extends HTMLAttributes<T> {
      open?: boolean | null
      onClose?: DelegationEventHandler<T, Event> | null
      onCancel?: DelegationEventHandler<T, Event> | null
    }
    interface EmbedHTMLAttributes<T> extends HTMLAttributes<T> {
      height?: number | string | null
      src?: string | null
      type?: string | null
      width?: number | string | null
    }
    interface FieldsetHTMLAttributes<T> extends HTMLAttributes<T> {
      disabled?: boolean | null
      form?: string | null
      name?: string | null
    }
    interface FormHTMLAttributes<T> extends HTMLAttributes<T> {
      'accept-charset'?: string | null
      action?: string | SerializableAttributeValue | null
      autocomplete?: string | null
      encoding?: HTMLFormEncType | null
      enctype?: HTMLFormEncType | null
      method?: HTMLFormMethod | null
      name?: string | null
      novalidate?: boolean | null
      target?: string | null
      noValidate?: boolean | null
    }
    interface IframeHTMLAttributes<T> extends HTMLAttributes<T> {
      allow?: string | null
      allowfullscreen?: boolean | null
      height?: number | string | null
      loading?: 'eager' | 'lazy' | null
      name?: string | null
      referrerpolicy?: HTMLReferrerPolicy | null
      sandbox?: HTMLIframeSandbox | string | null
      src?: string | null
      srcdoc?: string | null
      width?: number | string | null
      referrerPolicy?: HTMLReferrerPolicy | null
    }
    interface ImgHTMLAttributes<T> extends HTMLAttributes<T> {
      alt?: string | null
      crossorigin?: HTMLCrossorigin | null
      decoding?: 'sync' | 'async' | 'auto' | null
      height?: number | string | null
      ismap?: boolean | null
      isMap?: boolean | null
      loading?: 'eager' | 'lazy' | null
      referrerpolicy?: HTMLReferrerPolicy | null
      referrerPolicy?: HTMLReferrerPolicy | null
      sizes?: string | null
      src?: string | null
      srcset?: string | null
      srcSet?: string | null
      usemap?: string | null
      useMap?: string | null
      width?: number | string | null
      crossOrigin?: HTMLCrossorigin | null
      elementtiming?: string | null
      fetchpriority?: 'high' | 'low' | 'auto' | null
    }
    interface InputHTMLAttributes<T> extends HTMLAttributes<T> {
      accept?: string | null
      alt?: string | null
      autocomplete?: string | null
      autocorrect?: 'on' | 'off' | null
      autofocus?: boolean | null
      capture?: boolean | string | null
      checked?: boolean | null
      crossorigin?: HTMLCrossorigin | null
      disabled?: boolean | null
      enterkeyhint?:
        | 'enter'
        | 'done'
        | 'go'
        | 'next'
        | 'previous'
        | 'search'
        | 'send'
        | null
      form?: string | null
      formaction?: string | SerializableAttributeValue | null
      formenctype?: HTMLFormEncType | null
      formmethod?: HTMLFormMethod | null
      formnovalidate?: boolean | null
      formtarget?: string | null
      height?: number | string | null
      incremental?: boolean | null
      list?: string | null
      max?: number | string | null
      maxlength?: number | string | null
      min?: number | string | null
      minlength?: number | string | null
      multiple?: boolean | null
      name?: string | null
      pattern?: string | null
      placeholder?: string | null
      readonly?: boolean | null
      results?: number | null
      required?: boolean | null
      size?: number | string | null
      src?: string | null
      step?: number | string | null
      type?:
        | 'button'
        | 'checkbox'
        | 'color'
        | 'date'
        | 'datetime-local'
        | 'email'
        | 'file'
        | 'hidden'
        | 'image'
        | 'month'
        | 'number'
        | 'password'
        | 'radio'
        | 'range'
        | 'reset'
        | 'search'
        | 'submit'
        | 'tel'
        | 'text'
        | 'time'
        | 'url'
        | 'week'
        | (string & {})
        | null
      value?: string | string[] | number | null
      width?: number | string | null
      crossOrigin?: HTMLCrossorigin | null
      formAction?: string | SerializableAttributeValue | null
      formEnctype?: HTMLFormEncType | null
      formMethod?: HTMLFormMethod | null
      formNoValidate?: boolean | null
      formTarget?: string | null
      maxLength?: number | string | null
      minLength?: number | string | null
      readOnly?: boolean | null
    }
    interface InsHTMLAttributes<T> extends HTMLAttributes<T> {
      cite?: string | null
      dateTime?: string | null
    }
    interface KeygenHTMLAttributes<T> extends HTMLAttributes<T> {
      autofocus?: boolean | null
      challenge?: string | null
      disabled?: boolean | null
      form?: string | null
      keytype?: string | null
      keyparams?: string | null
      name?: string | null
    }
    interface LabelHTMLAttributes<T> extends HTMLAttributes<T> {
      for?: string | null
      form?: string | null
    }
    interface LiHTMLAttributes<T> extends HTMLAttributes<T> {
      value?: number | string | null
    }
    interface LinkHTMLAttributes<T> extends HTMLAttributes<T> {
      as?: HTMLLinkAs | null
      crossorigin?: HTMLCrossorigin | null
      disabled?: boolean | null
      fetchpriority?: 'high' | 'low' | 'auto' | null
      href?: string | null
      hreflang?: string | null
      imagesizes?: string | null
      imagesrcset?: string | null
      integrity?: string | null
      media?: string | null
      referrerpolicy?: HTMLReferrerPolicy | null
      rel?: string | null
      sizes?: string | null
      type?: string | null
      crossOrigin?: HTMLCrossorigin | null
      referrerPolicy?: HTMLReferrerPolicy | null
    }
    interface MapHTMLAttributes<T> extends HTMLAttributes<T> {
      name?: string | null
    }
    interface MediaHTMLAttributes<T> extends HTMLAttributes<T> {
      autoplay?: boolean | null
      controls?: boolean | null
      controlslist?:
        | 'nodownload'
        | 'nofullscreen'
        | 'noplaybackrate'
        | 'noremoteplayback'
        | (string & {})
        | null
      crossorigin?: HTMLCrossorigin | null
      loop?: boolean | null
      mediagroup?: string | null
      muted?: boolean | null
      preload?: 'none' | 'metadata' | 'auto' | '' | null
      src?: string | null
      crossOrigin?: HTMLCrossorigin | null
      mediaGroup?: string | null
    }
    interface MenuHTMLAttributes<T> extends HTMLAttributes<T> {
      label?: string | null
      type?: 'context' | 'toolbar' | null
    }
    interface MetaHTMLAttributes<T> extends HTMLAttributes<T> {
      charset?: string | null
      content?: string | null
      'http-equiv'?: string | null
      name?: string | null
      media?: string | null
    }
    interface MeterHTMLAttributes<T> extends HTMLAttributes<T> {
      form?: string | null
      high?: number | string | null
      low?: number | string | null
      max?: number | string | null
      min?: number | string | null
      optimum?: number | string | null
      value?: string | string[] | number | null
    }
    interface QuoteHTMLAttributes<T> extends HTMLAttributes<T> {
      cite?: string | null
    }
    interface ObjectHTMLAttributes<T> extends HTMLAttributes<T> {
      data?: string | null
      form?: string | null
      height?: number | string | null
      name?: string | null
      type?: string | null
      usemap?: string | null
      width?: number | string | null
      useMap?: string | null
    }
    interface OlHTMLAttributes<T> extends HTMLAttributes<T> {
      reversed?: boolean | null
      start?: number | string | null
      type?: '1' | 'a' | 'A' | 'i' | 'I' | null
    }
    interface OptgroupHTMLAttributes<T> extends HTMLAttributes<T> {
      disabled?: boolean | null
      label?: string | null
    }
    interface OptionHTMLAttributes<T> extends HTMLAttributes<T> {
      disabled?: boolean | null
      label?: string | null
      selected?: boolean | null
      value?: string | string[] | number | null
    }
    interface OutputHTMLAttributes<T> extends HTMLAttributes<T> {
      form?: string | null
      for?: string | null
      name?: string | null
    }
    interface ParamHTMLAttributes<T> extends HTMLAttributes<T> {
      name?: string | null
      value?: string | string[] | number | null
    }
    interface ProgressHTMLAttributes<T> extends HTMLAttributes<T> {
      max?: number | string | null
      value?: string | string[] | number | null
    }
    interface ScriptHTMLAttributes<T> extends HTMLAttributes<T> {
      async?: boolean | null
      charset?: string | null
      crossorigin?: HTMLCrossorigin | null
      defer?: boolean | null
      integrity?: string | null
      nomodule?: boolean | null
      nonce?: string | null
      referrerpolicy?: HTMLReferrerPolicy | null
      src?: string | null
      type?: string | null
      crossOrigin?: HTMLCrossorigin | null
      noModule?: boolean | null
      referrerPolicy?: HTMLReferrerPolicy | null
    }
    interface SelectHTMLAttributes<T> extends HTMLAttributes<T> {
      autocomplete?: string | null
      autofocus?: boolean | null
      disabled?: boolean | null
      form?: string | null
      multiple?: boolean | null
      name?: string | null
      required?: boolean | null
      size?: number | string | null
      value?: string | string[] | number | null
    }
    interface HTMLSlotElementAttributes<T = HTMLSlotElement>
      extends HTMLAttributes<T> {
      name?: string | null
    }
    interface SourceHTMLAttributes<T> extends HTMLAttributes<T> {
      media?: string | null
      sizes?: string | null
      src?: string | null
      srcset?: string | null
      type?: string | null
      width?: number | string | null
      height?: number | string | null
    }
    interface StyleHTMLAttributes<T> extends HTMLAttributes<T> {
      media?: string | null
      nonce?: string | null
      scoped?: boolean | null
      type?: string | null
    }
    interface TdHTMLAttributes<T> extends HTMLAttributes<T> {
      colspan?: number | string | null
      headers?: string | null
      rowspan?: number | string | null
      colSpan?: number | string | null
      rowSpan?: number | string | null
    }
    interface TemplateHTMLAttributes<T extends HTMLTemplateElement>
      extends HTMLAttributes<T> {
      content?: DocumentFragment | null
    }
    interface TextareaHTMLAttributes<T> extends HTMLAttributes<T> {
      autocomplete?: string | null
      autofocus?: boolean | null
      cols?: number | string | null
      dirname?: string | null
      disabled?: boolean | null
      enterkeyhint?:
        | 'enter'
        | 'done'
        | 'go'
        | 'next'
        | 'previous'
        | 'search'
        | 'send'
        | null
      form?: string | null
      maxlength?: number | string | null
      minlength?: number | string | null
      name?: string | null
      placeholder?: string | null
      readonly?: boolean | null
      required?: boolean | null
      rows?: number | string | null
      value?: string | string[] | number | null
      wrap?: 'hard' | 'soft' | 'off' | null
      maxLength?: number | string | null
      minLength?: number | string | null
      readOnly?: boolean | null
    }
    interface ThHTMLAttributes<T> extends HTMLAttributes<T> {
      colspan?: number | string | null
      headers?: string | null
      rowspan?: number | string | null
      colSpan?: number | string | null
      rowSpan?: number | string | null
      scope?: 'col' | 'row' | 'rowgroup' | 'colgroup' | null
    }
    interface TimeHTMLAttributes<T> extends HTMLAttributes<T> {
      datetime?: string | null
      dateTime?: string | null
    }
    interface TrackHTMLAttributes<T> extends HTMLAttributes<T> {
      default?: boolean | null
      kind?:
        | 'subtitles'
        | 'captions'
        | 'descriptions'
        | 'chapters'
        | 'metadata'
        | null
      label?: string | null
      src?: string | null
      srclang?: string | null
    }
    interface VideoHTMLAttributes<T> extends MediaHTMLAttributes<T> {
      height?: number | string | null
      playsinline?: boolean | null
      poster?: string | null
      width?: number | string | null
      disablepictureinpicture?: boolean | null
      disableremoteplayback?: boolean | null
    }
    type SVGPreserveAspectRatio =
      | 'none'
      | 'xMinYMin'
      | 'xMidYMin'
      | 'xMaxYMin'
      | 'xMinYMid'
      | 'xMidYMid'
      | 'xMaxYMid'
      | 'xMinYMax'
      | 'xMidYMax'
      | 'xMaxYMax'
      | 'xMinYMin meet'
      | 'xMidYMin meet'
      | 'xMaxYMin meet'
      | 'xMinYMid meet'
      | 'xMidYMid meet'
      | 'xMaxYMid meet'
      | 'xMinYMax meet'
      | 'xMidYMax meet'
      | 'xMaxYMax meet'
      | 'xMinYMin slice'
      | 'xMidYMin slice'
      | 'xMaxYMin slice'
      | 'xMinYMid slice'
      | 'xMidYMid slice'
      | 'xMaxYMid slice'
      | 'xMinYMax slice'
      | 'xMidYMax slice'
      | 'xMaxYMax slice'
    type ImagePreserveAspectRatio =
      | SVGPreserveAspectRatio
      | 'defer none'
      | 'defer xMinYMin'
      | 'defer xMidYMin'
      | 'defer xMaxYMin'
      | 'defer xMinYMid'
      | 'defer xMidYMid'
      | 'defer xMaxYMid'
      | 'defer xMinYMax'
      | 'defer xMidYMax'
      | 'defer xMaxYMax'
      | 'defer xMinYMin meet'
      | 'defer xMidYMin meet'
      | 'defer xMaxYMin meet'
      | 'defer xMinYMid meet'
      | 'defer xMidYMid meet'
      | 'defer xMaxYMid meet'
      | 'defer xMinYMax meet'
      | 'defer xMidYMax meet'
      | 'defer xMaxYMax meet'
      | 'defer xMinYMin slice'
      | 'defer xMidYMin slice'
      | 'defer xMaxYMin slice'
      | 'defer xMinYMid slice'
      | 'defer xMidYMid slice'
      | 'defer xMaxYMid slice'
      | 'defer xMinYMax slice'
      | 'defer xMidYMax slice'
      | 'defer xMaxYMax slice'
    type SVGUnits = 'userSpaceOnUse' | 'objectBoundingBox'
    interface CoreSVGAttributes<T> extends AriaAttributes, DOMAttributes<T> {
      id?: string | null
      lang?: string | null
      tabIndex?: number | string | null
      tabindex?: number | string | null
    }
    interface StylableSVGAttributes {
      class?: ClassList | string | null
      style?: CSSProperties | string | null
    }
    interface TransformableSVGAttributes {
      transform?: string | null
    }
    interface XLinkSVGAttributes {
      xlinkActuate?: string | null
      xlinkArcrole?: string | null
      xlinkHref?: string | null
      xlinkRole?: string | null
      xlinkShow?: string | null
      xlinkTitle?: string | null
      xlinkType?: string | null
    }
    interface ConditionalProcessingSVGAttributes {
      requiredExtensions?: string | null
      requiredFeatures?: string | null
      systemLanguage?: string | null
    }
    interface ExternalResourceSVGAttributes {
      externalResourcesRequired?: 'true' | 'false' | null
    }
    interface AnimationTimingSVGAttributes {
      begin?: string | null
      dur?: string | null
      end?: string | null
      min?: string | null
      max?: string | null
      restart?: 'always' | 'whenNotActive' | 'never' | null
      repeatCount?: number | 'indefinite' | null
      repeatDur?: string | null
      fill?: 'freeze' | 'remove' | null
    }
    interface AnimationValueSVGAttributes {
      calcMode?: 'discrete' | 'linear' | 'paced' | 'spline' | null
      values?: string | null
      keyTimes?: string | null
      keySplines?: string | null
      from?: number | string | null
      to?: number | string | null
      by?: number | string | null
    }
    interface AnimationAdditionSVGAttributes {
      attributeName?: string | null
      additive?: 'replace' | 'sum' | null
      accumulate?: 'none' | 'sum' | null
    }
    interface AnimationAttributeTargetSVGAttributes {
      attributeName?: string | null
      attributeType?: 'CSS' | 'XML' | 'auto' | null
    }
    interface PresentationSVGAttributes {
      'alignment-baseline'?:
        | 'auto'
        | 'baseline'
        | 'before-edge'
        | 'text-before-edge'
        | 'middle'
        | 'central'
        | 'after-edge'
        | 'text-after-edge'
        | 'ideographic'
        | 'alphabetic'
        | 'hanging'
        | 'mathematical'
        | 'inherit'
        | null
      'baseline-shift'?: number | string | null
      clip?: string | null
      'clip-path'?: string | null
      'clip-rule'?: 'nonzero' | 'evenodd' | 'inherit' | null
      color?: string | null
      'color-interpolation'?: 'auto' | 'sRGB' | 'linearRGB' | 'inherit' | null
      'color-interpolation-filters'?:
        | 'auto'
        | 'sRGB'
        | 'linearRGB'
        | 'inherit'
        | null
      'color-profile'?: string | null
      'color-rendering'?:
        | 'auto'
        | 'optimizeSpeed'
        | 'optimizeQuality'
        | 'inherit'
        | null
      cursor?: string | null
      direction?: 'ltr' | 'rtl' | 'inherit' | null
      display?: string | null
      'dominant-baseline'?:
        | 'auto'
        | 'text-bottom'
        | 'alphabetic'
        | 'ideographic'
        | 'middle'
        | 'central'
        | 'mathematical'
        | 'hanging'
        | 'text-top'
        | 'inherit'
        | null
      'enable-background'?: string | null
      fill?: string | null
      'fill-opacity'?: number | string | 'inherit' | null
      'fill-rule'?: 'nonzero' | 'evenodd' | 'inherit' | null
      filter?: string | null
      'flood-color'?: string | null
      'flood-opacity'?: number | string | 'inherit' | null
      'font-family'?: string | null
      'font-size'?: string | null
      'font-size-adjust'?: number | string | null
      'font-stretch'?: string | null
      'font-style'?: 'normal' | 'italic' | 'oblique' | 'inherit' | null
      'font-variant'?: string | null
      'font-weight'?: number | string | null
      'glyph-orientation-horizontal'?: string | null
      'glyph-orientation-vertical'?: string | null
      'image-rendering'?:
        | 'auto'
        | 'optimizeQuality'
        | 'optimizeSpeed'
        | 'inherit'
        | null
      kerning?: string | null
      'letter-spacing'?: number | string | null
      'lighting-color'?: string | null
      'marker-end'?: string | null
      'marker-mid'?: string | null
      'marker-start'?: string | null
      mask?: string | null
      opacity?: number | string | 'inherit' | null
      overflow?: 'visible' | 'hidden' | 'scroll' | 'auto' | 'inherit' | null
      pathLength?: string | number | null
      'pointer-events'?:
        | 'bounding-box'
        | 'visiblePainted'
        | 'visibleFill'
        | 'visibleStroke'
        | 'visible'
        | 'painted'
        | 'color'
        | 'fill'
        | 'stroke'
        | 'all'
        | 'none'
        | 'inherit'
        | null
      'shape-rendering'?:
        | 'auto'
        | 'optimizeSpeed'
        | 'crispEdges'
        | 'geometricPrecision'
        | 'inherit'
        | null
      'stop-color'?: string | null
      'stop-opacity'?: number | string | 'inherit' | null
      stroke?: string | null
      'stroke-dasharray'?: string | null
      'stroke-dashoffset'?: number | string | null
      'stroke-linecap'?: 'butt' | 'round' | 'square' | 'inherit' | null
      'stroke-linejoin'?:
        | 'arcs'
        | 'bevel'
        | 'miter'
        | 'miter-clip'
        | 'round'
        | 'inherit'
        | null
      'stroke-miterlimit'?: number | string | 'inherit' | null
      'stroke-opacity'?: number | string | 'inherit' | null
      'stroke-width'?: number | string | null
      'text-anchor'?: 'start' | 'middle' | 'end' | 'inherit' | null
      'text-decoration'?:
        | 'none'
        | 'underline'
        | 'overline'
        | 'line-through'
        | 'blink'
        | 'inherit'
        | null
      'text-rendering'?:
        | 'auto'
        | 'optimizeSpeed'
        | 'optimizeLegibility'
        | 'geometricPrecision'
        | 'inherit'
        | null
      'unicode-bidi'?: string | null
      visibility?: 'visible' | 'hidden' | 'collapse' | 'inherit' | null
      'word-spacing'?: number | string | null
      'writing-mode'?:
        | 'lr-tb'
        | 'rl-tb'
        | 'tb-rl'
        | 'lr'
        | 'rl'
        | 'tb'
        | 'inherit'
        | null
    }
    interface AnimationElementSVGAttributes<T>
      extends CoreSVGAttributes<T>,
        ExternalResourceSVGAttributes,
        ConditionalProcessingSVGAttributes {}
    interface ContainerElementSVGAttributes<T>
      extends CoreSVGAttributes<T>,
        ExternalResourceSVGAttributes,
        ShapeElementSVGAttributes<T>,
        Pick<
          PresentationSVGAttributes,
          | 'clip-path'
          | 'mask'
          | 'cursor'
          | 'opacity'
          | 'filter'
          | 'enable-background'
          | 'color-interpolation'
          | 'color-rendering'
        > {}
    interface FilterPrimitiveElementSVGAttributes<T>
      extends CoreSVGAttributes<T>,
        Pick<PresentationSVGAttributes, 'color-interpolation-filters'> {
      x?: number | string | null
      y?: number | string | null
      width?: number | string | null
      height?: number | string | null
      result?: string | null
    }
    interface SingleInputFilterSVGAttributes {
      in?: string | null
    }
    interface DoubleInputFilterSVGAttributes {
      in?: string | null
      in2?: string | null
    }
    interface FitToViewBoxSVGAttributes {
      viewBox?: string | null
      preserveAspectRatio?: SVGPreserveAspectRatio | null
    }
    interface GradientElementSVGAttributes<T>
      extends CoreSVGAttributes<T>,
        XLinkSVGAttributes,
        ExternalResourceSVGAttributes,
        StylableSVGAttributes {
      gradientUnits?: SVGUnits | null
      gradientTransform?: string | null
      spreadMethod?: 'pad' | 'reflect' | 'repeat' | null
      href?: string | null
    }
    interface GraphicsElementSVGAttributes<T>
      extends CoreSVGAttributes<T>,
        Pick<
          PresentationSVGAttributes,
          | 'clip-rule'
          | 'mask'
          | 'pointer-events'
          | 'cursor'
          | 'opacity'
          | 'filter'
          | 'display'
          | 'visibility'
          | 'color-interpolation'
          | 'color-rendering'
        > {}
    interface LightSourceElementSVGAttributes<T> extends CoreSVGAttributes<T> {}
    interface NewViewportSVGAttributes<T>
      extends CoreSVGAttributes<T>,
        Pick<PresentationSVGAttributes, 'overflow' | 'clip'> {
      viewBox?: string | null
    }
    interface ShapeElementSVGAttributes<T>
      extends CoreSVGAttributes<T>,
        Pick<
          PresentationSVGAttributes,
          | 'color'
          | 'fill'
          | 'fill-rule'
          | 'fill-opacity'
          | 'stroke'
          | 'stroke-width'
          | 'stroke-linecap'
          | 'stroke-linejoin'
          | 'stroke-miterlimit'
          | 'stroke-dasharray'
          | 'stroke-dashoffset'
          | 'stroke-opacity'
          | 'shape-rendering'
          | 'pathLength'
        > {}
    interface TextContentElementSVGAttributes<T>
      extends CoreSVGAttributes<T>,
        Pick<
          PresentationSVGAttributes,
          | 'font-family'
          | 'font-style'
          | 'font-variant'
          | 'font-weight'
          | 'font-stretch'
          | 'font-size'
          | 'font-size-adjust'
          | 'kerning'
          | 'letter-spacing'
          | 'word-spacing'
          | 'text-decoration'
          | 'glyph-orientation-horizontal'
          | 'glyph-orientation-vertical'
          | 'direction'
          | 'unicode-bidi'
          | 'text-anchor'
          | 'dominant-baseline'
          | 'color'
          | 'fill'
          | 'fill-rule'
          | 'fill-opacity'
          | 'stroke'
          | 'stroke-width'
          | 'stroke-linecap'
          | 'stroke-linejoin'
          | 'stroke-miterlimit'
          | 'stroke-dasharray'
          | 'stroke-dashoffset'
          | 'stroke-opacity'
        > {}
    interface ZoomAndPanSVGAttributes {
      zoomAndPan?: 'disable' | 'magnify' | null
    }
    interface AnimateSVGAttributes<T>
      extends AnimationElementSVGAttributes<T>,
        XLinkSVGAttributes,
        AnimationAttributeTargetSVGAttributes,
        AnimationTimingSVGAttributes,
        AnimationValueSVGAttributes,
        AnimationAdditionSVGAttributes,
        Pick<
          PresentationSVGAttributes,
          'color-interpolation' | 'color-rendering'
        > {}
    interface AnimateMotionSVGAttributes<T>
      extends AnimationElementSVGAttributes<T>,
        XLinkSVGAttributes,
        AnimationTimingSVGAttributes,
        AnimationValueSVGAttributes,
        AnimationAdditionSVGAttributes {
      path?: string | null
      keyPoints?: string | null
      rotate?: number | string | 'auto' | 'auto-reverse' | null
      origin?: 'default' | null
    }
    interface AnimateTransformSVGAttributes<T>
      extends AnimationElementSVGAttributes<T>,
        XLinkSVGAttributes,
        AnimationAttributeTargetSVGAttributes,
        AnimationTimingSVGAttributes,
        AnimationValueSVGAttributes,
        AnimationAdditionSVGAttributes {
      type?: 'translate' | 'scale' | 'rotate' | 'skewX' | 'skewY' | null
    }
    interface CircleSVGAttributes<T>
      extends GraphicsElementSVGAttributes<T>,
        ShapeElementSVGAttributes<T>,
        ConditionalProcessingSVGAttributes,
        StylableSVGAttributes,
        TransformableSVGAttributes {
      cx?: number | string | null
      cy?: number | string | null
      r?: number | string | null
    }
    interface ClipPathSVGAttributes<T>
      extends CoreSVGAttributes<T>,
        ConditionalProcessingSVGAttributes,
        ExternalResourceSVGAttributes,
        StylableSVGAttributes,
        TransformableSVGAttributes,
        Pick<PresentationSVGAttributes, 'clip-path'> {
      clipPathUnits?: SVGUnits | null
    }
    interface DefsSVGAttributes<T>
      extends ContainerElementSVGAttributes<T>,
        ConditionalProcessingSVGAttributes,
        ExternalResourceSVGAttributes,
        StylableSVGAttributes,
        TransformableSVGAttributes {}
    interface DescSVGAttributes<T>
      extends CoreSVGAttributes<T>,
        StylableSVGAttributes {}
    interface EllipseSVGAttributes<T>
      extends GraphicsElementSVGAttributes<T>,
        ShapeElementSVGAttributes<T>,
        ConditionalProcessingSVGAttributes,
        ExternalResourceSVGAttributes,
        StylableSVGAttributes,
        TransformableSVGAttributes {
      cx?: number | string | null
      cy?: number | string | null
      rx?: number | string | null
      ry?: number | string | null
    }
    interface FeBlendSVGAttributes<T>
      extends FilterPrimitiveElementSVGAttributes<T>,
        DoubleInputFilterSVGAttributes,
        StylableSVGAttributes {
      mode?: 'normal' | 'multiply' | 'screen' | 'darken' | 'lighten' | null
    }
    interface FeColorMatrixSVGAttributes<T>
      extends FilterPrimitiveElementSVGAttributes<T>,
        SingleInputFilterSVGAttributes,
        StylableSVGAttributes {
      type?: 'matrix' | 'saturate' | 'hueRotate' | 'luminanceToAlpha' | null
      values?: string | null
    }
    interface FeComponentTransferSVGAttributes<T>
      extends FilterPrimitiveElementSVGAttributes<T>,
        SingleInputFilterSVGAttributes,
        StylableSVGAttributes {}
    interface FeCompositeSVGAttributes<T>
      extends FilterPrimitiveElementSVGAttributes<T>,
        DoubleInputFilterSVGAttributes,
        StylableSVGAttributes {
      operator?: 'over' | 'in' | 'out' | 'atop' | 'xor' | 'arithmetic' | null
      k1?: number | string | null
      k2?: number | string | null
      k3?: number | string | null
      k4?: number | string | null
    }
    interface FeConvolveMatrixSVGAttributes<T>
      extends FilterPrimitiveElementSVGAttributes<T>,
        SingleInputFilterSVGAttributes,
        StylableSVGAttributes {
      order?: number | string | null
      kernelMatrix?: string | null
      divisor?: number | string | null
      bias?: number | string | null
      targetX?: number | string | null
      targetY?: number | string | null
      edgeMode?: 'duplicate' | 'wrap' | 'none' | null
      kernelUnitLength?: number | string | null
      preserveAlpha?: 'true' | 'false' | null
    }
    interface FeDiffuseLightingSVGAttributes<T>
      extends FilterPrimitiveElementSVGAttributes<T>,
        SingleInputFilterSVGAttributes,
        StylableSVGAttributes,
        Pick<PresentationSVGAttributes, 'color' | 'lighting-color'> {
      surfaceScale?: number | string | null
      diffuseConstant?: number | string | null
      kernelUnitLength?: number | string | null
    }
    interface FeDisplacementMapSVGAttributes<T>
      extends FilterPrimitiveElementSVGAttributes<T>,
        DoubleInputFilterSVGAttributes,
        StylableSVGAttributes {
      scale?: number | string | null
      xChannelSelector?: 'R' | 'G' | 'B' | 'A' | null
      yChannelSelector?: 'R' | 'G' | 'B' | 'A' | null
    }
    interface FeDistantLightSVGAttributes<T>
      extends LightSourceElementSVGAttributes<T> {
      azimuth?: number | string | null
      elevation?: number | string | null
    }
    interface FeDropShadowSVGAttributes<T>
      extends CoreSVGAttributes<T>,
        FilterPrimitiveElementSVGAttributes<T>,
        StylableSVGAttributes,
        Pick<
          PresentationSVGAttributes,
          'color' | 'flood-color' | 'flood-opacity'
        > {
      dx?: number | string | null
      dy?: number | string | null
      stdDeviation?: number | string | null
    }
    interface FeFloodSVGAttributes<T>
      extends FilterPrimitiveElementSVGAttributes<T>,
        StylableSVGAttributes,
        Pick<
          PresentationSVGAttributes,
          'color' | 'flood-color' | 'flood-opacity'
        > {}
    interface FeFuncSVGAttributes<T> extends CoreSVGAttributes<T> {
      type?: 'identity' | 'table' | 'discrete' | 'linear' | 'gamma' | null
      tableValues?: string | null
      slope?: number | string | null
      intercept?: number | string | null
      amplitude?: number | string | null
      exponent?: number | string | null
      offset?: number | string | null
    }
    interface FeGaussianBlurSVGAttributes<T>
      extends FilterPrimitiveElementSVGAttributes<T>,
        SingleInputFilterSVGAttributes,
        StylableSVGAttributes {
      stdDeviation?: number | string | null
    }
    interface FeImageSVGAttributes<T>
      extends FilterPrimitiveElementSVGAttributes<T>,
        XLinkSVGAttributes,
        ExternalResourceSVGAttributes,
        StylableSVGAttributes {
      preserveAspectRatio?: SVGPreserveAspectRatio | null
      href?: string | null
    }
    interface FeMergeSVGAttributes<T>
      extends FilterPrimitiveElementSVGAttributes<T>,
        StylableSVGAttributes {}
    interface FeMergeNodeSVGAttributes<T>
      extends CoreSVGAttributes<T>,
        SingleInputFilterSVGAttributes {}
    interface FeMorphologySVGAttributes<T>
      extends FilterPrimitiveElementSVGAttributes<T>,
        SingleInputFilterSVGAttributes,
        StylableSVGAttributes {
      operator?: 'erode' | 'dilate' | null
      radius?: number | string | null
    }
    interface FeOffsetSVGAttributes<T>
      extends FilterPrimitiveElementSVGAttributes<T>,
        SingleInputFilterSVGAttributes,
        StylableSVGAttributes {
      dx?: number | string | null
      dy?: number | string | null
    }
    interface FePointLightSVGAttributes<T>
      extends LightSourceElementSVGAttributes<T> {
      x?: number | string | null
      y?: number | string | null
      z?: number | string | null
    }
    interface FeSpecularLightingSVGAttributes<T>
      extends FilterPrimitiveElementSVGAttributes<T>,
        SingleInputFilterSVGAttributes,
        StylableSVGAttributes,
        Pick<PresentationSVGAttributes, 'color' | 'lighting-color'> {
      surfaceScale?: string | null
      specularConstant?: string | null
      specularExponent?: string | null
      kernelUnitLength?: number | string | null
    }
    interface FeSpotLightSVGAttributes<T>
      extends LightSourceElementSVGAttributes<T> {
      x?: number | string | null
      y?: number | string | null
      z?: number | string | null
      pointsAtX?: number | string | null
      pointsAtY?: number | string | null
      pointsAtZ?: number | string | null
      specularExponent?: number | string | null
      limitingConeAngle?: number | string | null
    }
    interface FeTileSVGAttributes<T>
      extends FilterPrimitiveElementSVGAttributes<T>,
        SingleInputFilterSVGAttributes,
        StylableSVGAttributes {}
    interface FeTurbulanceSVGAttributes<T>
      extends FilterPrimitiveElementSVGAttributes<T>,
        StylableSVGAttributes {
      baseFrequency?: number | string | null
      numOctaves?: number | string | null
      seed?: number | string | null
      stitchTiles?: 'stitch' | 'noStitch' | null
      type?: 'fractalNoise' | 'turbulence' | null
    }
    interface FilterSVGAttributes<T>
      extends CoreSVGAttributes<T>,
        XLinkSVGAttributes,
        ExternalResourceSVGAttributes,
        StylableSVGAttributes {
      filterUnits?: SVGUnits | null
      primitiveUnits?: SVGUnits | null
      x?: number | string | null
      y?: number | string | null
      width?: number | string | null
      height?: number | string | null
      filterRes?: number | string | null
    }
    interface ForeignObjectSVGAttributes<T>
      extends NewViewportSVGAttributes<T>,
        ConditionalProcessingSVGAttributes,
        ExternalResourceSVGAttributes,
        StylableSVGAttributes,
        TransformableSVGAttributes,
        Pick<PresentationSVGAttributes, 'display' | 'visibility'> {
      x?: number | string | null
      y?: number | string | null
      width?: number | string | null
      height?: number | string | null
    }
    interface GSVGAttributes<T>
      extends ContainerElementSVGAttributes<T>,
        ConditionalProcessingSVGAttributes,
        ExternalResourceSVGAttributes,
        StylableSVGAttributes,
        TransformableSVGAttributes,
        Pick<PresentationSVGAttributes, 'display' | 'visibility'> {}
    interface ImageSVGAttributes<T>
      extends NewViewportSVGAttributes<T>,
        GraphicsElementSVGAttributes<T>,
        ConditionalProcessingSVGAttributes,
        XLinkSVGAttributes,
        StylableSVGAttributes,
        TransformableSVGAttributes,
        Pick<PresentationSVGAttributes, 'color-profile' | 'image-rendering'> {
      x?: number | string | null
      y?: number | string | null
      width?: number | string | null
      height?: number | string | null
      preserveAspectRatio?: ImagePreserveAspectRatio | null
      href?: string | null
    }
    interface LineSVGAttributes<T>
      extends GraphicsElementSVGAttributes<T>,
        ShapeElementSVGAttributes<T>,
        ConditionalProcessingSVGAttributes,
        ExternalResourceSVGAttributes,
        StylableSVGAttributes,
        TransformableSVGAttributes,
        Pick<
          PresentationSVGAttributes,
          'marker-start' | 'marker-mid' | 'marker-end'
        > {
      x1?: number | string | null
      y1?: number | string | null
      x2?: number | string | null
      y2?: number | string | null
    }
    interface LinearGradientSVGAttributes<T>
      extends GradientElementSVGAttributes<T> {
      x1?: number | string | null
      x2?: number | string | null
      y1?: number | string | null
      y2?: number | string | null
    }
    interface MarkerSVGAttributes<T>
      extends ContainerElementSVGAttributes<T>,
        ExternalResourceSVGAttributes,
        StylableSVGAttributes,
        FitToViewBoxSVGAttributes,
        Pick<PresentationSVGAttributes, 'overflow' | 'clip'> {
      markerUnits?: 'strokeWidth' | 'userSpaceOnUse' | null
      refX?: number | string | null
      refY?: number | string | null
      markerWidth?: number | string | null
      markerHeight?: number | string | null
      orient?: string | null
    }
    interface MaskSVGAttributes<T>
      extends Omit<ContainerElementSVGAttributes<T>, 'opacity' | 'filter'>,
        ConditionalProcessingSVGAttributes,
        ExternalResourceSVGAttributes,
        StylableSVGAttributes {
      maskUnits?: SVGUnits | null
      maskContentUnits?: SVGUnits | null
      x?: number | string | null
      y?: number | string | null
      width?: number | string | null
      height?: number | string | null
    }
    interface MetadataSVGAttributes<T> extends CoreSVGAttributes<T> {}
    interface MPathSVGAttributes<T> extends CoreSVGAttributes<T> {}
    interface PathSVGAttributes<T>
      extends GraphicsElementSVGAttributes<T>,
        ShapeElementSVGAttributes<T>,
        ConditionalProcessingSVGAttributes,
        ExternalResourceSVGAttributes,
        StylableSVGAttributes,
        TransformableSVGAttributes,
        Pick<
          PresentationSVGAttributes,
          'marker-start' | 'marker-mid' | 'marker-end'
        > {
      d?: string | null
      pathLength?: number | string | null
    }
    interface PatternSVGAttributes<T>
      extends ContainerElementSVGAttributes<T>,
        ConditionalProcessingSVGAttributes,
        XLinkSVGAttributes,
        ExternalResourceSVGAttributes,
        StylableSVGAttributes,
        FitToViewBoxSVGAttributes,
        Pick<PresentationSVGAttributes, 'overflow' | 'clip'> {
      x?: number | string | null
      y?: number | string | null
      width?: number | string | null
      height?: number | string | null
      patternUnits?: SVGUnits | null
      patternContentUnits?: SVGUnits | null
      patternTransform?: string | null
      href?: string | null
    }
    interface PolygonSVGAttributes<T>
      extends GraphicsElementSVGAttributes<T>,
        ShapeElementSVGAttributes<T>,
        ConditionalProcessingSVGAttributes,
        ExternalResourceSVGAttributes,
        StylableSVGAttributes,
        TransformableSVGAttributes,
        Pick<
          PresentationSVGAttributes,
          'marker-start' | 'marker-mid' | 'marker-end'
        > {
      points?: string | null
    }
    interface PolylineSVGAttributes<T>
      extends GraphicsElementSVGAttributes<T>,
        ShapeElementSVGAttributes<T>,
        ConditionalProcessingSVGAttributes,
        ExternalResourceSVGAttributes,
        StylableSVGAttributes,
        TransformableSVGAttributes,
        Pick<
          PresentationSVGAttributes,
          'marker-start' | 'marker-mid' | 'marker-end'
        > {
      points?: string | null
    }
    interface RadialGradientSVGAttributes<T>
      extends GradientElementSVGAttributes<T> {
      cx?: number | string | null
      cy?: number | string | null
      r?: number | string | null
      fx?: number | string | null
      fy?: number | string | null
    }
    interface RectSVGAttributes<T>
      extends GraphicsElementSVGAttributes<T>,
        ShapeElementSVGAttributes<T>,
        ConditionalProcessingSVGAttributes,
        ExternalResourceSVGAttributes,
        StylableSVGAttributes,
        TransformableSVGAttributes {
      x?: number | string | null
      y?: number | string | null
      width?: number | string | null
      height?: number | string | null
      rx?: number | string | null
      ry?: number | string | null
    }
    interface SetSVGAttributes<T>
      extends CoreSVGAttributes<T>,
        StylableSVGAttributes,
        AnimationTimingSVGAttributes {}
    interface StopSVGAttributes<T>
      extends CoreSVGAttributes<T>,
        StylableSVGAttributes,
        Pick<
          PresentationSVGAttributes,
          'color' | 'stop-color' | 'stop-opacity'
        > {
      offset?: number | string | null
    }
    interface SvgSVGAttributes<T>
      extends ContainerElementSVGAttributes<T>,
        NewViewportSVGAttributes<T>,
        ConditionalProcessingSVGAttributes,
        ExternalResourceSVGAttributes,
        StylableSVGAttributes,
        FitToViewBoxSVGAttributes,
        ZoomAndPanSVGAttributes,
        PresentationSVGAttributes {
      version?: string | null
      baseProfile?: string | null
      x?: number | string | null
      y?: number | string | null
      width?: number | string | null
      height?: number | string | null
      contentScriptType?: string | null
      contentStyleType?: string | null
      xmlns?: string | null
      'xmlns:xlink'?: string | null
    }
    interface SwitchSVGAttributes<T>
      extends ContainerElementSVGAttributes<T>,
        ConditionalProcessingSVGAttributes,
        ExternalResourceSVGAttributes,
        StylableSVGAttributes,
        TransformableSVGAttributes,
        Pick<PresentationSVGAttributes, 'display' | 'visibility'> {}
    interface SymbolSVGAttributes<T>
      extends ContainerElementSVGAttributes<T>,
        NewViewportSVGAttributes<T>,
        ExternalResourceSVGAttributes,
        StylableSVGAttributes,
        FitToViewBoxSVGAttributes {
      width?: number | string | null
      height?: number | string | null
      preserveAspectRatio?: SVGPreserveAspectRatio | null
      refX?: number | string | null
      refY?: number | string | null
      viewBox?: string | null
      x?: number | string | null
      y?: number | string | null
    }
    interface TextSVGAttributes<T>
      extends TextContentElementSVGAttributes<T>,
        GraphicsElementSVGAttributes<T>,
        ConditionalProcessingSVGAttributes,
        ExternalResourceSVGAttributes,
        StylableSVGAttributes,
        TransformableSVGAttributes,
        Pick<PresentationSVGAttributes, 'writing-mode' | 'text-rendering'> {
      x?: number | string | null
      y?: number | string | null
      dx?: number | string | null
      dy?: number | string | null
      rotate?: number | string | null
      textLength?: number | string | null
      lengthAdjust?: 'spacing' | 'spacingAndGlyphs' | null
    }
    interface TextPathSVGAttributes<T>
      extends TextContentElementSVGAttributes<T>,
        ConditionalProcessingSVGAttributes,
        XLinkSVGAttributes,
        ExternalResourceSVGAttributes,
        StylableSVGAttributes,
        Pick<
          PresentationSVGAttributes,
          'alignment-baseline' | 'baseline-shift' | 'display' | 'visibility'
        > {
      startOffset?: number | string | null
      method?: 'align' | 'stretch' | null
      spacing?: 'auto' | 'exact' | null
      href?: string | null
    }
    interface TSpanSVGAttributes<T>
      extends TextContentElementSVGAttributes<T>,
        ConditionalProcessingSVGAttributes,
        ExternalResourceSVGAttributes,
        StylableSVGAttributes,
        Pick<
          PresentationSVGAttributes,
          'alignment-baseline' | 'baseline-shift' | 'display' | 'visibility'
        > {
      x?: number | string | null
      y?: number | string | null
      dx?: number | string | null
      dy?: number | string | null
      rotate?: number | string | null
      textLength?: number | string | null
      lengthAdjust?: 'spacing' | 'spacingAndGlyphs' | null
    }
    interface UseSVGAttributes<T>
      extends CoreSVGAttributes<T>,
        StylableSVGAttributes,
        ConditionalProcessingSVGAttributes,
        XLinkSVGAttributes,
        GraphicsElementSVGAttributes<T>,
        PresentationSVGAttributes,
        ExternalResourceSVGAttributes,
        TransformableSVGAttributes {
      x?: number | string | null
      y?: number | string | null
      width?: number | string | null
      height?: number | string | null
      href?: string | null
    }
    interface ViewSVGAttributes<T>
      extends CoreSVGAttributes<T>,
        ExternalResourceSVGAttributes,
        FitToViewBoxSVGAttributes,
        ZoomAndPanSVGAttributes {
      viewTarget?: string | null
    }
    interface HTMLElementTags {
      a: AnchorHTMLAttributes<HTMLAnchorElement>
      abbr: HTMLAttributes<HTMLElement>
      address: HTMLAttributes<HTMLElement>
      area: AreaHTMLAttributes<HTMLAreaElement>
      article: HTMLAttributes<HTMLElement>
      aside: HTMLAttributes<HTMLElement>
      audio: AudioHTMLAttributes<HTMLAudioElement>
      b: HTMLAttributes<HTMLElement>
      base: BaseHTMLAttributes<HTMLBaseElement>
      bdi: HTMLAttributes<HTMLElement>
      bdo: HTMLAttributes<HTMLElement>
      blockquote: BlockquoteHTMLAttributes<HTMLElement>
      body: HTMLAttributes<HTMLBodyElement>
      br: HTMLAttributes<HTMLBRElement>
      button: ButtonHTMLAttributes<HTMLButtonElement>
      canvas: CanvasHTMLAttributes<HTMLCanvasElement>
      caption: HTMLAttributes<HTMLElement>
      cite: HTMLAttributes<HTMLElement>
      code: HTMLAttributes<HTMLElement>
      col: ColHTMLAttributes<HTMLTableColElement>
      colgroup: ColgroupHTMLAttributes<HTMLTableColElement>
      data: DataHTMLAttributes<HTMLElement>
      datalist: HTMLAttributes<HTMLDataListElement>
      dd: HTMLAttributes<HTMLElement>
      del: HTMLAttributes<HTMLElement>
      details: DetailsHtmlAttributes<HTMLDetailsElement>
      dfn: HTMLAttributes<HTMLElement>
      dialog: DialogHtmlAttributes<HTMLDialogElement>
      div: HTMLAttributes<HTMLDivElement>
      dl: HTMLAttributes<HTMLDListElement>
      dt: HTMLAttributes<HTMLElement>
      em: HTMLAttributes<HTMLElement>
      embed: EmbedHTMLAttributes<HTMLEmbedElement>
      fieldset: FieldsetHTMLAttributes<HTMLFieldSetElement>
      figcaption: HTMLAttributes<HTMLElement>
      figure: HTMLAttributes<HTMLElement>
      footer: HTMLAttributes<HTMLElement>
      form: FormHTMLAttributes<HTMLFormElement>
      h1: HTMLAttributes<HTMLHeadingElement>
      h2: HTMLAttributes<HTMLHeadingElement>
      h3: HTMLAttributes<HTMLHeadingElement>
      h4: HTMLAttributes<HTMLHeadingElement>
      h5: HTMLAttributes<HTMLHeadingElement>
      h6: HTMLAttributes<HTMLHeadingElement>
      head: HTMLAttributes<HTMLHeadElement>
      header: HTMLAttributes<HTMLElement>
      hgroup: HTMLAttributes<HTMLElement>
      hr: HTMLAttributes<HTMLHRElement>
      html: HTMLAttributes<HTMLHtmlElement>
      i: HTMLAttributes<HTMLElement>
      iframe: IframeHTMLAttributes<HTMLIFrameElement>
      img: ImgHTMLAttributes<HTMLImageElement>
      input: InputHTMLAttributes<HTMLInputElement>
      ins: InsHTMLAttributes<HTMLModElement>
      kbd: HTMLAttributes<HTMLElement>
      label: LabelHTMLAttributes<HTMLLabelElement>
      legend: HTMLAttributes<HTMLLegendElement>
      li: LiHTMLAttributes<HTMLLIElement>
      link: LinkHTMLAttributes<HTMLLinkElement>
      main: HTMLAttributes<HTMLElement>
      map: MapHTMLAttributes<HTMLMapElement>
      mark: HTMLAttributes<HTMLElement>
      menu: MenuHTMLAttributes<HTMLMenuElement>
      meta: MetaHTMLAttributes<HTMLMetaElement>
      meter: MeterHTMLAttributes<HTMLElement>
      nav: HTMLAttributes<HTMLElement>
      noscript: HTMLAttributes<HTMLElement>
      object: ObjectHTMLAttributes<HTMLObjectElement>
      ol: OlHTMLAttributes<HTMLOListElement>
      optgroup: OptgroupHTMLAttributes<HTMLOptGroupElement>
      option: OptionHTMLAttributes<HTMLOptionElement>
      output: OutputHTMLAttributes<HTMLElement>
      p: HTMLAttributes<HTMLParagraphElement>
      picture: HTMLAttributes<HTMLElement>
      pre: HTMLAttributes<HTMLPreElement>
      progress: ProgressHTMLAttributes<HTMLProgressElement>
      q: QuoteHTMLAttributes<HTMLQuoteElement>
      rp: HTMLAttributes<HTMLElement>
      rt: HTMLAttributes<HTMLElement>
      ruby: HTMLAttributes<HTMLElement>
      s: HTMLAttributes<HTMLElement>
      samp: HTMLAttributes<HTMLElement>
      script: ScriptHTMLAttributes<HTMLScriptElement>
      search: HTMLAttributes<HTMLElement>
      section: HTMLAttributes<HTMLElement>
      select: SelectHTMLAttributes<HTMLSelectElement>
      slot: HTMLSlotElementAttributes
      small: HTMLAttributes<HTMLElement>
      source: SourceHTMLAttributes<HTMLSourceElement>
      span: HTMLAttributes<HTMLSpanElement>
      strong: HTMLAttributes<HTMLElement>
      style: StyleHTMLAttributes<HTMLStyleElement>
      sub: HTMLAttributes<HTMLElement>
      summary: HTMLAttributes<HTMLElement>
      sup: HTMLAttributes<HTMLElement>
      table: HTMLAttributes<HTMLTableElement>
      tbody: HTMLAttributes<HTMLTableSectionElement>
      td: TdHTMLAttributes<HTMLTableCellElement>
      template: TemplateHTMLAttributes<HTMLTemplateElement>
      textarea: TextareaHTMLAttributes<HTMLTextAreaElement>
      tfoot: HTMLAttributes<HTMLTableSectionElement>
      th: ThHTMLAttributes<HTMLTableCellElement>
      thead: HTMLAttributes<HTMLTableSectionElement>
      time: TimeHTMLAttributes<HTMLElement>
      title: HTMLAttributes<HTMLTitleElement>
      tr: HTMLAttributes<HTMLTableRowElement>
      track: TrackHTMLAttributes<HTMLTrackElement>
      u: HTMLAttributes<HTMLElement>
      ul: HTMLAttributes<HTMLUListElement>
      var: HTMLAttributes<HTMLElement>
      video: VideoHTMLAttributes<HTMLVideoElement>
      wbr: HTMLAttributes<HTMLElement>
    }
    interface HTMLElementDeprecatedTags {
      big: HTMLAttributes<HTMLElement>
      keygen: KeygenHTMLAttributes<HTMLElement>
      menuitem: HTMLAttributes<HTMLElement>
      noindex: HTMLAttributes<HTMLElement>
      param: ParamHTMLAttributes<HTMLParamElement>
    }
    interface SVGElementTags {
      animate: AnimateSVGAttributes<SVGAnimateElement>
      animateMotion: AnimateMotionSVGAttributes<SVGAnimateMotionElement>
      animateTransform: AnimateTransformSVGAttributes<SVGAnimateTransformElement>
      circle: CircleSVGAttributes<SVGCircleElement>
      clipPath: ClipPathSVGAttributes<SVGClipPathElement>
      defs: DefsSVGAttributes<SVGDefsElement>
      desc: DescSVGAttributes<SVGDescElement>
      ellipse: EllipseSVGAttributes<SVGEllipseElement>
      feBlend: FeBlendSVGAttributes<SVGFEBlendElement>
      feColorMatrix: FeColorMatrixSVGAttributes<SVGFEColorMatrixElement>
      feComponentTransfer: FeComponentTransferSVGAttributes<SVGFEComponentTransferElement>
      feComposite: FeCompositeSVGAttributes<SVGFECompositeElement>
      feConvolveMatrix: FeConvolveMatrixSVGAttributes<SVGFEConvolveMatrixElement>
      feDiffuseLighting: FeDiffuseLightingSVGAttributes<SVGFEDiffuseLightingElement>
      feDisplacementMap: FeDisplacementMapSVGAttributes<SVGFEDisplacementMapElement>
      feDistantLight: FeDistantLightSVGAttributes<SVGFEDistantLightElement>
      feDropShadow: FeDropShadowSVGAttributes<SVGFEDropShadowElement>
      feFlood: FeFloodSVGAttributes<SVGFEFloodElement>
      feFuncA: FeFuncSVGAttributes<SVGFEFuncAElement>
      feFuncB: FeFuncSVGAttributes<SVGFEFuncBElement>
      feFuncG: FeFuncSVGAttributes<SVGFEFuncGElement>
      feFuncR: FeFuncSVGAttributes<SVGFEFuncRElement>
      feGaussianBlur: FeGaussianBlurSVGAttributes<SVGFEGaussianBlurElement>
      feImage: FeImageSVGAttributes<SVGFEImageElement>
      feMerge: FeMergeSVGAttributes<SVGFEMergeElement>
      feMergeNode: FeMergeNodeSVGAttributes<SVGFEMergeNodeElement>
      feMorphology: FeMorphologySVGAttributes<SVGFEMorphologyElement>
      feOffset: FeOffsetSVGAttributes<SVGFEOffsetElement>
      fePointLight: FePointLightSVGAttributes<SVGFEPointLightElement>
      feSpecularLighting: FeSpecularLightingSVGAttributes<SVGFESpecularLightingElement>
      feSpotLight: FeSpotLightSVGAttributes<SVGFESpotLightElement>
      feTile: FeTileSVGAttributes<SVGFETileElement>
      feTurbulence: FeTurbulanceSVGAttributes<SVGFETurbulenceElement>
      filter: FilterSVGAttributes<SVGFilterElement>
      foreignObject: ForeignObjectSVGAttributes<SVGForeignObjectElement>
      g: GSVGAttributes<SVGGElement>
      image: ImageSVGAttributes<SVGImageElement>
      line: LineSVGAttributes<SVGLineElement>
      linearGradient: LinearGradientSVGAttributes<SVGLinearGradientElement>
      marker: MarkerSVGAttributes<SVGMarkerElement>
      mask: MaskSVGAttributes<SVGMaskElement>
      metadata: MetadataSVGAttributes<SVGMetadataElement>
      mpath: MPathSVGAttributes<SVGMPathElement>
      path: PathSVGAttributes<SVGPathElement>
      pattern: PatternSVGAttributes<SVGPatternElement>
      polygon: PolygonSVGAttributes<SVGPolygonElement>
      polyline: PolylineSVGAttributes<SVGPolylineElement>
      radialGradient: RadialGradientSVGAttributes<SVGRadialGradientElement>
      rect: RectSVGAttributes<SVGRectElement>
      set: SetSVGAttributes<SVGSetElement>
      stop: StopSVGAttributes<SVGStopElement>
      svg: SvgSVGAttributes<SVGSVGElement>
      switch: SwitchSVGAttributes<SVGSwitchElement>
      symbol: SymbolSVGAttributes<SVGSymbolElement>
      text: TextSVGAttributes<SVGTextElement>
      textPath: TextPathSVGAttributes<SVGTextPathElement>
      tspan: TSpanSVGAttributes<SVGTSpanElement>
      use: UseSVGAttributes<SVGUseElement>
      view: ViewSVGAttributes<SVGViewElement>
    }
    interface IntrinsicElements
      extends HTMLElementTags,
        HTMLElementDeprecatedTags,
        SVGElementTags {}
  }
}
