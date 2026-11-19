import type { ExactRoot } from './exactRoot'
import type { Expr } from './parse'
import type { Rational } from './rational'
import type { Step } from './step'

/** ax^2 + bx + c = 0, plus the two sides the student originally typed. */
export interface QuadraticEquation {
  a: Rational
  b: Rational
  c: Rational
  original: { left: Expr; right: Expr }
}

export type Applicability = { ok: true } | { ok: false; reason: string }

export interface Solution {
  steps: Step[]
  /** null when there are no real roots; q = 0 inside ExactRoot means one repeated root. */
  roots: ExactRoot | null
}

export interface SolvingMethod {
  id: string
  name: string
  applies(eq: QuadraticEquation): Applicability
  solve(eq: QuadraticEquation): Solution
}
