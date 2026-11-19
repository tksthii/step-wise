import { Rational } from './rational'

const ZERO = new Rational(0)

export class Polynomial {
  // coeffs[n] is the coefficient of x^n; no trailing zeros, so [] is the zero polynomial
  private readonly coeffs: readonly Rational[]

  constructor(coeffs: readonly Rational[]) {
    let end = coeffs.length
    while (end > 0 && coeffs[end - 1].num === 0) end--
    this.coeffs = coeffs.slice(0, end)
  }

  /** Highest power with a non-zero coefficient; -1 for the zero polynomial. */
  degree(): number {
    return this.coeffs.length - 1
  }

  coefficient(n: number): Rational {
    if (!Number.isInteger(n) || n < 0) throw new Error('Power must be a non-negative integer')
    return this.coeffs[n] ?? ZERO
  }
}
