import { ExactRoot } from './exactRoot'
import { wholeCoefficients } from './quadraticFormula'
import type { QuadraticEquation, SolvingMethod } from './solvingMethod'

type Pattern = 'sum-zero' | 'alternating-zero' | 'integer-roots'

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

  solve() {
    throw new Error('not implemented yet')
  },
}
