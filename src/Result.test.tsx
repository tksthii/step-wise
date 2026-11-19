import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { Result } from './Result'
import { solveEquation } from './solve'

const render = (text: string) => renderToStaticMarkup(<Result result={solveEquation(text)} />)

describe('Result steps', () => {
  it('shows the rearranging steps before the quadratic formula steps', () => {
    const html = render('x^2 = 3x + 4')
    const order = ['Rearrange into standard form', 'Move everything to the left side', 'Collect like terms',
      'Quadratic Formula', 'Identify a, b and c', 'Find the discriminant', 'Write the roots']
    const positions = order.map((t) => html.indexOf(t))
    expect(positions.every((p) => p >= 0)).toBe(true)
    expect(positions).toEqual([...positions].sort((a, b) => a - b))
  })

  it('shows each step explanation', () => {
    expect(render('x^2 = 3x + 4')).toContain('from both sides, so the right side becomes 0.')
  })
})

describe('Result math', () => {
  it('renders step math with KaTeX', () => {
    const html = render('x^2 - 2x - 4 = 0')
    expect(html).toContain('class="katex"')
    expect(html).not.toContain('<code>')
  })
})

describe('Result roots box', () => {
  const box = (text: string) => {
    const html = render(text)
    return html.slice(html.indexOf('class="roots"'))
  }

  it('shows the exact roots and their decimal values', () => {
    const html = box('x^2 - 2x - 4 = 0')
    expect(html).toContain('class="katex"')
    expect(html).toContain('x ≈ 3.24 or x ≈ -1.24')
  })

  it('skips decimals when the roots are whole numbers', () => {
    expect(box('x^2 = 3x + 4')).not.toContain('≈')
  })

  it('shows one decimal for a repeated fractional root', () => {
    expect(box('4x^2 - 4x + 1 = 0')).toContain('x ≈ 0.50')
  })

  it('says when there are no real roots', () => {
    expect(box('x^2 + 1 = 0')).toContain('No real roots')
  })
})

describe('Result messages', () => {
  const alert = (html: string) => html.match(/<p class="error" role="alert">([^<]*)<\/p>/)?.[1]

  it('shows a parse error as an alert and nothing else', () => {
    const html = render('x^2 + (')
    expect(alert(html)).toBe('Something is missing after (')
    expect(html).not.toContain('<section')
  })

  it('linear: alert, its steps, and the answer', () => {
    const html = render('2x + 3 = 7')
    expect(alert(html)).toBe('This is a linear equation')
    expect(html).toContain('Divide both sides by 2')
    expect(html.slice(html.indexOf('class="roots"'))).toContain('class="katex"')
  })

  it('not-quadratic: alert and its steps', () => {
    const html = render('x^3 = 1')
    expect(alert(html)).toBe('Not a quadratic')
    expect(html).toContain('The highest power of x is 3')
  })

  it('no solution and every x are answers, not errors', () => {
    expect(alert(render('x + 1 = x'))).toBeUndefined()
    expect(render('x + 1 = x')).toContain('This equation has no solution')
    expect(render('x = x')).toContain('Every x is a solution')
  })
})
