import { describe, expect, it } from 'vitest'
import { factoring } from './factoring'
import { quadraticFormula } from './quadraticFormula'
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

const solve = (text: string) => factoring.solve(equation(text))
const lines = (text: string) => solve(text).steps.map((s) => `${s.title}: ${s.math}`)

describe('factoring a simple trinomial', () => {
  it('x^2 + 5x + 6 = 0 -> (x + 2)(x + 3) = 0', () => {
    expect(lines('x^2 + 5x + 6 = 0')).toEqual([
      'Factor the simple trinomial: x^2 + 5x + 6 = (x + 2)(x + 3)',
      'Use the zero product property: (x + 2)(x + 3) = 0 \\Rightarrow x + 2 = 0 \\text{ or } x + 3 = 0',
      'Write the roots: x = -2 \\text{ or } x = -3',
    ])
    expect(solve('x^2 + 5x + 6 = 0').steps[0].explanation).toBe(
      'Find two numbers that multiply to $c = 6$ and add to $b = 5$: $2$ and $3$.',
    )
  })

  it('2x^2 - 4x - 6 = 0: common factor 2 first', () => {
    const { steps } = solve('2x^2 - 4x - 6 = 0')
    expect(lines('2x^2 - 4x - 6 = 0')).toEqual([
      'Take out the common factor: 2x^2 - 4x - 6 = 2(x^2 - 2x - 3)',
      'Factor the simple trinomial: x^2 - 2x - 3 = (x - 3)(x + 1)',
      'Use the zero product property: 2(x - 3)(x + 1) = 0 \\Rightarrow x - 3 = 0 \\text{ or } x + 1 = 0',
      'Write the roots: x = 3 \\text{ or } x = -1',
    ])
    expect(steps[0].explanation).toBe('Every term is divisible by $2$, so factor out $2$.')
    expect(steps[2].explanation).toContain("$2$ can't be 0")
  })

  it('a < 0: factor out -1 first', () => {
    const { steps } = solve('-x^2 - 5x - 6 = 0')
    expect(steps[0].math).toBe('-x^2 - 5x - 6 = -(x^2 + 5x + 6)')
    expect(steps[0].explanation).toBe('The $x^2$ term is negative, so factor out $-1$ to make it positive.')
    expect(steps.at(-1)?.math).toBe('x = -2 \\text{ or } x = -3')
  })

  it('a < 0 with a common factor: factor out -2', () => {
    const { steps } = solve('-2x^2 + 2x + 12 = 0')
    expect(steps[0].math).toBe('-2x^2 + 2x + 12 = -2(x^2 - x - 6)')
    expect(steps[0].explanation).toBe(
      'Every term is divisible by $2$ and the $x^2$ term is negative, so factor out $-2$.',
    )
  })

  it('returns the exact roots', () => {
    expect(solve('x^2 + 5x + 6 = 0').roots?.rationalRoots()?.map(String)).toEqual(['-2', '-3'])
  })
})

describe('factoring by decomposition', () => {
  it('6x^2 + x - 2 = 0: split the middle term, then group', () => {
    const { steps } = solve('6x^2 + x - 2 = 0')
    expect(lines('6x^2 + x - 2 = 0')).toEqual([
      'Decompose the middle term: 6x^2 + x - 2 = 6x^2 + 4x - 3x - 2',
      'Group and factor: 6x^2 + 4x - 3x - 2 = 2x(3x + 2) - 1(3x + 2) = (2x - 1)(3x + 2)',
      'Use the zero product property: (2x - 1)(3x + 2) = 0 \\Rightarrow 2x - 1 = 0 \\text{ or } 3x + 2 = 0',
      'Write the roots: x = \\frac{1}{2} \\text{ or } x = -\\frac{2}{3}',
    ])
    expect(steps[0].explanation).toBe(
      'Find two numbers that multiply to $ac = (6)(-2) = -12$ and add to $b = 1$: $4$ and $-3$. Split $x$ into $4x - 3x$.',
    )
    expect(steps[1].explanation).toBe(
      "Group the first two terms and the last two terms, and take out each group's common factor. Both groups share $(3x + 2)$, so factor it out.",
    )
  })

  it('2x^2 - 5x - 3 = 0 -> (2x + 1)(x - 3)', () => {
    expect(solve('2x^2 - 5x - 3 = 0').steps[1].math.split(' = ').at(-1)).toMatch(/^\(2x \+ 1\)\(x - 3\)$|^\(x - 3\)\(2x \+ 1\)$/)
  })
})

describe('factoring with identities', () => {
  it('x^2 - 16: difference of squares, identity 3', () => {
    const { steps } = solve('x^2 - 16')
    expect(lines('x^2 - 16')).toEqual([
      'Use identity 3: Difference of squares: x^2 - 16 = (x - 4)(x + 4)',
      'Use the zero product property: (x - 4)(x + 4) = 0 \\Rightarrow x - 4 = 0 \\text{ or } x + 4 = 0',
      'Write the roots: x = 4 \\text{ or } x = -4',
    ])
    expect(steps[0].identity).toBe(3)
    expect(steps[0].explanation).toBe(
      'Both terms are perfect squares with a minus between them, so use $a^2-b^2 = (a-b)(a+b)$ with $a = x$ and $b = 4$.',
    )
  })

  it('-x^2 + 4: factor out -1, then difference of squares', () => {
    expect(lines('-x^2 + 4 = 0')).toEqual([
      'Take out the common factor: -x^2 + 4 = -(x^2 - 4)',
      'Use identity 3: Difference of squares: x^2 - 4 = (x - 2)(x + 2)',
      "Use the zero product property: -(x - 2)(x + 2) = 0 \\Rightarrow x - 2 = 0 \\text{ or } x + 2 = 0",
      'Write the roots: x = 2 \\text{ or } x = -2',
    ])
  })

  it('4x^2 - 9: a = 2x', () => {
    expect(solve('4x^2 - 9').steps[0].math).toBe('4x^2 - 9 = (2x - 3)(2x + 3)')
  })

  it('x^2 - 6x + 9: perfect square, identity 2, one root', () => {
    const { steps } = solve('x^2 - 6x + 9 = 0')
    expect(lines('x^2 - 6x + 9 = 0')).toEqual([
      'Use identity 2: Square of a difference: x^2 - 6x + 9 = (x - 3)^2',
      'Use the zero product property: (x - 3)^2 = 0 \\Rightarrow x - 3 = 0',
      'Write the roots: x = 3',
    ])
    expect(steps[0].identity).toBe(2)
    expect(steps[0].explanation).toBe(
      'The first and last terms are perfect squares and the middle term is $-2ab$, so use $(a-b)^2 = a^2 - 2ab + b^2$ with $a = x$ and $b = 3$.',
    )
    expect(steps[2].explanation).toBe('Both factors are the same, so there is only one root.')
  })

  it('x^2 + 2x + 1 and 4x^2 + 12x + 9: perfect squares, identity 1', () => {
    expect(solve('x^2 + 2x + 1').steps[0]).toMatchObject({ identity: 1, math: 'x^2 + 2x + 1 = (x + 1)^2' })
    expect(solve('4x^2 + 12x + 9').steps[0].math).toBe('4x^2 + 12x + 9 = (2x + 3)^2')
  })
})

describe('factoring with fractions', () => {
  it('x^2/2 + 5x/2 + 3 = 0: multiply both sides by the LCD first', () => {
    const { steps, roots } = solve('x^2/2 + 5x/2 + 3 = 0')
    expect(steps[0]).toEqual({
      title: 'Clear the fractions',
      explanation: 'Multiply both sides by the LCD, $2$, so every coefficient is a whole number. This does not change the roots.',
      math: '2\\left(\\frac{1}{2}x^2 + \\frac{5}{2}x + 3\\right) = 2(0) \\Rightarrow x^2 + 5x + 6 = 0',
    })
    expect(steps[1].title).toBe('Factor the simple trinomial')
    expect(roots?.rationalRoots()?.map(String)).toEqual(['-2', '-3'])
  })

  it('x^2/4 - 1 = 0 -> x^2 - 4, then difference of squares', () => {
    expect(solve('x^2/4 - 1 = 0').steps.map((s) => s.title).slice(0, 2)).toEqual([
      'Clear the fractions',
      'Use identity 3: Difference of squares',
    ])
  })

  it('no fraction step for whole-number coefficients', () => {
    expect(solve('x^2 + 5x + 6').steps[0].title).not.toBe('Clear the fractions')
  })
})

describe('factoring agrees with the quadratic formula', () => {
  // every (k)(q1x - p1)(q2x - p2) with small numbers, written out as ax^2 + bx + c
  const cases: string[] = []
  for (const k of [1, -1, 2, -3])
    for (const q1 of [1, 2, 3])
      for (const q2 of [1, 2, 5])
        for (const p1 of [-4, -1, 0, 3])
          for (const p2 of [-3, 0, 2, 5]) {
            const [a, b, c] = [k * q1 * q2, -k * (q1 * p2 + q2 * p1), k * p1 * p2]
            cases.push(`${a}x^2 + ${b}x + ${c}`.replace(/\+ -/g, '- '))
          }

  it(`gives the same roots for ${cases.length} factorable quadratics`, () => {
    for (const text of cases) {
      const eq = equation(text)
      const expected = quadraticFormula.solve(eq).roots?.rationalRoots()?.map(String).sort()
      const written = solve(text).steps.at(-1)?.math
      const shown = [...(written?.matchAll(/x = (-?)(?:\\frac\{(\d+)\}\{(\d+)\}|(\d+))/g) ?? [])]
        .map(([, sign, num, den, whole]) => `${sign}${whole ?? `${num}/${den}`}`)
        .sort()
      expect(shown, text).toEqual(expected)
    }
  })
})

describe('factoring when c = 0: x is a common factor', () => {
  it('x^2 - 3x = 0 -> x(x - 3) = 0', () => {
    const { steps } = solve('x^2 - 3x = 0')
    expect(lines('x^2 - 3x = 0')).toEqual([
      'Take out the common factor: x^2 - 3x = x(x - 3)',
      'Use the zero product property: x(x - 3) = 0 \\Rightarrow x = 0 \\text{ or } x - 3 = 0',
      'Write the roots: x = 0 \\text{ or } x = 3',
    ])
    expect(steps[0].explanation).toBe('Every term is divisible by $x$, so factor out $x$.')
  })

  it('2x^2 + 6x = 0 -> 2x(x + 3) = 0', () => {
    expect(solve('2x^2 + 6x = 0').steps[0].math).toBe('2x^2 + 6x = 2x(x + 3)')
    expect(solve('2x^2 + 6x = 0').steps[0].explanation).toBe('Every term is divisible by $2x$, so factor out $2x$.')
  })

  it('3x^2 = 0 has the one root x = 0', () => {
    expect(lines('3x^2 = 0').slice(1)).toEqual([
      'Use the zero product property: 3x^2 = 0 \\Rightarrow x = 0',
      'Write the roots: x = 0',
    ])
  })
})
