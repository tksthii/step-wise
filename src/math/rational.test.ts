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
