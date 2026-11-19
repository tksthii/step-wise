import { describe, expect, it } from 'vitest'
import { parseEquation, parseExpression, type Expr } from './parse'
import { tokenize } from './tokenize'

// Fully parenthesized form makes the tree shape readable in assertions.
function show(e: Expr): string {
  switch (e.type) {
    case 'number':
      return e.text
    case 'x':
      return 'x'
    case 'neg':
      return `(-${show(e.arg)})`
    case 'binary':
      return `(${show(e.left)}${e.op}${show(e.right)})`
  }
}

const parse = (s: string) => show(parseExpression(tokenize(s)))

describe('parseExpression precedence', () => {
  it('parses a single number or x', () => {
    expect(parse('4.5')).toBe('4.5')
    expect(parse('x')).toBe('x')
  })

  it('* and / bind tighter than + and -', () => {
    expect(parse('1+2*x')).toBe('(1+(2*x))')
    expect(parse('1-x/2')).toBe('(1-(x/2))')
  })

  it('+ - and * / are left-associative', () => {
    expect(parse('1-2-3')).toBe('((1-2)-3)')
    expect(parse('8/4/2')).toBe('((8/4)/2)')
  })

  it('^ binds tighter than *', () => {
    expect(parse('3*x^2')).toBe('(3*(x^2))')
  })

  it('^ is right-associative', () => {
    expect(parse('2^3^2')).toBe('(2^(3^2))')
  })

  it('unary minus is below ^ but above *', () => {
    expect(parse('-x^2')).toBe('(-(x^2))')
    expect(parse('-2*x')).toBe('((-2)*x)')
    expect(parse('1--x')).toBe('(1-(-x))')
  })

  it('allows a negative exponent', () => {
    expect(parse('x^-1')).toBe('(x^(-1))')
  })

  it('parentheses override precedence', () => {
    expect(parse('(1+x)*2')).toBe('((1+x)*2)')
    expect(parse('(-x)^2')).toBe('((-x)^2)')
  })
})

describe('parseExpression rejects malformed input', () => {
  it('throws on leftover, missing or unbalanced tokens', () => {
    expect(() => parse('1)')).toThrow()
    expect(() => parse('(1')).toThrow()
    expect(() => parse('1+')).toThrow()
    expect(() => parse('')).toThrow()
  })
})

describe('parseEquation', () => {
  const eq = (s: string) => {
    const { left, right } = parseEquation(tokenize(s))
    return `${show(left)} = ${show(right)}`
  }

  it('splits on = into left and right sides', () => {
    expect(eq('x^2 = 3x + 4')).toBe('(x^2) = ((3*x)+4)')
  })

  it('treats input without = as "= 0"', () => {
    expect(eq('x^2 - 1')).toBe('((x^2)-1) = 0')
  })

  it('rejects more than one =', () => {
    expect(() => eq('x = 1 = 2')).toThrow('Only one = sign is allowed')
  })
})

describe('parseEquation friendly errors', () => {
  const cases: [string, string][] = [
    ['', 'Type an equation to solve'],
    ['(x+1', 'Missing closing parenthesis'],
    ['(x+1 = 2', 'Missing closing parenthesis'],
    ['x+1)', 'There is a ) without a matching ('],
    ['()', 'The parentheses () are empty'],
    ['x^2 + (', 'Something is missing after ('],
    ['x^2 =', 'Nothing after ='],
    ['= 5', 'Nothing before ='],
    ['x + = 2', 'Something is missing after +'],
    ['x +', 'Something is missing after +'],
    ['x * * 2', 'Something is missing after *'],
    ['*x', 'Something is missing before *'],
    ['2 3', 'Missing an operator between 2 and 3'],
    ['x2', 'Missing an operator between x and 2'],
  ]

  it.each(cases)('%j -> %s', (input, message) => {
    expect(() => parseEquation(tokenize(input))).toThrow(message)
  })

  it('never uses programmer words like "token" in messages', () => {
    for (const [input] of cases) {
      try {
        parseEquation(tokenize(input))
      } catch (e) {
        expect((e as Error).message).not.toMatch(/token|expected|unexpected/i)
      }
    }
  })
})
