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
