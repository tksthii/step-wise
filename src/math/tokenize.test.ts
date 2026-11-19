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

describe('tokenize implicit multiplication', () => {
  const types = (s: string) => tokenize(s).map((t) => (t.type === 'number' ? t.text : t.type)).join(' ')

  it('number before x: 2x -> 2*x', () => {
    expect(types('2x')).toBe('2 * x')
  })

  it('number before (: 3(x+1) -> 3*(x+1)', () => {
    expect(types('3(x+1)')).toBe('3 * ( x + 1 )')
  })

  it('x before ( and x before x: x(x-2), xx', () => {
    expect(types('x(x-2)')).toBe('x * ( x - 2 )')
    expect(types('xx')).toBe('x * x')
  })

  it(') before ( , x or a number: )( , )x , )2', () => {
    expect(types('(x+1)(x-1)')).toBe('( x + 1 ) * ( x - 1 )')
    expect(types('(x+1)x')).toBe('( x + 1 ) * x')
    expect(types('(x+1)2')).toBe('( x + 1 ) * 2')
  })

  it('works across spaces: 3 x -> 3*x', () => {
    expect(types('3 x')).toBe('3 * x')
  })

  it('does not join two numbers or x before a number', () => {
    expect(types('2 3')).toBe('2 3')
    expect(types('x2')).toBe('x 2')
  })
})
