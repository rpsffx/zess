import { generate } from 'astring'
import { decodeHTML } from 'entities'
import merge from 'merge-source-map'
import { parse, type ESTree } from 'meriyah'
import { SourceMapGenerator, type RawSourceMap } from 'source-map'
import { visit } from './visit'

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
type Location = Required<ESTree._Node>
type Listener = FunctionExpression | RightValue
type Stylesheet = ESTree.ObjectExpression | RightValue
type Function = FunctionExpression | ESTree.FunctionDeclaration
type RightValue = LeftValue | ESTree.CallExpression | ESTree.ChainExpression
type LeftValue = ESTree.Identifier | ESTree.MemberExpression
type FunctionExpression =
  | ESTree.FunctionExpression
  | ESTree.ArrowFunctionExpression

const UPPERCASE_REGEX = /^[A-Z]/
const NATIVE_EVENT_REGEX = /^on[a-z]+$/
const EMPTY_LINE_REGEX = /(?:\r?\n|\r)\s*/g
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
      modulePath: options.modulePath ?? '@zess/core',
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
        const callExpressionLocation = copyLocation(node)
        expression = createCallExpression(
          createArrowFunctionExpression(
            createBlockStatement(
              [...stmts, createReturnStatement(id, callExpressionLocation)],
              callExpressionLocation,
            ),
            callExpressionLocation,
          ),
          [],
          callExpressionLocation,
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
        copyLocation(node.openingFragment),
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
  const tagNameLocation = copyLocation(tagName)
  if (tagName.type === 'Literal') {
    const value = tagName.value as string
    const args = [createLiteral(value, tagNameLocation)]
    const JSXId = createIdentifier(getUniqueId('el', 'JSXId'), tagNameLocation)
    const namespace = SVGTags.has(value) ? 1 : MathMLTags.has(value) ? 2 : 0
    if (namespace) args.push(createLiteral(namespace, tagNameLocation))
    currentContext.shouldImportCreateElement = true
    stmts.push(
      createVariableDeclaration(
        JSXId,
        createCallExpression(
          createIdentifier('_$createElement', tagNameLocation),
          args,
          tagNameLocation,
        ),
        tagNameLocation,
      ),
      ...transformAttributes(opening.attributes, JSXId),
      ...transformChildren(node.children, JSXId),
    )
  } else {
    const elementLocation = copyLocation(node)
    currentContext.shouldImportCreateComponent = true
    stmts.push(
      createExpressionStatement(
        createCallExpression(
          createIdentifier('_$createComponent', elementLocation),
          [
            tagName,
            transformProperties(
              opening.attributes,
              node.children,
              copyLocation(opening),
            ),
          ],
          elementLocation,
        ),
        elementLocation,
      ),
    )
  }
  return stmts
}

function transformFragment(
  children: ESTree.JSXChild[],
  location: Location,
  isInComponent?: boolean,
): ESTree.Expression | void {
  const elements: ESTree.Expression[] = []
  let hasDynamicChildren = false
  let shouldImportUseMemo = false
  let textContent: string | undefined
  let textLocation: Location | undefined
  let elementsLocation: Location | undefined
  let childExpression: ESTree.Expression | undefined
  for (let i = 0; i < children.length; ++i) {
    const childNode = children[i]
    if (childNode.type === 'JSXText') {
      const value = trimWhitespace(childNode.value)
      if (!value) continue
      if (textContent) {
        textContent = `${textContent}${value}`
      } else {
        textContent = value
        textLocation = copyLocation(childNode)
        elementsLocation ??= textLocation
      }
    } else if (isJSXEmptyExpression(childNode)) {
      continue
    } else if (childNode.type === 'JSXFragment') {
      children.splice(i--, 1, ...childNode.children)
    } else {
      const childLocation = copyLocation(childNode)
      let childElement: ESTree.Expression
      if (textContent) {
        elements.push(createLiteral(decodeHTML(textContent), textLocation!))
        textContent = textLocation = undefined
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
                [...stmts, createReturnStatement(id, childLocation)],
                childLocation,
              ),
              childLocation,
            ),
            [],
            childLocation,
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
            createIdentifier('_$memo', childLocation),
            [
              !isInComponent && isBareIdentifierCall(expression)
                ? expression.callee
                : createArrowFunctionExpression(
                    expression,
                    copyLocation(expression),
                  ),
            ],
            childLocation,
          )
        } else {
          childElement = expression
        }
      }
      elements.push(childElement)
      elementsLocation ??= childLocation
    }
  }
  if (textContent) {
    elements.push(createLiteral(decodeHTML(textContent), textLocation!))
  }
  if (isInComponent) {
    currentContext.prevHasDynamicChildrenInComponent =
      currentContext.hasDynamicChildrenInComponent
    currentContext.hasDynamicChildrenInComponent = hasDynamicChildren
  }
  if (elements.length > 1) {
    if (shouldImportUseMemo) currentContext.shouldImportUseMemo = true
    return createArrayExpression(elements, elementsLocation!)
  }
  if (elements.length === 1) {
    if (!childExpression) {
      if (shouldImportUseMemo) currentContext.shouldImportUseMemo = true
      return elements[0]
    }
    return childExpression
  }
  if (!isInComponent) return createArrayExpression(elements, location)
}

function transformThisExpression(
  node: ESTree.ThisExpression | ESTree.JSXIdentifier,
): ESTree.Identifier | void {
  if (!currentContext.JSXParent) return
  const thisId = createIdentifier(
    getUniqueId('self', 'thisId'),
    copyLocation(node),
  )
  if (!currentContext.functionParent) {
    if (currentContext.hasThisInProgram) return thisId
    const { body } = currentContext.ast
    const programLocation = copyLocation(currentContext.ast)
    currentContext.hasThisInProgram = true
    for (let i = 0; i < body.length; ++i) {
      if (body[i].type === 'ImportDeclaration') continue
      body.splice(
        i,
        0,
        createVariableDeclaration(
          thisId,
          createThisExpression(programLocation),
          programLocation,
        ),
      )
      break
    }
  } else if (!currentContext.hasThisInFunction) {
    const functionLocation = copyLocation(currentContext.functionParent)
    const block = currentContext.functionParent.body!
    const declaration = createVariableDeclaration(
      thisId,
      createThisExpression(functionLocation),
      functionLocation,
    )
    currentContext.hasThisInFunction = true
    if (block.type === 'BlockStatement') {
      block.body.unshift(declaration)
    } else {
      currentContext.functionParent.body = createBlockStatement(
        [declaration, createReturnStatement(block, copyLocation(block))],
        functionLocation,
      )
    }
  }
  return thisId
}

function injectRuntimeImport(ast: ESTree.Program): void {
  const specifiers: ESTree.ImportSpecifier[] = []
  const programLocation = copyLocation(ast)
  if (currentContext.shouldImportCreateComponent) {
    specifiers.push(
      createImportSpecifier(
        '_$createComponent',
        'createComponent',
        programLocation,
      ),
    )
  }
  if (currentContext.shouldImportCreateElement) {
    specifiers.push(
      createImportSpecifier(
        '_$createElement',
        'createElement',
        programLocation,
      ),
    )
  }
  if (currentContext.events.length) {
    specifiers.push(
      createImportSpecifier(
        '_$delegateEvents',
        'delegateEvents',
        programLocation,
      ),
    )
    ast.body.push(
      createExpressionStatement(
        createCallExpression(
          createIdentifier('_$delegateEvents', programLocation),
          [createArrayExpression(currentContext.events, programLocation)],
          programLocation,
        ),
        programLocation,
      ),
    )
  }
  if (currentContext.shouldImportInsert) {
    specifiers.push(
      createImportSpecifier('_$insert', 'insert', programLocation),
    )
  }
  if (currentContext.shouldImportMergeProps) {
    specifiers.push(
      createImportSpecifier('_$mergeProps', 'mergeProps', programLocation),
    )
  }
  if (currentContext.shouldImportSetAttribute) {
    specifiers.push(
      createImportSpecifier('_$setAttribute', 'setAttribute', programLocation),
    )
  }
  if (currentContext.shouldImportSetAttributeNS) {
    specifiers.push(
      createImportSpecifier(
        '_$setAttributeNS',
        'setAttributeNS',
        programLocation,
      ),
    )
  }
  if (currentContext.shouldImportSetClassName) {
    specifiers.push(
      createImportSpecifier('_$className', 'setClassName', programLocation),
    )
  }
  if (currentContext.shouldImportSetStyle) {
    specifiers.push(
      createImportSpecifier('_$style', 'setStyle', programLocation),
    )
  }
  if (currentContext.shouldImportSpread) {
    specifiers.push(
      createImportSpecifier('_$spread', 'spread', programLocation),
    )
  }
  if (currentContext.shouldImportUse) {
    specifiers.push(createImportSpecifier('_$use', 'use', programLocation))
  }
  if (currentContext.shouldImportUseEffect) {
    specifiers.push(
      createImportSpecifier('_$effect', 'useRenderEffect', programLocation),
    )
  }
  if (currentContext.shouldImportUseMemo) {
    specifiers.push(createImportSpecifier('_$memo', 'useMemo', programLocation))
  }
  if (specifiers.length) {
    ast.body.unshift({
      type: 'ImportDeclaration',
      specifiers,
      attributes: [],
      source: createLiteral(currentContext.config.modulePath, programLocation),
      ...programLocation,
    })
  }
}

function transformJSXTagName(
  node: ESTree.JSXTagNameExpression,
): ESTree.PropertyName | ESTree.MemberExpression {
  const tagNameLocation = copyLocation(node)
  if (node.type === 'JSXNamespacedName') {
    const namespace = node.namespace as ESTree.JSXIdentifier
    return createLiteral(`${namespace.name}:${node.name.name}`, tagNameLocation)
  }
  let object: Record<string, any>
  let expression: ESTree.PropertyName | ESTree.MemberExpression | undefined
  if (node.type === 'JSXMemberExpression') {
    object = tagNameLocation
    expression = object as ESTree.MemberExpression
    do {
      const isValidPropertyName = isValidIdentifier(node.property.name)
      const propertyLocation = copyLocation(node.property)
      object.type = 'MemberExpression'
      object.property = isValidPropertyName
        ? createIdentifier(node.property.name, propertyLocation)
        : createLiteral(node.property.name, propertyLocation)
      object.computed = !isValidPropertyName
      object = object.object = copyLocation(node.object)
      node = node.object
    } while (node.type === 'JSXMemberExpression')
  }
  const tagName = node as ESTree.JSXIdentifier
  if (tagName.name === 'this') {
    const id = transformThisExpression(tagName)!
    if (expression) {
      object!.type = 'Identifier'
      object!.name = id.name
    } else {
      expression = id
    }
  } else if (expression || UPPERCASE_REGEX.test(tagName.name)) {
    if (expression) {
      object!.type = 'Identifier'
      object!.name = tagName.name
    } else {
      expression = createIdentifier(tagName.name, tagNameLocation)
    }
  } else {
    expression = createLiteral(tagName.name, tagNameLocation)
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
  let objectLocation: Location | undefined
  let spreadArgs: ESTree.Expression[] | undefined
  let spreadArgsLocation: Location | undefined
  let effect: ESTree.CallExpression | undefined
  let effectProperty: ESTree.Property | undefined
  let effectStmts: ESTree.Statement[] | undefined
  let effectParameter: ESTree.Identifier | undefined
  let effectFunction: ESTree.ArrowFunctionExpression
  let effectLocation: Location
  let dynamicCount: number
  for (let i = 0; i < attrs.length; ++i) {
    let expression: ESTree.Expression
    const attr = attrs[i]
    const attributeLocation = copyLocation(attr)
    if (attr.type === 'JSXAttribute') {
      const attributeName = getAttributeName(attr.name)
      if (attributeNameCache.has(attributeName)) continue
      let value: ESTree.Expression
      let isDynamicValue = false
      const attributeNameLocation = copyLocation(attr.name)
      attributeNameCache.add(attributeName)
      if (!attr.value) {
        value = createLiteral(true, attributeNameLocation)
      } else if (attr.value.type === 'Literal') {
        value = attr.value
      } else if (attr.value.type === 'JSXExpressionContainer') {
        expression = attr.value.expression as ESTree.Expression
        if (attributeName === 'ref') {
          if (isRightValue(expression)) {
            const refId = createIdentifier(
              getUniqueId('ref', 'refId'),
              attributeNameLocation,
            )
            const binaryExpression = createBinaryExpression(
              createUnaryExpression(refId, attributeLocation),
              createLiteral('function', attributeLocation),
              '===',
              attributeLocation,
            )
            const callExpression = createCallExpression(
              createIdentifier('_$use', attributeLocation),
              [refId, id],
              attributeLocation,
            )
            currentContext.shouldImportUse = true
            ref = [
              createVariableDeclaration(refId, expression, attributeLocation),
              createExpressionStatement(
                isLeftValue(expression)
                  ? createConditionalExpression(
                      binaryExpression,
                      callExpression,
                      createAssignmentExpression(
                        expression,
                        id,
                        attributeLocation,
                      ),
                      attributeLocation,
                    )
                  : createLogicalExpression(
                      binaryExpression,
                      callExpression,
                      attributeLocation,
                    ),
                attributeLocation,
              ),
            ]
            continue
          }
          if (isFunctionExpression(expression)) {
            currentContext.shouldImportUse = true
            ref = [
              createExpressionStatement(
                createCallExpression(
                  createIdentifier('_$use', attributeLocation),
                  [expression, id],
                  attributeLocation,
                ),
                attributeLocation,
              ),
            ]
            continue
          }
        } else if (
          !shouldImportSpread &&
          attributeName.startsWith('on') &&
          isListener(expression)
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
                createLiteral(eventName, attributeNameLocation),
              )
            }
            eventName = `$$${eventName}`
          }
          ;(events ??= []).push(
            createExpressionStatement(
              createAssignmentExpression(
                createMemberExpression(
                  id,
                  createIdentifier(eventName, attributeNameLocation),
                  false,
                  attributeNameLocation,
                ),
                expression,
                attributeLocation,
              ),
              attributeLocation,
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
          ? createIdentifier(attributeName, attributeNameLocation)
          : createLiteral(attributeName, attributeNameLocation),
        isDynamicValue
          ? createFunctionExpression([
              createReturnStatement(value!, attributeLocation),
            ])
          : value!,
        isDynamicValue ? 'get' : 'init',
        !isValidPropertyName,
        false,
        attributeLocation,
      )
      objectLocation ??= attributeLocation
      properties.push(property)
      if (shouldImportSpread) continue
      let styleOrClassArgs: ESTree.Expression[] | undefined
      if (attributeName === 'style') {
        if (isStylesheet(value!)) {
          shouldImportSetStyle = true
          expression = createCallExpression(
            createIdentifier('_$style', attributeNameLocation),
            (styleOrClassArgs = [id, value!]),
            attributeLocation,
          )
        } else {
          expression = createAssignmentExpression(
            createMemberExpression(
              createMemberExpression(
                id,
                createIdentifier(attributeName, attributeNameLocation),
                false,
                attributeNameLocation,
              ),
              createIdentifier('cssText', attributeNameLocation),
              false,
              attributeNameLocation,
            ),
            value!,
            attributeLocation,
          )
        }
      } else if (attributeName === 'class' || attributeName === 'className') {
        if (isStylesheet(value!)) {
          shouldImportSetClassName = true
          expression = createCallExpression(
            createIdentifier('_$className', attributeNameLocation),
            (styleOrClassArgs = [id, value!]),
            attributeLocation,
          )
        } else {
          expression = createAssignmentExpression(
            createMemberExpression(
              id,
              createIdentifier('className', attributeNameLocation),
              false,
              attributeNameLocation,
            ),
            value!,
            attributeLocation,
          )
        }
      } else if (
        DOMProperties.has(attributeName) ||
        attributeName.startsWith('on')
      ) {
        expression = createAssignmentExpression(
          createMemberExpression(
            id,
            createIdentifier(attributeName, attributeNameLocation),
            false,
            attributeNameLocation,
          ),
          value!,
          attributeLocation,
        )
      } else {
        let method: string
        let attributeArgs: ESTree.Expression[]
        const prefix = attributeName.split(':')[0]
        const namespace = prefix === 'xlink' ? 3 : prefix === 'xml' ? 4 : 0
        const name = createLiteral(attributeName, attributeNameLocation)
        if (namespace) {
          method = '_$setAttributeNS'
          shouldImportSetAttributeNS = true
          attributeArgs = [
            id,
            createLiteral(namespace, attributeNameLocation),
            name,
            value!,
          ]
        } else {
          method = '_$setAttribute'
          shouldImportSetAttribute = true
          attributeArgs = [id, name, value!]
        }
        expression = createCallExpression(
          createIdentifier(method, attributeNameLocation),
          attributeArgs,
          attributeLocation,
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
                effectLocation!,
              )
            }
            dynamicCount = 0
            valueId = createIdentifier(
              getUniqueId('v', ++dynamicCount),
              effectLocation!,
            )
            member = createMemberExpression(
              effectParameter,
              effectKey,
              effectProperty!.computed,
              effectLocation!,
            )
            if (hasEffectParameter) {
              const args = (effectCall as ESTree.CallExpression).arguments
              effectValue = args[1]
              args[1] = valueId
              args[2] = member
              effectCall = createAssignmentExpression(
                member,
                effectCall,
                effectLocation!,
              )
            } else {
              assignment = createAssignmentExpression(
                member,
                valueId,
                effectLocation!,
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
                createBinaryExpression(valueId, member, '!==', effectLocation!),
                effectCall,
                effectLocation!,
              )
              effectFunction!.params.push(effectParameter)
            }
            declaration = createVariableDeclaration(
              valueId,
              effectValue,
              effectLocation!,
            )
            effectStmts = [
              declaration,
              createExpressionStatement(effectCall, effectLocation!),
            ]
            effectFunction!.body = createBlockStatement(
              effectStmts,
              effectLocation!,
            )
            object = createObjectExpression(
              [
                createProperty(
                  effectKey,
                  createIdentifier('undefined', effectLocation!),
                  'init',
                  effectProperty!.computed,
                  false,
                  effectLocation!,
                ),
              ],
              effectLocation!,
            )
            effect.arguments.push(object)
          } else {
            object = effect.arguments[1] as ESTree.ObjectExpression
            declaration = effectStmts![0] as ESTree.VariableDeclaration
          }
          effectKey = property.key as ESTree.PropertyName
          valueId = createIdentifier(
            getUniqueId('v', ++dynamicCount!),
            attributeLocation,
          )
          member = createMemberExpression(
            effectParameter!,
            effectKey,
            property.computed,
            attributeLocation,
          )
          if (styleOrClassArgs) {
            styleOrClassArgs[1] = valueId
            styleOrClassArgs.push(member)
            expression = createAssignmentExpression(
              member,
              expression,
              attributeLocation,
            )
          } else {
            assignment = createAssignmentExpression(
              member,
              valueId,
              attributeLocation,
            )
            if (expression.type === 'CallExpression') {
              expression.arguments[expression.arguments.length - 1] = assignment
            } else {
              ;(expression as ESTree.AssignmentExpression).right = assignment
            }
            expression = createLogicalExpression(
              createBinaryExpression(valueId, member, '!==', attributeLocation),
              expression,
              attributeLocation,
            )
          }
          object.properties.push(
            createProperty(
              effectKey,
              createIdentifier('undefined', attributeLocation),
              'init',
              property.computed,
              false,
              attributeLocation,
            ),
          )
          declaration.declarations.push(
            createVariableDeclarator(valueId, value!, attributeLocation),
          )
          effectStmts!.push(
            createExpressionStatement(expression, attributeLocation),
          )
          continue
        }
        effectProperty = property
        effectLocation = attributeLocation
        effectFunction = createArrowFunctionExpression(
          expression,
          effectLocation,
        )
        if (styleOrClassArgs) {
          effectParameter = createIdentifier(getUniqueId('p'), effectLocation)
          effectFunction.params.push(effectParameter)
          styleOrClassArgs.push(effectParameter)
        }
        shouldImportUseEffect = true
        expression = effect = createCallExpression(
          createIdentifier('_$effect', effectLocation),
          [effectFunction],
          effectLocation,
        )
      }
    } else {
      let { argument } = attr
      spreadArgs ??= [id]
      if (properties.length) {
        spreadArgs.push(createObjectExpression(properties, objectLocation!))
        properties = []
        spreadArgsLocation ??= objectLocation
        objectLocation = undefined
      }
      if (isDynamicExpression(argument)) {
        shouldImportMergeProps = true
        argument = isBareIdentifierCall(argument)
          ? argument.callee
          : createArrowFunctionExpression(argument, copyLocation(argument))
      }
      spreadArgs.push(argument)
      if (shouldImportSpread) continue
      currentContext.shouldImportSpread = shouldImportSpread = true
      spreadArgsLocation ??= attributeLocation
      shouldImportSetStyle = false
      shouldImportSetClassName = false
      shouldImportSetAttribute = false
      shouldImportSetAttributeNS = false
      shouldImportUseEffect = false
      stmts.length = 0
      expression = createCallExpression(
        createIdentifier('_$spread', attributeLocation),
        spreadArgs,
        attributeLocation,
      )
    }
    stmts.push(createExpressionStatement(expression, attributeLocation))
  }
  if (spreadArgs) {
    if (properties.length) {
      spreadArgs.push(createObjectExpression(properties, objectLocation!))
    }
    if (shouldImportMergeProps || spreadArgs.length > 2) {
      currentContext.shouldImportMergeProps = true
      spreadArgs.splice(
        1,
        spreadArgs.length - 1,
        createCallExpression(
          createIdentifier('_$mergeProps', spreadArgsLocation!),
          spreadArgs.slice(1),
          spreadArgsLocation!,
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
          createReturnStatement(effectParameter!, effectLocation!),
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
  let textLocation: Location | undefined
  let elementsLocation: Location | undefined
  for (let i = 0; i < children.length; ++i) {
    const childNode = children[i]
    if (childNode.type === 'JSXText') {
      const value = trimWhitespace(childNode.value)
      if (!value) continue
      if (textContent) {
        textContent = `${textContent}${value}`
      } else {
        textContent = value
        textLocation = copyLocation(childNode)
        elementsLocation ??= textLocation
      }
    } else if (isJSXEmptyExpression(childNode)) {
      continue
    } else if (childNode.type === 'JSXFragment') {
      children.splice(i--, 1, ...childNode.children)
    } else {
      const childLocation = copyLocation(childNode)
      let expression: ESTree.Expression
      if (textContent) {
        elements.push(createLiteral(decodeHTML(textContent), textLocation!))
        textContent = textLocation = undefined
      }
      if (childNode.type === 'JSXElement') {
        const childStmts = transformElement(childNode)
        if (childStmts.length > 1) {
          const stmt = childStmts[0] as ESTree.VariableDeclaration
          elements.push(stmt.declarations[0].id as ESTree.Identifier)
          elementsLocation ??= childLocation
          stmts.push(...childStmts)
          continue
        } else if (childStmts[0].type === 'VariableDeclaration') {
          elements.push(childStmts[0].declarations[0].init!)
          elementsLocation ??= childLocation
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
            copyLocation(expression),
          )
        }
      }
      if (elements.length) {
        stmts.push(
          createExpressionStatement(
            createCallExpression(
              createMemberExpression(
                id,
                createIdentifier('append', elementsLocation!),
                false,
                elementsLocation!,
              ),
              elements,
              elementsLocation!,
            ),
            elementsLocation!,
          ),
        )
        elements = []
        elementsLocation = undefined
      }
      currentContext.shouldImportInsert = true
      stmts.push(
        createExpressionStatement(
          createCallExpression(
            createIdentifier('_$insert', childLocation),
            [id, expression],
            childLocation,
          ),
          childLocation,
        ),
      )
    }
  }
  if (textContent) {
    elements.push(createLiteral(decodeHTML(textContent), textLocation!))
  }
  if (elements.length) {
    stmts.push(
      createExpressionStatement(
        createCallExpression(
          createMemberExpression(
            id,
            createIdentifier('append', elementsLocation!),
            false,
            elementsLocation!,
          ),
          elements,
          elementsLocation!,
        ),
        elementsLocation!,
      ),
    )
  }
  return stmts
}

function transformProperties(
  attrs: ESTree.JSXOpeningElement['attributes'],
  children: ESTree.JSXChild[],
  location: Location,
): ESTree.Expression {
  const args: ESTree.Expression[] = []
  const propertyNameCache = new Set(['children'])
  let shouldImportMergeProps = false
  let properties: ESTree.Property[] = []
  let objectLocation: Location | undefined
  let argsLocation: Location | undefined
  for (let i = 0; i < attrs.length; ++i) {
    const attr = attrs[i]
    const propertyLocation = copyLocation(attr)
    if (attr.type === 'JSXAttribute') {
      const propertyName = getAttributeName(attr.name)
      if (propertyNameCache.has(propertyName)) continue
      let value: ESTree.Expression
      let isDynamicValue = false
      const propertyNameLocation = copyLocation(attr.name)
      propertyNameCache.add(propertyName)
      if (!attr.value) {
        value = createLiteral(true, propertyNameLocation)
      } else if (attr.value.type === 'Literal') {
        value = attr.value
      } else if (attr.value.type === 'JSXExpressionContainer') {
        const expression = attr.value.expression as ESTree.Expression
        if (propertyName === 'ref') {
          if (isRightValue(expression)) {
            const refId = createIdentifier(
              getUniqueId('ref', 'refId'),
              propertyNameLocation,
            )
            const argument = createIdentifier(
              getUniqueId('r'),
              copyLocation(expression),
            )
            const binaryExpression = createBinaryExpression(
              createUnaryExpression(refId, propertyLocation),
              createLiteral('function', propertyLocation),
              '===',
              propertyLocation,
            )
            const callExpression = createCallExpression(
              refId,
              [argument],
              propertyLocation,
            )
            objectLocation ??= propertyLocation
            properties.push(
              createProperty(
                createIdentifier(propertyName, propertyNameLocation),
                createFunctionExpression(
                  [
                    createVariableDeclaration(
                      refId,
                      expression,
                      propertyLocation,
                    ),
                    createExpressionStatement(
                      isLeftValue(expression)
                        ? createConditionalExpression(
                            binaryExpression,
                            callExpression,
                            createAssignmentExpression(
                              expression,
                              argument,
                              propertyLocation,
                            ),
                            propertyLocation,
                          )
                        : createLogicalExpression(
                            binaryExpression,
                            callExpression,
                            propertyLocation,
                          ),
                      propertyLocation,
                    ),
                  ],
                  argument,
                ),
                'init',
                false,
                true,
                propertyLocation,
              ),
            )
          } else if (isFunctionExpression(expression)) {
            objectLocation ??= propertyLocation
            properties.push(
              createProperty(
                createIdentifier(propertyName, propertyNameLocation),
                expression,
                'init',
                false,
                false,
                propertyLocation,
              ),
            )
          }
          continue
        }
        value = expression
        isDynamicValue = isDynamicExpression(value, true)
      }
      const isValidPropertyName = isValidIdentifier(propertyName)
      objectLocation ??= propertyLocation
      properties.push(
        createProperty(
          isValidPropertyName
            ? createIdentifier(propertyName, propertyNameLocation)
            : createLiteral(propertyName, propertyNameLocation),
          isDynamicValue
            ? createFunctionExpression([
                createReturnStatement(value!, propertyLocation),
              ])
            : value!,
          isDynamicValue ? 'get' : 'init',
          !isValidPropertyName,
          false,
          propertyLocation,
        ),
      )
    } else {
      let { argument } = attr
      if (properties.length) {
        args.push(createObjectExpression(properties, objectLocation!))
        properties = []
        argsLocation ??= objectLocation
        objectLocation = undefined
      }
      if (isDynamicExpression(argument)) {
        shouldImportMergeProps = true
        argument = isBareIdentifierCall(argument)
          ? argument.callee
          : createArrowFunctionExpression(argument, copyLocation(argument))
      }
      args.push(argument)
      argsLocation ??= propertyLocation
    }
  }
  if (children.length) {
    const childrenLocation = copyLocation(children[0])
    const childrenExpression = transformFragment(
      children,
      childrenLocation,
      true,
    )
    if (childrenExpression) {
      const hasDynamicChildren = currentContext.hasDynamicChildrenInComponent
      properties.push(
        createProperty(
          createIdentifier('children', childrenLocation),
          hasDynamicChildren
            ? createFunctionExpression([
                createReturnStatement(childrenExpression, childrenLocation),
              ])
            : childrenExpression,
          hasDynamicChildren ? 'get' : 'init',
          false,
          false,
          childrenLocation,
        ),
      )
    }
    currentContext.hasDynamicChildrenInComponent =
      currentContext.prevHasDynamicChildrenInComponent
  }
  if (properties.length) {
    args.push(createObjectExpression(properties, objectLocation!))
    argsLocation ??= objectLocation
  }
  if (shouldImportMergeProps || args.length > 1) {
    currentContext.shouldImportMergeProps = true
    return createCallExpression(
      createIdentifier('_$mergeProps', argsLocation!),
      args,
      argsLocation!,
    )
  }
  if (args.length === 1) return args[0]
  return createObjectExpression(properties, location)
}

function getAttributeName(node: ESTree.JSXAttribute['name']): string {
  if (node.type === 'JSXIdentifier') return node.name
  const namespace = node.namespace as ESTree.JSXIdentifier
  return `${namespace.name}:${node.name.name}`
}

function copyLocation(node: ESTree.Node): Location {
  return {
    start: node.start!,
    end: node.end!,
    range: node.range!,
    loc: node.loc!,
  }
}

function createExpressionStatement(
  expression: ESTree.Expression,
  location: Location,
): ESTree.ExpressionStatement {
  return {
    type: 'ExpressionStatement',
    expression,
    ...location,
  }
}

function createVariableDeclaration(
  id: ESTree.Identifier,
  init: ESTree.Expression,
  location: Location,
): ESTree.VariableDeclaration {
  return {
    type: 'VariableDeclaration',
    kind: 'const',
    declarations: [createVariableDeclarator(id, init, location)],
    ...location,
  }
}

function createReturnStatement(
  argument: ESTree.Expression,
  location: Location,
): ESTree.ReturnStatement {
  return {
    type: 'ReturnStatement',
    argument,
    ...location,
  }
}

function createBlockStatement(
  body: ESTree.Statement[],
  location: Location,
): ESTree.BlockStatement {
  return {
    type: 'BlockStatement',
    body,
    ...location,
  }
}

function createArrowFunctionExpression(
  body: ESTree.Expression | ESTree.BlockStatement,
  location: Location,
): ESTree.ArrowFunctionExpression {
  return {
    type: 'ArrowFunctionExpression',
    params: [],
    body,
    async: false,
    generator: false,
    expression: body.type !== 'BlockStatement',
    ...location,
  }
}

function createFunctionExpression(
  body: ESTree.Statement[],
  parameter?: ESTree.Identifier,
): ESTree.FunctionExpression {
  const functionLocation = copyLocation(body[0])
  const FunctionExpression: ESTree.FunctionExpression = {
    type: 'FunctionExpression',
    params: parameter ? [parameter] : [],
    body: createBlockStatement(body, functionLocation),
    async: false,
    generator: false,
    id: null,
    ...functionLocation,
  }
  currentContext.generatedFunctions.add(FunctionExpression)
  return FunctionExpression
}

function createCallExpression(
  callee: ESTree.Expression,
  args: ESTree.Expression[],
  location: Location,
): ESTree.CallExpression {
  return {
    type: 'CallExpression',
    callee,
    arguments: args,
    optional: false,
    ...location,
  }
}

function createMemberExpression(
  object: ESTree.Expression,
  property: ESTree.Expression,
  computed: boolean,
  location: Location,
): ESTree.MemberExpression {
  return {
    type: 'MemberExpression',
    object,
    property,
    computed,
    optional: false,
    ...location,
  }
}

function createProperty(
  key: ESTree.PropertyName,
  value: ESTree.Expression,
  kind: ESTree.Property['kind'],
  computed: boolean,
  method: boolean,
  location: Location,
): ESTree.Property {
  return {
    type: 'Property',
    key,
    value,
    kind,
    computed,
    method,
    shorthand: false,
    ...location,
  }
}

function createImportSpecifier(
  local: string,
  imported: string,
  location: Location,
): ESTree.ImportSpecifier {
  return {
    type: 'ImportSpecifier',
    local: createIdentifier(local, location),
    imported: createIdentifier(imported, location),
    ...location,
  }
}

function createObjectExpression(
  properties: ESTree.Property[],
  location: Location,
): ESTree.ObjectExpression {
  return {
    type: 'ObjectExpression',
    properties,
    ...location,
  }
}

function createArrayExpression(
  elements: ESTree.Expression[],
  location: Location,
): ESTree.ArrayExpression {
  return {
    type: 'ArrayExpression',
    elements,
    ...location,
  }
}

function createAssignmentExpression(
  left: ESTree.Expression,
  right: ESTree.Expression,
  location: Location,
): ESTree.AssignmentExpression {
  return {
    type: 'AssignmentExpression',
    left,
    right,
    operator: '=',
    ...location,
  }
}

function createBinaryExpression(
  left: ESTree.Expression,
  right: ESTree.Expression,
  operator: string,
  location: Location,
): ESTree.BinaryExpression {
  return {
    type: 'BinaryExpression',
    left,
    right,
    operator,
    ...location,
  }
}

function createLogicalExpression(
  left: ESTree.Expression,
  right: ESTree.Expression,
  location: Location,
): ESTree.LogicalExpression {
  return {
    type: 'LogicalExpression',
    left,
    right,
    operator: '&&',
    ...location,
  }
}

function createConditionalExpression(
  test: ESTree.Expression,
  consequent: ESTree.Expression,
  alternate: ESTree.Expression,
  location: Location,
): ESTree.ConditionalExpression {
  return {
    type: 'ConditionalExpression',
    test,
    consequent,
    alternate,
    ...location,
  }
}

function createUnaryExpression(
  argument: ESTree.Identifier,
  location: Location,
): ESTree.UnaryExpression {
  return {
    type: 'UnaryExpression',
    operator: 'typeof',
    argument,
    prefix: true,
    ...location,
  }
}

function createVariableDeclarator(
  id: ESTree.Identifier,
  init: ESTree.Expression,
  location: Location,
): ESTree.VariableDeclarator {
  return {
    type: 'VariableDeclarator',
    id,
    init,
    ...location,
  }
}

function createIdentifier(name: string, location: Location): ESTree.Identifier {
  return { type: 'Identifier', name, ...location }
}

function createLiteral(
  value: ESTree.Literal['value'],
  location: Location,
): ESTree.Literal {
  return { type: 'Literal', value, raw: JSON.stringify(value), ...location }
}

function createThisExpression(location: Location): ESTree.ThisExpression {
  return { type: 'ThisExpression', ...location }
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

function trimWhitespace(text: string): string {
  return text.replaceAll(EMPTY_LINE_REGEX, '').replaceAll(SPACE_REGEX, ' ')
}

function isValidIdentifier(name: string): boolean {
  return IDENTIFIER_REGEX.test(name) && !keywords.has(name)
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
    node.type === 'ChainExpression'
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
