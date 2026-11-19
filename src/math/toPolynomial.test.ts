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
