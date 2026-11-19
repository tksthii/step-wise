import type { Expr } from './parse'
import { Polynomial } from './polynomial'
import { Rational } from './rational'

// "1.25" -> 125/100, done on the digit string so no floating-point error creeps in
function parseNumber(text: string): Rational {
  const [whole, frac = ''] = text.split('.')
  const num = Number(whole + frac)
  const den = 10 ** frac.length
  if (!Number.isSafeInteger(num) || !Number.isSafeInteger(den)) throw new Error(`The number ${text} has too many digits`)
  return new Rational(num, den)
}

export function toPolynomial(expr: Expr): Polynomial {
  switch (expr.type) {
    case 'number':
      return new Polynomial([parseNumber(expr.text)])
    case 'x':
      return new Polynomial([new Rational(0), new Rational(1)])
    case 'neg':
      return new Polynomial([]).subtract(toPolynomial(expr.arg))
    case 'binary': {
      const left = toPolynomial(expr.left)
      const right = toPolynomial(expr.right)
      switch (expr.op) {
        case '+':
          return left.add(right)
        case '-':
          return left.subtract(right)
        default:
          throw new Error(`Converting "${expr.op}" is not supported yet`)
      }
    }
  }
}
