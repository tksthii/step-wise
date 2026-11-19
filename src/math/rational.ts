export function gcd(a: number, b: number): number {
  a = Math.abs(a)
  b = Math.abs(b)
  while (b !== 0) [a, b] = [b, a % b]
  return a
}

// shortcut: plain numbers cap at 2^53 (throws past it), switch to bigint if real inputs hit that
export class Rational {
  readonly num: number
  readonly den: number

  constructor(num: number, den = 1) {
    // safe-integer check also catches arithmetic results that overflowed and lost precision
    if (!Number.isSafeInteger(num) || !Number.isSafeInteger(den)) {
      throw new Error('Rational needs integer numerator and denominator within safe range')
    }
    if (den === 0) throw new Error('Denominator cannot be zero')
    const sign = den < 0 ? -1 : 1
    const g = gcd(num, den)
    // `|| 0` turns -0 into 0
    this.num = (sign * num) / g || 0
    this.den = (sign * den) / g
  }

  add(other: Rational): Rational {
    return new Rational(this.num * other.den + other.num * this.den, this.den * other.den)
  }

  subtract(other: Rational): Rational {
    return new Rational(this.num * other.den - other.num * this.den, this.den * other.den)
  }

  multiply(other: Rational): Rational {
    return new Rational(this.num * other.num, this.den * other.den)
  }

  divide(other: Rational): Rational {
    if (other.num === 0) throw new Error('Cannot divide by zero')
    return new Rational(this.num * other.den, this.den * other.num)
  }

  equals(other: Rational): boolean {
    return this.num === other.num && this.den === other.den
  }

  toString(): string {
    return this.den === 1 ? `${this.num}` : `${this.num}/${this.den}`
  }
}
