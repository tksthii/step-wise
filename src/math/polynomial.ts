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

  add(other: Polynomial): Polynomial {
    const length = Math.max(this.coeffs.length, other.coeffs.length)
    return new Polynomial(Array.from({ length }, (_, i) => this.coefficient(i).add(other.coefficient(i))))
  }

  subtract(other: Polynomial): Polynomial {
    const length = Math.max(this.coeffs.length, other.coeffs.length)
    return new Polynomial(Array.from({ length }, (_, i) => this.coefficient(i).subtract(other.coefficient(i))))
  }

  multiply(other: Polynomial): Polynomial {
    const result = Array.from({ length: this.coeffs.length + other.coeffs.length }, () => ZERO)
    this.coeffs.forEach((a, i) => {
      other.coeffs.forEach((b, j) => {
        result[i + j] = result[i + j].add(a.multiply(b))
      })
    })
    return new Polynomial(result)
  }

  power(n: number): Polynomial {
    if (!Number.isInteger(n) || n < 0) throw new Error('Exponent must be a whole number')
    if (n === 0 && this.coeffs.length === 0) throw new Error('0^0 is undefined')
    let result = new Polynomial([new Rational(1)])
    for (let i = 0; i < n; i++) result = result.multiply(this)
    return result
  }
}
