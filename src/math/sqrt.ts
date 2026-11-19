/** √n written as coefficient·√radicand, with radicand square-free (1 means a whole number). */
export interface SimplifiedSqrt {
  coefficient: number
  radicand: number
}

export function simplifySqrt(n: number): SimplifiedSqrt {
  if (!Number.isInteger(n)) throw new Error('simplifySqrt needs an integer')
  if (n === 0) return { coefficient: 0, radicand: 1 }
  let coefficient = 1
  let radicand = n
  for (let i = 2; i * i <= radicand; i++) {
    while (radicand % (i * i) === 0) {
      coefficient *= i
      radicand /= i * i
    }
  }
  return { coefficient, radicand }
}
