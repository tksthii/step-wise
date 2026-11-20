import { describe, expect, it } from 'vitest'
import { factoring } from './factoring'
import { toStandardForm } from './standardForm'

function equation(text: string) {
  const eq = toStandardForm(text)
  if (eq.kind !== 'quadratic') throw new Error(`expected quadratic, got ${eq.kind}`)
  return eq
}

describe('factoring applies', () => {
  it.each(['x^2 - 16', 'x^2 - 6x + 9', 'x^2 + 5x + 6', '2x^2 - 4x - 6', '6x^2 + x - 2', '-x^2 + 4'])(
    '%s has rational roots',
    (text) => {
      expect(factoring.applies(equation(text))).toEqual({ ok: true })
    },
  )

  it('x^2 - 2x - 4: discriminant 20 is not a perfect square', () => {
    expect(factoring.applies(equation('x^2 - 2x - 4'))).toEqual({
      ok: false,
      reason: "The discriminant (20) isn't a perfect square, so this doesn't factor nicely.",
    })
  })

  it('x^2/2 - x/3 = 1: after clearing fractions (3x^2 - 2x - 6) the discriminant is 76', () => {
    expect(factoring.applies(equation('x^2/2 - x/3 = 1'))).toEqual({
      ok: false,
      reason: "The discriminant (76) isn't a perfect square, so this doesn't factor nicely.",
    })
  })

  it('x^2 + 1: negative discriminant', () => {
    expect(factoring.applies(equation('x^2 + 1'))).toEqual({
      ok: false,
      reason: 'The discriminant (-4) is negative, so there are no real roots to factor.',
    })
  })

  it('has an id and a name', () => {
    expect([factoring.id, factoring.name]).toEqual(['factoring', 'Factoring'])
  })
})

const solve = (text: string) => factoring.solve(equation(text))
const lines = (text: string) => solve(text).steps.map((s) => `${s.title}: ${s.math}`)

describe('factoring a simple trinomial', () => {
  it('x^2 + 5x + 6 = 0 -> (x + 2)(x + 3) = 0', () => {
    expect(lines('x^2 + 5x + 6 = 0')).toEqual([
      'Factor the simple trinomial: x^2 + 5x + 6 = (x + 2)(x + 3)',
      'Use the zero product property: (x + 2)(x + 3) = 0 \\Rightarrow x + 2 = 0 \\text{ or } x + 3 = 0',
      'Write the roots: x = -2 \\text{ or } x = -3',
    ])
    expect(solve('x^2 + 5x + 6 = 0').steps[0].explanation).toBe(
      'Find two numbers that multiply to $c = 6$ and add to $b = 5$: $2$ and $3$.',
    )
  })

  it('2x^2 - 4x - 6 = 0: common factor 2 first', () => {
    const { steps } = solve('2x^2 - 4x - 6 = 0')
    expect(lines('2x^2 - 4x - 6 = 0')).toEqual([
      'Take out the common factor: 2x^2 - 4x - 6 = 2(x^2 - 2x - 3)',
      'Factor the simple trinomial: x^2 - 2x - 3 = (x - 3)(x + 1)',
      'Use the zero product property: 2(x - 3)(x + 1) = 0 \\Rightarrow x - 3 = 0 \\text{ or } x + 1 = 0',
      'Write the roots: x = 3 \\text{ or } x = -1',
    ])
    expect(steps[0].explanation).toBe('Every term is divisible by $2$, so factor out $2$.')
    expect(steps[2].explanation).toContain("$2$ can't be 0")
  })

  it('a < 0: factor out -1 first', () => {
    const { steps } = solve('-x^2 - 5x - 6 = 0')
    expect(steps[0].math).toBe('-x^2 - 5x - 6 = -(x^2 + 5x + 6)')
    expect(steps[0].explanation).toBe('The $x^2$ term is negative, so factor out $-1$ to make it positive.')
    expect(steps.at(-1)?.math).toBe('x = -2 \\text{ or } x = -3')
  })

  it('a < 0 with a common factor: factor out -2', () => {
    const { steps } = solve('-2x^2 + 2x + 12 = 0')
    expect(steps[0].math).toBe('-2x^2 + 2x + 12 = -2(x^2 - x - 6)')
    expect(steps[0].explanation).toBe(
      'Every term is divisible by $2$ and the $x^2$ term is negative, so factor out $-2$.',
    )
  })

  it('returns the exact roots', () => {
    expect(solve('x^2 + 5x + 6 = 0').roots?.rationalRoots()?.map(String)).toEqual(['-2', '-3'])
  })
})

describe('factoring when c = 0: x is a common factor', () => {
  it('x^2 - 3x = 0 -> x(x - 3) = 0', () => {
    const { steps } = solve('x^2 - 3x = 0')
    expect(lines('x^2 - 3x = 0')).toEqual([
      'Take out the common factor: x^2 - 3x = x(x - 3)',
      'Use the zero product property: x(x - 3) = 0 \\Rightarrow x = 0 \\text{ or } x - 3 = 0',
      'Write the roots: x = 0 \\text{ or } x = 3',
    ])
    expect(steps[0].explanation).toBe('Every term is divisible by $x$, so factor out $x$.')
  })

  it('2x^2 + 6x = 0 -> 2x(x + 3) = 0', () => {
    expect(solve('2x^2 + 6x = 0').steps[0].math).toBe('2x^2 + 6x = 2x(x + 3)')
    expect(solve('2x^2 + 6x = 0').steps[0].explanation).toBe('Every term is divisible by $2x$, so factor out $2x$.')
  })

  it('3x^2 = 0 has the one root x = 0', () => {
    expect(lines('3x^2 = 0').slice(1)).toEqual([
      'Use the zero product property: 3x^2 = 0 \\Rightarrow x = 0',
      'Write the roots: x = 0',
    ])
  })
})
