import { ExactRoot } from './exactRoot'
import { Polynomial } from './polynomial'
import { gcd, Rational } from './rational'
import { simplifySqrt } from './sqrt'
import type { QuadraticEquation, SolvingMethod } from './solvingMethod'
import type { Step } from './step'

const latex = (r: Rational) => new Polynomial([r]).toLatex()

// Multiply a, b, c by the lcm of their denominators so the formula works in whole numbers.
export function wholeCoefficients({ a, b, c }: QuadraticEquation) {
  const lcm = [a.den, b.den, c.den].reduce((l, d) => (l * d) / gcd(l, d), 1)
  return { lcm, A: (a.num * lcm) / a.den, B: (b.num * lcm) / b.den, C: (c.num * lcm) / c.den }
}

// b^2 - 4ac with the numbers put in, negatives in brackets: (-4)^2 - 4(2)(-6)
const substituted = (A: number, B: number, C: number) => `${B < 0 ? `(${B})` : B}^2 - 4(${A})(${C})`

function discriminantSteps(A: number, B: number, C: number, D: number): Step[] {
  const fourAC = 4 * A * C
  const difference = fourAC < 0 ? `${B * B} + ${-fourAC}` : `${B * B} - ${fourAC}`
  const steps: Step[] = [
    {
      title: 'Find the discriminant',
      explanation: 'The discriminant is $b^2 - 4ac$. Its sign tells us how many real roots there are.',
      math: `b^2 - 4ac = ${substituted(A, B, C)} = ${difference} = ${D}`,
    },
  ]
  if (D > 0) {
    steps.push({
      title: 'Two real roots',
      explanation: `The discriminant is ${D}, which is greater than 0, so there are two different real roots.`,
      math: `b^2 - 4ac = ${D} > 0`,
    })
  } else if (D === 0) {
    steps.push({
      title: 'One real root',
      explanation: 'The discriminant is 0, so there is exactly one real root (both roots are the same number).',
      math: 'b^2 - 4ac = 0',
    })
  } else {
    steps.push({
      title: 'No real roots',
      explanation:
        `The discriminant is ${D}, which is less than 0, so there are no real roots. ` +
        'The formula would need the square root of a negative number, which is not a real number. ' +
        'On the graph, the parabola never touches the x-axis.',
      math: `b^2 - 4ac = ${D} < 0`,
    })
  }
  return steps
}

export const quadraticFormula: SolvingMethod = {
  id: 'quadratic-formula',
  name: 'Quadratic Formula',

  applies: () => ({ ok: true }),

  solve(eq) {
    const steps: Step[] = [
      {
        title: 'Identify a, b and c',
        explanation: 'Compare the equation with the standard form $ax^2 + bx + c = 0$.',
        math: `a = ${latex(eq.a)}, \\quad b = ${latex(eq.b)}, \\quad c = ${latex(eq.c)}`,
      },
    ]
    const { lcm, A, B, C } = wholeCoefficients(eq)
    if (lcm !== 1) {
      const whole = new Polynomial([C, B, A].map((n) => new Rational(n)))
      steps.push({
        title: 'Clear the fractions',
        explanation: `Multiply every term by ${lcm} so a, b and c are whole numbers. This does not change the roots. Now a = ${A}, b = ${B} and c = ${C}.`,
        math: `${whole.toLatex()} = 0`,
      })
    }
    const discriminant = B * B - 4 * A * C
    steps.push(...discriminantSteps(A, B, C, discriminant))
    if (discriminant < 0) return { steps, roots: null }
    const roots = new ExactRoot(-B, 1, discriminant, 2 * A)
    steps.push(...formulaSteps(A, B, C, discriminant, roots))
    return { steps, roots }
  },
}

function formulaSteps(A: number, B: number, C: number, D: number, roots: ExactRoot): Step[] {
  const minusB = B < 0 ? `-(${B})` : B === 0 ? '0' : `-${B}`
  const top = `${-B} \\pm \\sqrt{${D}}`
  let simplified = `x = \\frac{${top}}{${2 * A}}`
  const { coefficient: k, radicand: m } = simplifySqrt(D)
  if (D === 0) simplified += ` = \\frac{${-B}}{${2 * A}}`
  else if (m === 1) simplified += ` = \\frac{${-B} \\pm ${k}}{${2 * A}}`
  else if (k > 1) simplified += ` = \\frac{${-B} \\pm ${k}\\sqrt{${m}}}{${2 * A}}`

  const rational = roots.rationalRoots()
  let explanation: string
  if (rational?.length === 1) explanation = `There is only one root: $x = ${latex(rational[0])}$.`
  else if (rational) {
    explanation = `The square root is a whole number, so both roots are rational: $x = ${latex(rational[0])}$ or $x = ${latex(rational[1])}$.`
  } else {
    const [plus, minus] = roots.decimals().map(twoPlaces)
    explanation = `This is the exact answer. As decimals, x ≈ ${plus} or x ≈ ${minus} (rounded to 2 decimal places).`
  }

  return [
    {
      title: 'Apply the quadratic formula',
      explanation: 'Substitute a, b and c into the quadratic formula.',
      math: `x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a} = \\frac{${minusB} \\pm \\sqrt{${substituted(A, B, C)}}}{2(${A})}`,
    },
    {
      title: 'Simplify',
      explanation: 'Work out the top and bottom, and simplify the square root if you can.',
      math: simplified,
    },
    { title: 'Write the roots', explanation, math: roots.toLatex() },
  ]
}

// toFixed(2) can give "-0.00"; students should see "0.00"
export const twoPlaces = (v: number) => (Math.abs(v) < 0.005 ? 0 : v).toFixed(2)
