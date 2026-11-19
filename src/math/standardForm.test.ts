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
