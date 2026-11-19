import { describe, expect, it } from 'vitest'
import { quadraticFormula } from './quadraticFormula'
import { Rational } from './rational'
import { toStandardForm } from './standardForm'

function solve(text: string) {
  const eq = toStandardForm(text)
  if (eq.kind !== 'quadratic') throw new Error(`expected quadratic, got ${eq.kind}`)
  return quadraticFormula.solve(eq)
}

const r = (n: number, d = 1) => new Rational(n, d)

describe('quadraticFormula roots', () => {
  it('always applies', () => {
    const eq = toStandardForm('x^2 + 1 = 0')
    if (eq.kind !== 'quadratic') throw new Error()
    expect(quadraticFormula.applies(eq)).toEqual({ ok: true })
    expect(quadraticFormula.id).toBe('quadratic-formula')
    expect(quadraticFormula.name).toBe('Quadratic Formula')
  })

  it('2x^2 - 4x - 6 = 0 -> x = 3 or x = -1', () => {
    expect(solve('2x^2 - 4x - 6 = 0').roots?.rationalRoots()).toEqual([r(3), r(-1)])
  })

  it('x^2 - 2x - 4 = 0 -> x = 1 ± √5', () => {
    expect(solve('x^2 - 2x - 4 = 0').roots?.toLatex()).toBe('x = 1 \\pm \\sqrt{5}')
  })

  it('x^2 + 2x + 1 = 0 -> one root, x = -1', () => {
    expect(solve('x^2 + 2x + 1 = 0').roots?.rationalRoots()).toEqual([r(-1)])
  })

  it('x^2 + 1 = 0 -> no real roots', () => {
    expect(solve('x^2 + 1 = 0').roots).toBeNull()
  })

  it('handles fractional coefficients exactly', () => {
    // x^2/2 - x/2 - 1 = 0 is (x - 2)(x + 1) / 2
    expect(solve('x^2/2 - x/2 - 1 = 0').roots?.rationalRoots()).toEqual([r(2), r(-1)])
  })
})

const lines = (text: string) => solve(text).steps.map((s) => `${s.title}: ${s.math}`)

describe('quadraticFormula steps: a, b, c and the discriminant', () => {
  it('2x^2 - 4x - 6 = 0 has two real roots', () => {
    expect(lines('2x^2 - 4x - 6 = 0').slice(0, 3)).toEqual([
      'Identify a, b and c: a = 2, \\quad b = -4, \\quad c = -6',
      'Find the discriminant: b^2 - 4ac = (-4)^2 - 4(2)(-6) = 16 + 48 = 64',
      'Two real roots: b^2 - 4ac = 64 > 0',
    ])
  })

  it('x^2 + 2x + 1 = 0 has one real root', () => {
    expect(lines('x^2 + 2x + 1 = 0').slice(1, 3)).toEqual([
      'Find the discriminant: b^2 - 4ac = 2^2 - 4(1)(1) = 4 - 4 = 0',
      'One real root: b^2 - 4ac = 0',
    ])
  })

  it('x^2 + 1 = 0 stops after explaining there are no real roots', () => {
    const { steps } = solve('x^2 + 1 = 0')
    expect(steps.map((s) => `${s.title}: ${s.math}`)).toEqual([
      'Identify a, b and c: a = 1, \\quad b = 0, \\quad c = 1',
      'Find the discriminant: b^2 - 4ac = 0^2 - 4(1)(1) = 0 - 4 = -4',
      'No real roots: b^2 - 4ac = -4 < 0',
    ])
    expect(steps[2].explanation).toContain('not a real number')
  })

  it('clears fractions before using the formula', () => {
    expect(lines('x^2/2 - x/2 - 1 = 0').slice(0, 2)).toEqual([
      'Identify a, b and c: a = \\frac{1}{2}, \\quad b = -\\frac{1}{2}, \\quad c = -1',
      'Clear the fractions: x^2 - x - 2 = 0',
    ])
  })
})
