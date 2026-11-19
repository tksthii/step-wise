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
            <code>{step.math}</code>
          </li>
        ))}
      </ol>
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
    </>
  )
}
