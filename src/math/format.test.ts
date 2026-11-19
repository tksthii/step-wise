import { describe, expect, it } from 'vitest'
import { exprToLatex, exprToText } from './format'
import { parseExpression } from './parse'
import { tokenize } from './tokenize'

const latex = (s: string) => exprToLatex(parseExpression(tokenize(s)))
const text = (s: string) => exprToText(parseExpression(tokenize(s)))

describe('exprToLatex', () => {
  it.each([
    ['3x(x-2)', '3x(x - 2)'],
    ['(x+1)(x-1)', '(x + 1)(x - 1)'],
    ['(x+1)^2', '(x + 1)^2'],
    ['x^10', 'x^{10}'],
    ['-x^2 + 4', '-x^2 + 4'],
    ['x/2', '\\frac{x}{2}'],
    ['2*3', '2 \\cdot 3'],
    ['x*x', 'x \\cdot x'],
    ['x - (x+1)', 'x - (x + 1)'],
    ['x + -3', 'x + (-3)'],
    ['-(x+1)', '-(x + 1)'],
    ['(-x)^2', '(-x)^2'],
    ['(x^2)^3', '(x^2)^3'],
  ])('%s -> %s', (input, expected) => {
    expect(latex(input)).toBe(expected)
  })
})

describe('exprToText', () => {
  it.each([
    ['3x(x-2)', '3x(x - 2)'],
    ['(x+1)^2', '(x + 1)^2'],
    ['x^10', 'x^10'],
    ['x/2', 'x/2'],
    ['(x+1)/2', '(x + 1)/2'],
    ['2*3', '2*3'],
    ['x^(4/2)', 'x^(4/2)'],
  ])('%s -> %s', (input, expected) => {
    expect(text(input)).toBe(expected)
  })
})
