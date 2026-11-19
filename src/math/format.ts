import type { Expr } from './parse'

type Mode = 'latex' | 'text'

// Binding strength, matching the parser: higher binds tighter.
function precedence(e: Expr): number {
  if (e.type === 'number' || e.type === 'x') return 5
  if (e.type === 'neg') return 3
  if (e.op === '^') return 4
  if (e.op === '*' || e.op === '/') return 2
  return 1
}

function format(e: Expr, mode: Mode): string {
  const wrap = (inner: Expr, needsParens: boolean) => {
    const s = format(inner, mode)
    return needsParens ? `(${s})` : s
  }

  switch (e.type) {
    case 'number':
      return e.text
    case 'x':
      return 'x'
    case 'neg':
      return `-${wrap(e.arg, precedence(e.arg) <= 3)}`
  }

  const { op, left, right } = e
  switch (op) {
    case '+':
    case '-': {
      const r = wrap(right, right.type === 'neg' || (op === '-' && precedence(right) <= 1))
      return `${format(left, mode)} ${op} ${r}`
    }
    case '*': {
      const l = wrap(left, precedence(left) < 2)
      const r = wrap(right, precedence(right) <= 2 || right.type === 'neg')
      // 2x and 3(x - 2) read naturally; anything else gets an explicit sign so x·x is not "xx"
      const juxtapose = r.startsWith('(') || (r.startsWith('x') && left.type === 'number')
      if (juxtapose) return l + r
      return mode === 'latex' ? `${l} \\cdot ${r}` : `${l}*${r}`
    }
    case '/':
      if (mode === 'latex') return `\\frac{${format(left, mode)}}{${format(right, mode)}}`
      return `${wrap(left, precedence(left) < 2)}/${wrap(right, precedence(right) <= 2)}`
    case '^': {
      const base = wrap(left, precedence(left) <= 4)
      const exp = format(right, mode)
      if (mode === 'latex') return exp.length === 1 ? `${base}^${exp}` : `${base}^{${exp}}`
      return `${base}^${wrap(right, precedence(right) < 5)}`
    }
  }
}

export const exprToLatex = (e: Expr) => format(e, 'latex')
export const exprToText = (e: Expr) => format(e, 'text')
