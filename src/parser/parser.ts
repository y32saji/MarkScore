import {
  TokenType,
  IToken,
  IPosition,
  INote,
  IRest,
  IClef,
  ITimeSignature,
  IPitch,
  IMeasure,
  IMusicScore,
  IParserError,
  IParseResult,
  IParserOptions,
  MusicElement,
  NoteName,
  Accidental,
  Duration,
  ClefType
} from '../types/music'
import { MusicLexer, TokenStream } from './lexer'
import { GrammarValidator } from './grammar'

export class MusicParser {
  private tokenStream: TokenStream
  private errors: IParserError[] = []
  private options: IParserOptions
  private currentMeasure: MusicElement[] = []
  private measures: IMeasure[] = []
  private measureNumber: number = 1

  constructor(tokens: IToken[], options: Partial<IParserOptions> = {}) {
    this.tokenStream = new TokenStream(tokens)
    this.options = {
      strict: true,
      allowPartialParsing: false,
      maxErrors: 10,
      ...options
    }
  }

  parse(): IParseResult {
    this.errors = []
    this.currentMeasure = []
    this.measures = []
    this.measureNumber = 1

    try {
      const score = this.parseScore()
      
      return {
        success: this.errors.length === 0,
        score,
        errors: this.errors,
        tokens: []
      }
    } catch (error) {
      // Only add error if it hasn't been handled already by handleParseError
      // Check if the error message is already in the errors list
      const errorMessage = (error as Error).message
      const alreadyHandled = this.errors.some(e => e.message.includes(errorMessage))
      
      if (!alreadyHandled) {
        this.addError('Parsing failed: ' + errorMessage)
      }
      
      return {
        success: false,
        errors: this.errors,
        tokens: []
      }
    }
  }

  private parseScore(): IMusicScore {
    const score: IMusicScore = {
      measures: [],
      metadata: {}
    }

    while (!this.tokenStream.isAtEnd()) {
      try {
        const element = this.parseElement()
        if (element) {
          if ('elementType' in element) {
            if (element.elementType === 'clef') {
              score.clef = element as IClef
            } else if (element.elementType === 'timeSignature') {
              score.timeSignature = element as ITimeSignature
            } else {
              this.currentMeasure.push(element as MusicElement)
            }
          } else if ('type' in element && element.type === 'bar') {
            this.finalizeMeasure()
          }
        }
      } catch (error) {
        this.handleParseError(error as Error)
        if (this.errors.length >= this.options.maxErrors) {
          break
        }
      }
    }

    this.finalizeMeasure()
    score.measures = this.measures

    return score
  }

  private parseElement(): MusicElement | IClef | ITimeSignature | { type: 'bar' } | null {
    const current = this.tokenStream.current()

    switch (current.type) {
    case TokenType.IDENTIFIER:
      return this.parseIdentifierElement()
    case TokenType.NOTE:
      return this.parseNote()
    case TokenType.REST:
      return this.parseRest()
    case TokenType.PIPE:
      this.tokenStream.advance()
      return { type: 'bar' }
    case TokenType.EOF:
      return null
    default:
      this.addError(`Unexpected token: ${current.type}`)
      this.tokenStream.advance()
      return null
    }
  }

  private parseIdentifierElement(): IClef | ITimeSignature | null {
    const identifier = this.tokenStream.current()
    
    if (identifier.value.toLowerCase() === 'clef') {
      return this.parseClef()
    } else if (identifier.value.toLowerCase() === 'time') {
      return this.parseTimeSignature()
    }

    this.addError(`Unknown identifier: ${identifier.value}`)
    this.tokenStream.advance()
    return null
  }

  private parseNote(): INote {
    const noteToken = this.tokenStream.advance()
    const noteName = noteToken.value.toUpperCase()
    
    if (!this.isValidNoteName(noteName)) {
      throw new Error(`Invalid note name: ${noteName}`)
    }

    let accidental: Accidental | undefined
    let octave: number

    if (this.tokenStream.match(TokenType.ACCIDENTAL)) {
      const accidentalToken = this.tokenStream.advance()
      accidental = accidentalToken.value as Accidental
    }

    if (this.tokenStream.match(TokenType.NUMBER)) {
      const octaveToken = this.tokenStream.advance()
      octave = parseInt(octaveToken.value)
      if (isNaN(octave) || octave < 0 || octave > 9) {
        throw new Error(`Invalid octave: ${octaveToken.value}`)
      }
    } else {
      throw new Error('Expected octave number after note')
    }

    if (!this.tokenStream.match(TokenType.DURATION)) {
      throw new Error('Expected duration after note')
    }

    const durationToken = this.tokenStream.advance()
    const duration = durationToken.value as Duration

    if (!this.isValidDuration(duration)) {
      throw new Error(`Invalid duration: ${duration}`)
    }

    const pitch: IPitch = {
      note: noteName as NoteName,
      octave
    }
    
    if (accidental !== undefined) {
      pitch.accidental = accidental
    }

    return {
      elementType: 'note',
      pitch,
      duration,
      position: this.getTokenPosition(noteToken)
    }
  }

  private parseRest(): IRest {
    const restToken = this.tokenStream.advance()

    if (!this.tokenStream.match(TokenType.DURATION)) {
      throw new Error('Expected duration after rest')
    }

    const durationToken = this.tokenStream.advance()
    const duration = durationToken.value as Duration

    if (!this.isValidDuration(duration)) {
      throw new Error(`Invalid duration: ${duration}`)
    }

    return {
      elementType: 'rest',
      duration,
      position: this.getTokenPosition(restToken)
    }
  }

  private parseClef(): IClef {
    const clefToken = this.tokenStream.advance()

    if (!this.tokenStream.match(TokenType.COLON)) {
      throw new Error('Expected colon after clef')
    }
    this.tokenStream.advance()

    if (!this.tokenStream.match(TokenType.CLEF)) {
      throw new Error('Expected clef type after colon')
    }

    const clefTypeToken = this.tokenStream.advance()
    const clefType = clefTypeToken.value.toLowerCase() as ClefType

    if (!this.isValidClefType(clefType)) {
      throw new Error(`Invalid clef type: ${clefType}`)
    }

    return {
      elementType: 'clef',
      type: clefType,
      position: this.getTokenPosition(clefToken)
    }
  }

  private parseTimeSignature(): ITimeSignature {
    const timeToken = this.tokenStream.advance()

    if (!this.tokenStream.match(TokenType.COLON)) {
      throw new Error('Expected colon after time')
    }
    this.tokenStream.advance()

    if (!this.tokenStream.match(TokenType.NUMBER)) {
      throw new Error('Expected numerator after time:')
    }

    const numeratorToken = this.tokenStream.advance()
    const numerator = parseInt(numeratorToken.value)

    if (!this.tokenStream.match(TokenType.SLASH)) {
      throw new Error('Expected slash after numerator')
    }
    this.tokenStream.advance()

    if (!this.tokenStream.match(TokenType.NUMBER)) {
      throw new Error('Expected denominator after slash')
    }

    const denominatorToken = this.tokenStream.advance()
    const denominator = parseInt(denominatorToken.value)

    if (isNaN(numerator) || isNaN(denominator) || numerator <= 0 || denominator <= 0) {
      throw new Error(`Invalid time signature: ${numerator}/${denominator}`)
    }

    return {
      elementType: 'timeSignature',
      numerator,
      denominator,
      position: this.getTokenPosition(timeToken)
    }
  }

  private finalizeMeasure(): void {
    if (this.currentMeasure.length > 0) {
      const measure: IMeasure = {
        elements: [...this.currentMeasure],
        number: this.measureNumber
      }
      this.measures.push(measure)
      this.currentMeasure = []
      this.measureNumber++
    }
  }

  private isValidNoteName(name: string): boolean {
    return ['C', 'D', 'E', 'F', 'G', 'A', 'B'].includes(name)
  }

  private isValidDuration(duration: string): boolean {
    return ['w', 'h', 'q', 'e', 's'].includes(duration)
  }

  private isValidClefType(clef: string): boolean {
    return ['treble', 'bass', 'alto', 'tenor'].includes(clef)
  }

  private getTokenPosition(token: IToken): IPosition {
    return {
      line: token.line,
      column: token.column,
      position: token.position
    }
  }

  private addError(message: string, token?: IToken): void {
    const error: IParserError = {
      message,
      position: token ? this.getTokenPosition(token) : {
        line: this.tokenStream.current().line,
        column: this.tokenStream.current().column,
        position: this.tokenStream.current().position
      }
    }
    
    if (token) {
      error.token = token
    }
    
    this.errors.push(error)
  }

  private handleParseError(error: Error): void {
    // Include current token information in the error
    const currentToken = this.tokenStream.current()
    this.addError(error.message, currentToken)
    
    // If maxErrors > 1, allow partial parsing to collect multiple errors
    // Otherwise, respect the allowPartialParsing setting
    const shouldContinue = this.options.allowPartialParsing || this.options.maxErrors > 1
    
    if (!shouldContinue) {
      throw error
    }

    this.synchronize()
  }

  private synchronize(): void {
    this.tokenStream.advance()

    while (!this.tokenStream.isAtEnd()) {
      const previous = this.tokenStream.peek(-1)
      if (previous && previous.type === TokenType.PIPE) {
        return
      }

      const current = this.tokenStream.current()
      if (current.type === TokenType.IDENTIFIER || 
          current.type === TokenType.NOTE || 
          current.type === TokenType.REST) {
        return
      }

      this.tokenStream.advance()
    }
  }

  static parseInput(input: string, options?: Partial<IParserOptions>): IParseResult {
    try {
      const lexResult = MusicLexer.tokenizeInput(input, { ignoreWhitespace: true })
      
      if (lexResult.errors.length > 0 && options?.strict !== false) {
        return {
          success: false,
          errors: lexResult.errors,
          tokens: lexResult.tokens
        }
      }

      const parser = new MusicParser(lexResult.tokens, options)
      const parseResult = parser.parse()

      parseResult.errors = [...lexResult.errors, ...parseResult.errors]
      parseResult.success = parseResult.success && lexResult.errors.length === 0

      return parseResult
    } catch (error) {
      return {
        success: false,
        errors: [{
          message: 'Failed to parse input: ' + (error as Error).message,
          position: { line: 1, column: 1, position: 0 }
        }],
        tokens: []
      }
    }
  }
}

export { GrammarValidator }