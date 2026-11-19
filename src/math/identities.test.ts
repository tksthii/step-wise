import { expect, it } from 'vitest'
import { IDENTITIES } from './identities'

it('lists the 7 identities numbered 1 to 7 in order', () => {
  expect(IDENTITIES.map((i) => i.number)).toEqual([1, 2, 3, 4, 5, 6, 7])
  expect(IDENTITIES.map((i) => i.latex.split('=')[0].trim())).toEqual([
    '(a+b)^2',
    '(a-b)^2',
    'a^2-b^2',
    '(a+b)^3',
    '(a-b)^3',
    'a^3+b^3',
    'a^3-b^3',
  ])
})
