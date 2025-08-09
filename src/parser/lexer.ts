import { 
  TokenType, 
  IToken, 
  ILexerOptions,
  IParserError
} from '../types/music'
import { KEYWORDS } from './grammar'

export class MusicLexer {
  private input: string
  private position: number = 0
  private line: number = 1
  private column: number = 1
  private tokens: IToken[] = []
  private errors: IParserError[] = []
  private options: ILexerOptions

  constructor(input: string, options: Partial<ILexerOptions> = {}) {
    this.input = input
    this.options = {
      ignoreWhitespace: false,
      includePosition: true,
      ...options
    }
  }

  tokenize(): { tokens: IToken[], errors: IParserError[] } {
    this.position = 0
    this.line = 1
    this.column = 1
    this.tokens = []
    this.errors = []

    while (this.position < this.input.length) {
      this.scanToken()
    }

    this.addToken(TokenType.EOF, '')
    return {
      tokens: this.tokens,
      errors: this.errors
    }
  }

  private scanToken(): void {
    const char = this.getCurrentChar()

    if (!char) {
      return
    }

    switch (char) {
    case ' ':
    case '\t':
      if (!this.options.ignoreWhitespace) {
        this.addToken(TokenType.WHITESPACE, char)
      }
      this.advance()
      break

    case '\n':
      if (!this.options.ignoreWhitespace) {
        this.addToken(TokenType.NEWLINE, char)
      }
      this.advanceLine()
      break

    case '\r':
      this.advance()
      if (this.getCurrentChar() === '\n') {
        if (!this.options.ignoreWhitespace) {
          this.addToken(TokenType.NEWLINE, '\r\n')
        }
        this.advanceLine()
      }
      break

    case ':':
      this.addToken(TokenType.COLON, char)
      this.advance()
      break

    case '|':
      this.addToken(TokenType.PIPE, char)
      this.advance()
      break

    case '/':
      this.addToken(TokenType.SLASH, char)
      this.advance()
      break

    default:
      if (this.isLetter(char)) {
        this.scanIdentifierOrKeyword()
      } else if (this.isDigit(char)) {
        this.scanNumber()
      } else if (this.isAccidental(char)) {
        this.addToken(TokenType.ACCIDENTAL, char)
        this.advance()
      } else {
        this.addError(`Unexpected character: '${char}'`)
        this.advance()
      }
      break
    }
  }

  private scanIdentifierOrKeyword(): void {
    const start = this.position
    
    // First check if this is a single character that could be a duration
    const firstChar = this.getCurrentChar()
    const secondChar = this.input[this.position + 1]
    
    // Check if this is a single character or note+accidental pattern
    if (this.isLetter(firstChar)) {
      // Prioritize duration over note for single characters with no following accidental/digit
      if (KEYWORDS.DURATIONS.includes(firstChar as any) && 
          (!secondChar || (!this.isAccidental(secondChar) && !this.isDigit(secondChar)))) {
        this.advance()
        this.addToken(TokenType.DURATION, firstChar)
        return
      }
      
      // Check if this looks like a note pattern (letter + accidental)
      if (secondChar && this.isAccidental(secondChar)) {
        // Treat as note regardless of whether it's A-G (let parser validate)
        this.advance()
        this.addToken(TokenType.NOTE, firstChar.toUpperCase())
        this.addToken(TokenType.ACCIDENTAL, secondChar)
        this.advance()
        return
      }
      
      // Check if this is a single letter followed by a digit (note + octave pattern)
      if (secondChar && this.isDigit(secondChar)) {
        this.advance()
        this.addToken(TokenType.NOTE, firstChar.toUpperCase())
        return
      }
      
      // Single letter followed by non-letter and not duration - could be note
      if (this.position + 1 >= this.input.length || (!this.isLetter(secondChar ?? '') && !this.isDigit(secondChar ?? '') && !this.isAccidental(secondChar ?? ''))) {
        if (this.isNoteLetter(firstChar)) {
          this.advance()
          this.addToken(TokenType.NOTE, firstChar.toUpperCase())
          return
        } else {
          // Not a valid note letter, fall through to identifier parsing
        }
      }
    }
    
    // Handle multi-character identifiers/keywords (like clef names)
    while (this.isLetter(this.getCurrentChar())) {
      this.advance()
    }

    const value = this.input.substring(start, this.position)
    const tokenType = this.getKeywordTokenType(value)
    
    this.addToken(tokenType, value)
  }

  private scanNumber(): void {
    const start = this.position
    
    while (this.isDigit(this.getCurrentChar())) {
      this.advance()
    }

    const value = this.input.substring(start, this.position)
    this.addToken(TokenType.NUMBER, value)
  }

  private getKeywordTokenType(value: string): TokenType {
    const upperValue = value.toUpperCase()
    
    if (KEYWORDS.NOTES.includes(upperValue as any)) {
      return TokenType.NOTE
    }
    
    if (KEYWORDS.DURATIONS.includes(value as any)) {
      return TokenType.DURATION
    }
    
    if (KEYWORDS.CLEFS.includes(value.toLowerCase() as any)) {
      return TokenType.CLEF
    }
    
    if (value.toLowerCase() === 'r') {
      return TokenType.REST
    }

    if (value.toLowerCase() === 'clef') {
      return TokenType.IDENTIFIER
    }

    if (value.toLowerCase() === 'time') {
      return TokenType.IDENTIFIER  
    }
    
    return TokenType.IDENTIFIER
  }

  private isLetter(char: string): boolean {
    return /[a-zA-Z]/.test(char)
  }

  private isNoteLetter(char: string): boolean {
    return /[A-G]/.test(char.toUpperCase())
  }

  private isDigit(char: string): boolean {
    return /[0-9]/.test(char)
  }

  private isAccidental(char: string): boolean {
    return char === '#' || char === 'b'
  }

  private getCurrentChar(): string {
    if (this.position >= this.input.length) {
      return ''
    }
    return this.input[this.position] ?? ''
  }

  private advance(): void {
    this.position++
    this.column++
  }

  private advanceLine(): void {
    this.position++
    this.line++
    this.column = 1
  }

  private addToken(type: TokenType, value: string): void {
    const token: IToken = {
      type,
      value,
      line: this.line,
      column: this.column - value.length,
      position: this.position - value.length
    }
    this.tokens.push(token)
  }

  private addError(message: string): void {
    const error: IParserError = {
      message,
      position: {
        line: this.line,
        column: this.column,
        position: this.position
      }
    }
    this.errors.push(error)
  }


  getTokens(): IToken[] {
    return [...this.tokens]
  }

  getErrors(): IParserError[] {
    return [...this.errors]
  }

  static tokenizeInput(input: string, options?: Partial<ILexerOptions>): { tokens: IToken[], errors: IParserError[] } {
    const lexer = new MusicLexer(input, options)
    return lexer.tokenize()
  }
}

export class TokenStream {
  private tokens: IToken[]
  private position: number = 0

  constructor(tokens: IToken[]) {
    this.tokens = tokens.filter(token => 
      token.type !== TokenType.WHITESPACE && 
      token.type !== TokenType.NEWLINE
    )
  }

  current(): IToken {
    if (this.position >= this.tokens.length) {
      return this.tokens[this.tokens.length - 1] ?? this.createEOFToken()
    }
    return this.tokens[this.position] ?? this.createEOFToken()
  }

  peek(offset: number = 1): IToken {
    const peekPosition = this.position + offset
    if (peekPosition >= this.tokens.length) {
      return this.tokens[this.tokens.length - 1] ?? this.createEOFToken()
    }
    return this.tokens[peekPosition] ?? this.createEOFToken()
  }

  advance(): IToken {
    const token = this.current()
    if (this.position < this.tokens.length - 1) {
      this.position++
    }
    return token
  }

  isAtEnd(): boolean {
    return this.current().type === TokenType.EOF
  }

  match(...types: TokenType[]): boolean {
    return types.includes(this.current().type)
  }

  consume(type: TokenType, errorMessage?: string): IToken {
    if (this.current().type === type) {
      return this.advance()
    }

    throw new Error(errorMessage || `Expected token type ${type}, got ${this.current().type}`)
  }

  getPosition(): number {
    return this.position
  }

  reset(): void {
    this.position = 0
  }

  private createEOFToken(): IToken {
    return {
      type: TokenType.EOF,
      value: '',
      line: 0,
      column: 0,
      position: 0
    }
  }
}