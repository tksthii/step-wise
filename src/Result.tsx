import { TeX } from './TeX'
import type { ExactRoot } from './math/exactRoot'
import { twoPlaces } from './math/quadraticFormula'
import type { Step } from './math/step'
import type { SolveResult } from './solve'

function Steps({ heading, steps }: { heading: string; steps: Step[] }) {
  return (
    <section>
      <h2>{heading}</h2>
      <ol className="steps">
        {steps.map((step, i) => (
          <li key={i}>
            <h3>{step.title}</h3>
            <p>{step.explanation}</p>
            <TeX math={step.math} />
          </li>
        ))}
      </ol>
    </section>
  )
}

function Roots({ roots }: { roots: ExactRoot | null }) {
  if (!roots) {
    return (
      <section className="roots">
        <h2>Roots</h2>
        <p>No real roots</p>
      </section>
    )
  }
  const decimals = roots.decimals()
  return (
    <section className="roots">
      <h2>Roots</h2>
      <TeX math={roots.toLatex()} />
      {!decimals.every(Number.isInteger) && <p>{decimals.map((v) => `x ≈ ${twoPlaces(v)}`).join(' or ')}</p>}
    </section>
  )
}

export function Result({ result }: { result: SolveResult }) {
  if (result.kind === 'error') return null
  if (result.kind !== 'quadratic') return <Steps heading="Rearrange into standard form" steps={result.steps} />
  return (
    <>
      <Steps heading="Rearrange into standard form" steps={result.rearranging} />
      <Steps heading="Quadratic Formula" steps={result.formula} />
      <Roots roots={result.roots} />
    </>
  )
}
