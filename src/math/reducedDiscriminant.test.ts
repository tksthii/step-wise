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
