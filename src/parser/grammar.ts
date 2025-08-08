import { TokenType } from '../types/music'

export const GRAMMAR_PATTERNS = {
  NOTE_NAME: /^[A-G]$/,
  ACCIDENTAL: /^[#b]$/,
  OCTAVE: /^[0-9]$/,
  DURATION: /^[whqes]$/,
  CLEF: /^(treble|bass|alto|tenor)$/,
  TIME_SIGNATURE_NUM: /^\d+$/,
  BAR_LINE: /^\|$/,
  REST: /^r$/,
  WHITESPACE: /^\s$/,
  NEWLINE: /^\n$/,
  COLON: /^:$/,
  SLASH: /^\/$/,
  IDENTIFIER: /^[a-zA-Z_][a-zA-Z0-9_]*$/,
  NUMBER: /^\d+$/
} as const

export const KEYWORDS = {
  CLEFS: ['treble', 'bass', 'alto', 'tenor'],
  DURATIONS: ['w', 'h', 'q', 'e', 's'],
  NOTES: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
  ACCIDENTALS: ['#', 'b'],
  REST: ['r']
} as const

export interface IGrammarRule {
  name: string
  pattern: string
  description: string
  examples: string[]
}

export const GRAMMAR_RULES: IGrammarRule[] = [
  {
    name: 'note',
    pattern: '<note-name>[<accidental>]<octave> <duration>',
    description: 'A musical note with pitch and duration',
    examples: ['C4 q', 'F#5 h', 'Bb3 e']
  },
  {
    name: 'rest',
    pattern: 'r <duration>',
    description: 'A rest with specified duration',
    examples: ['r q', 'r h', 'r w']
  },
  {
    name: 'clef',
    pattern: 'clef: <clef-type>',
    description: 'Clef specification',
    examples: ['clef: treble', 'clef: bass']
  },
  {
    name: 'time-signature',
    pattern: 'time: <numerator>/<denominator>',
    description: 'Time signature specification',
    examples: ['time: 4/4', 'time: 3/4', 'time: 6/8']
  },
  {
    name: 'measure-separator',
    pattern: '|',
    description: 'Measure/bar line separator',
    examples: ['|']
  },
  {
    name: 'score-structure',
    pattern: '[clef] [time] <measures>',
    description: 'Complete score structure',
    examples: [
      'clef: treble\ntime: 4/4\nC4 q D4 q E4 h | F4 w',
      'bass\n3/4\nC3 q D3 q E3 q | F3 h.'
    ]
  }
]

export class GrammarValidator {
  static validateNotePattern(input: string): boolean {
    const notePattern = /^[A-G][#b]?\d+\s+[whqes]$/
    return notePattern.test(input.trim())
  }

  static validateRestPattern(input: string): boolean {
    const restPattern = /^r\s+[whqes]$/
    return restPattern.test(input.trim())
  }

  static validateClefPattern(input: string): boolean {
    const clefPattern = /^clef:\s*(treble|bass|alto|tenor)$/i
    return clefPattern.test(input.trim())
  }

  static validateTimeSignaturePattern(input: string): boolean {
    const timePattern = /^time:\s*\d+\/\d+$/i
    return timePattern.test(input.trim())
  }

  static validateMeasurePattern(input: string): boolean {
    const elements = input.split(/\s+/).filter(el => el.length > 0)
    
    for (const element of elements) {
      if (element === '|') continue
      if (this.validateNotePattern(element) || this.validateRestPattern(element)) {
        continue
      }
      return false
    }
    
    return true
  }

  static getExpectedTokens(context: string): TokenType[] {
    switch (context) {
    case 'start':
      return [TokenType.CLEF, TokenType.TIME_SIGNATURE, TokenType.NOTE, TokenType.REST]
    case 'after-clef':
      return [TokenType.TIME_SIGNATURE, TokenType.NOTE, TokenType.REST]
    case 'after-time':
      return [TokenType.NOTE, TokenType.REST, TokenType.PIPE]
    case 'in-measure':
      return [TokenType.NOTE, TokenType.REST, TokenType.PIPE]
    case 'after-note-name':
      return [TokenType.ACCIDENTAL, TokenType.OCTAVE]
    case 'after-accidental':
      return [TokenType.OCTAVE]
    case 'after-octave':
      return [TokenType.DURATION]
    default:
      return []
    }
  }
}

export const PRECEDENCE = {
  CLEF: 1,
  TIME_SIGNATURE: 2,
  NOTE: 3,
  REST: 3,
  BAR: 4
} as const

export type PrecedenceLevel = typeof PRECEDENCE[keyof typeof PRECEDENCE]