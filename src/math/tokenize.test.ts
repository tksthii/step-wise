import { describe, expect, it } from 'vitest'
import { tokenize } from './tokenize'

describe('tokenize', () => {
  it('reads every token kind', () => {
    expect(tokenize('x^2+3*x-4/2=(x)')).toEqual([
      { type: 'x' },
      { type: '^' },
      { type: 'number', text: '2' },
      { type: '+' },
      { type: 'number', text: '3' },
      { type: '*' },
      { type: 'x' },
      { type: '-' },
      { type: 'number', text: '4' },
      { type: '/' },
      { type: 'number', text: '2' },
      { type: '=' },
      { type: '(' },
      { type: 'x' },
      { type: ')' },
    ])
  })

  it('reads multi-digit integers and decimals as one number', () => {
    expect(tokenize('12 + 0.25 - .5')).toEqual([
      { type: 'number', text: '12' },
      { type: '+' },
      { type: 'number', text: '0.25' },
      { type: '-' },
      { type: 'number', text: '.5' },
    ])
  })

  it('skips whitespace', () => {
    expect(tokenize('  x \t=\n 1 ')).toEqual([
      { type: 'x' },
      { type: '=' },
      { type: 'number', text: '1' },
    ])
  })

  it('returns no tokens for empty input', () => {
    expect(tokenize('   ')).toEqual([])
  })
})
