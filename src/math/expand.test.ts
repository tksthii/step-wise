import { describe, expect, it } from 'vitest'
import { expand } from './expand'
import { parseExpression } from './parse'
import { tokenize } from './tokenize'

const run = (s: string) => expand(parseExpression(tokenize(s)))

describe('expand', () => {
  it('returns the expanded polynomial', () => {
    expect(run('3x(x-2)').polynomial.toString()).toBe('3x^2 - 6x')
  })

  it('records no identity steps when none is used', () => {
    expect(run('3x(x-2) + 5').steps).toEqual([])
  })

  it('identity 1: (A+B)^2', () => {
    const { polynomial, steps } = run('(x+1)^2')
    expect(polynomial.toString()).toBe('x^2 + 2x + 1')
    expect(steps).toHaveLength(1)
    expect(steps[0].identity).toBe(1)
    expect(steps[0].math).toBe('(x + 1)^2 = x^2 + 2x + 1')
    expect(steps[0].title).toBe('Use identity 1: Square of a sum')
    expect(steps[0].explanation).toContain('a = x and b = 1')
  })
})

describe('expand identity 2', () => {
  it('(A-B)^2', () => {
    const { polynomial, steps } = run('(2x-3)^2')
    expect(polynomial.toString()).toBe('4x^2 - 12x + 9')
    expect(steps.map((s) => s.identity)).toEqual([2])
    expect(steps[0].explanation).toContain('a = 2x and b = 3')
  })
})

describe('expand identity 3', () => {
  it('(A-B)(A+B) in either order', () => {
    const { polynomial, steps } = run('(x-3)(x+3)')
    expect(polynomial.toString()).toBe('x^2 - 9')
    expect(steps.map((s) => s.identity)).toEqual([3])
    expect(steps[0].explanation).toContain('a = x and b = 3')
    expect(run('(2x+1)(2x-1)').steps.map((s) => s.identity)).toEqual([3])
  })

  it('does not cite it when the terms differ', () => {
    expect(run('(x-3)(x+2)').steps).toEqual([])
  })
})

describe('expand identity 4', () => {
  it('(A+B)^3, as in (x+1)^3 - x^3', () => {
    const { polynomial, steps } = run('(x+1)^3 - x^3')
    expect(polynomial.toString()).toBe('3x^2 + 3x + 1')
    expect(steps.map((s) => s.identity)).toEqual([4])
    expect(steps[0].math).toBe('(x + 1)^3 = x^3 + 3x^2 + 3x + 1')
  })
})

describe('expand identity 5', () => {
  it('(A-B)^3', () => {
    const { polynomial, steps } = run('(x-2)^3')
    expect(polynomial.toString()).toBe('x^3 - 6x^2 + 12x - 8')
    expect(steps.map((s) => s.identity)).toEqual([5])
  })
})

describe('expand identities 6 and 7', () => {
  it('6: (A+B)(A^2 - AB + B^2) = A^3 + B^3', () => {
    const { polynomial, steps } = run('(x+2)(x^2 - 2x + 4)')
    expect(polynomial.toString()).toBe('x^3 + 8')
    expect(steps.map((s) => s.identity)).toEqual([6])
    expect(steps[0].explanation).toContain('a = x and b = 2')
  })

  it('7: (A-B)(A^2 + AB + B^2) = A^3 - B^3, either order', () => {
    const { polynomial, steps } = run('(x^2 + x + 1)(x-1)')
    expect(polynomial.toString()).toBe('x^3 - 1')
    expect(steps.map((s) => s.identity)).toEqual([7])
  })

  it('does not cite 6 or 7 when the second factor is wrong', () => {
    expect(run('(x+2)(x^2 + 2x + 4)').steps).toEqual([])
  })
})

describe('expand explanations read in the expanding direction', () => {
  it.each([
    ['(x-2)(x+2)', 'This has the shape (a-b)(a+b)', '(a-b)(a+b) = a^2-b^2'],
    ['(x+2)(x^2 - 2x + 4)', 'This has the shape (a+b)(a^2 - ab + b^2)', '(a+b)(a^2 - ab + b^2) = a^3+b^3'],
    ['(x+1)^2', 'This has the shape (a+b)^2', '(a+b)^2 = a^2 + 2ab + b^2'],
  ])('%s', (input, shape, formula) => {
    const { explanation } = run(input).steps[0]
    expect(explanation).toContain(shape)
    expect(explanation).toContain(`Expand it with ${formula}.`)
  })
})
