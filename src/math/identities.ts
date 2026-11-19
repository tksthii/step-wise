export type IdentityNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7

export interface Identity {
  number: IdentityNumber
  name: string
  latex: string
}

export const IDENTITIES: readonly Identity[] = [
  { number: 1, name: 'Square of a sum', latex: '(a+b)^2 = a^2 + 2ab + b^2' },
  { number: 2, name: 'Square of a difference', latex: '(a-b)^2 = a^2 - 2ab + b^2' },
  { number: 3, name: 'Difference of squares', latex: 'a^2-b^2 = (a-b)(a+b)' },
  { number: 4, name: 'Cube of a sum', latex: '(a+b)^3 = a^3 + 3a^2b + 3ab^2 + b^3' },
  { number: 5, name: 'Cube of a difference', latex: '(a-b)^3 = a^3 - 3a^2b + 3ab^2 - b^3' },
  { number: 6, name: 'Sum of cubes', latex: 'a^3+b^3 = (a+b)(a^2 - ab + b^2)' },
  { number: 7, name: 'Difference of cubes', latex: 'a^3-b^3 = (a-b)(a^2 + ab + b^2)' },
]
