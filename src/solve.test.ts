import { describe, expect, it } from 'vitest'
import { solveEquation } from './solve'

describe('solveEquation', () => {
  it('quadratic: rearranging steps, formula steps and roots', () => {
    const result = solveEquation('x^2 = 3x + 4')
    if (result.kind !== 'quadratic') throw new Error(result.kind)
    expect(result.rearranging.map((s) => s.title)).toEqual(['Move everything to the left side', 'Collect like terms'])
    expect(result.formula[0].title).toBe('Identify a, b and c')
    expect(result.roots?.toLatex()).toBe('x = 4 \\text{ or } x = -1')
  })

  it('no real roots gives null roots', () => {
    const result = solveEquation('x^2 + 1 = 0')
    if (result.kind !== 'quadratic') throw new Error(result.kind)
    expect(result.roots).toBeNull()
  })

  it('parse errors become an error result with the friendly message', () => {
    expect(solveEquation('x^2 + (')).toEqual({ kind: 'error', message: 'Something is missing after (' })
  })

  it('linear keeps its steps and root', () => {
    const result = solveEquation('2x + 3 = 7')
    if (result.kind !== 'linear') throw new Error(result.kind)
    expect(result.message).toBe('This is a linear equation')
    expect(result.root.toString()).toBe('2')
    expect(result.steps.at(-1)?.math).toBe('x = 2')
  })

  it('not-quadratic keeps its message and steps', () => {
    const result = solveEquation('x^3 = 1')
    expect(result.kind).toBe('not-quadratic')
    if (result.kind === 'not-quadratic') expect(result.message).toBe('Not a quadratic')
  })
})
