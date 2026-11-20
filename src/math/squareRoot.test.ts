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
