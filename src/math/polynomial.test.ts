import { describe, expect, it } from 'vitest'
import { Polynomial } from './polynomial'
import { Rational } from './rational'

const r = (n: number, d = 1) => new Rational(n, d)

describe('Polynomial create, degree, coefficient', () => {
  // coefficients are listed from x^0 upward: 2x^2 - 4x - 6
  const p = new Polynomial([r(-6), r(-4), r(2)])

  it('reads coefficients by power', () => {
    expect(p.coefficient(0)).toEqual(r(-6))
    expect(p.coefficient(1)).toEqual(r(-4))
    expect(p.coefficient(2)).toEqual(r(2))
  })

  it('returns 0 for powers beyond the degree', () => {
    expect(p.coefficient(5)).toEqual(r(0))
  })

  it('degree is the highest power with a non-zero coefficient', () => {
    expect(p.degree()).toBe(2)
    expect(new Polynomial([r(1, 2)]).degree()).toBe(0)
  })

  it('ignores trailing zero coefficients', () => {
    const q = new Polynomial([r(1), r(3), r(0), r(0)])
    expect(q.degree()).toBe(1)
  })

  it('zero polynomial has degree -1', () => {
    expect(new Polynomial([]).degree()).toBe(-1)
    expect(new Polynomial([r(0), r(0)]).degree()).toBe(-1)
  })

  it('rejects negative or fractional powers', () => {
    expect(() => p.coefficient(-1)).toThrow()
    expect(() => p.coefficient(1.5)).toThrow()
  })
})
