export type Token =
  // number text stays a string so decimals like 0.1 can become exact Rationals later
  | { type: 'number'; text: string }
  | { type: 'x' | '+' | '-' | '*' | '/' | '^' | '(' | ')' | '=' }

const NUMBER = /\d+(?:\.\d+)?|\.\d+/y
const SYMBOLS = 'x+-*/^()='

// Students write 2x, 3(x+1), x(x-2), (x+1)(x-1) and (x+1)2 meaning multiplication.
// x2 and "2 3" are left alone so the parser can report them as mistakes.
function impliesMultiplication(prev: Token | undefined, next: Token): boolean {
  if (!prev || !['number', 'x', ')'].includes(prev.type)) return false
  return next.type === 'x' || next.type === '(' || (prev.type === ')' && next.type === 'number')
}

export function tokenize(input: string): Token[] {
  const tokens: Token[] = []
  const push = (token: Token) => {
    if (impliesMultiplication(tokens.at(-1), token)) tokens.push({ type: '*' })
    tokens.push(token)
  }
  let i = 0
  while (i < input.length) {
    const ch = input[i]
    if (/\s/.test(ch)) {
      i++
      continue
    }
    NUMBER.lastIndex = i
    const match = NUMBER.exec(input)
    if (match) {
      push({ type: 'number', text: match[0] })
      i += match[0].length
    } else if (SYMBOLS.includes(ch)) {
      push({ type: ch as Exclude<Token['type'], 'number'> })
      i++
    } else {
      throw new Error(`Unexpected character "${ch}"`)
    }
  }
  return tokens
}
