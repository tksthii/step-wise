import { exprToLatex, exprToText } from './format'
import { IDENTITIES, type IdentityNumber } from './identities'
import type { Expr } from './parse'
import type { Polynomial } from './polynomial'
import type { Step } from './step'
import { toPolynomial } from './toPolynomial'

export interface Expansion {
  polynomial: Polynomial
  /** One step per memorable identity used, innermost first. */
  steps: Step[]
}

interface IdentityMatch {
  identity: IdentityNumber
  a: Expr
  b: Expr
}

// (a+b)^2, (a-b)^2, ... keyed by the inner sign and the exponent
const POWER_IDENTITIES: Record<string, IdentityNumber> = { '+2': 1, '-2': 2 }

function matchIdentity(e: Extract<Expr, { type: 'binary' }>): IdentityMatch | null {
  const { op, left, right } = e
  if (op === '^' && right.type === 'number' && left.type === 'binary') {
    const identity = POWER_IDENTITIES[left.op + right.text]
    if (identity) return { identity, a: left.left, b: left.right }
  }
  return null
}

export function expand(expr: Expr): Expansion {
  const steps: Step[] = []
  const polynomial = toPolynomial(expr, (node, result) => {
    const match = matchIdentity(node)
    if (!match) return
    const { number, name, latex } = IDENTITIES[match.identity - 1]
    steps.push({
      title: `Use identity ${number}: ${name}`,
      explanation:
        `This has the shape ${latex.split('=')[0].trim()} with a = ${exprToText(match.a)} and b = ${exprToText(match.b)}. ` +
        `Expand it with ${latex}.`,
      math: `${exprToLatex(node)} = ${result.toLatex()}`,
      identity: number,
    })
  })
  return { polynomial, steps }
}
