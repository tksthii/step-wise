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

type BinaryExpr = Extract<Expr, { type: 'binary' }>

/** onBinary runs after each operator node is converted, innermost first; expand uses it to spot identities. */
export function toPolynomial(
  expr: Expr,
  onBinary?: (expr: BinaryExpr, result: Polynomial) => void,
): Polynomial {
  switch (expr.type) {
    case 'number':
      return new Polynomial([parseNumber(expr.text)])
    case 'x':
      return new Polynomial([new Rational(0), new Rational(1)])
    case 'neg':
      return new Polynomial([]).subtract(toPolynomial(expr.arg, onBinary))
    case 'binary': {
      const result = applyOperator(expr.op, toPolynomial(expr.left, onBinary), toPolynomial(expr.right, onBinary))
      onBinary?.(expr, result)
      return result
    }
  }
}

function applyOperator(op: BinaryExpr['op'], left: Polynomial, right: Polynomial): Polynomial {
  switch (op) {
    case '+':
      return left.add(right)
    case '-':
      return left.subtract(right)
    case '*':
      return left.multiply(right)
    case '/': {
      if (right.degree() > 0) throw new Error('x in the denominator is not supported')
      const divisor = right.coefficient(0)
      if (divisor.num === 0) throw new Error('Cannot divide by zero')
      return left.multiply(new Polynomial([new Rational(1).divide(divisor)]))
    }
    case '^': {
      const exponent = right.coefficient(0)
      if (right.degree() > 0 || exponent.den !== 1 || exponent.num < 0) {
        throw new Error('Exponent must be a whole number')
      }
      return left.power(exponent.num)
    }
  }
}
