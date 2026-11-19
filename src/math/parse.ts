import type { Token } from './tokenize'

export type Expr =
  | { type: 'number'; text: string }
  | { type: 'x' }
  | { type: 'neg'; arg: Expr }
  | { type: 'binary'; op: '+' | '-' | '*' | '/' | '^'; left: Expr; right: Expr }

export interface Equation {
  left: Expr
  right: Expr
}

// Grammar, lowest precedence first:
//   equation = sum ('=' sum)?           no '=' means "sum = 0"
//   sum      = product (('+' | '-') product)*
//   product  = unary (('*' | '/') unary)*
//   unary    = '-' unary | power
//   power    = primary ('^' unary)?     right side is unary, so 2^-1 and 2^3^2 work
//   primary  = number | 'x' | '(' sum ')'
function makeParser(tokens: Token[]) {
  let i = 0
  const peek = () => tokens[i]?.type

  function sum(): Expr {
    let left = product()
    while (peek() === '+' || peek() === '-') {
      const op = tokens[i++].type as '+' | '-'
      left = { type: 'binary', op, left, right: product() }
    }
    return left
  }

  function product(): Expr {
    let left = unary()
    while (peek() === '*' || peek() === '/') {
      const op = tokens[i++].type as '*' | '/'
      left = { type: 'binary', op, left, right: unary() }
    }
    return left
  }

  function unary(): Expr {
    if (peek() === '-') {
      i++
      return { type: 'neg', arg: unary() }
    }
    return power()
  }

  function power(): Expr {
    const base = primary()
    if (peek() !== '^') return base
    i++
    return { type: 'binary', op: '^', left: base, right: unary() }
  }

  function primary(): Expr {
    const token = tokens[i++]
    if (token?.type === 'number') return { type: 'number', text: token.text }
    if (token?.type === 'x') return { type: 'x' }
    if (token?.type === '(') {
      const inner = sum()
      if (tokens[i++]?.type !== ')') throw new Error('Expected )')
      return inner
    }
    throw new Error('Expected a number, x or (')
  }

  function end() {
    if (peek() === '=') throw new Error('Only one = sign is allowed')
    if (i < tokens.length) throw new Error('Unexpected token')
  }

  return {
    expression(): Expr {
      const expr = sum()
      end()
      return expr
    },
    equation(): Equation {
      const left = sum()
      if (peek() !== '=') {
        end()
        return { left, right: { type: 'number', text: '0' } }
      }
      i++
      const right = sum()
      end()
      return { left, right }
    },
  }
}

export function parseExpression(tokens: Token[]): Expr {
  return makeParser(tokens).expression()
}

export function parseEquation(tokens: Token[]): Equation {
  return makeParser(tokens).equation()
}
