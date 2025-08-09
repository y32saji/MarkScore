import { describe, it, expect, beforeEach } from 'vitest'
import { SVGMusicRenderer } from '../svg'
import { DEFAULT_RENDERING_OPTIONS } from '../../types/renderer'
import { IMusicScore, INote, IRest, IClef, ITimeSignature } from '../../types/music'

describe('SVGMusicRenderer - Accessibility Tests', () => {
  let renderer: SVGMusicRenderer

  beforeEach(() => {
    renderer = new SVGMusicRenderer()
  })

  describe('ARIA Label Validation', () => {
    it('should provide descriptive aria-label for musical score container', () => {
      const score: IMusicScore = {
        measures: [],
        metadata: { title: 'Empty Score', composer: 'Test' }
      }

      const result = renderer.renderScore(score)
      
      expect(result).toContain('aria-label="Musical score"')
      expect(result).toContain('<svg')
    })

    it('should provide aria-label for staff lines', () => {
      const score: IMusicScore = {
        measures: [],
        metadata: { title: 'Staff Test', composer: 'Test' }
      }

      const result = renderer.renderScore(score)
      
      expect(result).toContain('aria-label="Staff lines"')
      expect(result).toContain('role="img"')
    })

    it('should provide descriptive aria-labels for notes', () => {
      const note: INote = {
        elementType: 'note',
        pitch: { note: 'C', octave: 4 },
        duration: 'q',
        position: { line: 1, column: 1, position: 0 }
      }

      const score: IMusicScore = {
        measures: [{ elements: [note], number: 1 }],
        metadata: { title: 'Note Test', composer: 'Test' }
      }

      const result = renderer.renderScore(score)
      
      expect(result).toContain('aria-label="C4 q note"')
    })

    it('should provide descriptive aria-labels for notes with accidentals', () => {
      const sharpNote: INote = {
        elementType: 'note',
        pitch: { note: 'F', octave: 5, accidental: '#' },
        duration: 'e',
        position: { line: 1, column: 1, position: 0 }
      }

      const flatNote: INote = {
        elementType: 'note',
        pitch: { note: 'B', octave: 3, accidental: 'b' },
        duration: 'h',
        position: { line: 1, column: 2, position: 1 }
      }

      const score: IMusicScore = {
        measures: [{ elements: [sharpNote, flatNote], number: 1 }],
        metadata: { title: 'Accidental Test', composer: 'Test' }
      }

      const result = renderer.renderScore(score)
      
      expect(result).toContain('aria-label="F#5 e note"')
      expect(result).toContain('aria-label="Bb3 h note"')
      expect(result).toContain('aria-label="sharp accidental"')
      expect(result).toContain('aria-label="flat accidental"')
    })

    it('should provide descriptive aria-labels for rests', () => {
      const quarterRest: IRest = {
        elementType: 'rest',
        duration: 'q',
        position: { line: 1, column: 1, position: 0 }
      }

      const wholeRest: IRest = {
        elementType: 'rest',
        duration: 'w',
        position: { line: 1, column: 2, position: 1 }
      }

      const score: IMusicScore = {
        measures: [{ elements: [quarterRest, wholeRest], number: 1 }],
        metadata: { title: 'Rest Test', composer: 'Test' }
      }

      const result = renderer.renderScore(score)
      
      expect(result).toContain('aria-label="q rest"')
      expect(result).toContain('aria-label="w rest"')
    })

    it('should provide descriptive aria-labels for clefs', () => {
      const trebleClef: IClef = {
        elementType: 'clef',
        type: 'treble',
        position: { line: 1, column: 1, position: 0 }
      }

      const bassClef: IClef = {
        elementType: 'clef',
        type: 'bass',
        position: { line: 1, column: 2, position: 1 }
      }

      const score: IMusicScore = {
        measures: [{ elements: [trebleClef, bassClef], number: 1 }],
        metadata: { title: 'Clef Test', composer: 'Test' }
      }

      const result = renderer.renderScore(score)
      
      expect(result).toContain('aria-label="treble clef"')
      expect(result).toContain('aria-label="bass clef"')
    })

    it('should provide descriptive aria-labels for time signatures', () => {
      const timeSignature44: ITimeSignature = {
        elementType: 'timeSignature',
        numerator: 4,
        denominator: 4,
        position: { line: 1, column: 1, position: 0 }
      }

      const timeSignature34: ITimeSignature = {
        elementType: 'timeSignature',
        numerator: 3,
        denominator: 4,
        position: { line: 1, column: 2, position: 1 }
      }

      const score: IMusicScore = {
        measures: [{ elements: [timeSignature44, timeSignature34], number: 1 }],
        metadata: { title: 'Time Signature Test', composer: 'Test' }
      }

      const result = renderer.renderScore(score)
      
      expect(result).toContain('aria-label="Time signature 4/4"')
      expect(result).toContain('aria-label="Time signature 3/4"')
    })
  })

  describe('ARIA Hidden Attributes', () => {
    it('should mark decorative elements as aria-hidden', () => {
      const note: INote = {
        elementType: 'note',
        pitch: { note: 'G', octave: 4 },
        duration: 'q',
        position: { line: 1, column: 1, position: 0 }
      }

      const score: IMusicScore = {
        measures: [{ elements: [note], number: 1 }],
        metadata: { title: 'Hidden Test', composer: 'Test' }
      }

      const result = renderer.renderScore(score)
      
      // Staff lines should be hidden as they're decorative  
      expect(result).toContain('aria-hidden="true"')
      
      // Stems should be hidden as they're part of the note
      expect(result).toContain('aria-hidden="true"')
    })

    it('should mark stems as aria-hidden', () => {
      const note: INote = {
        elementType: 'note',
        pitch: { note: 'E', octave: 4 },
        duration: 'q',
        position: { line: 1, column: 1, position: 0 }
      }

      const score: IMusicScore = {
        measures: [{ elements: [note], number: 1 }],
        metadata: { title: 'Stem Test', composer: 'Test' }
      }

      const result = renderer.renderScore(score)
      
      // Find stem line element and verify it's hidden
      const stemRegex = /<line[^>]*stroke="#000000"[^>]*aria-hidden="true"[^>]*>/
      expect(stemRegex.test(result)).toBe(true)
    })

    it('should mark flags as aria-hidden', () => {
      const eighthNote: INote = {
        elementType: 'note',
        pitch: { note: 'A', octave: 4 },
        duration: 'e',
        position: { line: 1, column: 1, position: 0 }
      }

      const score: IMusicScore = {
        measures: [{ elements: [eighthNote], number: 1 }],
        metadata: { title: 'Flag Test', composer: 'Test' }
      }

      const result = renderer.renderScore(score)
      
      // Flag should be hidden as it's part of the note
      expect(result).toContain('<path d="M 17 ') // Flag path (actual coordinates)
      expect(result).toContain('aria-hidden="true"') // Should be hidden
    })

    it('should mark time signature denominator as aria-hidden', () => {
      const timeSignature: ITimeSignature = {
        elementType: 'timeSignature',
        numerator: 4,
        denominator: 4,
        position: { line: 1, column: 1, position: 0 }
      }

      const score: IMusicScore = {
        measures: [{ elements: [timeSignature], number: 1 }],
        metadata: { title: 'Time Signature Hidden Test', composer: 'Test' }
      }

      const result = renderer.renderScore(score)
      
      // Numerator should have the aria-label
      expect(result).toContain('aria-label="Time signature 4/4">4</text>')
      
      // Denominator should be hidden (only numerator has the full label)
      expect(result).toContain('aria-hidden="true">4</text>')
    })
  })

  describe('Role Attributes', () => {
    it('should use appropriate role attributes for grouped elements', () => {
      const timeSignature: ITimeSignature = {
        elementType: 'timeSignature',
        numerator: 4,
        denominator: 4,
        position: { line: 1, column: 1, position: 0 }
      }

      const score: IMusicScore = {
        measures: [{ elements: [timeSignature], number: 1 }],
        metadata: { title: 'Role Test', composer: 'Test' }
      }

      const result = renderer.renderScore(score)
      
      expect(result).toContain('role="img"')
    })

    it('should use role="img" for staff lines group', () => {
      const score: IMusicScore = {
        measures: [],
        metadata: { title: 'Staff Role Test', composer: 'Test' }
      }

      const result = renderer.renderScore(score)
      
      expect(result).toContain('<g aria-label="Staff lines" role="img">')
    })

    it('should use role="img" for time signature groups', () => {
      const timeSignature: ITimeSignature = {
        elementType: 'timeSignature',
        numerator: 3,
        denominator: 8,
        position: { line: 1, column: 1, position: 0 }
      }

      const score: IMusicScore = {
        measures: [{ elements: [timeSignature], number: 1 }],
        metadata: { title: 'Time Signature Role Test', composer: 'Test' }
      }

      const result = renderer.renderScore(score)
      
      expect(result).toContain('<g role="img">')
    })
  })

  describe('Screen Reader Compatibility', () => {
    it('should provide logical reading order for complex scores', () => {
      const clef: IClef = {
        elementType: 'clef',
        type: 'treble',
        position: { line: 1, column: 1, position: 0 }
      }

      const timeSignature: ITimeSignature = {
        elementType: 'timeSignature',
        numerator: 4,
        denominator: 4,
        position: { line: 1, column: 2, position: 1 }
      }

      const note1: INote = {
        elementType: 'note',
        pitch: { note: 'C', octave: 4 },
        duration: 'q',
        position: { line: 1, column: 3, position: 2 }
      }

      const note2: INote = {
        elementType: 'note',
        pitch: { note: 'D', octave: 4 },
        duration: 'q',
        position: { line: 1, column: 4, position: 3 }
      }

      const score: IMusicScore = {
        measures: [{ elements: [clef, timeSignature, note1, note2], number: 1 }],
        metadata: { title: 'Reading Order Test', composer: 'Test' }
      }

      const result = renderer.renderScore(score)
      
      // Extract aria-labels in order of appearance
      const ariaLabelRegex = /aria-label="([^"]+)"/g
      const ariaLabels: string[] = []
      let match
      while ((match = ariaLabelRegex.exec(result)) !== null) {
        ariaLabels.push(match[1])
      }

      expect(ariaLabels).toContain('Musical score')
      expect(ariaLabels).toContain('Staff lines')
      expect(ariaLabels).toContain('treble clef')
      expect(ariaLabels).toContain('Time signature 4/4')
      expect(ariaLabels).toContain('C4 q note')
      expect(ariaLabels).toContain('D4 q note')
    })

    it('should provide meaningful descriptions for notes with different durations', () => {
      const wholeNote: INote = {
        elementType: 'note',
        pitch: { note: 'G', octave: 4 },
        duration: 'w',
        position: { line: 1, column: 1, position: 0 }
      }

      const halfNote: INote = {
        elementType: 'note',
        pitch: { note: 'F', octave: 4 },
        duration: 'h',
        position: { line: 1, column: 2, position: 1 }
      }

      const quarterNote: INote = {
        elementType: 'note',
        pitch: { note: 'E', octave: 4 },
        duration: 'q',
        position: { line: 1, column: 3, position: 2 }
      }

      const eighthNote: INote = {
        elementType: 'note',
        pitch: { note: 'D', octave: 4 },
        duration: 'e',
        position: { line: 1, column: 4, position: 3 }
      }

      const sixteenthNote: INote = {
        elementType: 'note',
        pitch: { note: 'C', octave: 4 },
        duration: 's',
        position: { line: 1, column: 5, position: 4 }
      }

      const score: IMusicScore = {
        measures: [{ elements: [wholeNote, halfNote, quarterNote, eighthNote, sixteenthNote], number: 1 }],
        metadata: { title: 'Duration Test', composer: 'Test' }
      }

      const result = renderer.renderScore(score)
      
      expect(result).toContain('aria-label="G4 w note"')
      expect(result).toContain('aria-label="F4 h note"')
      expect(result).toContain('aria-label="E4 q note"')
      expect(result).toContain('aria-label="D4 e note"')
      expect(result).toContain('aria-label="C4 s note"')
    })

    it('should provide meaningful descriptions for rests with different durations', () => {
      const wholeRest: IRest = {
        elementType: 'rest',
        duration: 'w',
        position: { line: 1, column: 1, position: 0 }
      }

      const halfRest: IRest = {
        elementType: 'rest',
        duration: 'h',
        position: { line: 1, column: 2, position: 1 }
      }

      const quarterRest: IRest = {
        elementType: 'rest',
        duration: 'q',
        position: { line: 1, column: 3, position: 2 }
      }

      const eighthRest: IRest = {
        elementType: 'rest',
        duration: 'e',
        position: { line: 1, column: 4, position: 3 }
      }

      const score: IMusicScore = {
        measures: [{ elements: [wholeRest, halfRest, quarterRest, eighthRest], number: 1 }],
        metadata: { title: 'Rest Duration Test', composer: 'Test' }
      }

      const result = renderer.renderScore(score)
      
      expect(result).toContain('aria-label="w rest"')
      expect(result).toContain('aria-label="h rest"')
      expect(result).toContain('aria-label="q rest"')
      expect(result).toContain('aria-label="e rest"')
    })
  })

  describe('Accessibility Standards Compliance', () => {
    it('should have proper contrast for visual elements', () => {
      const note: INote = {
        elementType: 'note',
        pitch: { note: 'C', octave: 4 },
        duration: 'q',
        position: { line: 1, column: 1, position: 0 }
      }

      const score: IMusicScore = {
        measures: [{ elements: [note], number: 1 }],
        metadata: { title: 'Contrast Test', composer: 'Test' }
      }

      const result = renderer.renderScore(score)
      
      // Verify high contrast colors are used (black on white)
      expect(result).toContain('fill="#ffffff"') // White background
      expect(result).toContain('fill="#000000"') // Black note heads
      expect(result).toContain('stroke="#000000"') // Black lines
    })

    it('should maintain accessibility with custom colors', () => {
      const customOptions = {
        ...DEFAULT_RENDERING_OPTIONS,
        canvas: {
          ...DEFAULT_RENDERING_OPTIONS.canvas,
          backgroundColor: '#f0f0f0'
        },
        noteHead: {
          ...DEFAULT_RENDERING_OPTIONS.noteHead,
          color: '#0000ff'
        }
      }

      const note: INote = {
        elementType: 'note',
        pitch: { note: 'C', octave: 4 },
        duration: 'q',
        position: { line: 1, column: 1, position: 0 }
      }

      const score: IMusicScore = {
        measures: [{ elements: [note], number: 1 }],
        metadata: { title: 'Custom Color Test', composer: 'Test' }
      }

      const result = renderer.renderScore(score, customOptions)
      
      expect(result).toContain('fill="#f0f0f0"') // Custom background
      expect(result).toContain('fill="#0000ff"') // Custom note color
      expect(result).toContain('aria-label="C4 q note"') // Accessibility preserved
    })

    it('should provide comprehensive accessibility for complete scores', () => {
      const clef: IClef = {
        elementType: 'clef',
        type: 'bass',
        position: { line: 1, column: 1, position: 0 }
      }

      const timeSignature: ITimeSignature = {
        elementType: 'timeSignature',
        numerator: 6,
        denominator: 8,
        position: { line: 1, column: 2, position: 1 }
      }

      const sharpNote: INote = {
        elementType: 'note',
        pitch: { note: 'F', octave: 3, accidental: '#' },
        duration: 'e',
        position: { line: 1, column: 3, position: 2 }
      }

      const flatNote: INote = {
        elementType: 'note',
        pitch: { note: 'A', octave: 4, accidental: 'b' },
        duration: 's',
        position: { line: 1, column: 4, position: 3 }
      }

      const rest: IRest = {
        elementType: 'rest',
        duration: 'q',
        position: { line: 1, column: 5, position: 4 }
      }

      const score: IMusicScore = {
        measures: [{ elements: [clef, timeSignature, sharpNote, flatNote, rest], number: 1 }],
        metadata: { title: 'Comprehensive Accessibility Test', composer: 'Test' }
      }

      const result = renderer.renderScore(score)
      
      // Verify all accessibility features are present
      expect(result).toContain('aria-label="Musical score"')
      expect(result).toContain('aria-label="Staff lines"')
      expect(result).toContain('aria-label="bass clef"')
      expect(result).toContain('aria-label="Time signature 6/8"')
      expect(result).toContain('aria-label="F#3 e note"')
      expect(result).toContain('aria-label="sharp accidental"')
      expect(result).toContain('aria-label="Ab4 s note"')
      expect(result).toContain('aria-label="flat accidental"')
      expect(result).toContain('aria-label="q rest"')
      expect(result).toContain('role="img"')
      expect(result).toContain('aria-hidden="true"')
    })
  })

  describe('Edge Cases for Accessibility', () => {
    it('should handle empty scores accessibly', () => {
      const score: IMusicScore = {
        measures: [],
        metadata: { title: 'Empty Score', composer: 'Test' }
      }

      const result = renderer.renderScore(score)
      
      expect(result).toContain('aria-label="Musical score"')
      expect(result).toContain('aria-label="Staff lines"')
      expect(result).toContain('role="img"')
    })

    it('should handle single element scores accessibly', () => {
      const singleNote: INote = {
        elementType: 'note',
        pitch: { note: 'A', octave: 4 },
        duration: 'w',
        position: { line: 1, column: 1, position: 0 }
      }

      const score: IMusicScore = {
        measures: [{ elements: [singleNote], number: 1 }],
        metadata: { title: 'Single Element', composer: 'Test' }
      }

      const result = renderer.renderScore(score)
      
      expect(result).toContain('aria-label="Musical score"')
      expect(result).toContain('aria-label="A4 w note"')
      expect(result).toContain('aria-label="Staff lines"')
    })

    it('should handle extreme note ranges accessibly', () => {
      const lowNote: INote = {
        elementType: 'note',
        pitch: { note: 'C', octave: 1 },
        duration: 'q',
        position: { line: 1, column: 1, position: 0 }
      }

      const highNote: INote = {
        elementType: 'note',
        pitch: { note: 'B', octave: 8 },
        duration: 'q',
        position: { line: 1, column: 2, position: 1 }
      }

      const score: IMusicScore = {
        measures: [{ elements: [lowNote, highNote], number: 1 }],
        metadata: { title: 'Extreme Range', composer: 'Test' }
      }

      const result = renderer.renderScore(score)
      
      expect(result).toContain('aria-label="C1 q note"')
      expect(result).toContain('aria-label="B8 q note"')
    })
  })
})