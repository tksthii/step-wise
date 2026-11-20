import { describe, expect, it } from 'vitest'
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
