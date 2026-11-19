import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { TextWithMath } from './TeX'

describe('TextWithMath', () => {
  it('renders $...$ parts inline with KaTeX and keeps the rest as text', () => {
    const html = renderToStaticMarkup(<TextWithMath text="The discriminant is $b^2 - 4ac$. Done." />)
    expect(html.startsWith('The discriminant is <span><span class="katex">')).toBe(true)
    expect(html.endsWith('. Done.')).toBe(true)
    expect(html).not.toContain('katex-display')
  })

  it('plain text stays plain', () => {
    expect(renderToStaticMarkup(<TextWithMath text="No math here." />)).toBe('No math here.')
  })
})
