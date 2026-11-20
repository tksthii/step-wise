import { ExactRoot } from './exactRoot'
import { Polynomial } from './polynomial'
import { wholeCoefficients } from './quadraticFormula'
import { Rational } from './rational'
import type { QuadraticEquation, SolvingMethod } from './solvingMethod'
import type { Step } from './step'

type Pattern = 'sum-zero' | 'alternating-zero' | 'integer-roots'

const ZERO = new Rational(0)
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

// x = 1 is a root when a + b + c = 0, x = -1 when a - b + c = 0; the other root then comes from the product c/a
function knownRootSteps(eq: QuadraticEquation, root: 1 | -1): Step[] {
  const { a, b, c } = eq
  const x1 = new Rational(root)
  const x2 = c.divide(a).multiply(x1)
  const [check, other] = root === 1 ? ['a + b + c', '\\frac{c}{a}'] : ['a - b + c', '-\\frac{c}{a}']
  const substituted =
    root === 1
      ? `${fraction(a)} + ${bracketed(b)} + ${bracketed(c)}`
      : `${fraction(a)} - ${bracketed(b)} + ${bracketed(c)}`
  return [
    {
      title: `Check ${check}`,
      explanation:
        (root === 1 ? 'The coefficients add to 0' : 'This is 0') +
        `, so $x = ${root}$ is a root: substituting $x = ${root}$ gives $${check} = 0$.`,
      math: `${check} = ${substituted} = 0`,
    },
    {
      title: 'Find the other root',
      explanation: `The two roots multiply to $\\frac{c}{a}$. One root is $${root}$, so the other is $${other} = ${fraction(x2)}$.`,
      math: `x_1 = ${root}, \\quad x_2 = ${other} = ${fraction(x2)}`,
    },
    checkStep(x1, x2, eq),
    rootsStep(x1, x2),
  ]
}

// whole-number roots: name the two numbers with sum -b/a and product c/a, smaller first
function integerRootSteps(eq: QuadraticEquation, roots: ExactRoot): Step[] {
  const found = roots.rationalRoots()!
  const [x1, x2] = found.length === 1 ? [found[0], found[0]] : [...found].sort((p, q) => p.num - q.num)
  const sum = fraction(ZERO.subtract(eq.b).divide(eq.a))
  const product = fraction(eq.c.divide(eq.a))
  return [
    {
      title: 'Find two numbers',
      explanation: `Look for two whole numbers that add to $-\\frac{b}{a} = ${sum}$ and multiply to $\\frac{c}{a} = ${product}$: $${fraction(x1)}$ and $${fraction(x2)}$.`,
      math: `x_1 + x_2 = -\\frac{b}{a} = ${sum}, \\quad x_1 x_2 = \\frac{c}{a} = ${product}`,
    },
    checkStep(x1, x2, eq),
    rootsStep(x1, x2),
  ]
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
    const found = pattern(eq)
    const roots = exactRoots(eq)
    if (found === 'integer-roots') return { steps: integerRootSteps(eq, roots!), roots }
    return { steps: knownRootSteps(eq, found === 'sum-zero' ? 1 : -1), roots }
  },
}
