import type { ESTree } from 'meriyah'

type VisitorConfig = {
  [K in NodeTypes]?: Visitor<K>
} & {
  enter?: Visitor
  exit?: Visitor
}
type Visitor<T = NodeTypes, K = NodeTypes> = (
  this: Context,
  node: Node<T>,
  parent?: Node<K>,
  key?: keyof Node<K>,
  index?: number,
) => void
export type Context = {
  replace: (newNode: Node) => void
  remove: () => void
  skip: () => void
  break: () => void
}
type Node<T = NodeTypes> = Extract<ESTree.Node, { type: T }>
type NodeTypes = ESTree.Node['type']

const ESTreeNodeKeys: Partial<Record<NodeTypes, string[]>> = {
  AccessorProperty: ['key', 'value', '$decorators'],
  ArrayExpression: ['$elements'],
  ArrayPattern: ['$elements'],
  ArrowFunctionExpression: ['$params', 'body'],
  AssignmentExpression: ['left', 'right'],
  AssignmentPattern: ['left', 'right'],
  AwaitExpression: ['argument'],
  BinaryExpression: ['left', 'right'],
  BlockStatement: ['$body'],
  BreakStatement: ['label'],
  CallExpression: ['callee', '$arguments'],
  ChainExpression: ['expression'],
  ImportExpression: ['source', 'options'],
  CatchClause: ['param', 'body'],
  ClassBody: ['$body'],
  ClassDeclaration: ['id', 'body', 'superClass', '$decorators'],
  ClassExpression: ['id', 'body', 'superClass', '$decorators'],
  ConditionalExpression: ['test', 'consequent', 'alternate'],
  ContinueStatement: ['label'],
  Decorator: ['expression'],
  DoWhileStatement: ['test', 'body'],
  ExportAllDeclaration: ['source', 'exported', '$attributes'],
  ExportDefaultDeclaration: ['declaration'],
  ExportNamedDeclaration: [
    'declaration',
    '$specifiers',
    'source',
    '$attributes',
  ],
  ExportSpecifier: ['local', 'exported'],
  ExpressionStatement: ['expression'],
  PropertyDefinition: ['key', 'value', '$decorators'],
  ForInStatement: ['left', 'right', 'body'],
  ForOfStatement: ['left', 'right', 'body'],
  ForStatement: ['init', 'test', 'update', 'body'],
  FunctionDeclaration: ['id', '$params', 'body'],
  FunctionExpression: ['id', '$params', 'body'],
  IfStatement: ['test', 'consequent', 'alternate'],
  ImportDeclaration: ['source', '$specifiers', '$attributes'],
  ImportDefaultSpecifier: ['local'],
  ImportAttribute: ['key', 'value'],
  ImportNamespaceSpecifier: ['local'],
  ImportSpecifier: ['local', 'imported'],
  JSXNamespacedName: ['namespace', 'name'],
  JSXAttribute: ['name', 'value'],
  JSXClosingElement: ['name'],
  JSXElement: ['openingElement', 'closingElement', '$children'],
  JSXExpressionContainer: ['expression'],
  JSXFragment: ['openingFragment', 'closingFragment', '$children'],
  JSXOpeningElement: ['name', '$attributes'],
  JSXSpreadAttribute: ['argument'],
  JSXSpreadChild: ['expression'],
  JSXMemberExpression: ['object', 'property'],
  LabeledStatement: ['label', 'body'],
  LogicalExpression: ['left', 'right'],
  MemberExpression: ['object', 'property'],
  MetaProperty: ['meta', 'property'],
  MethodDefinition: ['key', 'value', '$decorators'],
  NewExpression: ['callee', '$arguments'],
  ObjectExpression: ['$properties'],
  ObjectPattern: ['$properties'],
  ParenthesizedExpression: ['expression'],
  Program: ['$body'],
  Property: ['key', 'value'],
  RestElement: ['argument', 'value'],
  ReturnStatement: ['argument'],
  SequenceExpression: ['$expressions'],
  SpreadElement: ['argument'],
  StaticBlock: ['$body'],
  SwitchCase: ['test', '$consequent'],
  SwitchStatement: ['discriminant', '$cases'],
  TaggedTemplateExpression: ['tag', 'quasi'],
  TemplateLiteral: ['$quasis', '$expressions'],
  ThrowStatement: ['argument'],
  TryStatement: ['block', 'handler', 'finalizer'],
  UpdateExpression: ['argument'],
  UnaryExpression: ['argument'],
  VariableDeclaration: ['$declarations'],
  VariableDeclarator: ['id', 'init'],
  WhileStatement: ['test', 'body'],
  WithStatement: ['object', 'body'],
  YieldExpression: ['argument'],
}

export function visit(ast: ESTree.Node, config: VisitorConfig): void {
  let shouldBreak = false
  let shouldSkipChildren = false
  const traverse = <T, K>(
    node: Node<T>,
    parent?: Node<K>,
    key?: keyof Node<K>,
    index?: number,
  ): void => {
    if (shouldBreak) return
    let nodeToReplace: Node | undefined
    let nodeToRemove: Node | undefined
    const context: Context = {
      replace(newNode) {
        nodeToReplace = newNode
      },
      remove() {
        nodeToRemove = node
      },
      skip() {
        shouldSkipChildren = true
      },
      break() {
        shouldBreak = true
      },
    }
    if (config.enter) {
      ;(config.enter as unknown as Visitor<T, K>).call(
        context,
        node,
        parent,
        key,
        index,
      )
      if (shouldBreak) return
    }
    if (config[node.type]) {
      ;(config[node.type] as unknown as Visitor<T, K>).call(
        context,
        node,
        parent,
        key,
        index,
      )
      if (shouldBreak) return
    }
    if ((nodeToReplace || nodeToRemove) && parent && key) {
      if (index === undefined) {
        parent[key] = nodeToReplace ?? null
      } else {
        const nodes = parent[key] as Node[]
        if (nodeToReplace) {
          nodes[index] = nodeToReplace
        } else {
          nodes.splice(index, 1)
        }
      }
      if (nodeToReplace) {
        traverse(nodeToReplace, parent, key, index)
      }
      return
    }
    if (shouldSkipChildren) {
      shouldSkipChildren = false
    } else if (ESTreeNodeKeys[node.type]) {
      const keys = ESTreeNodeKeys[node.type]!
      for (let i = 0; i < keys.length; ++i) {
        const key = keys[i]
        if (key[0] === '$') {
          const nodesKey = key.slice(1) as keyof Node<T>
          const values = node[nodesKey] as Node[]
          if (!values) continue
          let length = values.length
          for (let j = 0; j < length; ++j) {
            const child = values[j]
            if (!child) continue
            traverse(child, node, nodesKey, j)
            if (shouldBreak) return
            if (length > values.length) {
              length--
              j--
            }
          }
        } else {
          const nodeKey = key as keyof Node<T>
          const value = node[nodeKey] as Node
          if (!value) continue
          traverse(value, node, nodeKey)
          if (shouldBreak) return
        }
      }
    }
    if (config.exit) {
      ;(config.exit as unknown as Visitor<T, K>).call(
        context,
        node,
        parent,
        key,
        index,
      )
    }
  }
  traverse(ast)
}
