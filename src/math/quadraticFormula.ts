import { ExactRoot } from './exactRoot'
import { gcd } from './rational'
import type { QuadraticEquation, SolvingMethod } from './solvingMethod'
import type { Step } from './step'

// Multiply a, b, c by the lcm of their denominators so the formula works in whole numbers.
function wholeCoefficients({ a, b, c }: QuadraticEquation) {
  const lcm = [a.den, b.den, c.den].reduce((l, d) => (l * d) / gcd(l, d), 1)
  return { lcm, A: (a.num * lcm) / a.den, B: (b.num * lcm) / b.den, C: (c.num * lcm) / c.den }
}

export const quadraticFormula: SolvingMethod = {
  id: 'quadratic-formula',
  name: 'Quadratic Formula',

  applies: () => ({ ok: true }),

  solve(eq) {
    const steps: Step[] = []
    const { A, B, C } = wholeCoefficients(eq)
    const discriminant = B * B - 4 * A * C
    const roots = discriminant < 0 ? null : new ExactRoot(-B, 1, discriminant, 2 * A)
    return { steps, roots }
  },
}
