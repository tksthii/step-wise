import { ExactRoot } from './exactRoot'
import { exprToLatex } from './format'
import type { Expr } from './parse'
import { Polynomial } from './polynomial'
import { twoPlaces, wholeCoefficients } from './quadraticFormula'
import { Rational } from './rational'
import type { QuadraticEquation, Solution, SolvingMethod } from './solvingMethod'
import { simplifySqrt } from './sqrt'
import type { Step } from './step'
import { toPolynomial } from './toPolynomial'

/** k(inner)^2 = q, where inner is linear (x, x + p, 2x - 1, ...). */
interface SquareForm {
  k: Rational
  inner: Polynomial
  q: Rational
  /** The side with the square, as the student typed it. */
  side: Expr
}

const ZERO = new Rational(0)
const ONE = new Rational(1)
const X = new Polynomial([ZERO, ONE])
const fraction = (r: Rational) => new Polynomial([r]).toLatex()

// k(inner)^2, -(inner)^2 or (inner)^2 with a linear inner
function matchSquare(e: Expr): { k: Rational; inner: Polynomial } | null {
  if (e.type === 'neg') {
    const m = matchSquare(e.arg)
    return m && { k: ZERO.subtract(m.k), inner: m.inner }
  }
  if (e.type !== 'binary') return null
  if (e.op === '^' && e.right.type === 'number' && e.right.text === '2') {
    const inner = toPolynomial(e.left)
    return inner.degree() === 1 ? { k: ONE, inner } : null
  }
  if (e.op === '*') {
    const k = toPolynomial(e.left)
    const m = matchSquare(e.right)
    if (m && k.degree() === 0) return { k: k.coefficient(0).multiply(m.k), inner: m.inner }
  }
  return null
}

// the square on one side as the student typed it, a constant on the other
function squareForm({ original }: QuadraticEquation): SquareForm | null {
  for (const [side, other] of [[original.left, original.right], [original.right, original.left]]) {
    const m = matchSquare(side)
    const q = toPolynomial(other)
    if (m && q.degree() <= 0) return { ...m, q: q.coefficient(0), side }
  }
  return null
}

// ax^2 + c = 0 -> x^2 = -c/a
function isolateFromStandardForm(a: Rational, c: Rational, s: Rational): Step {
  const moves: string[] = []
  let math = `${new Polynomial([c, ZERO, a]).toLatex()} = 0`
  if (c.num !== 0) {
    moves.push(c.num < 0 ? `add $${fraction(ZERO.subtract(c))}$ to both sides` : `subtract $${fraction(c)}$ from both sides`)
    math += ` \\Rightarrow ${new Polynomial([ZERO, ZERO, a]).toLatex()} = ${fraction(ZERO.subtract(c))}`
  }
  if (!a.equals(ONE)) {
    moves.push(`divide both sides by $${fraction(a)}$`)
    math += ` \\Rightarrow x^2 = ${fraction(s)}`
  }
  const explanation = moves.join(', then ')
  return { title: 'Isolate the square', explanation: `${explanation[0].toUpperCase()}${explanation.slice(1)}.`, math }
}

/** √s = R√rad with R rational and rad square-free: √(9/4) = 3/2, √8 = 2√2, √(1/2) = (1/2)√2. */
function squareRootOf(s: Rational): { R: Rational; rad: number } {
  const { coefficient, radicand } = simplifySqrt(s.num * s.den)
  return { R: new Rational(coefficient, s.den), rad: radicand }
}

const radical = (R: Rational, rad: number) =>
  rad === 1 ? fraction(R) : `${R.equals(ONE) ? '' : fraction(R)}\\sqrt{${rad}}`

// mx + r = ±R√rad  ->  x = (±R√rad - r) / m
function casesStep(inner: Polynomial, R: Rational, rad: number): Step {
  const lhs = inner.toLatex()
  const m = inner.coefficient(1)
  const p = ZERO.subtract(inner.coefficient(0)).divide(m)
  const t = R.divide(m)
  const solved = (sign: 1 | -1) => {
    if (rad === 1) return fraction(p.add(t.multiply(new Rational(sign))))
    const coef = t.multiply(new Rational(sign))
    const abs = new Rational(Math.abs(coef.num), coef.den)
    const term = radical(abs, rad)
    if (p.num === 0) return `${coef.num < 0 ? '-' : ''}${term}`
    return `${fraction(p)} ${coef.num < 0 ? '-' : '+'} ${term}`
  }
  const value = radical(R, rad)
  const cases = R.num === 0 ? [{ v: '0', sign: 1 as const }] : [{ v: value, sign: 1 as const }, { v: `-${value}`, sign: -1 as const }]
  return {
    title: 'Solve each case',
    explanation:
      cases.length === 1
        ? `Solve $${lhs} = 0$.`
        : `Solve $${lhs} = ${cases[0].v}$ and $${lhs} = ${cases[1].v}$ separately.`,
    math: cases.map(({ v, sign }) => `${lhs} = ${v} \\Rightarrow x = ${solved(sign)}`).join(' \\text{ or } '),
  }
}

function rootsStep(eq: QuadraticEquation, s: Rational, rad: number): { step: Step; roots: ExactRoot } {
  const { A, B, C } = wholeCoefficients(eq)
  const roots = new ExactRoot(-B, 1, B * B - 4 * A * C, 2 * A)
  let explanation = 'There is one root for each sign.'
  if (s.num === 0) explanation = 'The square is 0, so there is only one root.'
  else if (rad !== 1) {
    const [plus, minus] = roots.decimals().map(twoPlaces)
    explanation = `This is the exact answer. As decimals, x ≈ ${plus} or x ≈ ${minus} (rounded to 2 decimal places).`
  }
  return { step: { title: 'Write the roots', explanation, math: roots.toLatex() }, roots }
}

export const squareRoot: SolvingMethod = {
  id: 'square-root',
  name: 'Square Root',

  applies(eq) {
    if (eq.b.num === 0 || squareForm(eq)) return { ok: true }
    return { ok: false, reason: 'This method needs the equation in the form $(x + p)^2 = q$ or with $b = 0$.' }
  },

  solve(eq) {
    const applicable = squareRoot.applies(eq)
    if (!applicable.ok) throw new Error(applicable.reason)
    const steps: Step[] = []
    // prefer the square exactly as the student typed it; otherwise b = 0 gives x^2 = -c/a
    const form = squareForm(eq)
    const inner = form ? form.inner : X
    const s = form ? form.q.divide(form.k) : ZERO.subtract(eq.c).divide(eq.a)
    const square = squareOf(inner)
    if (form && !form.k.equals(ONE)) {
      steps.push({
        title: 'Isolate the square',
        explanation: `Divide both sides by $${fraction(form.k)}$.`,
        math: `${exprToLatex(form.side)} = ${fraction(form.q)} \\Rightarrow ${square} = ${fraction(s)}`,
      })
    } else if (!form && (eq.c.num !== 0 || !eq.a.equals(ONE))) {
      steps.push(isolateFromStandardForm(eq.a, eq.c, s))
    }
    const rest = solveSquare(eq, inner, s)
    return { steps: [...steps, ...rest.steps], roots: rest.roots }
  },
}

/** "x^2" for the plain square, "(x + 3)^2" otherwise. */
export function squareOf(inner: Polynomial): string {
  const plain = inner.degree() === 1 && inner.coefficient(0).num === 0 && inner.coefficient(1).equals(ONE)
  return plain ? 'x^2' : `(${inner.toLatex()})^2`
}

/** Finishes (inner)^2 = s: no real roots if s < 0, otherwise ± square root, each case, and the roots of eq. */
export function solveSquare(eq: QuadraticEquation, inner: Polynomial, s: Rational): Solution {
  const lhs = inner.toLatex()
  const square = squareOf(inner)
  if (s.num < 0) {
    const step = {
      title: 'No real roots',
      explanation: "A square can't be negative, so there are no real roots.",
      math: `${square} = ${fraction(s)}`,
    }
    return { steps: [step], roots: null }
  }

  const steps: Step[] = []
  const { R, rad } = squareRootOf(s)
  let math = `${lhs} = \\pm \\sqrt{${fraction(s)}}`
  const simplified = radical(R, rad)
  if (s.num === 0) math = `${lhs} = 0`
  else if (simplified !== `\\sqrt{${fraction(s)}}`) math += ` = \\pm ${simplified}`
  steps.push({
    title: 'Take the square root of both sides',
    explanation:
      'A positive number and its opposite have the same square, so take both the positive and the negative square root.',
    math,
  })

  if (square !== 'x^2') steps.push(casesStep(inner, R, rad))

  const { step, roots } = rootsStep(eq, s, rad)
  steps.push(step)
  return { steps, roots }
}
