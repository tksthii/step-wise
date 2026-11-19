import { ExactRoot } from './exactRoot'
import { Polynomial } from './polynomial'
import { gcd, Rational } from './rational'
import type { QuadraticEquation, SolvingMethod } from './solvingMethod'
import type { Step } from './step'

const latex = (r: Rational) => new Polynomial([r]).toLatex()

// Multiply a, b, c by the lcm of their denominators so the formula works in whole numbers.
function wholeCoefficients({ a, b, c }: QuadraticEquation) {
  const lcm = [a.den, b.den, c.den].reduce((l, d) => (l * d) / gcd(l, d), 1)
  return { lcm, A: (a.num * lcm) / a.den, B: (b.num * lcm) / b.den, C: (c.num * lcm) / c.den }
}

function discriminantSteps(A: number, B: number, C: number, D: number): Step[] {
  const square = B < 0 ? `(${B})^2` : `${B}^2`
  const fourAC = 4 * A * C
  const difference = fourAC < 0 ? `${B * B} + ${-fourAC}` : `${B * B} - ${fourAC}`
  const steps: Step[] = [
    {
      title: 'Find the discriminant',
      explanation: 'The discriminant is b^2 - 4ac. Its sign tells us how many real roots there are.',
      math: `b^2 - 4ac = ${square} - 4(${A})(${C}) = ${difference} = ${D}`,
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
        explanation: 'Compare the equation with the standard form ax^2 + bx + c = 0.',
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
    const roots = discriminant < 0 ? null : new ExactRoot(-B, 1, discriminant, 2 * A)
    return { steps, roots }
  },
}
