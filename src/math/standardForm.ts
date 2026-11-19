import { expand } from './expand'
import { exprToLatex, exprToText } from './format'
import { parseEquation, type Equation, type Expr } from './parse'
import type { Polynomial } from './polynomial'
import type { Rational } from './rational'
import type { Step } from './step'
import { tokenize } from './tokenize'

interface Common {
  steps: Step[]
  original: Equation
  /** Everything moved to the left: this polynomial = 0. */
  polynomial: Polynomial
}

export type StandardForm = Common & { kind: 'quadratic'; a: Rational; b: Rational; c: Rational }

function termCount(p: Polynomial): number {
  let count = 0
  for (let k = 0; k <= p.degree(); k++) if (p.coefficient(k).num !== 0) count++
  return count
}

// Identity steps for one side, then a general expand step if that still changes what the student sees.
function expandSide(expr: Expr, side: 'left' | 'right', steps: Step[]): Polynomial {
  const { polynomial, steps: identitySteps } = expand(expr)
  steps.push(...identitySteps)
  const math = `${exprToLatex(expr)} = ${polynomial.toLatex()}`
  const alreadyShown = identitySteps.at(-1)?.math === math
  if (exprToText(expr) !== polynomial.toString() && !alreadyShown) {
    steps.push({
      title: `Expand and simplify the ${side} side`,
      explanation: 'Multiply out any brackets, then combine the terms that have the same power of x.',
      math,
    })
  }
  return polynomial
}

/** Rearranges the student's equation into ax^2 + bx + c = 0, explaining each step. */
export function toStandardForm(equationText: string): StandardForm {
  const original = parseEquation(tokenize(equationText))
  const steps: Step[] = []
  const left = expandSide(original.left, 'left', steps)
  const right = expandSide(original.right, 'right', steps)
  const polynomial = left.subtract(right)

  if (right.degree() >= 0) {
    // brackets only when the right side has several terms or starts with a minus
    const needsBrackets = termCount(right) > 1 || right.coefficient(right.degree()).num < 0
    const moved = needsBrackets ? `(${right.toLatex()})` : right.toLatex()
    const movedMath = `${left.toLatex()} - ${moved} = 0`
    steps.push({
      title: 'Move everything to the left side',
      explanation: `Subtract ${right.toString()} from both sides, so the right side becomes 0.`,
      math: movedMath,
    })
    const collected = `${polynomial.toLatex()} = 0`
    if (collected !== movedMath) {
      steps.push({
        title: 'Collect like terms',
        explanation: 'Combine the terms that have the same power of x.',
        math: collected,
      })
    }
  }

  if (right.degree() < 0 && steps.length > 0) {
    steps.push({
      title: 'Write in standard form',
      explanation: 'The right side is 0, so the equation is now in the form ax^2 + bx + c = 0.',
      math: `${polynomial.toLatex()} = 0`,
    })
  }

  if (steps.length === 0) {
    steps.push({
      title: 'Already in standard form',
      explanation: 'The right side is already 0 and the like terms are already collected.',
      math: `${polynomial.toLatex()} = 0`,
    })
  }

  if (polynomial.degree() !== 2) {
    // shortcut: linear, constant and higher-degree equations are classified in the next commits
    throw new Error('Only quadratic equations are handled so far')
  }
  return {
    kind: 'quadratic',
    steps,
    original,
    polynomial,
    a: polynomial.coefficient(2),
    b: polynomial.coefficient(1),
    c: polynomial.coefficient(0),
  }
}
