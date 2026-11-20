import { describe, expect, it } from 'vitest'
import { quadraticFormula } from './quadraticFormula'
import { reducedDiscriminant } from './reducedDiscriminant'
import { toStandardForm } from './standardForm'

function equation(text: string) {
  const eq = toStandardForm(text)
  if (eq.kind !== 'quadratic') throw new Error(`expected quadratic, got ${eq.kind}`)
  return eq
}

describe('reducedDiscriminant applies', () => {
  it('has an id and a name', () => {
    expect([reducedDiscriminant.id, reducedDiscriminant.name]).toEqual([
      'reduced-discriminant',
      "Reduced discriminant (Δ')",
    ])
  })

  it.each(['x^2 - 2x - 4', '2x^2 - 4x - 6', 'x^2 + 6x + 9', 'x^2 + 2x + 5', 'x^2 - 9'])('%s: b is even', (text) => {
    expect(reducedDiscriminant.applies(equation(text))).toEqual({ ok: true })
  })

  it('x^2 + x - 1: b is odd', () => {
    expect(reducedDiscriminant.applies(equation('x^2 + x - 1'))).toEqual({
      ok: false,
      reason: "b is odd, so there's no shortcut here.",
    })
  })

  it('fractions are cleared first: x^2/2 - x/3 = 1 becomes 3x^2 - 2x - 6', () => {
    expect(reducedDiscriminant.applies(equation('x^2/2 - x/3 = 1'))).toEqual({ ok: true })
    expect(reducedDiscriminant.applies(equation('x^2/2 + x/2 = 1')).ok).toBe(false)
  })
})

const solve = (text: string) => reducedDiscriminant.solve(equation(text))
const lines = (text: string) => solve(text).steps.map((s) => `${s.title}: ${s.math}`)

describe('reducedDiscriminant agrees with the quadratic formula', () => {
  const cases: string[] = []
  for (const a of [1, 2, -1, 3, -5])
    for (const b of [-6, -4, -2, 0, 2, 4, 8])
      for (const c of [-7, -3, 0, 1, 5]) cases.push(`${a}x^2 + ${b}x + ${c}`.replace(/\+ -/g, '- '))

  it(`for ${cases.length} equations with even b`, () => {
    for (const text of cases) {
      const eq = equation(text)
      const expected = quadraticFormula.solve(eq).roots?.decimals().sort()
      const shown = reducedDiscriminant.solve(eq).roots?.decimals().sort()
      expect(shown?.length, text).toBe(expected?.length)
      shown?.forEach((v, i) => expect(v, text).toBeCloseTo(expected![i], 9))
    }
  })
})

describe("reducedDiscriminant: b' and Δ'", () => {
  it("x^2 - 2x - 4: b' = -1, Δ' = 5, two roots", () => {
    const { steps } = solve('x^2 - 2x - 4')
    expect(lines('x^2 - 2x - 4').slice(0, 3)).toEqual([
      "Find b': a = 1, \\quad b = -2, \\quad c = -4, \\quad b' = \\frac{b}{2} = -1",
      "Find the reduced discriminant: \\Delta' = b'^2 - ac = (-1)^2 - (1)(-4) = 1 + 4 = 5",
      "Two real roots: \\Delta' = 5 > 0",
    ])
    expect(steps[0].explanation).toBe(
      "This is a shortcut taught in Vietnam when $b$ is even: use $b' = \\frac{b}{2}$ instead of $b$, so the numbers stay smaller.",
    )
    expect(steps[1].explanation).toBe(
      "The reduced discriminant is $\\Delta' = b'^2 - ac$. Its sign tells us how many real roots there are.",
    )
  })

  it("x^2 + 6x + 9: Δ' = 0, one root", () => {
    expect(lines('x^2 + 6x + 9').slice(1, 3)).toEqual([
      "Find the reduced discriminant: \\Delta' = b'^2 - ac = 3^2 - (1)(9) = 9 - 9 = 0",
      "One real root: \\Delta' = 0",
    ])
  })

  it("x^2 - 2x - 4: the formula gives 1 ± √5 directly", () => {
    const { steps, roots } = solve('x^2 - 2x - 4')
    expect(lines('x^2 - 2x - 4').slice(3)).toEqual([
      "Apply the formula: x = \\frac{-b' \\pm \\sqrt{\\Delta'}}{a} = \\frac{-(-1) \\pm \\sqrt{5}}{1}",
      'Write the roots: x = 1 \\pm \\sqrt{5}',
    ])
    expect(steps[3].explanation).toBe("Substitute $b'$, $\\Delta'$ and $a$ into $x = \\frac{-b' \\pm \\sqrt{\\Delta'}}{a}$.")
    expect(steps[4].explanation).toContain('x ≈ 3.24 or x ≈ -1.24')
    expect(roots?.toLatex()).toBe('x = 1 \\pm \\sqrt{5}')
  })

  it('2x^2 - 4x - 6: simplify, then rational roots', () => {
    expect(lines('2x^2 - 4x - 6')).toEqual([
      "Find b': a = 2, \\quad b = -4, \\quad c = -6, \\quad b' = \\frac{b}{2} = -2",
      "Find the reduced discriminant: \\Delta' = b'^2 - ac = (-2)^2 - (2)(-6) = 4 + 12 = 16",
      "Two real roots: \\Delta' = 16 > 0",
      "Apply the formula: x = \\frac{-b' \\pm \\sqrt{\\Delta'}}{a} = \\frac{-(-2) \\pm \\sqrt{16}}{2}",
      'Simplify: x = \\frac{2 \\pm \\sqrt{16}}{2} = \\frac{2 \\pm 4}{2}',
      'Write the roots: x = 3 \\text{ or } x = -1',
    ])
  })

  it('x^2 + 6x + 9: one root', () => {
    const { steps } = solve('x^2 + 6x + 9')
    expect(lines('x^2 + 6x + 9').slice(3)).toEqual([
      "Apply the formula: x = \\frac{-b' \\pm \\sqrt{\\Delta'}}{a} = \\frac{-3 \\pm \\sqrt{0}}{1}",
      'Simplify: x = -3 \\pm \\sqrt{0} = -3',
      'Write the roots: x = -3',
    ])
    expect(steps.at(-1)?.explanation).toBe('There is only one root: $x = -3$.')
  })

  it('x^2 - 12: b = 0 and the root simplifies', () => {
    expect(lines('x^2 - 12').slice(3, 5)).toEqual([
      "Apply the formula: x = \\frac{-b' \\pm \\sqrt{\\Delta'}}{a} = \\frac{0 \\pm \\sqrt{12}}{1}",
      'Simplify: x = 0 \\pm \\sqrt{12} = 0 \\pm 2\\sqrt{3}',
    ])
  })

  it('x^2/2 - x/3 = 1: clear the fractions first', () => {
    const { steps, roots } = solve('x^2/2 - x/3 = 1')
    expect(steps[0]).toEqual({
      title: 'Clear the fractions',
      explanation:
        'Multiply every term by $6$ so $a$, $b$ and $c$ are whole numbers. This does not change the roots.',
      math: '3x^2 - 2x - 6 = 0',
    })
    expect(steps[1].math).toBe("a = 3, \\quad b = -2, \\quad c = -6, \\quad b' = \\frac{b}{2} = -1")
    expect(roots?.toLatex()).toBe('x = \\frac{1 \\pm \\sqrt{19}}{3}')
  })

  it("x^2 + 2x + 5: Δ' < 0, no real roots, stop", () => {
    const { steps, roots } = solve('x^2 + 2x + 5')
    expect(roots).toBeNull()
    expect(steps).toHaveLength(3)
    expect(steps[2]).toEqual({
      title: 'No real roots',
      explanation: "$\\Delta' = -4$ is less than 0, so there are no real roots. On the graph, the parabola never touches the x-axis.",
      math: "\\Delta' = -4 < 0",
    })
  })
})
