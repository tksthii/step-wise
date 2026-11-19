import type { ReactNode } from 'react'
import { TeX, TextWithMath } from './TeX'
import { Polynomial } from './math/polynomial'
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
            <p>
              <TextWithMath text={step.explanation} />
            </p>
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

const Alert = ({ message }: { message: string }) => (
  <p className="error" role="alert">
    {message}
  </p>
)

function Answer({ children }: { children: ReactNode }) {
  return (
    <section className="roots">
      <h2>Answer</h2>
      {children}
    </section>
  )
}

export function Result({ result }: { result: SolveResult }) {
  switch (result.kind) {
    case 'error':
      return <Alert message={result.message} />
    case 'quadratic':
      return (
        <>
          <Steps heading="Rearrange into standard form" steps={result.rearranging} />
          <Steps heading="Quadratic Formula" steps={result.formula} />
          <Roots roots={result.roots} />
        </>
      )
    case 'linear':
      return (
        <>
          <Alert message={result.message} />
          <Steps heading="Solve the linear equation" steps={result.steps} />
          <Answer>
            <TeX math={`x = ${new Polynomial([result.root]).toLatex()}`} />
          </Answer>
        </>
      )
    case 'not-quadratic':
      return (
        <>
          <Alert message={result.message} />
          <Steps heading="Rearrange into standard form" steps={result.steps} />
        </>
      )
    case 'no-solution':
    case 'every-x':
      return (
        <>
          <Steps heading="Rearrange into standard form" steps={result.steps} />
          <Answer>
            <p>{result.message}</p>
          </Answer>
        </>
      )
  }
}
