import { parseEquation, type Equation } from './parse'
import type { Polynomial } from './polynomial'
import type { Rational } from './rational'
import type { Step } from './step'
import { tokenize } from './tokenize'
import { toPolynomial } from './toPolynomial'

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

/** Rearranges the student's equation into ax^2 + bx + c = 0, explaining each step. */
export function toStandardForm(equationText: string): StandardForm {
  const original = parseEquation(tokenize(equationText))
  const left = toPolynomial(original.left)
  const right = toPolynomial(original.right)
  const polynomial = left.subtract(right)
  const steps: Step[] = []

  if (right.degree() >= 0) {
    // brackets only when the right side has several terms or starts with a minus
    const needsBrackets = termCount(right) > 1 || right.coefficient(right.degree()).num < 0
    const moved = needsBrackets ? `(${right.toLatex()})` : right.toLatex()
    steps.push({
      title: 'Move everything to the left side',
      explanation: `Subtract ${right.toString()} from both sides, so the right side becomes 0.`,
      math: `${left.toLatex()} - ${moved} = 0`,
    })
    steps.push({
      title: 'Collect like terms',
      explanation: 'Combine the terms that have the same power of x.',
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
