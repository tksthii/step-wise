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
