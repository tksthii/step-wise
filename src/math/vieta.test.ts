import { describe, expect, it } from 'vitest'
import { toStandardForm } from './standardForm'
import { vieta } from './vieta'

function equation(text: string) {
  const eq = toStandardForm(text)
  if (eq.kind !== 'quadratic') throw new Error(`expected quadratic, got ${eq.kind}`)
  return eq
}

describe('vieta applies', () => {
  it('has an id and a name', () => {
    expect([vieta.id, vieta.name]).toEqual(['vieta', "Vieta's shortcut"])
  })

  it.each([
    ['2x^2 - 5x + 3', 'a + b + c = 0'],
    ['x^2 + 3x + 2', 'a - b + c = 0'],
    ['x^2 - 5x + 6', 'integer roots'],
    ['x^2 - 4x + 4', 'a repeated integer root'],
    ['2x^2 - 10x + 12', 'integer roots with a ≠ 1'],
  ])('%s (%s)', (text) => {
    expect(vieta.applies(equation(text))).toEqual({ ok: true })
  })

  it.each(['x^2 - 2x - 4', '2x^2 + x - 6', 'x^2 + 1'])('%s does not apply', (text) => {
    expect(vieta.applies(equation(text)).ok).toBe(false)
  })

  it('x^2 - 2x - 4 gives the reason', () => {
    const text = 'x^2 - 2x - 4'
    expect(vieta.applies(equation(text))).toEqual({
      ok: false,
      reason: "No quick pattern: $a + b + c \\neq 0$, $a - b + c \\neq 0$, and the roots aren't whole numbers.",
    })
  })
})

const solve = (text: string) => vieta.solve(equation(text))
const lines = (text: string) => solve(text).steps.map((s) => `${s.title}: ${s.math}`)

describe('vieta with whole-number roots', () => {
  it('x^2 - 5x + 6: two numbers with sum 5 and product 6', () => {
    const { steps } = solve('x^2 - 5x + 6')
    expect(lines('x^2 - 5x + 6')).toEqual([
      'Find two numbers: x_1 + x_2 = -\\frac{b}{a} = 5, \\quad x_1 x_2 = \\frac{c}{a} = 6',
      'Check with the sum and product: x_1 + x_2 = 2 + 3 = 5, \\quad x_1 x_2 = 2 \\cdot 3 = 6',
      'Write the roots: x = 2 \\text{ or } x = 3',
    ])
    expect(steps[0].explanation).toBe(
      'Look for two whole numbers that add to $-\\frac{b}{a} = 5$ and multiply to $\\frac{c}{a} = 6$: $2$ and $3$.',
    )
  })

  it('2x^2 - 10x + 12: divides through by a', () => {
    expect(solve('2x^2 - 10x + 12').steps.at(-1)?.math).toBe('x = 2 \\text{ or } x = 3')
  })

  it('x^2 - 4x + 4: a repeated root', () => {
    expect(lines('x^2 - 4x + 4').at(-1)).toBe('Write the roots: x = 2')
  })
})

describe('vieta when a + b + c = 0', () => {
  it('2x^2 - 5x + 3: roots 1 and c/a', () => {
    const { steps, roots } = solve('2x^2 - 5x + 3')
    expect(lines('2x^2 - 5x + 3')).toEqual([
      'Check a + b + c: a + b + c = 2 + (-5) + 3 = 0',
      'Find the other root: x_1 = 1, \\quad x_2 = \\frac{c}{a} = \\frac{3}{2}',
      'Check with the sum and product: x_1 + x_2 = 1 + \\frac{3}{2} = \\frac{5}{2}, \\quad x_1 x_2 = 1 \\cdot \\frac{3}{2} = \\frac{3}{2}',
      'Write the roots: x = 1 \\text{ or } x = \\frac{3}{2}',
    ])
    expect(steps.map((s) => s.explanation).slice(0, 3)).toEqual([
      'The coefficients add to 0, so $x = 1$ is a root: substituting $x = 1$ gives $a + b + c = 0$.',
      'The two roots multiply to $\\frac{c}{a}$. One root is $1$, so the other is $\\frac{c}{a} = \\frac{3}{2}$.',
      "Vieta's formulas say the roots add to $-\\frac{b}{a} = \\frac{5}{2}$ and multiply to $\\frac{c}{a} = \\frac{3}{2}$. Both match.",
    ])
    expect(roots?.rationalRoots()?.map(String).sort()).toEqual(['1', '3/2'])
  })

  it('x^2 + 3x + 2: a - b + c = 0, roots -1 and -c/a', () => {
    const { steps } = solve('x^2 + 3x + 2')
    expect(lines('x^2 + 3x + 2')).toEqual([
      'Check a - b + c: a - b + c = 1 - 3 + 2 = 0',
      'Find the other root: x_1 = -1, \\quad x_2 = -\\frac{c}{a} = -2',
      'Check with the sum and product: x_1 + x_2 = -1 + (-2) = -3, \\quad x_1 x_2 = (-1) \\cdot (-2) = 2',
      'Write the roots: x = -1 \\text{ or } x = -2',
    ])
    expect(steps[0].explanation).toBe(
      'This is 0, so $x = -1$ is a root: substituting $x = -1$ gives $a - b + c = 0$.',
    )
    expect(steps[1].explanation).toBe(
      'The two roots multiply to $\\frac{c}{a}$. One root is $-1$, so the other is $-\\frac{c}{a} = -2$.',
    )
  })

  it('3x^2 - x - 4: a - b + c with a negative b', () => {
    expect(solve('3x^2 - x - 4').steps[0].math).toBe('a - b + c = 3 - (-1) + (-4) = 0')
    expect(solve('3x^2 - x - 4').steps[1].math).toBe('x_1 = -1, \\quad x_2 = -\\frac{c}{a} = \\frac{4}{3}')
  })

  it('x^2 - 2x + 1: both roots are 1', () => {
    const { steps } = solve('x^2 - 2x + 1')
    expect(steps.at(-1)).toEqual({
      title: 'Write the roots',
      explanation: 'Both roots are the same, so there is only one root.',
      math: 'x = 1',
    })
  })
})
