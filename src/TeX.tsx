import katex from 'katex'

/** Display-mode KaTeX; bad LaTeX shows in red instead of crashing the page. */
export function TeX({ math }: { math: string }) {
  const html = katex.renderToString(math, { displayMode: true, throwOnError: false })
  return <div className="math" dangerouslySetInnerHTML={{ __html: html }} />
}
