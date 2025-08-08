import { describe, it, expect } from 'vitest'
import { MusicParser } from './parser'
import { GrammarValidator } from './grammar'
import { TokenType, NoteName, Accidental, Duration, ClefType } from '../types/music'

describe('MusicParser', () => {
  describe('Note Parsing', () => {
    it('should parse simple note', () => {
      const result = MusicParser.parseInput('C4 q')
      
      expect(result.success).toBe(true)
      expect(result.score?.measures).toHaveLength(1)
      
      const note = result.score?.measures[0]?.elements[0]
      expect(note).toBeDefined()
      if (note && note.elementType === 'note') {
        expect(note.pitch.note).toBe(NoteName.C)
        expect(note.pitch.octave).toBe(4)
        expect(note.duration).toBe(Duration.QUARTER)
        expect(note.pitch.accidental).toBeUndefined()
      }
    })

    it('should parse note with sharp', () => {
      const result = MusicParser.parseInput('F#5 h')
      
      expect(result.success).toBe(true)
      const note = result.score?.measures[0]?.elements[0]
      if (note && note.elementType === 'note') {
        expect(note.pitch.note).toBe(NoteName.F)
        expect(note.pitch.accidental).toBe(Accidental.SHARP)
        expect(note.pitch.octave).toBe(5)
        expect(note.duration).toBe(Duration.HALF)
      }
    })

    it('should parse note with flat', () => {
      const result = MusicParser.parseInput('Bb3 e')
      
      expect(result.success).toBe(true)
      const note = result.score?.measures[0]?.elements[0]
      if (note && note.elementType === 'note') {
        expect(note.pitch.note).toBe(NoteName.B)
        expect(note.pitch.accidental).toBe(Accidental.FLAT)
        expect(note.pitch.octave).toBe(3)
        expect(note.duration).toBe(Duration.EIGHTH)
      }
    })

    it('should parse multiple notes', () => {
      const result = MusicParser.parseInput('C4 q D4 q E4 h')
      
      expect(result.success).toBe(true)
      expect(result.score?.measures[0]?.elements).toHaveLength(3)
      
      const notes = result.score?.measures[0]?.elements
      if (notes) {
        expect(notes.every(n => n.elementType === 'note')).toBe(true)
        const pitches = notes.map(n => n.elementType === 'note' ? n.pitch.note : null)
        expect(pitches).toEqual([NoteName.C, NoteName.D, NoteName.E])
      }
    })
  })

  describe('Rest Parsing', () => {
    it('should parse rest', () => {
      const result = MusicParser.parseInput('r q')
      
      expect(result.success).toBe(true)
      const rest = result.score?.measures[0]?.elements[0]
      expect(rest).toBeDefined()
      if (rest && rest.elementType === 'rest') {
        expect(rest.duration).toBe(Duration.QUARTER)
      }
    })

    it('should parse multiple rests with different durations', () => {
      const result = MusicParser.parseInput('r w r h r q')
      
      expect(result.success).toBe(true)
      const elements = result.score?.measures[0]?.elements
      expect(elements).toHaveLength(3)
      
      if (elements) {
        const durations = elements.map(e => e.elementType === 'rest' ? e.duration : null)
        expect(durations).toEqual([Duration.WHOLE, Duration.HALF, Duration.QUARTER])
      }
    })
  })

  describe('Clef Parsing', () => {
    it('should parse treble clef', () => {
      const result = MusicParser.parseInput('clef: treble')
      
      expect(result.success).toBe(true)
      expect(result.score?.clef).toBeDefined()
      expect(result.score?.clef?.type).toBe(ClefType.TREBLE)
    })

    it('should parse bass clef', () => {
      const result = MusicParser.parseInput('clef: bass')
      
      expect(result.success).toBe(true)
      expect(result.score?.clef?.type).toBe(ClefType.BASS)
    })

    it('should parse alto clef', () => {
      const result = MusicParser.parseInput('clef: alto')
      
      expect(result.success).toBe(true)
      expect(result.score?.clef?.type).toBe(ClefType.ALTO)
    })

    it('should parse tenor clef', () => {
      const result = MusicParser.parseInput('clef: tenor')
      
      expect(result.success).toBe(true)
      expect(result.score?.clef?.type).toBe(ClefType.TENOR)
    })
  })

  describe('Time Signature Parsing', () => {
    it('should parse 4/4 time signature', () => {
      const result = MusicParser.parseInput('time: 4/4')
      
      expect(result.success).toBe(true)
      expect(result.score?.timeSignature).toBeDefined()
      expect(result.score?.timeSignature?.numerator).toBe(4)
      expect(result.score?.timeSignature?.denominator).toBe(4)
    })

    it('should parse 3/4 time signature', () => {
      const result = MusicParser.parseInput('time: 3/4')
      
      expect(result.success).toBe(true)
      expect(result.score?.timeSignature?.numerator).toBe(3)
      expect(result.score?.timeSignature?.denominator).toBe(4)
    })

    it('should parse 6/8 time signature', () => {
      const result = MusicParser.parseInput('time: 6/8')
      
      expect(result.success).toBe(true)
      expect(result.score?.timeSignature?.numerator).toBe(6)
      expect(result.score?.timeSignature?.denominator).toBe(8)
    })
  })

  describe('Measure Parsing', () => {
    it('should parse single measure', () => {
      const result = MusicParser.parseInput('C4 q D4 q E4 h')
      
      expect(result.success).toBe(true)
      expect(result.score?.measures).toHaveLength(1)
      expect(result.score?.measures[0]?.elements).toHaveLength(3)
      expect(result.score?.measures[0]?.number).toBe(1)
    })

    it('should parse multiple measures', () => {
      const result = MusicParser.parseInput('C4 q D4 q | E4 h F4 h | G4 w')
      
      expect(result.success).toBe(true)
      expect(result.score?.measures).toHaveLength(3)
      expect(result.score?.measures[0]?.elements).toHaveLength(2)
      expect(result.score?.measures[1]?.elements).toHaveLength(2)
      expect(result.score?.measures[2]?.elements).toHaveLength(1)
      
      const measureNumbers = result.score?.measures.map(m => m.number)
      expect(measureNumbers).toEqual([1, 2, 3])
    })

    it('should handle empty measures', () => {
      const result = MusicParser.parseInput('C4 q | | D4 q')
      
      expect(result.success).toBe(true)
      expect(result.score?.measures).toHaveLength(2)
      expect(result.score?.measures[0]?.elements).toHaveLength(1)
      expect(result.score?.measures[1]?.elements).toHaveLength(1)
    })
  })

  describe('Complete Score Parsing', () => {
    it('should parse complete score with clef, time signature, and notes', () => {
      const input = `clef: treble
time: 4/4
C4 q D4 q E4 h | F4 q G4 q A4 h`
      
      const result = MusicParser.parseInput(input)
      
      expect(result.success).toBe(true)
      expect(result.score?.clef?.type).toBe(ClefType.TREBLE)
      expect(result.score?.timeSignature?.numerator).toBe(4)
      expect(result.score?.timeSignature?.denominator).toBe(4)
      expect(result.score?.measures).toHaveLength(2)
    })

    it('should parse mixed notes and rests', () => {
      const input = 'C4 q r q E4 h | r w'
      
      const result = MusicParser.parseInput(input)
      
      expect(result.success).toBe(true)
      expect(result.score?.measures).toHaveLength(2)
      
      const firstMeasure = result.score?.measures[0]?.elements
      expect(firstMeasure).toHaveLength(3)
      expect(firstMeasure![0]?.elementType).toBe('note')
      expect(firstMeasure![1]?.elementType).toBe('rest')
      expect(firstMeasure![2]?.elementType).toBe('note')
    })
  })

  describe('Error Handling', () => {
    it('should report invalid note names', () => {
      const result = MusicParser.parseInput('H4 q')
      
      expect(result.success).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0]?.message).toContain('Invalid note name')
    })

    it('should report missing octave', () => {
      const result = MusicParser.parseInput('C q')
      
      expect(result.success).toBe(false)
      expect(result.errors[0]?.message).toContain('Expected octave number')
    })

    it('should report missing duration', () => {
      const result = MusicParser.parseInput('C4')
      
      expect(result.success).toBe(false)
      expect(result.errors[0]?.message).toContain('Expected duration')
    })

    it('should report invalid clef syntax', () => {
      const result = MusicParser.parseInput('clef treble')
      
      expect(result.success).toBe(false)
      expect(result.errors[0]?.message).toContain('Expected colon after clef')
    })

    it('should report invalid time signature syntax', () => {
      const result = MusicParser.parseInput('time 4/4')
      
      expect(result.success).toBe(false)
      expect(result.errors[0]?.message).toContain('Expected colon after time')
    })

    it('should report invalid time signature values', () => {
      const result = MusicParser.parseInput('time: 0/4')
      
      expect(result.success).toBe(false)
      expect(result.errors[0]?.message).toContain('Invalid time signature')
    })

    it('should handle multiple errors', () => {
      const result = MusicParser.parseInput('H4 q I5 z', { maxErrors: 10 })
      
      expect(result.success).toBe(false)
      expect(result.errors.length).toBeGreaterThan(1)
    })

    it('should limit error count', () => {
      const result = MusicParser.parseInput('H4 q I5 z J6 x', { maxErrors: 1 })
      
      expect(result.success).toBe(false)
      expect(result.errors).toHaveLength(1)
    })
  })

  describe('Parser Options', () => {
    it('should support partial parsing', () => {
      const result = MusicParser.parseInput('C4 q H4 q D4 q', { 
        allowPartialParsing: true,
        maxErrors: 10 
      })
      
      expect(result.success).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.score?.measures[0]?.elements.length).toBeGreaterThan(0)
    })

    it('should support non-strict mode', () => {
      const result = MusicParser.parseInput('C4 @ q', { strict: false })
      
      expect(result.errors.length).toBeGreaterThan(0)
    })
  })

  describe('Position Information', () => {
    it('should include position information in parsed elements', () => {
      const result = MusicParser.parseInput('C4 q')
      
      expect(result.success).toBe(true)
      const note = result.score?.measures[0]?.elements[0]
      expect(note?.position).toBeDefined()
      expect(note?.position.line).toBe(1)
      expect(note?.position.column).toBe(1)
    })

    it('should include position information in errors', () => {
      const result = MusicParser.parseInput('H4 q')
      
      expect(result.success).toBe(false)
      expect(result.errors[0]?.position).toBeDefined()
      expect(result.errors[0]?.token).toBeDefined()
    })
  })
})

describe('GrammarValidator', () => {
  describe('Pattern Validation', () => {
    it('should validate note patterns', () => {
      expect(GrammarValidator.validateNotePattern('C4 q')).toBe(true)
      expect(GrammarValidator.validateNotePattern('F#5 h')).toBe(true)
      expect(GrammarValidator.validateNotePattern('Bb3 e')).toBe(true)
      expect(GrammarValidator.validateNotePattern('C4')).toBe(false)
      expect(GrammarValidator.validateNotePattern('H4 q')).toBe(false)
    })

    it('should validate rest patterns', () => {
      expect(GrammarValidator.validateRestPattern('r q')).toBe(true)
      expect(GrammarValidator.validateRestPattern('r w')).toBe(true)
      expect(GrammarValidator.validateRestPattern('r')).toBe(false)
      expect(GrammarValidator.validateRestPattern('rest q')).toBe(false)
    })

    it('should validate clef patterns', () => {
      expect(GrammarValidator.validateClefPattern('clef: treble')).toBe(true)
      expect(GrammarValidator.validateClefPattern('clef: bass')).toBe(true)
      expect(GrammarValidator.validateClefPattern('clef treble')).toBe(false)
      expect(GrammarValidator.validateClefPattern('clef: invalid')).toBe(false)
    })

    it('should validate time signature patterns', () => {
      expect(GrammarValidator.validateTimeSignaturePattern('time: 4/4')).toBe(true)
      expect(GrammarValidator.validateTimeSignaturePattern('time: 3/4')).toBe(true)
      expect(GrammarValidator.validateTimeSignaturePattern('time: 6/8')).toBe(true)
      expect(GrammarValidator.validateTimeSignaturePattern('time 4/4')).toBe(false)
      expect(GrammarValidator.validateTimeSignaturePattern('time: 4')).toBe(false)
    })
  })

  describe('Expected Tokens', () => {
    it('should return expected tokens for different contexts', () => {
      const startTokens = GrammarValidator.getExpectedTokens('start')
      expect(startTokens).toContain(TokenType.CLEF)
      expect(startTokens).toContain(TokenType.TIME_SIGNATURE)
      expect(startTokens).toContain(TokenType.NOTE)

      const afterClefTokens = GrammarValidator.getExpectedTokens('after-clef')
      expect(afterClefTokens).toContain(TokenType.TIME_SIGNATURE)
      expect(afterClefTokens).toContain(TokenType.NOTE)

      const afterOctaveTokens = GrammarValidator.getExpectedTokens('after-octave')
      expect(afterOctaveTokens).toContain(TokenType.DURATION)
    })

    it('should return empty array for unknown context', () => {
      const tokens = GrammarValidator.getExpectedTokens('unknown-context')
      expect(tokens).toEqual([])
    })
  })
})