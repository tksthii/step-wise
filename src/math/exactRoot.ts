import { gcd, Rational } from './rational'
import { simplifySqrt } from './sqrt'

/** The pair of roots (p ± q√n) / d, kept simplified. q = 0 and n = 0 means a single repeated root p/d. */
export class ExactRoot {
  readonly p: number
  readonly q: number
  readonly n: number
  readonly d: number

  constructor(p: number, q: number, n: number, d: number) {
    if (![p, q, n, d].every(Number.isSafeInteger)) throw new Error('ExactRoot needs integers')
    if (d === 0) throw new Error('Denominator cannot be zero')
    if (n < 0) throw new Error('The equation has no real roots')

    const { coefficient, radicand } = simplifySqrt(n)
    // ± already covers both signs, so q is stored non-negative
    q = Math.abs(q) * coefficient
    n = q === 0 ? 0 : radicand
    if (n === 0) q = 0
    if (d < 0) [p, d] = [-p, -d]

    const g = gcd(gcd(p, q), d)
    this.p = p / g || 0 // `|| 0` turns -0 into 0
    this.q = q / g
    this.n = n
    this.d = d / g
  }

  /** The roots as exact fractions when there is no square root left ((p+q)/d first), otherwise null. */
  rationalRoots(): Rational[] | null {
    if (this.n === 0) return [new Rational(this.p, this.d)]
    if (this.n !== 1) return null
    return [new Rational(this.p + this.q, this.d), new Rational(this.p - this.q, this.d)]
  }
}
