import type { ExactRoot } from './math/exactRoot'
import { quadraticFormula } from './math/quadraticFormula'
import { toStandardForm, type StandardForm } from './math/standardForm'
import type { Step } from './math/step'

export type SolveResult =
  | { kind: 'error'; message: string }
  | { kind: 'quadratic'; rearranging: Step[]; formula: Step[]; roots: ExactRoot | null }
  | Exclude<StandardForm, { kind: 'quadratic' }>

/** Everything the UI needs for one equation; never throws. */
export function solveEquation(text: string): SolveResult {
  let form: StandardForm
  try {
    form = toStandardForm(text)
  } catch (e) {
    return { kind: 'error', message: e instanceof Error ? e.message : String(e) }
  }
  if (form.kind !== 'quadratic') return form
  const { steps, roots } = quadraticFormula.solve(form)
  return { kind: 'quadratic', rearranging: form.steps, formula: steps, roots }
}
