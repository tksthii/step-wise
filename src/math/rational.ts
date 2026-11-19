function gcd(a: number, b: number): number {
  a = Math.abs(a)
  b = Math.abs(b)
  while (b !== 0) [a, b] = [b, a % b]
  return a
}

// shortcut: plain numbers lose precision past 2^53, switch to bigint if inputs get that large
export class Rational {
  readonly num: number
  readonly den: number

  constructor(num: number, den = 1) {
    if (!Number.isInteger(num) || !Number.isInteger(den)) {
      throw new Error('Rational needs integer numerator and denominator')
    }
    if (den === 0) throw new Error('Denominator cannot be zero')
    const sign = den < 0 ? -1 : 1
    const g = gcd(num, den)
    // `|| 0` turns -0 into 0
    this.num = (sign * num) / g || 0
    this.den = (sign * den) / g
  }
}
