import { wholeCoefficients } from './quadraticFormula'
import type { QuadraticEquation, SolvingMethod } from './solvingMethod'

const discriminant = (eq: QuadraticEquation) => {
  const { A, B, C } = wholeCoefficients(eq)
  return B * B - 4 * A * C
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

  solve() {
    throw new Error('not implemented yet')
  },
}
