import { describe, expect, it } from 'vitest'
import { factoring } from './factoring'
import { quadraticFormula } from './quadraticFormula'
import { squareRoot } from './squareRoot'
import { toStandardForm } from './standardForm'

const inputs = [
  '2x^2 - 4x - 6 = 0', 'x^2 = 3x + 4', '3x(x-2) = 5', '(x+1)^2 = 9', '(x+1)^3 - x^3 = 7',
  'x^2 + 1 = 0', '(2x+3)^2 = 0', 'x^2/2 - x/3 = 1', '(x/2 + 1)^2 = 4', '(x-1)(x+1) = 3x',
  '(x+2)(x^2 - 2x + 4) = x^3 + x^2', '2x + 3 = 7', 'x + 1 = x', 'x^3 = 1',
  'x^2 - 16', 'x^2 - 6x + 9', '6x^2 + x - 2', '-2x^2 + 2x + 12', 'x^2/2 + 5x/2 + 3', '2x^2 + 6x', '3x^2',
  '3(x-2)^2 = 12', '(2x+1)^2 = 5', 'x^2/2 - 8 = 0', '(x+1)^2 = -4', '4x^2 = 9',
]

function explanations(text: string): string[] {
  const form = toStandardForm(text)
  if (form.kind !== 'quadratic') return form.steps.map((s) => s.explanation)
  const methods = [quadraticFormula, factoring, squareRoot].filter((m) => m.applies(form).ok)
  return [...form.steps, ...methods.flatMap((m) => m.solve(form).steps)].map((s) => s.explanation)
}

describe('step explanations keep math inside $...$', () => {
  it.each(inputs)('%s', (input) => {
    for (const explanation of explanations(input)) {
      const parts = explanation.split('$')
      expect(parts.length % 2, explanation).toBe(1)
      const text = parts.filter((_, i) => i % 2 === 0).join(' ')
      expect(text, explanation).not.toMatch(/\^|\d\/\d/)
    }
  })
})
