import { describe, expect, it, vi } from 'vitest'
import { visit } from '../src/visit'
import type { ESTree } from 'meriyah'

describe('visit', () => {
  it('should call enter and exit callbacks for each node', () => {
    const ast: ESTree.BinaryExpression = {
      type: 'BinaryExpression',
      operator: '+',
      left: { type: 'Literal', value: 1 },
      right: { type: 'Literal', value: 2 },
    }
    const enterMock = vi.fn()
    const exitMock = vi.fn()
    visit(ast, {
      enter: enterMock,
      exit: exitMock,
    })
    expect(enterMock).toHaveBeenCalledTimes(3)
    expect(exitMock).toHaveBeenCalledTimes(3)
  })
  it('should call specific node type handlers', () => {
    const ast: ESTree.Literal = { type: 'Literal', value: 42 }
    const literalHandler = vi.fn()
    visit(ast, {
      Literal: literalHandler,
    })
    expect(literalHandler).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'Literal', value: 42 }),
      undefined,
      undefined,
      undefined,
    )
  })
  it('should replace nodes using context.replace', () => {
    const ast: ESTree.BinaryExpression = {
      type: 'BinaryExpression',
      operator: '+',
      left: { type: 'Literal', value: 1 },
      right: { type: 'Literal', value: 2 },
    }
    const newLiteral: ESTree.Literal = { type: 'Literal', value: 100 }
    visit(ast, {
      Literal(node) {
        if (node.value === 2) this.replace(newLiteral)
      },
    })
    expect(ast.right).toBe(newLiteral)
  })
  it('should remove nodes using context.remove', () => {
    const ast: ESTree.BinaryExpression = {
      type: 'BinaryExpression',
      operator: '+',
      left: { type: 'Literal', value: 1 },
      right: { type: 'Literal', value: 2 },
    }
    visit(ast, {
      Literal(node) {
        if (node.value === 2) this.remove()
      },
    })
    expect(ast.right).toBeNull()
  })
  it('should skip children traversal using context.skip', () => {
    const ast: ESTree.BinaryExpression = {
      type: 'BinaryExpression',
      operator: '+',
      left: { type: 'Literal', value: 1 },
      right: { type: 'Literal', value: 2 },
    }
    const enterMock = vi.fn()
    visit(ast, {
      BinaryExpression() {
        this.skip()
      },
      enter: enterMock,
    })
    expect(enterMock).toHaveBeenCalledTimes(1)
  })
  it('should stop traversal using context.break', () => {
    const ast: ESTree.Program = {
      type: 'Program',
      body: [
        {
          type: 'ExpressionStatement',
          expression: { type: 'Literal', value: 1 },
        },
        {
          type: 'ExpressionStatement',
          expression: { type: 'Literal', value: 2 },
        },
      ],
      sourceType: 'script',
    }
    const enterMock = vi.fn()
    visit(ast, {
      enter(node) {
        enterMock(node.type)
        if (node.type === 'ExpressionStatement') this.break()
      },
    })
    expect(enterMock).toHaveBeenCalledWith('Program')
    expect(enterMock).toHaveBeenCalledWith('ExpressionStatement')
    expect(enterMock).not.toHaveBeenCalledWith('Literal')
  })
  it('should handle array element removal correctly', () => {
    const elements: ESTree.Expression[] = [
      { type: 'Literal', value: 1 },
      { type: 'Literal', value: 2 },
      { type: 'Literal', value: 3 },
    ]
    const ast: ESTree.ArrayExpression = {
      type: 'ArrayExpression',
      elements,
    }
    visit(ast, {
      Literal(node) {
        if (node.value === 2) this.remove()
      },
    })
    expect(elements).toHaveLength(2)
    expect(elements.map((n) => (n as ESTree.Literal).value)).toEqual([1, 3])
  })
  it('should traverse replaced nodes', () => {
    const ast: ESTree.ExpressionStatement = {
      type: 'ExpressionStatement',
      expression: { type: 'Literal', value: 42 },
    }
    const newLiteral: ESTree.Literal = { type: 'Literal', value: 100 }
    const enterMock = vi.fn()
    visit(ast, {
      Literal(node) {
        enterMock(node.value)
        if (node.value === 42) this.replace(newLiteral)
      },
    })
    expect(enterMock).toHaveBeenCalledWith(42)
    expect(enterMock).toHaveBeenCalledWith(100)
    expect(ast.expression).toBe(newLiteral)
  })
})
