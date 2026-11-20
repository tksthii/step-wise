import { IDENTITIES } from './identities'
import { Polynomial } from './polynomial'
import { Rational } from './rational'
import type { SolvingMethod } from './solvingMethod'
import { solveSquare, squareOf } from './squareRoot'
import type { Step } from './step'

const ZERO = new Rational(0)
const ONE = new Rational(1)
const fraction = (r: Rational) => new Polynomial([r]).toLatex()
const poly = (...coeffs: Rational[]) => new Polynomial(coeffs).toLatex()
// (-1)^2 and \left(\frac{1}{2}\right)^2 need brackets; 3^2 does not
const squared = (r: Rational) =>
  r.den !== 1 ? `\\left(${fraction(r)}\\right)^2` : r.num < 0 ? `(${fraction(r)})^2` : `${fraction(r)}^2`

export const completingSquare: SolvingMethod = {
  id: 'completing-square',
  name: 'Completing the Square',

  applies: () => ({ ok: true }),

  solve(eq) {
    const steps: Step[] = []
    const b = eq.b.divide(eq.a)
    const c = eq.c.divide(eq.a)
    const right = ZERO.subtract(c)

    if (c.num !== 0) {
      steps.push({
        title: 'Move the constant to the right side',
        explanation: c.num < 0 ? `Add $${fraction(right)}$ to both sides.` : `Subtract $${fraction(c)}$ from both sides.`,
        math: `${poly(ZERO, b, ONE)} = ${fraction(right)}`,
      })
    }

    const half = b.divide(new Rational(2))
    const added = half.multiply(half)
    const total = right.add(added)
    const sum = c.num === 0 ? fraction(added) : `${fraction(right)} + ${fraction(added)}`
    steps.push({
      title: 'Complete the square',
      explanation: `Half of $${fraction(b)}$ is $${fraction(half)}$, and $${squared(half)} = ${fraction(added)}$. Add $${fraction(added)}$ to both sides.`,
      math: `${poly(added, b, ONE)} = ${sum}`,
    })

    const inner = new Polynomial([half, ONE])
    const { number, name } = IDENTITIES[half.num > 0 ? 0 : 1]
    const [shape, factored] = half.num > 0 ? ['a^2 + 2ab + b^2', '(a+b)^2'] : ['a^2 - 2ab + b^2', '(a-b)^2']
    const abs = new Rational(Math.abs(half.num), half.den)
    steps.push({
      title: `Use identity ${number}: ${name}`,
      explanation: `The left side has the shape $${shape}$ with $a = x$ and $b = ${fraction(abs)}$, so it equals $${factored}$. On the right, $${sum} = ${fraction(total)}$.`,
      math: `${squareOf(inner)} = ${fraction(total)}`,
      identity: number,
    })

    const rest = solveSquare(eq, inner, total)
    return { steps: [...steps, ...rest.steps], roots: rest.roots }
  },
}
