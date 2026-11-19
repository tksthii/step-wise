import { useState, type FormEvent } from 'react'
import { Result } from './Result'
import { solveEquation, type SolveResult } from './solve'

function App() {
  const [text, setText] = useState('')
  const [result, setResult] = useState<SolveResult | null>(null)

  // a form submit also fires on Enter in the input
  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    setResult(solveEquation(text))
  }

  return (
    <main>
      <h1>step-wise</h1>
      <form onSubmit={onSubmit}>
        <label htmlFor="equation">Equation</label>
        <input
          id="equation"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="2x^2 - 4x - 6 = 0"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
        />
        <button type="submit">Solve</button>
      </form>
      {result && <Result result={result} />}
    </main>
  )
}

export default App
