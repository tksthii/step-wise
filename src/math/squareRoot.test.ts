import { describe, expect, it } from 'vitest'
import { caseValues } from './evaluateLatex'
import { quadraticFormula } from './quadraticFormula'
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

describe('squareRoot on a(x + p)^2 = q as typed', () => {
  it('(x+1)^2 = 9: no isolating needed, then each case', () => {
    expect(lines('(x+1)^2 = 9')).toEqual([
      'Take the square root of both sides: x + 1 = \\pm \\sqrt{9} = \\pm 3',
      'Solve each case: x + 1 = 3 \\Rightarrow x = 2 \\text{ or } x + 1 = -3 \\Rightarrow x = -4',
      'Write the roots: x = 2 \\text{ or } x = -4',
    ])
    expect(solve('(x+1)^2 = 9').steps[1].explanation).toBe('Solve $x + 1 = 3$ and $x + 1 = -3$ separately.')
  })

  it('3(x-2)^2 = 12: divide first', () => {
    const { steps } = solve('3(x-2)^2 = 12')
    expect(lines('3(x-2)^2 = 12')).toEqual([
      'Isolate the square: 3(x - 2)^2 = 12 \\Rightarrow (x - 2)^2 = 4',
      'Take the square root of both sides: x - 2 = \\pm \\sqrt{4} = \\pm 2',
      'Solve each case: x - 2 = 2 \\Rightarrow x = 4 \\text{ or } x - 2 = -2 \\Rightarrow x = 0',
      'Write the roots: x = 4 \\text{ or } x = 0',
    ])
    expect(steps[0].explanation).toBe('Divide both sides by $3$.')
  })

  it('2x^2 = 18: divide, then x = ±3 needs no cases', () => {
    expect(lines('2x^2 = 18')).toEqual([
      'Isolate the square: 2x^2 = 18 \\Rightarrow x^2 = 9',
      'Take the square root of both sides: x = \\pm \\sqrt{9} = \\pm 3',
      'Write the roots: x = 3 \\text{ or } x = -3',
    ])
  })

  it('(x+1)^2 = 5: irrational cases', () => {
    expect(solve('(x+1)^2 = 5').steps[1].math).toBe(
      'x + 1 = \\sqrt{5} \\Rightarrow x = -1 + \\sqrt{5} \\text{ or } x + 1 = -\\sqrt{5} \\Rightarrow x = -1 - \\sqrt{5}',
    )
  })

  it('(2x+1)^2 = 9: divide by the x coefficient in each case', () => {
    expect(solve('(2x+1)^2 = 9').steps[1].math).toBe(
      '2x + 1 = 3 \\Rightarrow x = 1 \\text{ or } 2x + 1 = -3 \\Rightarrow x = -2',
    )
  })

  it('(x-3)^2 = 0: one case', () => {
    expect(lines('(x-3)^2 = 0')).toEqual([
      'Take the square root of both sides: x - 3 = 0',
      'Solve each case: x - 3 = 0 \\Rightarrow x = 3',
      'Write the roots: x = 3',
    ])
  })

  it('9 = (x+1)^2: the square is written on the left', () => {
    expect(solve('9 = (x+1)^2').steps[0].math).toBe('x + 1 = \\pm \\sqrt{9} = \\pm 3')
  })
})

describe('squareRoot with a negative square', () => {
  it('(x+1)^2 = -4: no real roots', () => {
    const { steps, roots } = solve('(x+1)^2 = -4')
    expect(roots).toBeNull()
    expect(steps).toEqual([
      {
        title: 'No real roots',
        explanation: "A square can't be negative, so there are no real roots.",
        math: '(x + 1)^2 = -4',
      },
    ])
  })

  it('x^2 + 4 = 0: isolate first, then no real roots', () => {
    expect(lines('x^2 + 4 = 0')).toEqual([
      'Isolate the square: x^2 + 4 = 0 \\Rightarrow x^2 = -4',
      'No real roots: x^2 = -4',
    ])
  })

  it('-(x-1)^2 = 4: dividing by -1 leaves a negative square', () => {
    expect(solve('-(x-1)^2 = 4').steps.at(-1)?.math).toBe('(x - 1)^2 = -4')
  })
})

describe('squareRoot cases agree with the quadratic formula', () => {
  const cases: string[] = []
  for (const k of ['', '-', '2', '3'])
    for (const m of ['', '2', '3'])
      for (const r of [-3, -1, 1, 2])
        for (const q of [-4, 0, 1, 5, 8, 9, 12]) cases.push(`${k}(${m}x ${r < 0 ? '-' : '+'} ${Math.abs(r)})^2 = ${q}`)

  it(`gives the same x values for ${cases.length} equations`, () => {
    for (const text of cases) {
      const eq = equation(text)
      const expected = quadraticFormula.solve(eq).roots?.decimals().sort() ?? []
      const casesStep = solve(text).steps.find((s) => s.title === 'Solve each case')
      const shown = casesStep ? caseValues(casesStep.math).sort() : []
      expect(shown.length, text).toBe(expected.length)
      shown.forEach((v, i) => expect(v, text).toBeCloseTo(expected[i], 9))
    }
  })
})

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

  it('4x^2 - 5 = 0 and 2x^2 - 1 = 0: fractional roots written as a fraction', () => {
    expect(solve('4x^2 - 5 = 0').steps[1].math).toBe('x = \\pm \\sqrt{\\frac{5}{4}} = \\pm \\frac{\\sqrt{5}}{2}')
    expect(solve('2x^2 - 1 = 0').steps[1].math).toBe('x = \\pm \\sqrt{\\frac{1}{2}} = \\pm \\frac{\\sqrt{2}}{2}')
    expect(solve('(2x+1)^2 = 5').steps[1].math).toBe(
      '2x + 1 = \\sqrt{5} \\Rightarrow x = -\\frac{1}{2} + \\frac{\\sqrt{5}}{2} \\text{ or } 2x + 1 = -\\sqrt{5} \\Rightarrow x = -\\frac{1}{2} - \\frac{\\sqrt{5}}{2}',
    )
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
