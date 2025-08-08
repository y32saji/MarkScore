import { describe, it, expect, beforeEach } from 'vitest'
import { SVGMusicRenderer } from '../svg'
import { DEFAULT_RENDERING_OPTIONS } from '../../types/renderer'
import { IMusicScore, INote, IRest, IClef, ITimeSignature } from '../../types/music'

describe('SVGMusicRenderer', () => {
  let renderer: SVGMusicRenderer

  beforeEach(() => {
    renderer = new SVGMusicRenderer()
  })

  describe('createSVGElement', () => {
    it('should create a simple SVG element with attributes', () => {
      const element = renderer.createSVGElement('rect', {
        width: 100,
        height: 50,
        fill: 'red'
      })

      expect(element).toEqual({
        tagName: 'rect',
        attributes: {
          width: 100,
          height: 50,
          fill: 'red'
        }
      })
    })

    it('should create SVG element with children', () => {
      const child = renderer.createSVGElement('circle', { r: 5 })
      const parent = renderer.createSVGElement('g', {}, [child])

      expect(parent).toEqual({
        tagName: 'g',
        attributes: {},
        children: [child]
      })
    })

    it('should create SVG element with text content', () => {
      const element = renderer.createSVGElement('text', { x: 10, y: 20 }, [], 'Hello')

      expect(element).toEqual({
        tagName: 'text',
        attributes: { x: 10, y: 20 },
        textContent: 'Hello'
      })
    })
  })

  describe('elementToSVG', () => {
    it('should convert simple element to SVG string', () => {
      const element = renderer.createSVGElement('rect', {
        width: 100,
        height: 50,
        fill: 'red'
      })

      const result = renderer.elementToSVG(element)
      expect(result).toBe('<rect width="100" height="50" fill="red" />')
    })

    it('should convert element with children to SVG string', () => {
      const child = renderer.createSVGElement('circle', { r: 5 })
      const parent = renderer.createSVGElement('g', {}, [child])

      const result = renderer.elementToSVG(parent)
      expect(result).toBe('<g><circle r="5" /></g>')
    })

    it('should convert element with text content to SVG string', () => {
      const element = renderer.createSVGElement('text', { x: 10, y: 20 }, [], 'Hello')

      const result = renderer.elementToSVG(element)
      expect(result).toBe('<text x="10" y="20">Hello</text>')
    })
  })

  describe('calculateNotePosition', () => {
    it('should calculate correct position for first note', () => {
      const note: INote = {
        elementType: 'note',
        pitch: { note: 'C', octave: 4 },
        duration: 'q',
        position: { line: 1, column: 1, position: 0 }
      }

      const position = renderer.calculateNotePosition(note, 0, 0, DEFAULT_RENDERING_OPTIONS)
      
      expect(position.x).toBe(DEFAULT_RENDERING_OPTIONS.canvas.padding)
      expect(position.y).toBe(DEFAULT_RENDERING_OPTIONS.canvas.padding + 40)
    })

    it('should calculate correct position for second note', () => {
      const note: INote = {
        elementType: 'note',
        pitch: { note: 'D', octave: 4 },
        duration: 'q',
        position: { line: 1, column: 1, position: 0 }
      }

      const position = renderer.calculateNotePosition(note, 0, 1, DEFAULT_RENDERING_OPTIONS)
      
      expect(position.x).toBe(DEFAULT_RENDERING_OPTIONS.canvas.padding + DEFAULT_RENDERING_OPTIONS.spacing.noteSpacing)
      expect(position.y).toBe(DEFAULT_RENDERING_OPTIONS.canvas.padding + 40)
    })
  })

  describe('calculateStaffPosition', () => {
    it('should calculate correct position for first staff', () => {
      const position = renderer.calculateStaffPosition(0, DEFAULT_RENDERING_OPTIONS)
      
      expect(position.x).toBe(DEFAULT_RENDERING_OPTIONS.canvas.padding)
      expect(position.y).toBe(DEFAULT_RENDERING_OPTIONS.canvas.padding + 40)
    })

    it('should calculate correct position for second staff', () => {
      const position = renderer.calculateStaffPosition(1, DEFAULT_RENDERING_OPTIONS)
      
      expect(position.x).toBe(DEFAULT_RENDERING_OPTIONS.canvas.padding)
      expect(position.y).toBe(DEFAULT_RENDERING_OPTIONS.canvas.padding + 40 + 100)
    })
  })

  describe('renderScore', () => {
    it('should render empty score', () => {
      const score: IMusicScore = {
        measures: [],
        metadata: {
          title: 'Test Score',
          composer: 'Test Composer'
        }
      }

      const result = renderer.renderScore(score)
      
      expect(result).toContain('<svg')
      expect(result).toContain('width="800"')
      expect(result).toContain('height="200"')
      expect(result).toContain('aria-label="Musical score"')
      expect(result).toContain('</svg>')
    })

    it('should render score with single note', () => {
      const note: INote = {
        elementType: 'note',
        pitch: { note: 'C', octave: 4 },
        duration: 'q',
        position: { line: 1, column: 1, position: 0 }
      }

      const score: IMusicScore = {
        measures: [{ elements: [note], number: 1 }],
        metadata: {
          title: 'Single Note',
          composer: 'Test'
        }
      }

      const result = renderer.renderScore(score)
      
      expect(result).toContain('<svg')
      expect(result).toContain('aria-label="C4 q note"')
      expect(result).toContain('<ellipse')
      expect(result).toContain('<line') // stem
    })

    it('should render score with rest', () => {
      const rest: IRest = {
        elementType: 'rest',
        duration: 'q',
        position: { line: 1, column: 1, position: 0 }
      }

      const score: IMusicScore = {
        measures: [{ elements: [rest], number: 1 }],
        metadata: {
          title: 'Rest Score',
          composer: 'Test'
        }
      }

      const result = renderer.renderScore(score)
      
      expect(result).toContain('<svg')
      expect(result).toContain('aria-label="q rest"')
      expect(result).toContain('<path')
    })

    it('should render score with clef', () => {
      const clef: IClef = {
        elementType: 'clef',
        type: 'treble',
        position: { line: 1, column: 1, position: 0 }
      }

      const score: IMusicScore = {
        measures: [{ elements: [clef], number: 1 }],
        metadata: {
          title: 'Clef Score',
          composer: 'Test'
        }
      }

      const result = renderer.renderScore(score)
      
      expect(result).toContain('<svg')
      expect(result).toContain('aria-label="treble clef"')
      expect(result).toContain('<path')
    })

    it('should render score with time signature', () => {
      const timeSignature: ITimeSignature = {
        elementType: 'timeSignature',
        numerator: 4,
        denominator: 4,
        position: { line: 1, column: 1, position: 0 }
      }

      const score: IMusicScore = {
        measures: [{ elements: [timeSignature], number: 1 }],
        metadata: {
          title: 'Time Signature Score',
          composer: 'Test'
        }
      }

      const result = renderer.renderScore(score)
      
      expect(result).toContain('<svg')
      expect(result).toContain('aria-label="Time signature 4/4"')
      expect(result).toContain('<text')
      expect(result).toContain('>4</text>')
      expect(result).toContain('>4</text>')
    })

    it('should render complete score with multiple elements', () => {
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
        pitch: { note: 'D', octave: 4, accidental: '#' },
        duration: 'h',
        position: { line: 1, column: 4, position: 3 }
      }

      const rest: IRest = {
        elementType: 'rest',
        duration: 'q',
        position: { line: 1, column: 5, position: 4 }
      }

      const score: IMusicScore = {
        measures: [{ elements: [clef, timeSignature, note1, note2, rest], number: 1 }],
        metadata: {
          title: 'Complete Score',
          composer: 'Test Composer'
        }
      }

      const result = renderer.renderScore(score)
      
      // Verify SVG structure
      expect(result).toContain('<svg')
      expect(result).toContain('aria-label="Musical score"')
      
      // Verify clef rendering
      expect(result).toContain('aria-label="treble clef"')
      
      // Verify time signature rendering
      expect(result).toContain('aria-label="Time signature 4/4"')
      
      // Verify note rendering
      expect(result).toContain('aria-label="C4 q note"')
      expect(result).toContain('aria-label="D#4 h note"')
      
      // Verify accidental rendering
      expect(result).toContain('aria-label="sharp accidental"')
      
      // Verify rest rendering
      expect(result).toContain('aria-label="q rest"')
      
      // Verify staff lines
      expect(result).toContain('aria-label="Staff lines"')
      
      expect(result).toContain('</svg>')
    })

    it('should render note with sharp accidental', () => {
      const note: INote = {
        elementType: 'note',
        pitch: { note: 'F', octave: 5, accidental: '#' },
        duration: 'e',
        position: { line: 1, column: 1, position: 0 }
      }

      const score: IMusicScore = {
        measures: [{ elements: [note], number: 1 }],
        metadata: {
          title: 'Sharp Note',
          composer: 'Test'
        }
      }

      const result = renderer.renderScore(score)
      
      expect(result).toContain('aria-label="F#5 e note"')
      expect(result).toContain('aria-label="sharp accidental"')
    })

    it('should render note with flat accidental', () => {
      const note: INote = {
        elementType: 'note',
        pitch: { note: 'B', octave: 3, accidental: 'b' },
        duration: 's',
        position: { line: 1, column: 1, position: 0 }
      }

      const score: IMusicScore = {
        measures: [{ elements: [note], number: 1 }],
        metadata: {
          title: 'Flat Note',
          composer: 'Test'
        }
      }

      const result = renderer.renderScore(score)
      
      expect(result).toContain('aria-label="Bb3 s note"')
      expect(result).toContain('aria-label="flat accidental"')
    })

    it('should render whole note without stem', () => {
      const note: INote = {
        elementType: 'note',
        pitch: { note: 'G', octave: 4 },
        duration: 'w',
        position: { line: 1, column: 1, position: 0 }
      }

      const score: IMusicScore = {
        measures: [{ elements: [note], number: 1 }],
        metadata: {
          title: 'Whole Note',
          composer: 'Test'
        }
      }

      const result = renderer.renderScore(score)
      
      expect(result).toContain('aria-label="G4 w note"')
      // Whole notes should have hollow note heads
      expect(result).toContain('fill="none"')
      expect(result).toContain('stroke="#000000"')
      // Should not contain stems (no additional lines beyond staff)
      const lineCount = (result.match(/<line/g) || []).length
      expect(lineCount).toBe(5) // Only staff lines, no stem
    })

    it('should render eighth note with flag', () => {
      const note: INote = {
        elementType: 'note',
        pitch: { note: 'A', octave: 4 },
        duration: 'e',
        position: { line: 1, column: 1, position: 0 }
      }

      const score: IMusicScore = {
        measures: [{ elements: [note], number: 1 }],
        metadata: {
          title: 'Eighth Note',
          composer: 'Test'
        }
      }

      const result = renderer.renderScore(score)
      
      expect(result).toContain('aria-label="A4 e note"')
      // Should have filled note head
      expect(result).toContain('<ellipse')
      expect(result).toContain('fill="#000000"')
      // Should have stem
      expect(result).toContain('<line')
      // Should have flag
      expect(result).toContain('<path')
    })
  })

  describe('accessibility features', () => {
    it('should include proper ARIA labels for all musical elements', () => {
      const clef: IClef = {
        elementType: 'clef',
        type: 'bass',
        position: { line: 1, column: 1, position: 0 }
      }

      const note: INote = {
        elementType: 'note',
        pitch: { note: 'E', octave: 3, accidental: 'b' },
        duration: 'h',
        position: { line: 1, column: 2, position: 1 }
      }

      const score: IMusicScore = {
        measures: [{ elements: [clef, note], number: 1 }],
        metadata: {
          title: 'Accessibility Test',
          composer: 'Test'
        }
      }

      const result = renderer.renderScore(score)
      
      expect(result).toContain('aria-label="Musical score"')
      expect(result).toContain('aria-label="Staff lines"')
      expect(result).toContain('aria-label="bass clef"')
      expect(result).toContain('aria-label="Eb3 h note"')
      expect(result).toContain('aria-label="flat accidental"')
      expect(result).toContain('role="img"')
      expect(result).toContain('aria-hidden="true"')
    })
  })

  describe('custom rendering options', () => {
    it('should use custom rendering options', () => {
      const customOptions = {
        ...DEFAULT_RENDERING_OPTIONS,
        canvas: {
          ...DEFAULT_RENDERING_OPTIONS.canvas,
          width: 1000,
          height: 300,
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
        metadata: {
          title: 'Custom Options',
          composer: 'Test'
        }
      }

      const result = renderer.renderScore(score, customOptions)
      
      expect(result).toContain('width="1000"')
      expect(result).toContain('height="300"')
      expect(result).toContain('fill="#f0f0f0"')
      expect(result).toContain('fill="#0000ff"')
    })
  })
})