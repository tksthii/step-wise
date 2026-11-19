import katex from 'katex'

/** Display-mode KaTeX; bad LaTeX shows in red instead of crashing the page. */
export function TeX({ math }: { math: string }) {
  const html = katex.renderToString(math, { displayMode: true, throwOnError: false })
  return <div className="math" dangerouslySetInnerHTML={{ __html: html }} />
}

/** Text where $...$ parts are inline LaTeX: "The discriminant is $b^2 - 4ac$." */
export function TextWithMath({ text }: { text: string }) {
  // splitting on $ puts the math at the odd indexes
  return text.split('$').map((part, i) =>
    i % 2 === 0 ? (
      part
    ) : (
      <span key={i} dangerouslySetInnerHTML={{ __html: katex.renderToString(part, { throwOnError: false }) }} />
    ),
  )
}
