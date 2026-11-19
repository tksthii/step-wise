import { describe, expect, it } from 'vitest'
import { Rational } from './rational'

describe('Rational create + reduce', () => {
  it('reduces to lowest terms', () => {
    const r = new Rational(6, 8)
    expect([r.num, r.den]).toEqual([3, 4])
  })

  it('keeps the denominator positive', () => {
    const r = new Rational(3, -6)
    expect([r.num, r.den]).toEqual([-1, 2])
    const s = new Rational(-4, -2)
    expect([s.num, s.den]).toEqual([2, 1])
  })

  it('defaults the denominator to 1', () => {
    const r = new Rational(5)
    expect([r.num, r.den]).toEqual([5, 1])
  })

  it('normalizes zero to 0/1', () => {
    const r = new Rational(0, -7)
    expect([r.num, r.den]).toEqual([0, 1])
  })

  it('rejects a zero denominator', () => {
    expect(() => new Rational(1, 0)).toThrow()
  })

  it('rejects non-integers', () => {
    expect(() => new Rational(1.5, 2)).toThrow()
    expect(() => new Rational(1, NaN)).toThrow()
  })
})

describe('Rational add', () => {
  it('adds and reduces', () => {
    expect(new Rational(1, 2).add(new Rational(1, 3))).toEqual(new Rational(5, 6))
    expect(new Rational(1, 6).add(new Rational(1, 3))).toEqual(new Rational(1, 2))
  })

  it('handles negatives and zero', () => {
    expect(new Rational(-3, 4).add(new Rational(1, 4))).toEqual(new Rational(-1, 2))
    expect(new Rational(2, 5).add(new Rational(-2, 5))).toEqual(new Rational(0))
  })

  it('throws instead of losing precision on huge values', () => {
    const big = new Rational(Number.MAX_SAFE_INTEGER)
    expect(() => big.add(big)).toThrow('safe range')
  })
})

describe('Rational subtract', () => {
  it('subtracts and reduces', () => {
    expect(new Rational(1, 2).subtract(new Rational(1, 3))).toEqual(new Rational(1, 6))
    expect(new Rational(1, 4).subtract(new Rational(3, 4))).toEqual(new Rational(-1, 2))
    expect(new Rational(2).subtract(new Rational(2))).toEqual(new Rational(0))
  })
})

describe('Rational multiply', () => {
  it('multiplies and reduces', () => {
    expect(new Rational(2, 3).multiply(new Rational(9, 4))).toEqual(new Rational(3, 2))
    expect(new Rational(-1, 2).multiply(new Rational(4))).toEqual(new Rational(-2))
    expect(new Rational(5, 7).multiply(new Rational(0))).toEqual(new Rational(0))
  })
})

describe('Rational divide', () => {
  it('divides and reduces', () => {
    expect(new Rational(3, 4).divide(new Rational(3, 8))).toEqual(new Rational(2))
    expect(new Rational(1, 2).divide(new Rational(-3))).toEqual(new Rational(-1, 6))
  })

  it('throws a clear error on divide by zero', () => {
    expect(() => new Rational(1).divide(new Rational(0))).toThrow('Cannot divide by zero')
  })
})

describe('Rational equals', () => {
  it('compares reduced values', () => {
    expect(new Rational(2, 4).equals(new Rational(1, 2))).toBe(true)
    expect(new Rational(1, -2).equals(new Rational(-1, 2))).toBe(true)
    expect(new Rational(1, 2).equals(new Rational(1, 3))).toBe(false)
  })
})

describe('Rational toString', () => {
  it('writes fractions, negatives and whole numbers', () => {
    expect(new Rational(3, 4).toString()).toBe('3/4')
    expect(new Rational(-2).toString()).toBe('-2')
    expect(new Rational(10, 2).toString()).toBe('5')
    expect(new Rational(-1, 3).toString()).toBe('-1/3')
    expect(new Rational(0).toString()).toBe('0')
  })
})
