import { describe, expect, it } from 'vitest'
import { parseExpression } from './parse'
import { Polynomial } from './polynomial'
import { Rational } from './rational'
import { toPolynomial } from './toPolynomial'
import { tokenize } from './tokenize'

const r = (n: number, d = 1) => new Rational(n, d)
const convert = (s: string) => toPolynomial(parseExpression(tokenize(s)))

describe('toPolynomial leaves', () => {
  it('turns an integer into a constant polynomial', () => {
    expect(convert('7')).toEqual(new Polynomial([r(7)]))
    expect(convert('0')).toEqual(new Polynomial([]))
  })

  it('turns decimals into exact fractions', () => {
    expect(convert('0.25')).toEqual(new Polynomial([r(1, 4)]))
    expect(convert('.5')).toEqual(new Polynomial([r(1, 2)]))
    expect(convert('1.10')).toEqual(new Polynomial([r(11, 10)]))
  })

  it('turns x into the polynomial x', () => {
    expect(convert('x')).toEqual(new Polynomial([r(0), r(1)]))
  })

  it('rejects numbers too long to represent exactly', () => {
    expect(() => convert('12345678901234567890')).toThrow('too many digits')
    expect(() => convert('0.0000000000000000001')).toThrow('too many digits')
  })
})

// builds a polynomial from integer coefficients, lowest power first
const poly = (...cs: number[]) => new Polynomial(cs.map((c) => r(c)))

describe('toPolynomial operators', () => {
  it('negation', () => {
    expect(convert('-x')).toEqual(poly(0, -1))
    expect(convert('--3')).toEqual(poly(3))
  })
})

describe('toPolynomial sums', () => {
  it('adds and subtracts, collecting like terms', () => {
    expect(convert('x + 3 - x - x')).toEqual(poly(3, -1))
    expect(convert('0.5 + x - 0.25')).toEqual(new Polynomial([r(1, 4), r(1)]))
  })
})

describe('toPolynomial multiplication', () => {
  it('multiplies out brackets, including implicit multiplication', () => {
    expect(convert('3x(x-2)')).toEqual(poly(0, -6, 3))
    expect(convert('(x-3)(x+1)')).toEqual(poly(-3, -2, 1))
  })
})

describe('toPolynomial division', () => {
  it('divides by a constant', () => {
    expect(convert('(4x*x + 2)/2')).toEqual(poly(1, 0, 2))
    expect(convert('x/3')).toEqual(new Polynomial([r(0), r(1, 3)]))
  })

  it('rejects x in the denominator', () => {
    expect(() => convert('1/x')).toThrow('x in the denominator is not supported')
    expect(() => convert('2/(x+1)')).toThrow('x in the denominator is not supported')
  })

  it('rejects dividing by zero, even a hidden zero', () => {
    expect(() => convert('x/0')).toThrow('Cannot divide by zero')
    expect(() => convert('x/(x-x)')).toThrow('Cannot divide by zero')
  })
})

describe('toPolynomial powers', () => {
  it('raises to whole-number powers', () => {
    expect(convert('(x+1)^2')).toEqual(poly(1, 2, 1))
    expect(convert('(x+1)^3 - x^3')).toEqual(poly(1, 3, 3))
    expect(convert('x^(4/2)')).toEqual(poly(0, 0, 1))
    expect(convert('x^0')).toEqual(poly(1))
  })

  it('rejects exponents that are not whole numbers', () => {
    for (const s of ['x^-1', 'x^0.5', 'x^(1/2)', 'x^x', '2^(x+1)']) {
      expect(() => convert(s), s).toThrow('Exponent must be a whole number')
    }
  })
})
