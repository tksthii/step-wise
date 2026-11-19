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
