import { wholeCoefficients } from './quadraticFormula'
import type { SolvingMethod } from './solvingMethod'

export const reducedDiscriminant: SolvingMethod = {
  id: 'reduced-discriminant',
  name: "Reduced discriminant (Δ')",

  applies(eq) {
    const { B } = wholeCoefficients(eq)
    return B % 2 === 0 ? { ok: true } : { ok: false, reason: "b is odd, so there's no shortcut here." }
  },

  solve() {
    throw new Error('not implemented yet')
  },
}
