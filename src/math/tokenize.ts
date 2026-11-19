export type Token =
  // number text stays a string so decimals like 0.1 can become exact Rationals later
  | { type: 'number'; text: string }
  | { type: 'x' | '+' | '-' | '*' | '/' | '^' | '(' | ')' | '=' }

const NUMBER = /\d+(?:\.\d+)?|\.\d+/y
const SYMBOLS = 'x+-*/^()='

export function tokenize(input: string): Token[] {
  const tokens: Token[] = []
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
      tokens.push({ type: 'number', text: match[0] })
      i += match[0].length
    } else if (SYMBOLS.includes(ch)) {
      tokens.push({ type: ch as Exclude<Token['type'], 'number'> })
      i++
    } else {
      throw new Error(`Unexpected character "${ch}"`)
    }
  }
  return tokens
}
