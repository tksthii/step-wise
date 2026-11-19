import type { IdentityNumber } from './identities'

/** One line of a worked solution. */
export interface Step {
  title: string
  /** Plain English for an Ontario high-school student. */
  explanation: string
  /** LaTeX source for the math shown in this step. */
  math: string
  /** The memorable identity this step relies on, if any. */
  identity?: IdentityNumber
}
