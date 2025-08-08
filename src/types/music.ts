export enum TokenType {
  NOTE = 'NOTE',
  DURATION = 'DURATION',
  CLEF = 'CLEF',
  TIME_SIGNATURE = 'TIME_SIGNATURE',
  BAR = 'BAR',
  REST = 'REST',
  ACCIDENTAL = 'ACCIDENTAL',
  OCTAVE = 'OCTAVE',
  WHITESPACE = 'WHITESPACE',
  NEWLINE = 'NEWLINE',
  COLON = 'COLON',
  PIPE = 'PIPE',
  SLASH = 'SLASH',
  IDENTIFIER = 'IDENTIFIER',
  NUMBER = 'NUMBER',
  EOF = 'EOF',
  UNKNOWN = 'UNKNOWN'
}

export interface IToken {
  type: TokenType
  value: string
  line: number
  column: number
  position: number
}

export interface IPosition {
  line: number
  column: number
  position: number
}

export enum NoteName {
  C = 'C',
  D = 'D',
  E = 'E',
  F = 'F',
  G = 'G',
  A = 'A',
  B = 'B'
}

export enum Accidental {
  SHARP = '#',
  FLAT = 'b',
  NATURAL = 'n'
}

export enum Duration {
  WHOLE = 'w',
  HALF = 'h',
  QUARTER = 'q',
  EIGHTH = 'e',
  SIXTEENTH = 's'
}

export enum ClefType {
  TREBLE = 'treble',
  BASS = 'bass',
  ALTO = 'alto',
  TENOR = 'tenor'
}

export interface IPitch {
  note: NoteName
  accidental?: Accidental
  octave: number
}

export interface INote {
  elementType: 'note'
  pitch: IPitch
  duration: Duration
  position: IPosition
}

export interface IRest {
  elementType: 'rest'
  duration: Duration
  position: IPosition
}

export interface IClef {
  elementType: 'clef'
  type: ClefType
  position: IPosition
}

export interface ITimeSignature {
  elementType: 'timeSignature'
  numerator: number
  denominator: number
  position: IPosition
}

export interface IBar {
  elementType: 'bar'
  position: IPosition
}

export type MusicElement = INote | IRest | IClef | ITimeSignature | IBar

export interface IMeasure {
  elements: MusicElement[]
  number: number
}

export interface IMusicScore {
  clef?: IClef
  timeSignature?: ITimeSignature
  measures: IMeasure[]
  metadata: {
    title?: string
    composer?: string
    key?: string
  }
}

export interface IParserError {
  message: string
  position: IPosition
  token?: IToken
  expected?: string[]
}

export interface IParseResult {
  success: boolean
  score?: IMusicScore
  errors: IParserError[]
  tokens: IToken[]
}

export interface ILexerOptions {
  ignoreWhitespace: boolean
  includePosition: boolean
}

export interface IParserOptions {
  strict: boolean
  allowPartialParsing: boolean
  maxErrors: number
}