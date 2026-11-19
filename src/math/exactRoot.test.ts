import { describe, expect, it } from 'vitest'
import { ExactRoot } from './exactRoot'
import { Rational } from './rational'

const parts = (r: ExactRoot) => ({ p: r.p, q: r.q, n: r.n, d: r.d })

describe('ExactRoot create + simplify', () => {
  it('simplifies the root and the common factor: (4 ± √40)/4 = (2 ± √10)/2', () => {
    expect(parts(new ExactRoot(4, 1, 40, 4))).toEqual({ p: 2, q: 1, n: 10, d: 2 })
  })

  it('reduces a common factor of p, q and d: (6 ± 3√5)/9 = (2 ± √5)/3', () => {
    expect(parts(new ExactRoot(6, 3, 5, 9))).toEqual({ p: 2, q: 1, n: 5, d: 3 })
  })

  it('keeps d positive and q non-negative', () => {
    expect(parts(new ExactRoot(2, -1, 3, -1))).toEqual({ p: -2, q: 1, n: 3, d: 1 })
  })

  it('stores a zero radical as q = 0, n = 0 (one repeated root)', () => {
    expect(parts(new ExactRoot(6, 5, 0, 4))).toEqual({ p: 3, q: 0, n: 0, d: 2 })
    expect(parts(new ExactRoot(6, 0, 7, 4))).toEqual({ p: 3, q: 0, n: 0, d: 2 })
  })

  it('turns a perfect-square radical into q with n = 1: (2 ± √36)/2 = 1 ± 3', () => {
    expect(parts(new ExactRoot(2, 1, 36, 2))).toEqual({ p: 1, q: 3, n: 1, d: 1 })
  })

  it('rejects a negative radicand, zero denominator and non-integers', () => {
    expect(() => new ExactRoot(1, 1, -4, 2)).toThrow('no real roots')
    expect(() => new ExactRoot(1, 1, 4, 0)).toThrow()
    expect(() => new ExactRoot(1.5, 1, 4, 2)).toThrow()
  })
})

describe('ExactRoot rationalRoots', () => {
  it('splits a perfect-square radical into two rational roots, + root first', () => {
    // (-3 ± √81)/6 = (-1 ± 3)/2 -> x = 1 or x = -2
    expect(new ExactRoot(-3, 1, 81, 6).rationalRoots()).toEqual([new Rational(1), new Rational(-2)])
    // (4 ± √64)/4 -> x = 3 or x = -1
    expect(new ExactRoot(4, 1, 64, 4).rationalRoots()).toEqual([new Rational(3), new Rational(-1)])
  })

  it('keeps fractions exact', () => {
    // (1 ± √9)/4 -> 1 or -1/2
    expect(new ExactRoot(1, 1, 9, 4).rationalRoots()).toEqual([new Rational(1), new Rational(-1, 2)])
  })

  it('gives one root when the radical is zero', () => {
    expect(new ExactRoot(-2, 1, 0, 2).rationalRoots()).toEqual([new Rational(-1)])
  })

  it('gives null when the roots are irrational', () => {
    expect(new ExactRoot(2, 1, 20, 2).rationalRoots()).toBeNull()
  })
})
