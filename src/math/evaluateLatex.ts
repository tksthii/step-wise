/**
 * Test helper: the numeric value of a root as the steps print it.
 * "-\frac{1}{2} + \frac{3\sqrt{5}}{2}" -> -((1)/(2)) + ((3*Math.sqrt(5))/(2))
 */
export function evaluateLatex(latex: string): number {
  const js = latex
    .replace(/(\d)\\sqrt/g, '$1*\\sqrt')
    .replace(/\\sqrt\{(\d+)\}/g, 'Math.sqrt($1)')
    .replace(/\\frac\{([^{}]*)\}\{([^{}]*)\}/g, '(($1)/($2))')
  if (!/^[-+*/().\d\s\w]*$/.test(js)) throw new Error(`cannot evaluate ${latex}`)
  return Function(`return ${js}`)() as number
}

/** The x values from a "Solve each case" line: "x + 3 = 2 \Rightarrow x = -1 \text{ or } ...". */
export const caseValues = (math: string) =>
  math.split(' \\text{ or } ').map((c) => evaluateLatex(c.split('\\Rightarrow x = ')[1]))
