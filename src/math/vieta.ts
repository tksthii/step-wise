import { ExactRoot } from './exactRoot'
import { Polynomial } from './polynomial'
import { wholeCoefficients } from './quadraticFormula'
import { Rational } from './rational'
import type { QuadraticEquation, SolvingMethod } from './solvingMethod'
import type { Step } from './step'

type Pattern = 'sum-zero' | 'alternating-zero' | 'integer-roots'

const ZERO = new Rational(0)
const ONE = new Rational(1)
const fraction = (r: Rational) => new Polynomial([r]).toLatex()
// negatives after the first term get brackets: 2 + (-5) + 3
const bracketed = (r: Rational) => (r.num < 0 ? `(${fraction(r)})` : fraction(r))

function exactRoots(eq: QuadraticEquation): ExactRoot | null {
  const { A, B, C } = wholeCoefficients(eq)
  const D = B * B - 4 * A * C
  return D < 0 ? null : new ExactRoot(-B, 1, D, 2 * A)
}

// a + b + c = 0 means x = 1 works; a - b + c = 0 means x = -1 works
function pattern(eq: QuadraticEquation): Pattern | null {
  const { a, b, c } = eq
  if (a.add(b).add(c).num === 0) return 'sum-zero'
  if (a.subtract(b).add(c).num === 0) return 'alternating-zero'
  const roots = exactRoots(eq)?.rationalRoots()
  if (roots?.every((r) => r.den === 1)) return 'integer-roots'
  return null
}

function checkStep(x1: Rational, x2: Rational, eq: QuadraticEquation): Step {
  const sum = x1.add(x2)
  const product = x1.multiply(x2)
  const minusBOverA = ZERO.subtract(eq.b).divide(eq.a)
  return {
    title: 'Check with the sum and product',
    explanation: `Vieta's formulas say the roots add to $-\\frac{b}{a} = ${fraction(minusBOverA)}$ and multiply to $\\frac{c}{a} = ${fraction(eq.c.divide(eq.a))}$. Both match.`,
    math: `x_1 + x_2 = ${fraction(x1)} + ${bracketed(x2)} = ${fraction(sum)}, \\quad x_1 x_2 = ${bracketed(x1)} \\cdot ${bracketed(x2)} = ${fraction(product)}`,
  }
}

function rootsStep(x1: Rational, x2: Rational): Step {
  const same = x1.equals(x2)
  return {
    title: 'Write the roots',
    explanation: same ? 'Both roots are the same, so there is only one root.' : 'These are the two roots.',
    math: same ? `x = ${fraction(x1)}` : `x = ${fraction(x1)} \\text{ or } x = ${fraction(x2)}`,
  }
}

export const vieta: SolvingMethod = {
  id: 'vieta',
  name: "Vieta's shortcut",

  applies(eq) {
    if (pattern(eq)) return { ok: true }
    return {
      ok: false,
      reason: "No quick pattern: $a + b + c \\neq 0$, $a - b + c \\neq 0$, and the roots aren't whole numbers.",
    }
  },

  solve(eq) {
    const applicable = vieta.applies(eq)
    if (!applicable.ok) throw new Error(applicable.reason)
    const { a, b, c } = eq
    const x1 = ONE
    const x2 = c.divide(a)
    const steps: Step[] = [
      {
        title: 'Check a + b + c',
        explanation: 'The coefficients add to 0, so $x = 1$ is a root: substituting $x = 1$ gives $a + b + c = 0$.',
        math: `a + b + c = ${fraction(a)} + ${bracketed(b)} + ${bracketed(c)} = 0`,
      },
      {
        title: 'Find the other root',
        explanation: `The two roots multiply to $\\frac{c}{a}$. One root is $1$, so the other is $\\frac{c}{a} = ${fraction(x2)}$.`,
        math: `x_1 = 1, \\quad x_2 = \\frac{c}{a} = ${fraction(x2)}`,
      },
      checkStep(x1, x2, eq),
      rootsStep(x1, x2),
    ]
    return { steps, roots: exactRoots(eq) }
  },
}
