import { describe, it, expect } from 'vitest'
import { MusicLexer, TokenStream } from './lexer'
import { TokenType } from '../types/music'

describe('MusicLexer', () => {
  describe('Basic Tokenization', () => {
    it('should tokenize note names', () => {
      const lexer = new MusicLexer('C D E F G A B', { ignoreWhitespace: true })
      const { tokens } = lexer.tokenize()
      
      const noteTokens = tokens.filter(t => t.type === TokenType.NOTE)
      expect(noteTokens).toHaveLength(7)
      expect(noteTokens.map(t => t.value)).toEqual(['C', 'D', 'E', 'F', 'G', 'A', 'B'])
    })

    it('should tokenize accidentals', () => {
      const lexer = new MusicLexer('C# Bb', { ignoreWhitespace: true })
      const { tokens } = lexer.tokenize()
      
      expect(tokens[0]).toEqual(expect.objectContaining({ type: TokenType.NOTE, value: 'C' }))
      expect(tokens[1]).toEqual(expect.objectContaining({ type: TokenType.ACCIDENTAL, value: '#' }))
      expect(tokens[2]).toEqual(expect.objectContaining({ type: TokenType.NOTE, value: 'B' }))
      expect(tokens[3]).toEqual(expect.objectContaining({ type: TokenType.ACCIDENTAL, value: 'b' }))
    })

    it('should tokenize numbers', () => {
      const lexer = new MusicLexer('C4 D5 E6', { ignoreWhitespace: true })
      const { tokens } = lexer.tokenize()
      
      const numberTokens = tokens.filter(t => t.type === TokenType.NUMBER)
      expect(numberTokens).toHaveLength(3)
      expect(numberTokens.map(t => t.value)).toEqual(['4', '5', '6'])
    })

    it('should tokenize durations', () => {
      const lexer = new MusicLexer('w h q e s', { ignoreWhitespace: true })
      const { tokens } = lexer.tokenize()
      
      const durationTokens = tokens.filter(t => t.type === TokenType.DURATION)
      expect(durationTokens).toHaveLength(5)
      expect(durationTokens.map(t => t.value)).toEqual(['w', 'h', 'q', 'e', 's'])
    })

    it('should tokenize clef types', () => {
      const lexer = new MusicLexer('treble bass alto tenor', { ignoreWhitespace: true })
      const { tokens } = lexer.tokenize()
      
      const clefTokens = tokens.filter(t => t.type === TokenType.CLEF)
      expect(clefTokens).toHaveLength(4)
      expect(clefTokens.map(t => t.value)).toEqual(['treble', 'bass', 'alto', 'tenor'])
    })

    it('should tokenize special characters', () => {
      const lexer = new MusicLexer('clef: time: 4/4 | |', { ignoreWhitespace: true })
      const { tokens } = lexer.tokenize()
      
      expect(tokens.filter(t => t.type === TokenType.COLON)).toHaveLength(2)
      expect(tokens.filter(t => t.type === TokenType.SLASH)).toHaveLength(1)
      expect(tokens.filter(t => t.type === TokenType.PIPE)).toHaveLength(2)
    })

    it('should tokenize rest', () => {
      const lexer = new MusicLexer('r q r h', { ignoreWhitespace: true })
      const { tokens } = lexer.tokenize()
      
      const restTokens = tokens.filter(t => t.type === TokenType.REST)
      expect(restTokens).toHaveLength(2)
      expect(restTokens.map(t => t.value)).toEqual(['r', 'r'])
    })
  })

  describe('Complex Examples', () => {
    it('should tokenize complete note with accidental and duration', () => {
      const lexer = new MusicLexer('C#4 q', { ignoreWhitespace: true })
      const { tokens } = lexer.tokenize()
      
      expect(tokens[0]).toEqual(expect.objectContaining({ type: TokenType.NOTE, value: 'C' }))
      expect(tokens[1]).toEqual(expect.objectContaining({ type: TokenType.ACCIDENTAL, value: '#' }))
      expect(tokens[2]).toEqual(expect.objectContaining({ type: TokenType.NUMBER, value: '4' }))
      expect(tokens[3]).toEqual(expect.objectContaining({ type: TokenType.DURATION, value: 'q' }))
    })

    it('should tokenize clef declaration', () => {
      const lexer = new MusicLexer('clef: treble', { ignoreWhitespace: true })
      const { tokens } = lexer.tokenize()
      
      expect(tokens[0]).toEqual(expect.objectContaining({ type: TokenType.IDENTIFIER, value: 'clef' }))
      expect(tokens[1]).toEqual(expect.objectContaining({ type: TokenType.COLON, value: ':' }))
      expect(tokens[2]).toEqual(expect.objectContaining({ type: TokenType.CLEF, value: 'treble' }))
    })

    it('should tokenize time signature', () => {
      const lexer = new MusicLexer('time: 4/4', { ignoreWhitespace: true })
      const { tokens } = lexer.tokenize()
      
      expect(tokens[0]).toEqual(expect.objectContaining({ type: TokenType.IDENTIFIER, value: 'time' }))
      expect(tokens[1]).toEqual(expect.objectContaining({ type: TokenType.COLON, value: ':' }))
      expect(tokens[2]).toEqual(expect.objectContaining({ type: TokenType.NUMBER, value: '4' }))
      expect(tokens[3]).toEqual(expect.objectContaining({ type: TokenType.SLASH, value: '/' }))
      expect(tokens[4]).toEqual(expect.objectContaining({ type: TokenType.NUMBER, value: '4' }))
    })

    it('should tokenize measure with multiple notes', () => {
      const lexer = new MusicLexer('C4 q D4 q E4 h | F4 w', { ignoreWhitespace: true })
      const { errors } = lexer.tokenize()
      
      expect(errors).toHaveLength(0)
    })
  })

  describe('Position Tracking', () => {
    it('should track line and column positions', () => {
      const input = 'C4 q\nD4 h'
      const lexer = new MusicLexer(input, { ignoreWhitespace: false })
      const { tokens } = lexer.tokenize()
      
      expect(tokens[0]).toEqual(expect.objectContaining({ 
        type: TokenType.NOTE, 
        value: 'C', 
        line: 1, 
        column: 1 
      }))
      
      const newlineToken = tokens.find(t => t.type === TokenType.NEWLINE)
      expect(newlineToken).toBeDefined()
      
      const dToken = tokens.find(t => t.value === 'D')
      expect(dToken).toEqual(expect.objectContaining({ 
        line: 2, 
        column: 1 
      }))
    })
  })

  describe('Error Handling', () => {
    it('should handle unexpected characters', () => {
      const lexer = new MusicLexer('C4 @ D4', { ignoreWhitespace: true })
      const { errors } = lexer.tokenize()
      
      expect(errors).toHaveLength(1)
      expect(errors[0].message).toContain('Unexpected character')
    })

    it('should continue parsing after errors', () => {
      const lexer = new MusicLexer('C4 @ D4 q', { ignoreWhitespace: true })
      const { tokens, errors } = lexer.tokenize()
      
      expect(errors).toHaveLength(1)
      expect(tokens.filter(t => t.type === TokenType.NOTE)).toHaveLength(2)
    })
  })

  describe('Static tokenizeInput method', () => {
    it('should work as static method', () => {
      const result = MusicLexer.tokenizeInput('C4 q', { ignoreWhitespace: true })
      
      expect(result.tokens).toHaveLength(4) // C, 4, q, EOF
      expect(result.errors).toHaveLength(0)
    })
  })
})

describe('TokenStream', () => {
  const createTokenStream = (input: string) => {
    const { tokens } = MusicLexer.tokenizeInput(input, { ignoreWhitespace: true })
    return new TokenStream(tokens)
  }

  describe('Navigation', () => {
    it('should provide current token', () => {
      const stream = createTokenStream('C4 q')
      
      expect(stream.current().type).toBe(TokenType.NOTE)
      expect(stream.current().value).toBe('C')
    })

    it('should advance through tokens', () => {
      const stream = createTokenStream('C4 q')
      
      expect(stream.advance().type).toBe(TokenType.NOTE)
      expect(stream.current().type).toBe(TokenType.NUMBER)
      expect(stream.advance().type).toBe(TokenType.NUMBER)
      expect(stream.current().type).toBe(TokenType.DURATION)
    })

    it('should peek ahead', () => {
      const stream = createTokenStream('C4 q D5')
      
      expect(stream.current().value).toBe('C')
      expect(stream.peek().value).toBe('4')
      expect(stream.peek(2).value).toBe('q')
      expect(stream.current().value).toBe('C') // Should not have moved
    })

    it('should detect end of stream', () => {
      const stream = createTokenStream('C')
      
      expect(stream.isAtEnd()).toBe(false)
      stream.advance() // C
      stream.advance() // EOF
      expect(stream.isAtEnd()).toBe(true)
    })
  })

  describe('Token Matching', () => {
    it('should match token types', () => {
      const stream = createTokenStream('C4 q')
      
      expect(stream.match(TokenType.NOTE)).toBe(true)
      expect(stream.match(TokenType.DURATION)).toBe(false)
      expect(stream.match(TokenType.NOTE, TokenType.REST)).toBe(true)
    })

    it('should consume expected tokens', () => {
      const stream = createTokenStream('C4 q')
      
      const noteToken = stream.consume(TokenType.NOTE)
      expect(noteToken.value).toBe('C')
      expect(stream.current().type).toBe(TokenType.NUMBER)
    })

    it('should throw on consume mismatch', () => {
      const stream = createTokenStream('C4 q')
      
      expect(() => stream.consume(TokenType.DURATION)).toThrow()
    })
  })

  describe('Reset and Position', () => {
    it('should track and reset position', () => {
      const stream = createTokenStream('C4 q')
      
      expect(stream.getPosition()).toBe(0)
      stream.advance()
      expect(stream.getPosition()).toBe(1)
      
      stream.reset()
      expect(stream.getPosition()).toBe(0)
      expect(stream.current().value).toBe('C')
    })
  })
})