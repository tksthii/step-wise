import { ExactRoot } from './exactRoot'
import { Polynomial } from './polynomial'
import { twoPlaces, wholeCoefficients } from './quadraticFormula'
import type { Rational } from './rational'
import type { SolvingMethod } from './solvingMethod'
import { simplifySqrt } from './sqrt'
import type { Step } from './step'

const latex = (r: Rational) => new Polynomial([r]).toLatex()
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

// x = (-b' ± √Δ')/a, simplified; the Simplify step is skipped when it already reads as the answer
function formulaSteps(A: number, bp: number, D: number, roots: ExactRoot): Step[] {
  const minusBp = bp < 0 ? `-(${bp})` : bp === 0 ? '0' : `-${bp}`
  const over = (top: string) => (A === 1 ? top : `\\frac{${top}}{${A}}`)
  let simplified = `x = ${over(`${-bp} \\pm \\sqrt{${D}}`)}`
  const { coefficient: k, radicand: m } = simplifySqrt(D)
  if (D === 0) simplified += ` = ${over(`${-bp}`)}`
  else if (m === 1) simplified += ` = ${over(`${-bp} \\pm ${k}`)}`
  else if (k > 1) simplified += ` = ${over(`${-bp} \\pm ${k}\\sqrt{${m}}`)}`

  const rational = roots.rationalRoots()
  let explanation: string
  if (rational?.length === 1) explanation = `There is only one root: $x = ${latex(rational[0])}$.`
  else if (rational) {
    explanation = `The square root is a whole number, so both roots are rational: $x = ${latex(rational[0])}$ or $x = ${latex(rational[1])}$.`
  } else {
    const [plus, minus] = roots.decimals().map(twoPlaces)
    explanation = `This is the exact answer. As decimals, x ≈ ${plus} or x ≈ ${minus} (rounded to 2 decimal places).`
  }

  const steps: Step[] = [
    {
      title: 'Apply the formula',
      explanation: "Substitute $b'$, $\\Delta'$ and $a$ into $x = \\frac{-b' \\pm \\sqrt{\\Delta'}}{a}$.",
      math: `x = \\frac{-b' \\pm \\sqrt{\\Delta'}}{a} = \\frac{${minusBp} \\pm \\sqrt{${D}}}{${A}}`,
    },
  ]
  if (simplified !== roots.toLatex()) {
    steps.push({
      title: 'Simplify',
      explanation: 'Work out the top and bottom, and simplify the square root if you can.',
      math: simplified,
    })
  }
  steps.push({ title: 'Write the roots', explanation, math: roots.toLatex() })
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
    if (D < 0) return { steps, roots: null }
    const roots = new ExactRoot(-bp, 1, D, A)
    return { steps: [...steps, ...formulaSteps(A, bp, D, roots)], roots }
  },
}
