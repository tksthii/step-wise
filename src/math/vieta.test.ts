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
    expect(vieta.applies(equation(text))).toEqual({
      ok: false,
      reason: "No quick pattern: $a + b + c \\neq 0$, $a - b + c \\neq 0$, and the roots aren't whole numbers.",
    })
  })
})
