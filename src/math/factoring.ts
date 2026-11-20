import { ExactRoot } from './exactRoot'
import { Polynomial } from './polynomial'
import { wholeCoefficients } from './quadraticFormula'
import { Rational } from './rational'
import type { QuadraticEquation, SolvingMethod } from './solvingMethod'
import type { Step } from './step'

/** The linear factor qx - p, with q > 0 and gcd(q, p) = 1. */
interface Factor {
  q: number
  p: number
}

const signed = (n: number, suffix = '') => `${n < 0 ? '-' : '+'} ${Math.abs(n)}${suffix}`
const linear = ({ q, p }: Factor) => `${q === 1 ? '' : q}x${p === 0 ? '' : ` ${signed(-p)}`}`
const bracketed = (f: Factor) => (f.p === 0 ? linear(f) : `(${linear(f)})`)
const product = (factors: Factor[]) => factors.map(bracketed).join('')
const trinomial = (a: number, b: number, c: number) => new Polynomial([c, b, a].map((n) => new Rational(n))).toLatex()
const fraction = (r: Rational) => new Polynomial([r]).toLatex()

const discriminant = (eq: QuadraticEquation) => {
  const { A, B, C } = wholeCoefficients(eq)
  return B * B - 4 * A * C
}

// with rational roots p1/q1, p2/q2 in lowest terms, a primitive ax^2 + bx + c (a > 0) is exactly (q1x - p1)(q2x - p2)
function factorsFromRoots(a: number, b: number, c: number): [Factor, Factor] {
  const s = Math.sqrt(b * b - 4 * a * c)
  const factor = (top: number): Factor => {
    const r = new Rational(top, 2 * a)
    return { q: r.den, p: r.num }
  }
  return [factor(-b + s), factor(-b - s)]
}

function zeroProductSteps(factors: Factor[]): Step[] {
  const roots = factors.map(({ q, p }) => `x = ${fraction(new Rational(p, q))}`)
  return [
    {
      title: 'Use the zero product property',
      explanation: 'If a product is 0, at least one of the factors must be 0. Set each factor equal to 0.',
      math: `${product(factors)} = 0 \\Rightarrow ${factors.map((f) => `${linear(f)} = 0`).join(' \\text{ or } ')}`,
    },
    { title: 'Write the roots', explanation: 'Solve each equation for $x$.', math: roots.join(' \\text{ or } ') },
  ]
}

export const factoring: SolvingMethod = {
  id: 'factoring',
  name: 'Factoring',

  // only rational roots give factors with whole-number coefficients
  applies(eq) {
    const D = discriminant(eq)
    if (D < 0) return { ok: false, reason: `The discriminant (${D}) is negative, so there are no real roots to factor.` }
    if (!Number.isInteger(Math.sqrt(D))) {
      return { ok: false, reason: `The discriminant (${D}) isn't a perfect square, so this doesn't factor nicely.` }
    }
    return { ok: true }
  },

  solve(eq) {
    const applicable = factoring.applies(eq)
    if (!applicable.ok) throw new Error(applicable.reason)
    const { A, B, C } = wholeCoefficients(eq)
    const factors = factorsFromRoots(A, B, C)
    const [m, n] = factors.map((f) => -f.p)
    const steps: Step[] = [
      {
        title: 'Factor the simple trinomial',
        explanation: `Find two numbers that multiply to $c = ${C}$ and add to $b = ${B}$: $${m}$ and $${n}$.`,
        math: `${trinomial(A, B, C)} = ${product(factors)}`,
      },
      ...zeroProductSteps(factors),
    ]
    return { steps, roots: new ExactRoot(-B, 1, B * B - 4 * A * C, 2 * A) }
  },
}
