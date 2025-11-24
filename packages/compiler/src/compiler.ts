import { generate } from 'astring'
import { decodeHTML } from 'entities'
import merge from 'merge-source-map'
import { parse, type ESTree } from 'meriyah'
import { SourceMapGenerator, type RawSourceMap } from 'source-map'
import { visit } from './visit'

export type { ESTree, RawSourceMap }

type CompilerContext = {
  config: Required<CompilerOptions>
  ast: ESTree.Program
  events: ESTree.Literal[]
  eventsCache: Set<string>
  generatedFunctions: WeakSet<ESTree.FunctionExpression>
  JSXId?: number
  refId?: number
  thisId?: number
  JSXParent?: ESTree.Expression
  functionParent?: Function
  hasThisInFunction?: boolean
  hasThisInProgram?: boolean
  hasDynamicChildrenInComponent?: boolean
  prevHasDynamicChildrenInComponent?: boolean
  shouldImportCreateComponent?: boolean
  shouldImportCreateElement?: boolean
  shouldImportInsert?: boolean
  shouldImportMergeProps?: boolean
  shouldImportSetAttribute?: boolean
  shouldImportSetAttributeNS?: boolean
  shouldImportSetClassName?: boolean
  shouldImportSetStyle?: boolean
  shouldImportSpread?: boolean
  shouldImportUse?: boolean
  shouldImportUseEffect?: boolean
  shouldImportUseMemo?: boolean
}
type CompilerOptions = {
  modulePath?: string
  file?: string
  sourceRoot?: string
  sourcemap?: RawSourceMap
}
type CompilerResult = {
  code: string
  map: RawSourceMap
}
type Position = Required<ESTree._Node>
type Listener = FunctionExpression | RightValue
type Stylesheet = ESTree.ObjectExpression | RightValue
type LeftValue = ESTree.Identifier | ESTree.MemberExpression
type Function = FunctionExpression | ESTree.FunctionDeclaration
type FunctionExpression =
  | ESTree.FunctionExpression
  | ESTree.ArrowFunctionExpression
type RightValue =
  | LeftValue
  | ESTree.CallExpression
  | ESTree.ChainExpression
  | ESTree.JSXElement
  | ESTree.JSXFragment
  | ESTree.ThisExpression
  | ESTree.NewExpression
  | ESTree.TaggedTemplateExpression
  | ESTree.ImportExpression
  | ESTree.MetaProperty

const UPPERCASE_REGEX = /^[A-Z]/
const NATIVE_EVENT_REGEX = /^on[a-z]+$/
const NON_BLANK_LINE_REGEX = /\S|^[^\S\r\n]+$/
const EDGE_SPACE_REGEX = /^\s*[\r\n]\s*|[\r\n]\s*$/g
const SPACE_REGEX = /\s+/g
const IDENTIFIER_REGEX = /^[a-z_$][\w$]*$/i
const SVGTags = new Set([
  'animate',
  'animateMotion',
  'animateTransform',
  'circle',
  'clipPath',
  'cursor',
  'defs',
  'desc',
  'ellipse',
  'feBlend',
  'feColorMatrix',
  'feComponentTransfer',
  'feComposite',
  'feConvolveMatrix',
  'feDiffuseLighting',
  'feDisplacementMap',
  'feDistantLight',
  'feDropShadow',
  'feFlood',
  'feFuncA',
  'feFuncB',
  'feFuncG',
  'feFuncR',
  'feGaussianBlur',
  'feImage',
  'feMerge',
  'feMergeNode',
  'feMorphology',
  'feOffset',
  'fePointLight',
  'feSpecularLighting',
  'feSpotLight',
  'feTile',
  'feTurbulence',
  'filter',
  'font-face',
  'font-face-format',
  'font-face-name',
  'font-face-src',
  'font-face-uri',
  'foreignObject',
  'g',
  'glyph',
  'glyphRef',
  'hkern',
  'line',
  'linearGradient',
  'marker',
  'mask',
  'metadata',
  'missing-glyph',
  'mpath',
  'path',
  'pattern',
  'polygon',
  'polyline',
  'radialGradient',
  'rect',
  'set',
  'stop',
  'svg',
  'switch',
  'symbol',
  'text',
  'textPath',
  'tref',
  'tspan',
  'use',
  'view',
  'vkern',
])
const MathMLTags = new Set([
  'annotation',
  'annotation-xml',
  'maction',
  'math',
  'menclose',
  'merror',
  'mfenced',
  'mfrac',
  'mi',
  'mmultiscripts',
  'mn',
  'mo',
  'mover',
  'mpadded',
  'mphantom',
  'mprescripts',
  'mroot',
  'mrow',
  'ms',
  'mspace',
  'msqrt',
  'mstyle',
  'msub',
  'msubsup',
  'msup',
  'mtable',
  'mtd',
  'mtext',
  'mtr',
  'munder',
  'munderover',
  'semantics',
])
const DOMProperties = new Set([
  'allowFullscreen',
  'async',
  'autofocus',
  'autoplay',
  'checked',
  'controls',
  'default',
  'disabled',
  'formNoValidate',
  'hidden',
  'indeterminate',
  'inert',
  'innerHTML',
  'innerText',
  'isMap',
  'loop',
  'multiple',
  'muted',
  'noValidate',
  'nomodule',
  'open',
  'playsInline',
  'readOnly',
  'required',
  'reversed',
  'seamless',
  'selected',
  'textContent',
  'value',
])
const keywords = new Set([
  'async',
  'await',
  'break',
  'case',
  'catch',
  'class',
  'const',
  'continue',
  'debugger',
  'default',
  'delete',
  'do',
  'else',
  'enum',
  'export',
  'extends',
  'false',
  'finally',
  'for',
  'function',
  'if',
  'import',
  'in',
  'instanceof',
  'let',
  'new',
  'null',
  'return',
  'super',
  'switch',
  'this',
  'throw',
  'true',
  'try',
  'typeof',
  'var',
  'void',
  'while',
  'with',
  'yield',
])
let currentContext: CompilerContext

export function compile(
  code: string,
  options: CompilerOptions = {},
): CompilerResult {
  let prevFunctionParent: Function | undefined
  let prevHasThisInFunction: boolean | undefined
  const ast = parse(code, {
    jsx: true,
    next: true,
    module: true,
    ranges: true,
    loc: true,
  })
  currentContext = {
    config: {
      sourcemap: options.sourcemap!,
      file: options.file ?? 'output.js',
      sourceRoot: options.sourceRoot ?? '',
      modulePath: options.modulePath ?? '@zessjs/core',
    },
    ast,
    events: [],
    eventsCache: new Set(),
    generatedFunctions: new WeakSet(),
  }
  visit(ast, {
    JSXElement(node) {
      currentContext.JSXId ??= 0
      currentContext.refId ??= 0
      currentContext.thisId ??= 0
      const stmts = transformElement(node)
      let expression: ESTree.Expression
      if (stmts.length === 1) {
        if (stmts[0].type === 'VariableDeclaration') {
          expression = stmts[0].declarations[0].init!
        } else {
          expression = (stmts[0] as ESTree.ExpressionStatement).expression
        }
      } else {
        const stmt = stmts[0] as ESTree.VariableDeclaration
        const id = stmt.declarations[0].id as ESTree.Identifier
        const callExpressionPosition = copyPosition(node)
        expression = createCallExpression(
          createArrowFunctionExpression(
            createBlockStatement(
              [...stmts, createReturnStatement(id, callExpressionPosition)],
              callExpressionPosition,
            ),
            callExpressionPosition,
          ),
          [],
          callExpressionPosition,
        )
      }
      currentContext.JSXParent ??= expression
      this.replace(expression)
    },
    JSXFragment(node) {
      currentContext.JSXId ??= 0
      currentContext.refId ??= 0
      currentContext.thisId ??= 0
      const expression = transformFragment(
        node.children,
        copyPosition(node.openingFragment),
      )!
      currentContext.JSXParent ??= expression
      this.replace(expression)
    },
    FunctionDeclaration(node) {
      prevFunctionParent = currentContext.functionParent
      prevHasThisInFunction = currentContext.hasThisInFunction
      currentContext.functionParent = node
      currentContext.hasThisInFunction = false
    },
    FunctionExpression(node) {
      if (currentContext.generatedFunctions.has(node)) {
        currentContext.generatedFunctions.delete(node)
      } else {
        prevFunctionParent = currentContext.functionParent
        prevHasThisInFunction = currentContext.hasThisInFunction
        currentContext.functionParent = node
        currentContext.hasThisInFunction = false
      }
    },
    ArrowFunctionExpression(node, parent, key) {
      if (
        parent?.type === 'PropertyDefinition' &&
        (key as keyof typeof parent) === 'value'
      ) {
        prevFunctionParent = currentContext.functionParent
        prevHasThisInFunction = currentContext.hasThisInFunction
        currentContext.functionParent = node
        currentContext.hasThisInFunction = false
      }
    },
    ThisExpression(node) {
      const expression = transformThisExpression(node)
      if (expression) this.replace(expression)
    },
    exit(node) {
      if (node === currentContext.functionParent) {
        currentContext.functionParent = prevFunctionParent
        currentContext.hasThisInFunction = prevHasThisInFunction
      } else if (node === currentContext.JSXParent) {
        currentContext.JSXId = undefined
        currentContext.refId = undefined
        currentContext.thisId = undefined
        currentContext.JSXParent = undefined
      }
    },
  })
  injectRuntimeImport(ast)
  const sourceMap = new SourceMapGenerator({
    file: currentContext.config.file,
    sourceRoot: currentContext.config.sourceRoot,
  })
  code = generate(ast, { sourceMap })
  let map = sourceMap.toJSON()
  if (currentContext.config.sourcemap) {
    map = merge(currentContext.config.sourcemap, map)!
  }
  return { code, map }
}

function transformElement(node: ESTree.JSXElement): ESTree.Statement[] {
  const stmts: ESTree.Statement[] = []
  const opening = node.openingElement
  const tagName = transformJSXTagName(opening.name)
  const tagNamePosition = copyPosition(tagName)
  if (tagName.type === 'Literal') {
    const value = tagName.value as string
    const args = [createLiteral(value, tagNamePosition)]
    const JSXId = createIdentifier(getUniqueId('el', 'JSXId'), tagNamePosition)
    const namespace = SVGTags.has(value) ? 1 : MathMLTags.has(value) ? 2 : 0
    if (namespace) args.push(createLiteral(namespace, tagNamePosition))
    currentContext.shouldImportCreateElement = true
    stmts.push(
      createVariableDeclaration(
        JSXId,
        createCallExpression(
          createIdentifier('_$createElement', tagNamePosition),
          args,
          tagNamePosition,
        ),
        tagNamePosition,
      ),
      ...transformAttributes(opening.attributes, JSXId),
      ...transformChildren(node.children, JSXId),
    )
  } else {
    const elementPosition = copyPosition(node)
    currentContext.shouldImportCreateComponent = true
    stmts.push(
      createExpressionStatement(
        createCallExpression(
          createIdentifier('_$createComponent', elementPosition),
          [
            tagName,
            transformProperties(
              opening.attributes,
              node.children,
              copyPosition(opening),
            ),
          ],
          elementPosition,
        ),
        elementPosition,
      ),
    )
  }
  return stmts
}

function transformFragment(
  children: ESTree.JSXChild[],
  position: Position,
  isInComponent?: boolean,
): ESTree.Expression | void {
  const elements: ESTree.Expression[] = []
  let hasDynamicChildren = false
  let shouldImportUseMemo = false
  let textContent: string | undefined
  let textPosition: Position | undefined
  let elementsPosition: Position | undefined
  let childExpression: ESTree.Expression | undefined
  for (let i = 0; i < children.length; ++i) {
    const childNode = children[i]
    if (childNode.type === 'JSXText') {
      const text = childNode.value
      if (isBlankLine(text)) continue
      if (textContent) {
        textContent = `${textContent}${text}`
      } else {
        textContent = text
        textPosition = copyPosition(childNode)
        elementsPosition ??= textPosition
      }
    } else if (isJSXEmptyExpression(childNode)) {
      continue
    } else if (childNode.type === 'JSXFragment') {
      children.splice(i--, 1, ...childNode.children)
    } else {
      const childPosition = copyPosition(childNode)
      let childElement: ESTree.Expression
      if (textContent) {
        elements.push(createLiteral(decodeText(textContent), textPosition!))
        textContent = textPosition = undefined
      }
      if (childNode.type === 'JSXElement') {
        const stmts = transformElement(childNode)
        if (isInComponent) hasDynamicChildren = true
        if (stmts.length > 1) {
          const stmt = stmts[0] as ESTree.VariableDeclaration
          const id = stmt.declarations[0].id as ESTree.Identifier
          childElement = createCallExpression(
            createArrowFunctionExpression(
              createBlockStatement(
                [...stmts, createReturnStatement(id, childPosition)],
                childPosition,
              ),
              childPosition,
            ),
            [],
            childPosition,
          )
        } else if (stmts[0].type === 'VariableDeclaration') {
          childElement = stmts[0].declarations[0].init!
        } else {
          childElement = (stmts[0] as ESTree.ExpressionStatement).expression
        }
      } else {
        const expression = childNode.expression as ESTree.Expression
        if (isInComponent) childExpression ??= expression
        if (isDynamicExpression(expression, isInComponent)) {
          shouldImportUseMemo = hasDynamicChildren = true
          childElement = createCallExpression(
            createIdentifier('_$memo', childPosition),
            [
              !isInComponent && isBareIdentifierCall(expression)
                ? expression.callee
                : createArrowFunctionExpression(
                    expression,
                    copyPosition(expression),
                  ),
            ],
            childPosition,
          )
        } else {
          childElement = expression
        }
      }
      elements.push(childElement)
      elementsPosition ??= childPosition
    }
  }
  if (textContent) {
    elements.push(createLiteral(decodeText(textContent), textPosition!))
  }
  if (isInComponent) {
    currentContext.prevHasDynamicChildrenInComponent =
      currentContext.hasDynamicChildrenInComponent
    currentContext.hasDynamicChildrenInComponent = hasDynamicChildren
  }
  if (elements.length > 1) {
    if (shouldImportUseMemo) currentContext.shouldImportUseMemo = true
    return createArrayExpression(elements, elementsPosition!)
  }
  if (elements.length === 1) {
    if (!childExpression) {
      if (shouldImportUseMemo) currentContext.shouldImportUseMemo = true
      return elements[0]
    }
    return childExpression
  }
  if (!isInComponent) return createArrayExpression(elements, position)
}

function transformThisExpression(
  node: ESTree.ThisExpression | ESTree.JSXIdentifier,
): ESTree.Identifier | void {
  if (!currentContext.JSXParent) return
  const thisId = createIdentifier(
    getUniqueId('self', 'thisId'),
    copyPosition(node),
  )
  if (!currentContext.functionParent) {
    if (currentContext.hasThisInProgram) return thisId
    const { body } = currentContext.ast
    const programPosition = copyPosition(currentContext.ast)
    currentContext.hasThisInProgram = true
    for (let i = 0; i < body.length; ++i) {
      if (body[i].type === 'ImportDeclaration') continue
      body.splice(
        i,
        0,
        createVariableDeclaration(
          thisId,
          createIdentifier('globalThis', programPosition),
          programPosition,
        ),
      )
      break
    }
  } else if (!currentContext.hasThisInFunction) {
    const functionPosition = copyPosition(currentContext.functionParent)
    const block = currentContext.functionParent.body!
    const declaration = createVariableDeclaration(
      thisId,
      createThisExpression(functionPosition),
      functionPosition,
    )
    currentContext.hasThisInFunction = true
    if (block.type === 'BlockStatement') {
      block.body.unshift(declaration)
    } else {
      currentContext.functionParent.body = createBlockStatement(
        [declaration, createReturnStatement(block, copyPosition(block))],
        functionPosition,
      )
    }
  }
  return thisId
}

function injectRuntimeImport(ast: ESTree.Program): void {
  const specifiers: ESTree.ImportSpecifier[] = []
  const programPosition = copyPosition(ast)
  if (currentContext.shouldImportCreateComponent) {
    specifiers.push(
      createImportSpecifier(
        '_$createComponent',
        'createComponent',
        programPosition,
      ),
    )
  }
  if (currentContext.shouldImportCreateElement) {
    specifiers.push(
      createImportSpecifier(
        '_$createElement',
        'createElement',
        programPosition,
      ),
    )
  }
  if (currentContext.events.length) {
    specifiers.push(
      createImportSpecifier(
        '_$delegateEvents',
        'delegateEvents',
        programPosition,
      ),
    )
    ast.body.push(
      createExpressionStatement(
        createCallExpression(
          createIdentifier('_$delegateEvents', programPosition),
          [createArrayExpression(currentContext.events, programPosition)],
          programPosition,
        ),
        programPosition,
      ),
    )
  }
  if (currentContext.shouldImportInsert) {
    specifiers.push(
      createImportSpecifier('_$insert', 'insert', programPosition),
    )
  }
  if (currentContext.shouldImportMergeProps) {
    specifiers.push(
      createImportSpecifier('_$mergeProps', 'mergeProps', programPosition),
    )
  }
  if (currentContext.shouldImportSetAttribute) {
    specifiers.push(
      createImportSpecifier('_$setAttribute', 'setAttribute', programPosition),
    )
  }
  if (currentContext.shouldImportSetAttributeNS) {
    specifiers.push(
      createImportSpecifier(
        '_$setAttributeNS',
        'setAttributeNS',
        programPosition,
      ),
    )
  }
  if (currentContext.shouldImportSetClassName) {
    specifiers.push(
      createImportSpecifier('_$className', 'setClassName', programPosition),
    )
  }
  if (currentContext.shouldImportSetStyle) {
    specifiers.push(
      createImportSpecifier('_$style', 'setStyle', programPosition),
    )
  }
  if (currentContext.shouldImportSpread) {
    specifiers.push(
      createImportSpecifier('_$spread', 'spread', programPosition),
    )
  }
  if (currentContext.shouldImportUse) {
    specifiers.push(createImportSpecifier('_$use', 'use', programPosition))
  }
  if (currentContext.shouldImportUseEffect) {
    specifiers.push(
      createImportSpecifier('_$effect', 'useRenderEffect', programPosition),
    )
  }
  if (currentContext.shouldImportUseMemo) {
    specifiers.push(createImportSpecifier('_$memo', 'useMemo', programPosition))
  }
  if (specifiers.length) {
    ast.body.unshift({
      type: 'ImportDeclaration',
      specifiers,
      attributes: [],
      source: createLiteral(currentContext.config.modulePath, programPosition),
      ...programPosition,
    })
  }
}

function transformJSXTagName(
  node: ESTree.JSXTagNameExpression,
): ESTree.PropertyName | ESTree.MemberExpression {
  const tagNamePosition = copyPosition(node)
  if (node.type === 'JSXNamespacedName') {
    const namespace = node.namespace as ESTree.JSXIdentifier
    return createLiteral(`${namespace.name}:${node.name.name}`, tagNamePosition)
  }
  let object: ESTree.MemberExpression | ESTree.Identifier
  let expression: ESTree.PropertyName | ESTree.MemberExpression | undefined
  if (node.type === 'JSXMemberExpression') {
    object = expression = tagNamePosition as ESTree.MemberExpression
    do {
      const isValidPropertyName = isValidIdentifier(node.property.name)
      const propertyPosition = copyPosition(node.property)
      object.type = 'MemberExpression'
      ;(object as ESTree.MemberExpression).property = isValidPropertyName
        ? createIdentifier(node.property.name, propertyPosition)
        : createLiteral(node.property.name, propertyPosition)
      ;(object as ESTree.MemberExpression).computed = !isValidPropertyName
      ;(object as ESTree.MemberExpression).object = object = copyPosition(
        node.object,
      ) as ESTree.MemberExpression
      node = node.object
    } while (node.type === 'JSXMemberExpression')
  }
  const tagName = node as ESTree.JSXIdentifier
  if (tagName.name === 'this') {
    const id = transformThisExpression(tagName)!
    if (expression) {
      object!.type = 'Identifier'
      ;(object! as ESTree.Identifier).name = id.name
    } else {
      expression = id
    }
  } else if (expression || UPPERCASE_REGEX.test(tagName.name)) {
    if (expression) {
      object!.type = 'Identifier'
      ;(object! as ESTree.Identifier).name = tagName.name
    } else {
      expression = createIdentifier(tagName.name, tagNamePosition)
    }
  } else {
    expression = createLiteral(tagName.name, tagNamePosition)
  }
  return expression
}

function transformAttributes(
  attrs: ESTree.JSXOpeningElement['attributes'],
  id: ESTree.Identifier,
): ESTree.Statement[] {
  const stmts: ESTree.Statement[] = []
  const attributeNameCache = new Set(['children'])
  let shouldImportSpread = false
  let shouldImportMergeProps = false
  let properties: ESTree.Property[] = []
  let shouldImportSetStyle: boolean | undefined
  let shouldImportSetClassName: boolean | undefined
  let shouldImportSetAttribute: boolean | undefined
  let shouldImportSetAttributeNS: boolean | undefined
  let shouldImportUseEffect: boolean | undefined
  let ref: ESTree.Statement[] | undefined
  let events: ESTree.Statement[] | undefined
  let objectPosition: Position | undefined
  let spreadArgs: ESTree.Expression[] | undefined
  let spreadArgsPosition: Position | undefined
  let effect: ESTree.CallExpression | undefined
  let effectProperty: ESTree.Property | undefined
  let effectStmts: ESTree.Statement[] | undefined
  let effectParameter: ESTree.Identifier | undefined
  let effectFunction: ESTree.ArrowFunctionExpression
  let effectPosition: Position
  let dynamicCount: number
  for (let i = 0; i < attrs.length; ++i) {
    let expression: ESTree.Expression
    const attr = attrs[i]
    const attributePosition = copyPosition(attr)
    if (attr.type === 'JSXAttribute') {
      const attributeName = getAttributeName(attr.name)
      if (attributeNameCache.has(attributeName)) continue
      let value: ESTree.Expression
      let isDynamicValue = false
      const attributeNamePosition = copyPosition(attr.name)
      attributeNameCache.add(attributeName)
      if (!attr.value) {
        value = createLiteral(true, attributeNamePosition)
      } else if (attr.value.type === 'Literal') {
        value = attr.value
      } else if (attr.value.type === 'JSXExpressionContainer') {
        expression = attr.value.expression as ESTree.Expression
        if (attributeName === 'ref') {
          if (matchesType(expression, isRightValue)) {
            const refId = createIdentifier(
              getUniqueId('ref', 'refId'),
              attributeNamePosition,
            )
            const binaryExpression = createBinaryExpression(
              createUnaryExpression(refId, attributePosition),
              createLiteral('function', attributePosition),
              '===',
              attributePosition,
            )
            const callExpression = createCallExpression(
              createIdentifier('_$use', attributePosition),
              [refId, id],
              attributePosition,
            )
            currentContext.shouldImportUse = true
            ref = [
              createVariableDeclaration(refId, expression, attributePosition),
              createExpressionStatement(
                isLeftValue(expression)
                  ? createConditionalExpression(
                      binaryExpression,
                      callExpression,
                      createAssignmentExpression(
                        expression,
                        id,
                        attributePosition,
                      ),
                      attributePosition,
                    )
                  : createLogicalExpression(
                      binaryExpression,
                      callExpression,
                      attributePosition,
                    ),
                attributePosition,
              ),
            ]
            continue
          }
          if (isFunctionExpression(expression)) {
            currentContext.shouldImportUse = true
            ref = [
              createExpressionStatement(
                createCallExpression(
                  createIdentifier('_$use', attributePosition),
                  [expression, id],
                  attributePosition,
                ),
                attributePosition,
              ),
            ]
            continue
          }
        } else if (
          !shouldImportSpread &&
          attributeName.startsWith('on') &&
          matchesType(expression, isListener)
        ) {
          let eventName: string
          if (NATIVE_EVENT_REGEX.test(attributeName)) {
            eventName = attributeName
          } else {
            eventName = attributeName.slice(2).toLowerCase()
            if (eventName === 'doubleclick') eventName = 'dblclick'
            if (!currentContext.eventsCache.has(eventName)) {
              currentContext.eventsCache.add(eventName)
              currentContext.events.push(
                createLiteral(eventName, attributeNamePosition),
              )
            }
            eventName = `$$${eventName}`
          }
          ;(events ??= []).push(
            createExpressionStatement(
              createAssignmentExpression(
                createMemberExpression(
                  id,
                  createIdentifier(eventName, attributeNamePosition),
                  false,
                  attributeNamePosition,
                ),
                expression,
                attributePosition,
              ),
              attributePosition,
            ),
          )
          continue
        }
        value = expression
        isDynamicValue = isDynamicExpression(value)
      }
      const isValidPropertyName = isValidIdentifier(attributeName)
      const property = createProperty(
        isValidPropertyName
          ? createIdentifier(attributeName, attributeNamePosition)
          : createLiteral(attributeName, attributeNamePosition),
        isDynamicValue
          ? createFunctionExpression([
              createReturnStatement(value!, attributePosition),
            ])
          : value!,
        isDynamicValue ? 'get' : 'init',
        !isValidPropertyName,
        false,
        attributePosition,
      )
      objectPosition ??= attributePosition
      properties.push(property)
      if (shouldImportSpread) continue
      let styleOrClassArgs: ESTree.Expression[] | undefined
      if (attributeName === 'style') {
        if (matchesType(value!, isStylesheet)) {
          shouldImportSetStyle = true
          expression = createCallExpression(
            createIdentifier('_$style', attributeNamePosition),
            (styleOrClassArgs = [id, value!]),
            attributePosition,
          )
        } else {
          expression = createAssignmentExpression(
            createMemberExpression(
              createMemberExpression(
                id,
                createIdentifier(attributeName, attributeNamePosition),
                false,
                attributeNamePosition,
              ),
              createIdentifier('cssText', attributeNamePosition),
              false,
              attributeNamePosition,
            ),
            value!,
            attributePosition,
          )
        }
      } else if (attributeName === 'class' || attributeName === 'className') {
        if (matchesType(value!, isStylesheet)) {
          shouldImportSetClassName = true
          expression = createCallExpression(
            createIdentifier('_$className', attributeNamePosition),
            (styleOrClassArgs = [id, value!]),
            attributePosition,
          )
        } else {
          shouldImportSetAttribute = true
          expression = createCallExpression(
            createIdentifier('_$setAttribute', attributeNamePosition),
            [id, createLiteral('class', attributeNamePosition), value!],
            attributePosition,
          )
        }
      } else if (
        DOMProperties.has(attributeName) ||
        attributeName.startsWith('on')
      ) {
        expression = createAssignmentExpression(
          createMemberExpression(
            id,
            createIdentifier(attributeName, attributeNamePosition),
            false,
            attributeNamePosition,
          ),
          value!,
          attributePosition,
        )
      } else {
        let method: string
        let attributeArgs: ESTree.Expression[]
        const prefix = attributeName.split(':')[0]
        const namespace = prefix === 'xlink' ? 3 : prefix === 'xml' ? 4 : 0
        const name = createLiteral(attributeName, attributeNamePosition)
        if (namespace) {
          method = '_$setAttributeNS'
          shouldImportSetAttributeNS = true
          attributeArgs = [
            id,
            createLiteral(namespace, attributeNamePosition),
            name,
            value!,
          ]
        } else {
          method = '_$setAttribute'
          shouldImportSetAttribute = true
          attributeArgs = [id, name, value!]
        }
        expression = createCallExpression(
          createIdentifier(method, attributeNamePosition),
          attributeArgs,
          attributePosition,
        )
      }
      if (isDynamicValue) {
        if (effect) {
          let valueId: ESTree.Identifier
          let effectKey: ESTree.PropertyName
          let member: ESTree.MemberExpression
          let object: ESTree.ObjectExpression
          let assignment: ESTree.AssignmentExpression
          let declaration: ESTree.VariableDeclaration
          if (effect.arguments.length === 1) {
            let hasEffectParameter: boolean
            let effectValue: ESTree.Expression
            let effectCall = effectFunction!.body as ESTree.Expression
            effectKey = effectProperty!.key as ESTree.PropertyName
            if (effectParameter) {
              hasEffectParameter = true
            } else {
              hasEffectParameter = false
              effectParameter = createIdentifier(
                getUniqueId('p'),
                effectPosition!,
              )
            }
            dynamicCount = 0
            valueId = createIdentifier(
              getUniqueId('v', ++dynamicCount),
              effectPosition!,
            )
            member = createMemberExpression(
              effectParameter,
              effectKey,
              effectProperty!.computed,
              effectPosition!,
            )
            if (hasEffectParameter) {
              const args = (effectCall as ESTree.CallExpression).arguments
              effectValue = args[1]
              args[1] = valueId
              args[2] = member
              effectCall = createAssignmentExpression(
                member,
                effectCall,
                effectPosition!,
              )
            } else {
              assignment = createAssignmentExpression(
                member,
                valueId,
                effectPosition!,
              )
              if (effectCall.type === 'CallExpression') {
                const index = effectCall.arguments.length - 1
                effectValue = effectCall.arguments[index]
                effectCall.arguments[index] = assignment
              } else {
                effectValue = (effectCall as ESTree.AssignmentExpression).right
                ;(effectCall as ESTree.AssignmentExpression).right = assignment
              }
              effectCall = createLogicalExpression(
                createBinaryExpression(valueId, member, '!==', effectPosition!),
                effectCall,
                effectPosition!,
              )
              effectFunction!.params.push(effectParameter)
            }
            declaration = createVariableDeclaration(
              valueId,
              effectValue,
              effectPosition!,
            )
            effectStmts = [
              declaration,
              createExpressionStatement(effectCall, effectPosition!),
            ]
            effectFunction!.body = createBlockStatement(
              effectStmts,
              effectPosition!,
            )
            object = createObjectExpression(
              [
                createProperty(
                  effectKey,
                  createIdentifier('undefined', effectPosition!),
                  'init',
                  effectProperty!.computed,
                  false,
                  effectPosition!,
                ),
              ],
              effectPosition!,
            )
            effect.arguments.push(object)
          } else {
            object = effect.arguments[1] as ESTree.ObjectExpression
            declaration = effectStmts![0] as ESTree.VariableDeclaration
          }
          effectKey = property.key as ESTree.PropertyName
          valueId = createIdentifier(
            getUniqueId('v', ++dynamicCount!),
            attributePosition,
          )
          member = createMemberExpression(
            effectParameter!,
            effectKey,
            property.computed,
            attributePosition,
          )
          if (styleOrClassArgs) {
            styleOrClassArgs[1] = valueId
            styleOrClassArgs.push(member)
            expression = createAssignmentExpression(
              member,
              expression,
              attributePosition,
            )
          } else {
            assignment = createAssignmentExpression(
              member,
              valueId,
              attributePosition,
            )
            if (expression.type === 'CallExpression') {
              expression.arguments[expression.arguments.length - 1] = assignment
            } else {
              ;(expression as ESTree.AssignmentExpression).right = assignment
            }
            expression = createLogicalExpression(
              createBinaryExpression(valueId, member, '!==', attributePosition),
              expression,
              attributePosition,
            )
          }
          object.properties.push(
            createProperty(
              effectKey,
              createIdentifier('undefined', attributePosition),
              'init',
              property.computed,
              false,
              attributePosition,
            ),
          )
          declaration.declarations.push(
            createVariableDeclarator(valueId, value!, attributePosition),
          )
          effectStmts!.push(
            createExpressionStatement(expression, attributePosition),
          )
          continue
        }
        effectProperty = property
        effectPosition = attributePosition
        effectFunction = createArrowFunctionExpression(
          expression,
          effectPosition,
        )
        if (styleOrClassArgs) {
          effectParameter = createIdentifier(getUniqueId('p'), effectPosition)
          effectFunction.params.push(effectParameter)
          styleOrClassArgs.push(effectParameter)
        }
        shouldImportUseEffect = true
        expression = effect = createCallExpression(
          createIdentifier('_$effect', effectPosition),
          [effectFunction],
          effectPosition,
        )
      }
    } else {
      let { argument } = attr
      spreadArgs ??= [id]
      if (properties.length) {
        spreadArgs.push(createObjectExpression(properties, objectPosition!))
        properties = []
        spreadArgsPosition ??= objectPosition
        objectPosition = undefined
      }
      if (isDynamicExpression(argument)) {
        shouldImportMergeProps = true
        argument = isBareIdentifierCall(argument)
          ? argument.callee
          : createArrowFunctionExpression(argument, copyPosition(argument))
      }
      spreadArgs.push(argument)
      if (shouldImportSpread) continue
      currentContext.shouldImportSpread = shouldImportSpread = true
      spreadArgsPosition ??= attributePosition
      shouldImportSetStyle = false
      shouldImportSetClassName = false
      shouldImportSetAttribute = false
      shouldImportSetAttributeNS = false
      shouldImportUseEffect = false
      stmts.length = 0
      expression = createCallExpression(
        createIdentifier('_$spread', attributePosition),
        spreadArgs,
        attributePosition,
      )
    }
    stmts.push(createExpressionStatement(expression, attributePosition))
  }
  if (spreadArgs) {
    if (properties.length) {
      spreadArgs.push(createObjectExpression(properties, objectPosition!))
    }
    if (shouldImportMergeProps || spreadArgs.length > 2) {
      currentContext.shouldImportMergeProps = true
      spreadArgs.splice(
        1,
        spreadArgs.length - 1,
        createCallExpression(
          createIdentifier('_$mergeProps', spreadArgsPosition!),
          spreadArgs.slice(1),
          spreadArgsPosition!,
        ),
      )
    }
  } else {
    if (shouldImportSetStyle) {
      currentContext.shouldImportSetStyle = true
    }
    if (shouldImportSetClassName) {
      currentContext.shouldImportSetClassName = true
    }
    if (shouldImportSetAttribute) {
      currentContext.shouldImportSetAttribute = true
    }
    if (shouldImportSetAttributeNS) {
      currentContext.shouldImportSetAttributeNS = true
    }
    if (shouldImportUseEffect) {
      currentContext.shouldImportUseEffect = true
      if (effectStmts) {
        effectStmts.push(
          createReturnStatement(effectParameter!, effectPosition!),
        )
      }
    }
  }
  if (events) stmts.unshift(...events)
  if (ref) stmts.unshift(...ref)
  return stmts
}

function transformChildren(
  children: ESTree.JSXChild[],
  id: ESTree.Identifier,
): ESTree.Statement[] {
  const stmts: ESTree.Statement[] = []
  let elements: ESTree.Expression[] = []
  let textContent: string | undefined
  let textPosition: Position | undefined
  let elementsPosition: Position | undefined
  for (let i = 0; i < children.length; ++i) {
    const childNode = children[i]
    if (childNode.type === 'JSXText') {
      const text = childNode.value
      if (isBlankLine(text)) continue
      if (textContent) {
        textContent = `${textContent}${text}`
      } else {
        textContent = text
        textPosition = copyPosition(childNode)
        elementsPosition ??= textPosition
      }
    } else if (isJSXEmptyExpression(childNode)) {
      continue
    } else if (childNode.type === 'JSXFragment') {
      children.splice(i--, 1, ...childNode.children)
    } else {
      const childPosition = copyPosition(childNode)
      let expression: ESTree.Expression
      if (textContent) {
        elements.push(createLiteral(decodeText(textContent), textPosition!))
        textContent = textPosition = undefined
      }
      if (childNode.type === 'JSXElement') {
        const childStmts = transformElement(childNode)
        if (childStmts.length > 1) {
          const stmt = childStmts[0] as ESTree.VariableDeclaration
          elements.push(stmt.declarations[0].id as ESTree.Identifier)
          elementsPosition ??= childPosition
          stmts.push(...childStmts)
          continue
        } else if (childStmts[0].type === 'VariableDeclaration') {
          elements.push(childStmts[0].declarations[0].init!)
          elementsPosition ??= childPosition
          continue
        } else {
          expression = (childStmts[0] as ESTree.ExpressionStatement).expression
        }
      } else {
        expression = childNode.expression as ESTree.Expression
        if (isBareIdentifierCall(expression)) {
          expression = expression.callee
        } else if (isDynamicExpression(expression)) {
          expression = createArrowFunctionExpression(
            expression,
            copyPosition(expression),
          )
        }
      }
      if (elements.length) {
        stmts.push(
          createExpressionStatement(
            createCallExpression(
              createMemberExpression(
                id,
                createIdentifier('append', elementsPosition!),
                false,
                elementsPosition!,
              ),
              elements,
              elementsPosition!,
            ),
            elementsPosition!,
          ),
        )
        elements = []
        elementsPosition = undefined
      }
      currentContext.shouldImportInsert = true
      stmts.push(
        createExpressionStatement(
          createCallExpression(
            createIdentifier('_$insert', childPosition),
            [id, expression],
            childPosition,
          ),
          childPosition,
        ),
      )
    }
  }
  if (textContent) {
    elements.push(createLiteral(decodeText(textContent), textPosition!))
  }
  if (elements.length) {
    stmts.push(
      createExpressionStatement(
        !stmts.length && elements.length === 1 && textContent
          ? createAssignmentExpression(
              createMemberExpression(
                id,
                createIdentifier('textContent', elementsPosition!),
                false,
                elementsPosition!,
              ),
              elements[0],
              elementsPosition!,
            )
          : createCallExpression(
              createMemberExpression(
                id,
                createIdentifier('append', elementsPosition!),
                false,
                elementsPosition!,
              ),
              elements,
              elementsPosition!,
            ),
        elementsPosition!,
      ),
    )
  }
  return stmts
}

function transformProperties(
  attrs: ESTree.JSXOpeningElement['attributes'],
  children: ESTree.JSXChild[],
  position: Position,
): ESTree.Expression {
  const args: ESTree.Expression[] = []
  const propertyNameCache = new Set(['children'])
  let shouldImportMergeProps = false
  let properties: ESTree.Property[] = []
  let objectPosition: Position | undefined
  let argsPosition: Position | undefined
  for (let i = 0; i < attrs.length; ++i) {
    const attr = attrs[i]
    const propertyPosition = copyPosition(attr)
    if (attr.type === 'JSXAttribute') {
      const propertyName = getAttributeName(attr.name)
      if (propertyNameCache.has(propertyName)) continue
      let value: ESTree.Expression
      let isDynamicValue = false
      const propertyNamePosition = copyPosition(attr.name)
      propertyNameCache.add(propertyName)
      if (!attr.value) {
        value = createLiteral(true, propertyNamePosition)
      } else if (attr.value.type === 'Literal') {
        value = attr.value
      } else if (attr.value.type === 'JSXExpressionContainer') {
        const expression = attr.value.expression as ESTree.Expression
        if (propertyName === 'ref') {
          if (matchesType(expression, isRightValue)) {
            const refId = createIdentifier(
              getUniqueId('ref', 'refId'),
              propertyNamePosition,
            )
            const argument = createIdentifier(
              getUniqueId('r'),
              copyPosition(expression),
            )
            const binaryExpression = createBinaryExpression(
              createUnaryExpression(refId, propertyPosition),
              createLiteral('function', propertyPosition),
              '===',
              propertyPosition,
            )
            const callExpression = createCallExpression(
              refId,
              [argument],
              propertyPosition,
            )
            objectPosition ??= propertyPosition
            properties.push(
              createProperty(
                createIdentifier(propertyName, propertyNamePosition),
                createFunctionExpression(
                  [
                    createVariableDeclaration(
                      refId,
                      expression,
                      propertyPosition,
                    ),
                    createExpressionStatement(
                      isLeftValue(expression)
                        ? createConditionalExpression(
                            binaryExpression,
                            callExpression,
                            createAssignmentExpression(
                              expression,
                              argument,
                              propertyPosition,
                            ),
                            propertyPosition,
                          )
                        : createLogicalExpression(
                            binaryExpression,
                            callExpression,
                            propertyPosition,
                          ),
                      propertyPosition,
                    ),
                  ],
                  argument,
                ),
                'init',
                false,
                true,
                propertyPosition,
              ),
            )
          } else if (isFunctionExpression(expression)) {
            objectPosition ??= propertyPosition
            properties.push(
              createProperty(
                createIdentifier(propertyName, propertyNamePosition),
                expression,
                'init',
                false,
                false,
                propertyPosition,
              ),
            )
          }
          continue
        }
        value = expression
        isDynamicValue = isDynamicExpression(value, true)
      }
      const isValidPropertyName = isValidIdentifier(propertyName)
      objectPosition ??= propertyPosition
      properties.push(
        createProperty(
          isValidPropertyName
            ? createIdentifier(propertyName, propertyNamePosition)
            : createLiteral(propertyName, propertyNamePosition),
          isDynamicValue
            ? createFunctionExpression([
                createReturnStatement(value!, propertyPosition),
              ])
            : value!,
          isDynamicValue ? 'get' : 'init',
          !isValidPropertyName,
          false,
          propertyPosition,
        ),
      )
    } else {
      let { argument } = attr
      if (properties.length) {
        args.push(createObjectExpression(properties, objectPosition!))
        properties = []
        argsPosition ??= objectPosition
        objectPosition = undefined
      }
      if (isDynamicExpression(argument)) {
        shouldImportMergeProps = true
        argument = isBareIdentifierCall(argument)
          ? argument.callee
          : createArrowFunctionExpression(argument, copyPosition(argument))
      }
      args.push(argument)
      argsPosition ??= propertyPosition
    }
  }
  if (children.length) {
    const childrenPosition = copyPosition(children[0])
    const childrenExpression = transformFragment(
      children,
      childrenPosition,
      true,
    )
    if (childrenExpression) {
      const hasDynamicChildren = currentContext.hasDynamicChildrenInComponent
      properties.push(
        createProperty(
          createIdentifier('children', childrenPosition),
          hasDynamicChildren
            ? createFunctionExpression([
                createReturnStatement(childrenExpression, childrenPosition),
              ])
            : childrenExpression,
          hasDynamicChildren ? 'get' : 'init',
          false,
          false,
          childrenPosition,
        ),
      )
    }
    currentContext.hasDynamicChildrenInComponent =
      currentContext.prevHasDynamicChildrenInComponent
  }
  if (properties.length) {
    args.push(createObjectExpression(properties, objectPosition!))
    argsPosition ??= objectPosition
  }
  if (shouldImportMergeProps || args.length > 1) {
    currentContext.shouldImportMergeProps = true
    return createCallExpression(
      createIdentifier('_$mergeProps', argsPosition!),
      args,
      argsPosition!,
    )
  }
  if (args.length === 1) return args[0]
  return createObjectExpression(properties, position)
}

function getAttributeName(node: ESTree.JSXAttribute['name']): string {
  if (node.type === 'JSXIdentifier') return node.name
  const namespace = node.namespace as ESTree.JSXIdentifier
  return `${namespace.name}:${node.name.name}`
}

function copyPosition(node: ESTree.Node): Position {
  return {
    start: node.start!,
    end: node.end!,
    range: node.range!,
    loc: node.loc!,
  }
}

function createExpressionStatement(
  expression: ESTree.Expression,
  position: Position,
): ESTree.ExpressionStatement {
  return {
    type: 'ExpressionStatement',
    expression,
    ...position,
  }
}

function createVariableDeclaration(
  id: ESTree.Identifier,
  init: ESTree.Expression,
  position: Position,
): ESTree.VariableDeclaration {
  return {
    type: 'VariableDeclaration',
    kind: 'const',
    declarations: [createVariableDeclarator(id, init, position)],
    ...position,
  }
}

function createReturnStatement(
  argument: ESTree.Expression,
  position: Position,
): ESTree.ReturnStatement {
  return {
    type: 'ReturnStatement',
    argument,
    ...position,
  }
}

function createBlockStatement(
  body: ESTree.Statement[],
  position: Position,
): ESTree.BlockStatement {
  return {
    type: 'BlockStatement',
    body,
    ...position,
  }
}

function createArrowFunctionExpression(
  body: ESTree.Expression | ESTree.BlockStatement,
  position: Position,
): ESTree.ArrowFunctionExpression {
  return {
    type: 'ArrowFunctionExpression',
    params: [],
    body,
    async: false,
    generator: false,
    expression: body.type !== 'BlockStatement',
    ...position,
  }
}

function createFunctionExpression(
  body: ESTree.Statement[],
  parameter?: ESTree.Identifier,
): ESTree.FunctionExpression {
  const functionPosition = copyPosition(body[0])
  const FunctionExpression: ESTree.FunctionExpression = {
    type: 'FunctionExpression',
    params: parameter ? [parameter] : [],
    body: createBlockStatement(body, functionPosition),
    async: false,
    generator: false,
    id: null,
    ...functionPosition,
  }
  currentContext.generatedFunctions.add(FunctionExpression)
  return FunctionExpression
}

function createCallExpression(
  callee: ESTree.Expression,
  args: ESTree.Expression[],
  position: Position,
): ESTree.CallExpression {
  return {
    type: 'CallExpression',
    callee,
    arguments: args,
    optional: false,
    ...position,
  }
}

function createMemberExpression(
  object: ESTree.Expression,
  property: ESTree.Expression,
  computed: boolean,
  position: Position,
): ESTree.MemberExpression {
  return {
    type: 'MemberExpression',
    object,
    property,
    computed,
    optional: false,
    ...position,
  }
}

function createProperty(
  key: ESTree.PropertyName,
  value: ESTree.Expression,
  kind: ESTree.Property['kind'],
  computed: boolean,
  method: boolean,
  position: Position,
): ESTree.Property {
  return {
    type: 'Property',
    key,
    value,
    kind,
    computed,
    method,
    shorthand: false,
    ...position,
  }
}

function createImportSpecifier(
  local: string,
  imported: string,
  position: Position,
): ESTree.ImportSpecifier {
  return {
    type: 'ImportSpecifier',
    local: createIdentifier(local, position),
    imported: createIdentifier(imported, position),
    ...position,
  }
}

function createObjectExpression(
  properties: ESTree.Property[],
  position: Position,
): ESTree.ObjectExpression {
  return {
    type: 'ObjectExpression',
    properties,
    ...position,
  }
}

function createArrayExpression(
  elements: ESTree.Expression[],
  position: Position,
): ESTree.ArrayExpression {
  return {
    type: 'ArrayExpression',
    elements,
    ...position,
  }
}

function createAssignmentExpression(
  left: ESTree.Expression,
  right: ESTree.Expression,
  position: Position,
): ESTree.AssignmentExpression {
  return {
    type: 'AssignmentExpression',
    left,
    right,
    operator: '=',
    ...position,
  }
}

function createBinaryExpression(
  left: ESTree.Expression,
  right: ESTree.Expression,
  operator: string,
  position: Position,
): ESTree.BinaryExpression {
  return {
    type: 'BinaryExpression',
    left,
    right,
    operator,
    ...position,
  }
}

function createLogicalExpression(
  left: ESTree.Expression,
  right: ESTree.Expression,
  position: Position,
): ESTree.LogicalExpression {
  return {
    type: 'LogicalExpression',
    left,
    right,
    operator: '&&',
    ...position,
  }
}

function createConditionalExpression(
  test: ESTree.Expression,
  consequent: ESTree.Expression,
  alternate: ESTree.Expression,
  position: Position,
): ESTree.ConditionalExpression {
  return {
    type: 'ConditionalExpression',
    test,
    consequent,
    alternate,
    ...position,
  }
}

function createUnaryExpression(
  argument: ESTree.Identifier,
  position: Position,
): ESTree.UnaryExpression {
  return {
    type: 'UnaryExpression',
    operator: 'typeof',
    argument,
    prefix: true,
    ...position,
  }
}

function createVariableDeclarator(
  id: ESTree.Identifier,
  init: ESTree.Expression,
  position: Position,
): ESTree.VariableDeclarator {
  return {
    type: 'VariableDeclarator',
    id,
    init,
    ...position,
  }
}

function createIdentifier(name: string, position: Position): ESTree.Identifier {
  return { type: 'Identifier', name, ...position }
}

function createLiteral(
  value: ESTree.Literal['value'],
  position: Position,
): ESTree.Literal {
  return { type: 'Literal', value, raw: JSON.stringify(value), ...position }
}

function createThisExpression(position: Position): ESTree.ThisExpression {
  return { type: 'ThisExpression', ...position }
}

function getUniqueId(
  prefix: string,
  key?: keyof CompilerContext | number,
): string {
  let id: number | ''
  if (
    currentContext[key as keyof CompilerContext] != null &&
    currentContext[key as keyof CompilerContext]++
  ) {
    id = currentContext[key as keyof CompilerContext] as number
  } else if ((key as number) > 1) {
    id = key as number
  } else {
    id = ''
  }
  return `_${prefix}$${id}`
}

function isBlankLine(text: string): boolean {
  return !NON_BLANK_LINE_REGEX.test(text)
}

function decodeText(text: string): string {
  return decodeHTML(
    text.replaceAll(EDGE_SPACE_REGEX, '').replaceAll(SPACE_REGEX, ' '),
  )
}

function isValidIdentifier(name: string): boolean {
  return IDENTIFIER_REGEX.test(name) && !keywords.has(name)
}

function matchesType<T extends ESTree.Expression>(
  node: ESTree.Expression,
  predicate: (childNode: ESTree.Expression) => childNode is T,
): node is T {
  if (predicate(node)) return true
  if (node.type === 'LogicalExpression') {
    return predicate(node.left) || predicate(node.right)
  }
  if (node.type === 'ConditionalExpression') {
    return predicate(node.consequent) || predicate(node.alternate)
  }
  if (node.type === 'AssignmentExpression') return predicate(node.right)
  if (node.type === 'AwaitExpression') return predicate(node.argument)
  if (node.type === 'YieldExpression' && node.argument) {
    return predicate(node.argument)
  }
  if (node.type === 'SequenceExpression') {
    return predicate(node.expressions.at(-1)!)
  }
  return false
}

function isListener(node: ESTree.Expression): node is Listener {
  return isFunctionExpression(node) || isRightValue(node)
}

function isStylesheet(node: ESTree.Expression): node is Stylesheet {
  return node.type === 'ObjectExpression' || isRightValue(node)
}

function isRightValue(node: ESTree.Expression): node is RightValue {
  return (
    isLeftValue(node) ||
    node.type === 'CallExpression' ||
    node.type === 'ChainExpression' ||
    node.type === 'JSXElement' ||
    node.type === 'JSXFragment' ||
    node.type === 'ThisExpression' ||
    node.type === 'NewExpression' ||
    node.type === 'TaggedTemplateExpression' ||
    node.type === 'ImportExpression' ||
    node.type === 'MetaProperty'
  )
}

function isLeftValue(node: ESTree.Expression): node is LeftValue {
  return node.type === 'Identifier' || node.type === 'MemberExpression'
}

function isFunctionExpression(
  node: ESTree.Expression,
): node is FunctionExpression {
  return (
    node.type === 'ArrowFunctionExpression' ||
    node.type === 'FunctionExpression'
  )
}

function isBareIdentifierCall(
  node: ESTree.Expression,
): node is ESTree.CallExpression {
  return (
    node.type === 'CallExpression' &&
    node.callee.type === 'Identifier' &&
    node.arguments.length === 0
  )
}

function isJSXEmptyExpression(
  node: ESTree.JSXChild,
): node is ESTree.JSXEmptyExpression {
  return (
    node.type === 'JSXEmptyExpression' ||
    ((node.type === 'JSXExpressionContainer' ||
      node.type === 'JSXSpreadChild') &&
      node.expression.type === 'JSXEmptyExpression')
  )
}

function isDynamicExpression(
  node: ESTree.Expression,
  checkTags?: boolean,
): boolean {
  let isDynamic = false
  visit(node, {
    ArrowFunctionExpression() {
      this.skip()
    },
    FunctionExpression() {
      this.skip()
    },
    CallExpression() {
      isDynamic = true
      this.break()
    },
    MemberExpression() {
      isDynamic = true
      this.break()
    },
    ChainExpression() {
      isDynamic = true
      this.break()
    },
    JSXElement() {
      if (checkTags) {
        isDynamic = true
        this.break()
      }
    },
    JSXFragment(node) {
      if (checkTags && node.children.length) {
        isDynamic = true
        this.break()
      }
    },
  })
  return isDynamic
}
