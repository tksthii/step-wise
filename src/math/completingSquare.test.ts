import { describe, expect, it } from 'vitest'
import { completingSquare } from './completingSquare'
import { caseValues } from './evaluateLatex'
import { quadraticFormula } from './quadraticFormula'
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

  it('2x^2 - 4x - 6 = 0: divide by a first', () => {
    const { steps } = solve('2x^2 - 4x - 6 = 0')
    expect(lines('2x^2 - 4x - 6 = 0')).toEqual([
      'Divide by a: 2x^2 - 4x - 6 = 0 \\Rightarrow x^2 - 2x - 3 = 0',
      'Move the constant to the right side: x^2 - 2x = 3',
      'Complete the square: x^2 - 2x + 1 = 3 + 1',
      'Use identity 2: Square of a difference: (x - 1)^2 = 4',
      'Take the square root of both sides: x - 1 = \\pm \\sqrt{4} = \\pm 2',
      'Solve each case: x - 1 = 2 \\Rightarrow x = 3 \\text{ or } x - 1 = -2 \\Rightarrow x = -1',
      'Write the roots: x = 3 \\text{ or } x = -1',
    ])
    expect(steps[0].explanation).toBe('Divide every term by $2$ so the $x^2$ term has a coefficient of 1.')
  })

  it('3x^2 + 2x - 1 = 0: dividing gives fractions', () => {
    expect(solve('3x^2 + 2x - 1 = 0').steps[0].math).toBe(
      '3x^2 + 2x - 1 = 0 \\Rightarrow x^2 + \\frac{2}{3}x - \\frac{1}{3} = 0',
    )
  })

  it('x^2 + 1 = 0: b = 0 is already a square, and it is negative', () => {
    const { steps, roots } = solve('x^2 + 1 = 0')
    expect(lines('x^2 + 1 = 0')).toEqual([
      'Move the constant to the right side: x^2 = -1',
      'No real roots: x^2 = -1',
    ])
    expect(steps[1].explanation).toBe("A square can't be negative, so there are no real roots.")
    expect(roots).toBeNull()
  })

  it('x^2 + 2x + 5 = 0: the right side ends up negative', () => {
    expect(lines('x^2 + 2x + 5 = 0').slice(2)).toEqual([
      'Use identity 1: Square of a sum: (x + 1)^2 = -4',
      'No real roots: (x + 1)^2 = -4',
    ])
    expect(solve('x^2 + 2x + 5 = 0').roots).toBeNull()
  })

  it('x^2 - 9 = 0: b = 0, nothing to complete', () => {
    expect(lines('x^2 - 9 = 0').map((l) => l.split(':')[0])).toEqual([
      'Move the constant to the right side',
      'Take the square root of both sides',
      'Write the roots',
    ])
  })

  it('x^2 + 6x = 0: c = 0, nothing to move', () => {
    const { steps } = solve('x^2 + 6x = 0')
    expect(lines('x^2 + 6x = 0').slice(0, 2)).toEqual([
      'Complete the square: x^2 + 6x + 9 = 9',
      'Use identity 1: Square of a sum: (x + 3)^2 = 9',
    ])
    expect(steps[1].explanation).toBe(
      'The left side has the shape $a^2 + 2ab + b^2$ with $a = x$ and $b = 3$, so it equals $(a+b)^2$.',
    )
    expect(steps.at(-1)?.math).toBe('x = 0 \\text{ or } x = -6')
  })

  describe('agrees with the quadratic formula', () => {
    const cases: string[] = []
    for (const a of [1, -1, 2, 3, -4])
      for (const b of [-5, -3, -1, 1, 2, 4, 6])
        for (const c of [-6, -2, 0, 1, 3, 7]) cases.push(`${a}x^2 + ${b}x + ${c}`.replace(/\+ -/g, '- '))

    it(`for ${cases.length} equations with b ≠ 0`, () => {
      for (const text of cases) {
        const expected = quadraticFormula.solve(equation(text)).roots?.decimals().sort() ?? []
        const casesStep = solve(text).steps.find((s) => s.title === 'Solve each case')
        const shown = casesStep ? caseValues(casesStep.math).sort() : []
        expect(shown.length, text).toBe(expected.length)
        shown.forEach((v, i) => expect(v, text).toBeCloseTo(expected[i], 9))
      }
    })
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
