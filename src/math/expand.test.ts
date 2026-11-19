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
