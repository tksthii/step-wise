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

// builds a polynomial from integer coefficients, lowest power first
const poly = (...cs: number[]) => new Polynomial(cs.map((c) => r(c)))

describe('Polynomial add', () => {
  it('adds like terms', () => {
    // (x^2 + 2x) + (3x - 5) = x^2 + 5x - 5
    expect(poly(0, 2, 1).add(poly(-5, 3))).toEqual(poly(-5, 5, 1))
  })

  it('drops terms that cancel', () => {
    expect(poly(1, 0, 2).add(poly(0, 0, -2))).toEqual(poly(1))
  })
})
