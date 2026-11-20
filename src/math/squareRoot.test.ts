import { describe, expect, it } from 'vitest'
import { squareRoot } from './squareRoot'
import { toStandardForm } from './standardForm'

function equation(text: string) {
  const eq = toStandardForm(text)
  if (eq.kind !== 'quadratic') throw new Error(`expected quadratic, got ${eq.kind}`)
  return eq
}

describe('squareRoot applies', () => {
  it.each(['x^2 - 16 = 0', '2x^2 = 18', '(x+1)^2 = 9', '3(x-2)^2 = 12', '(x+1)^2 = -4', '-(x-1)^2 = -4', '9 = (x+1)^2'])(
    '%s',
    (text) => {
      expect(squareRoot.applies(equation(text))).toEqual({ ok: true })
    },
  )

  it.each(['x^2 + 5x + 6 = 0', '(x+1)^2 + 2x = 9', '(x+1)^2 = x'])('%s does not apply', (text) => {
    expect(squareRoot.applies(equation(text))).toEqual({
      ok: false,
      reason: 'This method needs the equation in the form $(x + p)^2 = q$ or with $b = 0$.',
    })
  })

  it('has an id and a name', () => {
    expect([squareRoot.id, squareRoot.name]).toEqual(['square-root', 'Square Root'])
  })
})

const solve = (text: string) => squareRoot.solve(equation(text))
const lines = (text: string) => solve(text).steps.map((s) => `${s.title}: ${s.math}`)

describe('squareRoot when b = 0', () => {
  it('x^2 - 16 = 0', () => {
    const { steps, roots } = solve('x^2 - 16 = 0')
    expect(lines('x^2 - 16 = 0')).toEqual([
      'Isolate the square: x^2 - 16 = 0 \\Rightarrow x^2 = 16',
      'Take the square root of both sides: x = \\pm \\sqrt{16} = \\pm 4',
      'Write the roots: x = 4 \\text{ or } x = -4',
    ])
    expect(steps[0].explanation).toBe('Add $16$ to both sides.')
    expect(steps[1].explanation).toBe(
      'A positive number and its opposite have the same square, so take both the positive and the negative square root.',
    )
    expect(roots?.rationalRoots()?.map(String)).toEqual(['4', '-4'])
  })

  it('2x^2 - 18 = 0: add, then divide', () => {
    const { steps } = solve('2x^2 - 18 = 0')
    expect(steps[0].math).toBe('2x^2 - 18 = 0 \\Rightarrow 2x^2 = 18 \\Rightarrow x^2 = 9')
    expect(steps[0].explanation).toBe('Add $18$ to both sides, then divide both sides by $2$.')
  })

  it('x^2 - 8 = 0: irrational, with decimals', () => {
    const { steps } = solve('x^2 - 8 = 0')
    expect(steps[1].math).toBe('x = \\pm \\sqrt{8} = \\pm 2\\sqrt{2}')
    expect(steps[2].math).toBe('x = \\pm 2\\sqrt{2}')
    expect(steps[2].explanation).toContain('x ≈ 2.83 or x ≈ -2.83')
  })

  it('4x^2 - 9 = 0: a fraction under the root', () => {
    expect(solve('4x^2 - 9 = 0').steps[1].math).toBe('x = \\pm \\sqrt{\\frac{9}{4}} = \\pm \\frac{3}{2}')
  })

  it('x^2 - 5 = 0: nothing to simplify', () => {
    expect(solve('x^2 - 5 = 0').steps[1].math).toBe('x = \\pm \\sqrt{5}')
  })

  it('3x^2 = 0 in standard form: one root', () => {
    const { steps } = solve('3x^2 + 0 = 0')
    expect(steps.map((s) => s.math)).toEqual(['3x^2 = 0 \\Rightarrow x^2 = 0', 'x = 0', 'x = 0'])
    expect(steps[2].explanation).toBe('The square is 0, so there is only one root.')
  })
})
