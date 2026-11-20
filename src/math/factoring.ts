import { ExactRoot } from './exactRoot'
import { IDENTITIES, type IdentityNumber } from './identities'
import { Polynomial } from './polynomial'
import { wholeCoefficients } from './quadraticFormula'
import { gcd, Rational } from './rational'
import type { QuadraticEquation, SolvingMethod } from './solvingMethod'
import type { Step } from './step'

/** The linear factor qx - p, with q > 0 and gcd(q, p) = 1. */
interface Factor {
  q: number
  p: number
}

const signed = (n: number, suffix = '') => `${n < 0 ? '-' : '+'} ${Math.abs(n)}${suffix}`
const linear = ({ q, p }: Factor) => `${q === 1 ? '' : q}x${p === 0 ? '' : ` ${signed(-p)}`}`
const bracketed = (f: Factor) => (f.p === 0 ? linear(f) : `(${linear(f)})`)
const same = (f: Factor, g: Factor) => f.q === g.q && f.p === g.p
const product = ([f, g]: Factor[]) => (same(f, g) ? `${bracketed(f)}^2` : bracketed(f) + bracketed(g))
// the constant in front of a product: 2(...), -(...), or nothing for 1
const prefix = (k: number) => (k === 1 ? '' : k === -1 ? '-' : `${k}`)
const trinomial = (a: number, b: number, c: number) => new Polynomial([c, b, a].map((n) => new Rational(n))).toLatex()
const fraction = (r: Rational) => new Polynomial([r]).toLatex()

const discriminant = (eq: QuadraticEquation) => {
  const { A, B, C } = wholeCoefficients(eq)
  return B * B - 4 * A * C
}

// with rational roots p1/q1, p2/q2 in lowest terms, a primitive ax^2 + bx + c (a > 0) is exactly (q1x - p1)(q2x - p2)
function factorsFromRoots(a: number, b: number, c: number): [Factor, Factor] {
  const s = Math.sqrt(b * b - 4 * a * c)
  const factor = (top: number): Factor => {
    const r = new Rational(top, 2 * a)
    return { q: r.den, p: r.num }
  }
  return [factor(-b + s), factor(-b - s)]
}

// k = the common factor taken out (negative when a < 0); c = 0 means x itself is part of it
function commonFactorStep(A: number, B: number, C: number, k: number): Step {
  const withX = C === 0
  const divisor = `${Math.abs(k) === 1 ? '' : Math.abs(k)}${withX ? 'x' : ''}`
  const out = `${k === -1 && !withX ? '-1' : prefix(k)}${withX ? 'x' : ''}`
  const explanation =
    divisor === ''
      ? 'The $x^2$ term is negative, so factor out $-1$ to make it positive.'
      : `Every term is divisible by $${divisor}$${k < 0 ? ' and the $x^2$ term is negative' : ''}, so factor out $${out}$.`
  const inside = withX ? linear({ q: A / k, p: -B / k || 0 }) : trinomial(A / k, B / k, C / k)
  return {
    title: 'Take out the common factor',
    explanation,
    math: `${trinomial(A, B, C)} = ${prefix(k)}${withX ? 'x' : ''}(${inside})`,
  }
}

function zeroProductSteps(k: number, factors: [Factor, Factor]): Step[] {
  const repeated = same(...factors)
  const each = repeated ? [factors[0]] : factors
  const roots = each.map(({ q, p }) => `x = ${fraction(new Rational(p, q))}`)
  const constant = k === 1 ? 'Set each factor equal to 0.' : `$${k}$ can't be 0, so set each factor with $x$ equal to 0.`
  return [
    {
      title: 'Use the zero product property',
      explanation: `If a product is 0, at least one of the factors must be 0. ${constant}`,
      math: `${prefix(k)}${product(factors)} = 0 \\Rightarrow ${each.map((f) => `${linear(f)} = 0`).join(' \\text{ or } ')}`,
    },
    {
      title: 'Write the roots',
      explanation: repeated ? 'Both factors are the same, so there is only one root.' : 'Solve each equation for $x$.',
      math: roots.join(' \\text{ or } '),
    },
  ]
}

function identityStep(number: IdentityNumber, why: string, f: Factor, expression: string, factored: string): Step {
  const { name, latex } = IDENTITIES[number - 1]
  return {
    title: `Use identity ${number}: ${name}`,
    explanation: `${why}, so use $${latex}$ with $a = ${linear({ q: f.q, p: 0 })}$ and $b = ${Math.abs(f.p)}$.`,
    math: `${expression} = ${factored}`,
    identity: number,
  }
}

const xTerm = (n: number) => `${n === 1 ? '' : n === -1 ? '-' : n}x`
const signedX = (n: number) => `${n < 0 ? '-' : '+'} ${xTerm(Math.abs(n))}`

// (q1x - p1)(q2x - p2) splits bx into mx + nx with m = -q1p2, n = -q2p1, so the groups are
// q1x(q2x - p2) and -p1(q2x - p2)
function decompositionSteps(a: number, b: number, c: number, [f1, f2]: [Factor, Factor]): Step[] {
  const m = -f1.q * f2.p
  const n = -f2.q * f1.p
  const split = `${xTerm(a)}^2 ${signedX(m)} ${signedX(n)} ${signed(c)}`
  const common = bracketed(f2)
  const grouped = `${xTerm(f1.q)}${common} ${signed(-f1.p)}${common}`
  return [
    {
      title: 'Decompose the middle term',
      explanation:
        `Find two numbers that multiply to $ac = (${a})(${c}) = ${a * c}$ and add to $b = ${b}$: $${m}$ and $${n}$. ` +
        `Split $${xTerm(b)}$ into $${xTerm(m)} ${signedX(n)}$.`,
      math: `${trinomial(a, b, c)} = ${split}`,
    },
    {
      title: 'Group and factor',
      explanation:
        "Group the first two terms and the last two terms, and take out each group's common factor. " +
        `Both groups share $${common}$, so factor it out.`,
      math: `${split} = ${grouped} = ${product([f1, f2])}`,
    },
  ]
}

function trinomialSteps(a: number, b: number, c: number, factors: [Factor, Factor]): Step[] {
  const expression = trinomial(a, b, c)
  // equal roots: (qx - p)^2; roots ±p/q: (qx - p)(qx + p)
  if (same(...factors)) {
    const sign = b < 0 ? '-' : ''
    const why = `The first and last terms are perfect squares and the middle term is $${sign}2ab$`
    return [identityStep(b < 0 ? 2 : 1, why, factors[0], expression, product(factors))]
  }
  if (b === 0) {
    const why = 'Both terms are perfect squares with a minus between them'
    return [identityStep(3, why, factors[0], expression, product(factors))]
  }
  if (a !== 1) return decompositionSteps(a, b, c, factors)
  const [m, n] = factors.map((f) => -f.p)
  return [
    {
      title: 'Factor the simple trinomial',
      explanation: `Find two numbers that multiply to $c = ${c}$ and add to $b = ${b}$: $${m}$ and $${n}$.`,
      math: `${trinomial(a, b, c)} = ${product(factors)}`,
    },
  ]
}

export const factoring: SolvingMethod = {
  id: 'factoring',
  name: 'Factoring',

  // only rational roots give factors with whole-number coefficients
  applies(eq) {
    const D = discriminant(eq)
    if (D < 0) return { ok: false, reason: `The discriminant (${D}) is negative, so there are no real roots to factor.` }
    if (!Number.isInteger(Math.sqrt(D))) {
      return { ok: false, reason: `The discriminant (${D}) isn't a perfect square, so this doesn't factor nicely.` }
    }
    return { ok: true }
  },

  solve(eq) {
    const applicable = factoring.applies(eq)
    if (!applicable.ok) throw new Error(applicable.reason)
    const { A, B, C } = wholeCoefficients(eq)
    const steps: Step[] = []
    // common factor first, negative when a < 0 so the x^2 term inside is positive
    const g = C === 0 ? gcd(A, B) : gcd(gcd(A, B), C)
    const k = A < 0 ? -g : g
    const [a, b, c] = [A, B, C].map((n) => n / k || 0) // `|| 0` avoids -0
    let factors: [Factor, Factor]
    if (c === 0) {
      factors = [{ q: 1, p: 0 }, { q: a, p: -b || 0 }]
      steps.push(commonFactorStep(A, B, C, k))
    } else {
      if (k !== 1) steps.push(commonFactorStep(A, B, C, k))
      factors = factorsFromRoots(a, b, c)
      steps.push(...trinomialSteps(a, b, c, factors))
    }
    steps.push(...zeroProductSteps(k, factors))
    return { steps, roots: new ExactRoot(-B, 1, B * B - 4 * A * C, 2 * A) }
  },
}
