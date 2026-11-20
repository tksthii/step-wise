import { describe, expect, it } from 'vitest'
import { completingSquare } from './completingSquare'
import { toStandardForm } from './standardForm'

function equation(text: string) {
  const eq = toStandardForm(text)
  if (eq.kind !== 'quadratic') throw new Error(`expected quadratic, got ${eq.kind}`)
  return eq
}

const solve = (text: string) => completingSquare.solve(equation(text))
const lines = (text: string) => solve(text).steps.map((s) => `${s.title}: ${s.math}`)

describe('completingSquare', () => {
  it('always applies, and has an id and a name', () => {
    expect(completingSquare.applies(equation('x^2 + 1'))).toEqual({ ok: true })
    expect([completingSquare.id, completingSquare.name]).toEqual(['completing-square', 'Completing the Square'])
  })

  it('x^2 + 6x + 5 = 0', () => {
    const { steps, roots } = solve('x^2 + 6x + 5 = 0')
    expect(lines('x^2 + 6x + 5 = 0')).toEqual([
      'Move the constant to the right side: x^2 + 6x = -5',
      'Complete the square: x^2 + 6x + 9 = -5 + 9',
      'Use identity 1: Square of a sum: (x + 3)^2 = 4',
      'Take the square root of both sides: x + 3 = \\pm \\sqrt{4} = \\pm 2',
      'Solve each case: x + 3 = 2 \\Rightarrow x = -1 \\text{ or } x + 3 = -2 \\Rightarrow x = -5',
      'Write the roots: x = -1 \\text{ or } x = -5',
    ])
    expect(steps.slice(0, 3).map((s) => s.explanation)).toEqual([
      'Subtract $5$ from both sides.',
      'Half of $6$ is $3$, and $3^2 = 9$. Add $9$ to both sides.',
      'The left side has the shape $a^2 + 2ab + b^2$ with $a = x$ and $b = 3$, so it equals $(a+b)^2$. On the right, $-5 + 9 = 4$.',
    ])
    expect(steps[2].identity).toBe(1)
    expect(roots?.rationalRoots()?.map(String)).toEqual(['-1', '-5'])
  })

  it('x^2 - 2x - 4 = 0: identity 2 and irrational roots', () => {
    const { steps } = solve('x^2 - 2x - 4 = 0')
    expect(lines('x^2 - 2x - 4 = 0').slice(0, 5)).toEqual([
      'Move the constant to the right side: x^2 - 2x = 4',
      'Complete the square: x^2 - 2x + 1 = 4 + 1',
      'Use identity 2: Square of a difference: (x - 1)^2 = 5',
      'Take the square root of both sides: x - 1 = \\pm \\sqrt{5}',
      'Solve each case: x - 1 = \\sqrt{5} \\Rightarrow x = 1 + \\sqrt{5} \\text{ or } x - 1 = -\\sqrt{5} \\Rightarrow x = 1 - \\sqrt{5}',
    ])
    expect(steps[0].explanation).toBe('Add $4$ to both sides.')
    expect(steps[1].explanation).toBe('Half of $-2$ is $-1$, and $(-1)^2 = 1$. Add $1$ to both sides.')
    expect(steps[2].explanation).toContain('$a^2 - 2ab + b^2$ with $a = x$ and $b = 1$, so it equals $(a-b)^2$')
    expect(steps.at(-1)?.math).toBe('x = 1 \\pm \\sqrt{5}')
  })

  it('x^2 + x - 1 = 0: exact fractions', () => {
    const { steps } = solve('x^2 + x - 1 = 0')
    expect(lines('x^2 + x - 1 = 0').slice(1, 4)).toEqual([
      'Complete the square: x^2 + x + \\frac{1}{4} = 1 + \\frac{1}{4}',
      'Use identity 1: Square of a sum: (x + \\frac{1}{2})^2 = \\frac{5}{4}',
      'Take the square root of both sides: x + \\frac{1}{2} = \\pm \\sqrt{\\frac{5}{4}} = \\pm \\frac{\\sqrt{5}}{2}',
    ])
    expect(steps[1].explanation).toBe(
      'Half of $1$ is $\\frac{1}{2}$, and $\\left(\\frac{1}{2}\\right)^2 = \\frac{1}{4}$. Add $\\frac{1}{4}$ to both sides.',
    )
    expect(steps.at(-1)?.math).toBe('x = \\frac{-1 \\pm \\sqrt{5}}{2}')
  })
})
