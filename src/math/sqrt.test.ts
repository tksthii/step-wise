import { describe, expect, it } from 'vitest'
import { simplifySqrt } from './sqrt'

describe('simplifySqrt', () => {
  it('pulls out square factors: √40 = 2√10', () => {
    expect(simplifySqrt(40)).toEqual({ coefficient: 2, radicand: 10 })
  })

  it('pulls out several square factors: √72 = 6√2', () => {
    expect(simplifySqrt(72)).toEqual({ coefficient: 6, radicand: 2 })
  })

  it('gives radicand 1 for perfect squares: √49 = 7', () => {
    expect(simplifySqrt(49)).toEqual({ coefficient: 7, radicand: 1 })
  })

  it('leaves square-free numbers alone: √10', () => {
    expect(simplifySqrt(10)).toEqual({ coefficient: 1, radicand: 10 })
  })

  it('handles 0 and 1', () => {
    expect(simplifySqrt(0)).toEqual({ coefficient: 0, radicand: 1 })
    expect(simplifySqrt(1)).toEqual({ coefficient: 1, radicand: 1 })
  })

  it('rejects non-integers', () => {
    expect(() => simplifySqrt(2.5)).toThrow()
  })
})
