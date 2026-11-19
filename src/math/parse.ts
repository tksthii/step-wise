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
const text = (t: Token) => (t.type === 'number' ? t.text : t.type)

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
    const token = tokens[i]
    if (token?.type === 'number') {
      i++
      return { type: 'number', text: token.text }
    }
    if (token?.type === 'x') {
      i++
      return { type: 'x' }
    }
    if (token?.type === '(') {
      i++
      const inner = sum()
      if (peek() === ')') {
        i++
        return inner
      }
      if (peek() === undefined || peek() === '=') throw new Error('Missing closing parenthesis')
      throw strayAfterValue()
    }
    throw missingValue()
  }

  // A number, x or ( was needed at position i; explain what the student left out.
  function missingValue(): Error {
    const token = tokens[i]
    const prev = tokens[i - 1]
    if (!token) {
      if (!prev) return new Error('Type an equation to solve')
      if (prev.type === '=') return new Error('Nothing after =')
      return new Error(`Something is missing after ${prev.type}`)
    }
    if (token.type === '=' && !prev) return new Error('Nothing before =')
    if (token.type === ')') {
      if (prev?.type === '(') return new Error('The parentheses () are empty')
      if (!prev) return new Error('There is a ) without a matching (')
    }
    if (!prev || prev.type === '(' || prev.type === '=') {
      return new Error(`Something is missing before ${token.type}`)
    }
    return new Error(`Something is missing after ${prev.type}`)
  }

  // A complete value was followed by something that cannot come next.
  function strayAfterValue(): Error {
    const token = tokens[i]
    const prev = tokens[i - 1]
    if (token.type === ')') return new Error('There is a ) without a matching (')
    return new Error(`Missing an operator between ${text(prev)} and ${text(token)}`)
  }

  function end(equalsMessage: string) {
    if (i === tokens.length) return
    if (peek() === '=') throw new Error(equalsMessage)
    throw strayAfterValue()
  }

  return {
    expression(): Expr {
      const expr = sum()
      end('An = sign is not allowed here')
      return expr
    },
    equation(): Equation {
      const left = sum()
      if (peek() !== '=') {
        end('Only one = sign is allowed')
        return { left, right: { type: 'number', text: '0' } }
      }
      i++
      const right = sum()
      end('Only one = sign is allowed')
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
