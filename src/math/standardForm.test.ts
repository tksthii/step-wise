import { describe, expect, it } from 'vitest'
import { Rational } from './rational'
import { toStandardForm } from './standardForm'

const r = (n: number, d = 1) => new Rational(n, d)

function quadratic(text: string) {
  const result = toStandardForm(text)
  if (result.kind !== 'quadratic') throw new Error(`expected quadratic, got ${result.kind}`)
  return result
}

describe('toStandardForm quadratic', () => {
  it('x^2 = 3x + 4 -> x^2 - 3x - 4 = 0', () => {
    const result = quadratic('x^2 = 3x + 4')
    expect([result.a, result.b, result.c]).toEqual([r(1), r(-3), r(-4)])
    expect(result.steps.map((s) => s.title)).toEqual(['Move everything to the left side', 'Collect like terms'])
    expect(result.steps[0].math).toBe('x^2 - (3x + 4) = 0')
    expect(result.steps[1].math).toBe('x^2 - 3x - 4 = 0')
  })

  it('keeps the original equation', () => {
    const result = quadratic('x^2 = 3x + 4')
    expect(result.original.left).toEqual({
      type: 'binary', op: '^', left: { type: 'x' }, right: { type: 'number', text: '2' },
    })
  })

  it('says when the equation is already in standard form', () => {
    const result = quadratic('x^2 - 2x - 4 = 0')
    expect(result.steps.map((s) => s.title)).toEqual(['Already in standard form'])
    expect(result.steps[0].math).toBe('x^2 - 2x - 4 = 0')
  })

  it('passes parse errors through', () => {
    expect(() => toStandardForm('x^2 +')).toThrow('Something is missing after +')
  })
})

describe('toStandardForm expands each side', () => {
  const summary = (text: string) =>
    quadratic(text).steps.map((s) => `${s.title}${s.identity ? ` [${s.identity}]` : ''}: ${s.math}`)

  it('3x(x-2) = 5', () => {
    const result = quadratic('3x(x-2) = 5')
    expect([result.a, result.b, result.c]).toEqual([r(3), r(-6), r(-5)])
    expect(summary('3x(x-2) = 5')).toEqual([
      'Expand and simplify the left side: 3x(x - 2) = 3x^2 - 6x',
      'Move everything to the left side: 3x^2 - 6x - 5 = 0',
    ])
  })

  it('(x+1)^2 = 9 cites identity 1', () => {
    const result = quadratic('(x+1)^2 = 9')
    expect([result.a, result.b, result.c]).toEqual([r(1), r(2), r(-8)])
    expect(summary('(x+1)^2 = 9')).toEqual([
      'Use identity 1: Square of a sum [1]: (x + 1)^2 = x^2 + 2x + 1',
      'Move everything to the left side: x^2 + 2x + 1 - 9 = 0',
      'Collect like terms: x^2 + 2x - 8 = 0',
    ])
  })

  it('(x+1)^3 - x^3 = 7 cites identity 4 and becomes 3x^2 + 3x - 6 = 0', () => {
    const result = quadratic('(x+1)^3 - x^3 = 7')
    expect([result.a, result.b, result.c]).toEqual([r(3), r(3), r(-6)])
    expect(summary('(x+1)^3 - x^3 = 7')).toEqual([
      'Use identity 4: Cube of a sum [4]: (x + 1)^3 = x^3 + 3x^2 + 3x + 1',
      'Expand and simplify the left side: (x + 1)^3 - x^3 = 3x^2 + 3x + 1',
      'Move everything to the left side: 3x^2 + 3x + 1 - 7 = 0',
      'Collect like terms: 3x^2 + 3x - 6 = 0',
    ])
  })

  it('expands the right side too', () => {
    expect(summary('x^2 = (x-1)(x+1) + x^2')).toContain(
      'Expand and simplify the right side: (x - 1)(x + 1) + x^2 = 2x^2 - 1',
    )
  })
})

describe('toStandardForm without =', () => {
  it('ends by showing the standard form', () => {
    const steps = quadratic('(x+1)^2').steps
    expect(steps.at(-1)?.title).toBe('Write in standard form')
    expect(steps.at(-1)?.math).toBe('x^2 + 2x + 1 = 0')
  })
})
