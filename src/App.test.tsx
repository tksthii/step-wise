import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  it('has a labelled equation input and a Solve submit button inside a form', () => {
    const html = renderToStaticMarkup(<App />)
    expect(html).toMatch(/<form/)
    expect(html).toMatch(/<label[^>]*for="equation"/)
    expect(html).toMatch(/<input[^>]*id="equation"/)
    expect(html).toMatch(/<button[^>]*type="submit"[^>]*>Solve<\/button>/)
  })
})
