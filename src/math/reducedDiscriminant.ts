import { wholeCoefficients } from './quadraticFormula'
import type { SolvingMethod } from './solvingMethod'
import type { Step } from './step'

const bracketIfNegative = (n: number) => (n < 0 ? `(${n})` : `${n}`)

// b' = b/2 and Δ' = b'^2 - ac, then how many roots Δ' gives
function discriminantSteps(A: number, B: number, C: number, bp: number, D: number): Step[] {
  const ac = A * C
  const steps: Step[] = [
    {
      title: "Find b'",
      explanation:
        "This is a shortcut taught in Vietnam when $b$ is even: use $b' = \\frac{b}{2}$ instead of $b$, so the numbers stay smaller.",
      math: `a = ${A}, \\quad b = ${B}, \\quad c = ${C}, \\quad b' = \\frac{b}{2} = ${bp}`,
    },
    {
      title: 'Find the reduced discriminant',
      explanation: "The reduced discriminant is $\\Delta' = b'^2 - ac$. Its sign tells us how many real roots there are.",
      math: `\\Delta' = b'^2 - ac = ${bracketIfNegative(bp)}^2 - (${A})(${C}) = ${bp * bp} ${ac < 0 ? `+ ${-ac}` : `- ${ac}`} = ${D}`,
    },
  ]
  if (D > 0) {
    steps.push({
      title: 'Two real roots',
      explanation: `$\\Delta' = ${D}$ is greater than 0, so there are two different real roots.`,
      math: `\\Delta' = ${D} > 0`,
    })
  } else if (D === 0) {
    steps.push({
      title: 'One real root',
      explanation: "$\\Delta' = 0$, so there is exactly one real root.",
      math: "\\Delta' = 0",
    })
  } else {
    steps.push({
      title: 'No real roots',
      explanation: `$\\Delta' = ${D}$ is less than 0, so there are no real roots. On the graph, the parabola never touches the x-axis.`,
      math: `\\Delta' = ${D} < 0`,
    })
  }
  return steps
}

export const reducedDiscriminant: SolvingMethod = {
  id: 'reduced-discriminant',
  name: "Reduced discriminant (Δ')",

  applies(eq) {
    const { B } = wholeCoefficients(eq)
    return B % 2 === 0 ? { ok: true } : { ok: false, reason: "b is odd, so there's no shortcut here." }
  },

  solve(eq) {
    const applicable = reducedDiscriminant.applies(eq)
    if (!applicable.ok) throw new Error(applicable.reason)
    const { A, B, C } = wholeCoefficients(eq)
    const bp = B / 2
    const D = bp * bp - A * C
    const steps = discriminantSteps(A, B, C, bp, D)
    return { steps, roots: null }
  },
}
