import type { Expr } from './parse'
import type { Polynomial } from './polynomial'
import { Rational } from './rational'
import type { QuadraticEquation, SolvingMethod } from './solvingMethod'
import { toPolynomial } from './toPolynomial'

/** k(inner)^2 = q, where inner is linear (x, x + p, 2x - 1, ...). */
interface SquareForm {
  k: Rational
  inner: Polynomial
  q: Rational
}

// k(inner)^2, -(inner)^2 or (inner)^2 with a linear inner
function matchSquare(e: Expr): { k: Rational; inner: Polynomial } | null {
  if (e.type === 'neg') {
    const m = matchSquare(e.arg)
    return m && { k: new Rational(0).subtract(m.k), inner: m.inner }
  }
  if (e.type !== 'binary') return null
  if (e.op === '^' && e.right.type === 'number' && e.right.text === '2') {
    const inner = toPolynomial(e.left)
    return inner.degree() === 1 ? { k: new Rational(1), inner } : null
  }
  if (e.op === '*') {
    const k = toPolynomial(e.left)
    const m = matchSquare(e.right)
    if (m && k.degree() === 0) return { k: k.coefficient(0).multiply(m.k), inner: m.inner }
  }
  return null
}

// the square on one side as the student typed it, a constant on the other
function squareForm({ original }: QuadraticEquation): SquareForm | null {
  for (const [square, other] of [[original.left, original.right], [original.right, original.left]]) {
    const m = matchSquare(square)
    const q = toPolynomial(other)
    if (m && q.degree() <= 0) return { ...m, q: q.coefficient(0) }
  }
  return null
}

export const squareRoot: SolvingMethod = {
  id: 'square-root',
  name: 'Square Root',

  applies(eq) {
    if (eq.b.num === 0 || squareForm(eq)) return { ok: true }
    return { ok: false, reason: 'This method needs the equation in the form $(x + p)^2 = q$ or with $b = 0$.' }
  },

  solve() {
    throw new Error('not implemented yet')
  },
}
