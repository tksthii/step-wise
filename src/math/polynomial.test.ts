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

describe('Polynomial subtract', () => {
  it('subtracts like terms', () => {
    // (x^2 + 2x) - (3x - 5) = x^2 - x + 5
    expect(poly(0, 2, 1).subtract(poly(-5, 3))).toEqual(poly(5, -1, 1))
  })

  it('gives zero when subtracting itself', () => {
    expect(poly(3, 1).subtract(poly(3, 1)).degree()).toBe(-1)
  })
})

describe('Polynomial multiply', () => {
  it('multiplies term by term and collects', () => {
    // (x - 3)(x + 1) = x^2 - 2x - 3
    expect(poly(-3, 1).multiply(poly(1, 1))).toEqual(poly(-3, -2, 1))
    // 3x(x - 2) = 3x^2 - 6x
    expect(poly(0, 3).multiply(poly(-2, 1))).toEqual(poly(0, -6, 3))
  })

  it('works with fractions', () => {
    // (1/2 x)(4x) = 2x^2
    expect(new Polynomial([r(0), r(1, 2)]).multiply(poly(0, 4))).toEqual(poly(0, 0, 2))
  })

  it('anything times zero is zero', () => {
    expect(poly(1, 2, 3).multiply(poly()).degree()).toBe(-1)
  })
})

describe('Polynomial power', () => {
  it('raises to a whole-number power', () => {
    // (x + 1)^2 = x^2 + 2x + 1
    expect(poly(1, 1).power(2)).toEqual(poly(1, 2, 1))
    // (x + 1)^3 = x^3 + 3x^2 + 3x + 1
    expect(poly(1, 1).power(3)).toEqual(poly(1, 3, 3, 1))
    expect(poly(-2, 1).power(1)).toEqual(poly(-2, 1))
  })

  it('anything non-zero to the power 0 is 1', () => {
    expect(poly(5, 1).power(0)).toEqual(poly(1))
  })

  it('rejects 0^0 and negative or fractional powers', () => {
    expect(() => poly().power(0)).toThrow('0^0 is undefined')
    expect(() => poly(1, 1).power(-1)).toThrow()
    expect(() => poly(1, 1).power(0.5)).toThrow()
  })
})

describe('Polynomial toString', () => {
  it('writes student-style polynomials', () => {
    expect(poly(-6, -4, 2).toString()).toBe('2x^2 - 4x - 6')
    expect(poly(1, 0, 1).toString()).toBe('x^2 + 1')
    expect(poly(0, -1).toString()).toBe('-x')
    expect(poly().toString()).toBe('0')
    expect(poly(0, 0, 0, 1).toString()).toBe('x^3')
    expect(poly(-7).toString()).toBe('-7')
  })

  it('brackets fractional coefficients of x so 1/2x is not ambiguous', () => {
    expect(new Polynomial([r(-3, 4), r(1, 2), r(-1)]).toString()).toBe('-x^2 + (1/2)x - 3/4')
    expect(new Polynomial([r(0), r(-2, 3)]).toString()).toBe('-(2/3)x')
  })
})

describe('Polynomial toLatex', () => {
  it('matches toString for integer coefficients', () => {
    expect(poly(-6, -4, 2).toLatex()).toBe('2x^2 - 4x - 6')
    expect(poly().toLatex()).toBe('0')
  })

  it('uses \\frac for fractions and braces for long exponents', () => {
    expect(new Polynomial([r(-3, 4), r(1, 2), r(-1)]).toLatex()).toBe('-x^2 + \\frac{1}{2}x - \\frac{3}{4}')
    expect(poly(...Array(10).fill(0), 1).toLatex()).toBe('x^{10}')
  })
})
