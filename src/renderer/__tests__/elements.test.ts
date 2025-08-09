import { describe, it, expect, beforeEach } from 'vitest'
import { SVGMusicRenderer } from '../svg'
import { DEFAULT_RENDERING_OPTIONS } from '../../types/renderer'
import { INote, IRest, IClef, ITimeSignature } from '../../types/music'

describe('SVGMusicRenderer - Individual Element Rendering', () => {
  let renderer: SVGMusicRenderer

  beforeEach(() => {
    renderer = new SVGMusicRenderer()
  })

  describe('Note Head Rendering', () => {
    it('should render filled note head for quarter notes', () => {
      const note: INote = {
        elementType: 'note',
        pitch: { note: 'C', octave: 4 },
        duration: 'q',
        position: { line: 1, column: 1, position: 0 }
      }

      const position = { x: 100, y: 200 }
      const element = renderer.renderNoteHead(note, position, DEFAULT_RENDERING_OPTIONS.noteHead)

      expect(element.tagName).toBe('ellipse')
      expect(element.attributes.cx).toBe(100)
      expect(element.attributes.fill).toBe(DEFAULT_RENDERING_OPTIONS.noteHead.color)
      expect(element.attributes['aria-label']).toContain('C4 q note')
    })

    it('should render filled note head for eighth notes', () => {
      const note: INote = {
        elementType: 'note',
        pitch: { note: 'D', octave: 5 },
        duration: 'e',
        position: { line: 1, column: 1, position: 0 }
      }

      const position = { x: 150, y: 180 }
      const element = renderer.renderNoteHead(note, position, DEFAULT_RENDERING_OPTIONS.noteHead)

      expect(element.tagName).toBe('ellipse')
      expect(element.attributes.fill).toBe(DEFAULT_RENDERING_OPTIONS.noteHead.color)
      expect(element.attributes['aria-label']).toContain('D5 e note')
    })

    it('should render filled note head for sixteenth notes', () => {
      const note: INote = {
        elementType: 'note',
        pitch: { note: 'E', octave: 3 },
        duration: 's',
        position: { line: 1, column: 1, position: 0 }
      }

      const position = { x: 200, y: 250 }
      const element = renderer.renderNoteHead(note, position, DEFAULT_RENDERING_OPTIONS.noteHead)

      expect(element.tagName).toBe('ellipse')
      expect(element.attributes.fill).toBe(DEFAULT_RENDERING_OPTIONS.noteHead.color)
      expect(element.attributes['aria-label']).toContain('E3 s note')
    })

    it('should render hollow note head for half notes', () => {
      const note: INote = {
        elementType: 'note',
        pitch: { note: 'F', octave: 4 },
        duration: 'h',
        position: { line: 1, column: 1, position: 0 }
      }

      const position = { x: 120, y: 190 }
      const element = renderer.renderNoteHead(note, position, DEFAULT_RENDERING_OPTIONS.noteHead)

      expect(element.tagName).toBe('ellipse')
      expect(element.attributes.fill).toBe('none')
      expect(element.attributes.stroke).toBe(DEFAULT_RENDERING_OPTIONS.noteHead.color)
      expect(element.attributes['aria-label']).toContain('F4 h note')
    })

    it('should render hollow note head for whole notes', () => {
      const note: INote = {
        elementType: 'note',
        pitch: { note: 'G', octave: 5 },
        duration: 'w',
        position: { line: 1, column: 1, position: 0 }
      }

      const position = { x: 80, y: 170 }
      const element = renderer.renderNoteHead(note, position, DEFAULT_RENDERING_OPTIONS.noteHead)

      expect(element.tagName).toBe('ellipse')
      expect(element.attributes.fill).toBe('none')
      expect(element.attributes.stroke).toBe(DEFAULT_RENDERING_OPTIONS.noteHead.color)
      expect(element.attributes['aria-label']).toContain('G5 w note')
    })

    it('should include accidentals in aria-label for sharp notes', () => {
      const note: INote = {
        elementType: 'note',
        pitch: { note: 'A', octave: 4, accidental: '#' },
        duration: 'q',
        position: { line: 1, column: 1, position: 0 }
      }

      const position = { x: 100, y: 200 }
      const element = renderer.renderNoteHead(note, position, DEFAULT_RENDERING_OPTIONS.noteHead)

      expect(element.attributes['aria-label']).toContain('A#4 q note')
    })

    it('should include accidentals in aria-label for flat notes', () => {
      const note: INote = {
        elementType: 'note',
        pitch: { note: 'B', octave: 3, accidental: 'b' },
        duration: 'h',
        position: { line: 1, column: 1, position: 0 }
      }

      const position = { x: 100, y: 200 }
      const element = renderer.renderNoteHead(note, position, DEFAULT_RENDERING_OPTIONS.noteHead)

      expect(element.attributes['aria-label']).toContain('Bb3 h note')
    })
  })

  describe('Stem Rendering', () => {
    it('should render stem with correct direction for low notes', () => {
      const note: INote = {
        elementType: 'note',
        pitch: { note: 'C', octave: 4 },
        duration: 'q',
        position: { line: 1, column: 1, position: 0 }
      }

      const position = { x: 100, y: 200 }
      const element = renderer.renderStem(note, position, DEFAULT_RENDERING_OPTIONS.stem)

      expect(element.tagName).toBe('line')
      expect(element.attributes['stroke-width']).toBe(DEFAULT_RENDERING_OPTIONS.stem.width)
      expect(element.attributes.stroke).toBe(DEFAULT_RENDERING_OPTIONS.stem.color)
      expect(element.attributes['aria-hidden']).toBe('true')
    })

    it('should render stem with correct direction for high notes', () => {
      const note: INote = {
        elementType: 'note',
        pitch: { note: 'G', octave: 5 },
        duration: 'q',
        position: { line: 1, column: 1, position: 0 }
      }

      const position = { x: 100, y: 200 }
      const element = renderer.renderStem(note, position, DEFAULT_RENDERING_OPTIONS.stem)

      expect(element.tagName).toBe('line')
      expect(element.attributes['stroke-width']).toBe(DEFAULT_RENDERING_OPTIONS.stem.width)
    })

    it('should position stem correctly relative to note head', () => {
      const note: INote = {
        elementType: 'note',
        pitch: { note: 'D', octave: 4 },
        duration: 'e',
        position: { line: 1, column: 1, position: 0 }
      }

      const position = { x: 100, y: 200 }
      const element = renderer.renderStem(note, position, DEFAULT_RENDERING_OPTIONS.stem)

      expect(element.attributes.x1).toBe(element.attributes.x2)
      expect(Number(element.attributes.y1)).not.toBe(Number(element.attributes.y2))
    })
  })

  describe('Flag Rendering', () => {
    it('should render flag for eighth notes', () => {
      const note: INote = {
        elementType: 'note',
        pitch: { note: 'E', octave: 4 },
        duration: 'e',
        position: { line: 1, column: 1, position: 0 }
      }

      const position = { x: 100, y: 200 }
      const element = renderer.renderFlag(note, position, DEFAULT_RENDERING_OPTIONS.flag)

      expect(element).not.toBeNull()
      expect(element!.tagName).toBe('path')
      expect(element!.attributes.fill).toBe(DEFAULT_RENDERING_OPTIONS.flag.color)
      expect(element!.attributes['aria-hidden']).toBe('true')
    })

    it('should render flag for sixteenth notes', () => {
      const note: INote = {
        elementType: 'note',
        pitch: { note: 'F', octave: 4 },
        duration: 's',
        position: { line: 1, column: 1, position: 0 }
      }

      const position = { x: 100, y: 200 }
      const element = renderer.renderFlag(note, position, DEFAULT_RENDERING_OPTIONS.flag)

      expect(element).not.toBeNull()
      expect(element!.tagName).toBe('path')
      expect(element!.attributes.d).toContain('Z M') // Should contain two flag curves
    })

    it('should not render flag for quarter notes', () => {
      const note: INote = {
        elementType: 'note',
        pitch: { note: 'G', octave: 4 },
        duration: 'q',
        position: { line: 1, column: 1, position: 0 }
      }

      const position = { x: 100, y: 200 }
      const element = renderer.renderFlag(note, position, DEFAULT_RENDERING_OPTIONS.flag)

      expect(element).toBeNull()
    })

    it('should not render flag for half notes', () => {
      const note: INote = {
        elementType: 'note',
        pitch: { note: 'A', octave: 4 },
        duration: 'h',
        position: { line: 1, column: 1, position: 0 }
      }

      const position = { x: 100, y: 200 }
      const element = renderer.renderFlag(note, position, DEFAULT_RENDERING_OPTIONS.flag)

      expect(element).toBeNull()
    })

    it('should not render flag for whole notes', () => {
      const note: INote = {
        elementType: 'note',
        pitch: { note: 'B', octave: 4 },
        duration: 'w',
        position: { line: 1, column: 1, position: 0 }
      }

      const position = { x: 100, y: 200 }
      const element = renderer.renderFlag(note, position, DEFAULT_RENDERING_OPTIONS.flag)

      expect(element).toBeNull()
    })
  })

  describe('Accidental Rendering', () => {
    it('should render sharp accidental correctly', () => {
      const position = { x: 88, y: 200 }
      const element = renderer.renderAccidental('sharp', position, DEFAULT_RENDERING_OPTIONS.accidental)

      expect(element.tagName).toBe('path')
      expect(element.attributes.stroke).toBe(DEFAULT_RENDERING_OPTIONS.accidental.color)
      expect(element.attributes.fill).toBe('none')
      expect(element.attributes['aria-label']).toBe('sharp accidental')
    })

    it('should render flat accidental correctly', () => {
      const position = { x: 88, y: 200 }
      const element = renderer.renderAccidental('flat', position, DEFAULT_RENDERING_OPTIONS.accidental)

      expect(element.tagName).toBe('path')
      expect(element.attributes.stroke).toBe(DEFAULT_RENDERING_OPTIONS.accidental.color)
      expect(element.attributes.fill).toBe('none')
      expect(element.attributes['aria-label']).toBe('flat accidental')
    })

    it('should position sharp accidental with correct path', () => {
      const position = { x: 88, y: 200 }
      const element = renderer.renderAccidental('sharp', position, DEFAULT_RENDERING_OPTIONS.accidental)

      expect(element.attributes.d).toContain('M 88 194') // Start point
      expect(element.attributes.d).toContain('L 88 206') // End point
    })

    it('should position flat accidental with correct path', () => {
      const position = { x: 88, y: 200 }
      const element = renderer.renderAccidental('flat', position, DEFAULT_RENDERING_OPTIONS.accidental)

      expect(element.attributes.d).toContain('M 88 192') // Start point
      expect(element.attributes.d).toContain('Q') // Quadratic curve
    })
  })

  describe('Rest Symbol Rendering', () => {
    it('should render whole rest correctly', () => {
      const rest: IRest = {
        elementType: 'rest',
        duration: 'w',
        position: { line: 1, column: 1, position: 0 }
      }

      const position = { x: 100, y: 200 }
      const element = renderer.createRestSymbol(rest, position)

      expect(element.tagName).toBe('path')
      expect(element.attributes.fill).toBe('#000000')
      expect(element.attributes['aria-label']).toBe('w rest')
    })

    it('should render half rest correctly', () => {
      const rest: IRest = {
        elementType: 'rest',
        duration: 'h',
        position: { line: 1, column: 1, position: 0 }
      }

      const position = { x: 100, y: 200 }
      const element = renderer.createRestSymbol(rest, position)

      expect(element.tagName).toBe('path')
      expect(element.attributes.fill).toBe('#000000')
      expect(element.attributes['aria-label']).toBe('h rest')
    })

    it('should render quarter rest correctly', () => {
      const rest: IRest = {
        elementType: 'rest',
        duration: 'q',
        position: { line: 1, column: 1, position: 0 }
      }

      const position = { x: 100, y: 200 }
      const element = renderer.createRestSymbol(rest, position)

      expect(element.tagName).toBe('path')
      expect(element.attributes.fill).toBe('#000000')
      expect(element.attributes['aria-label']).toBe('q rest')
    })

    it('should render eighth rest correctly', () => {
      const rest: IRest = {
        elementType: 'rest',
        duration: 'e',
        position: { line: 1, column: 1, position: 0 }
      }

      const position = { x: 100, y: 200 }
      const element = renderer.createRestSymbol(rest, position)

      expect(element.tagName).toBe('path')
      expect(element.attributes.fill).toBe('#000000')
      expect(element.attributes['aria-label']).toBe('e rest')
    })

    it('should render sixteenth rest correctly', () => {
      const rest: IRest = {
        elementType: 'rest',
        duration: 's',
        position: { line: 1, column: 1, position: 0 }
      }

      const position = { x: 100, y: 200 }
      const element = renderer.createRestSymbol(rest, position)

      expect(element.tagName).toBe('path')
      expect(element.attributes.fill).toBe('#000000')
      expect(element.attributes['aria-label']).toBe('s rest')
    })

    it('should handle invalid rest duration gracefully', () => {
      const rest: any = {
        elementType: 'rest',
        duration: 'invalid',
        position: { line: 1, column: 1, position: 0 }
      }

      const position = { x: 100, y: 200 }
      const element = renderer.createRestSymbol(rest, position)

      expect(element.tagName).toBe('path')
      expect(element.attributes['aria-label']).toBe('invalid rest')
    })
  })

  describe('Clef Symbol Rendering', () => {
    it('should render treble clef correctly', () => {
      const clef: IClef = {
        elementType: 'clef',
        type: 'treble',
        position: { line: 1, column: 1, position: 0 }
      }

      const position = { x: 100, y: 200 }
      const element = renderer.createClefSymbol(clef, position, DEFAULT_RENDERING_OPTIONS.clef)

      expect(element.tagName).toBe('path')
      expect(element.attributes.stroke).toBe(DEFAULT_RENDERING_OPTIONS.clef.color)
      expect(element.attributes['stroke-width']).toBe(2)
      expect(element.attributes.fill).toBe('none')
      expect(element.attributes['aria-label']).toBe('treble clef')
    })

    it('should render bass clef correctly', () => {
      const clef: IClef = {
        elementType: 'clef',
        type: 'bass',
        position: { line: 1, column: 1, position: 0 }
      }

      const position = { x: 100, y: 200 }
      const element = renderer.createClefSymbol(clef, position, DEFAULT_RENDERING_OPTIONS.clef)

      expect(element.tagName).toBe('path')
      expect(element.attributes.stroke).toBe(DEFAULT_RENDERING_OPTIONS.clef.color)
      expect(element.attributes['aria-label']).toBe('bass clef')
    })

    it('should render alto clef with default path', () => {
      const clef: IClef = {
        elementType: 'clef',
        type: 'alto',
        position: { line: 1, column: 1, position: 0 }
      }

      const position = { x: 100, y: 200 }
      const element = renderer.createClefSymbol(clef, position, DEFAULT_RENDERING_OPTIONS.clef)

      expect(element.tagName).toBe('path')
      expect(element.attributes['aria-label']).toBe('alto clef')
      expect(element.attributes.d).toContain('M 100 200')
    })

    it('should render tenor clef with default path', () => {
      const clef: IClef = {
        elementType: 'clef',
        type: 'tenor',
        position: { line: 1, column: 1, position: 0 }
      }

      const position = { x: 100, y: 200 }
      const element = renderer.createClefSymbol(clef, position, DEFAULT_RENDERING_OPTIONS.clef)

      expect(element.tagName).toBe('path')
      expect(element.attributes['aria-label']).toBe('tenor clef')
    })
  })

  describe('Time Signature Symbol Rendering', () => {
    it('should render 4/4 time signature correctly', () => {
      const timeSignature: ITimeSignature = {
        elementType: 'timeSignature',
        numerator: 4,
        denominator: 4,
        position: { line: 1, column: 1, position: 0 }
      }

      const position = { x: 100, y: 200 }
      const element = renderer.createTimeSignatureSymbol(timeSignature, position, DEFAULT_RENDERING_OPTIONS.timeSignature)

      expect(element.tagName).toBe('g')
      expect(element.attributes.role).toBe('img')
      expect(element.children).toHaveLength(2)

      const numerator = element.children![0]
      const denominator = element.children![1]

      expect(numerator.tagName).toBe('text')
      expect(numerator.textContent).toBe('4')
      expect(numerator.attributes['aria-label']).toBe('Time signature 4/4')

      expect(denominator.tagName).toBe('text')
      expect(denominator.textContent).toBe('4')
      expect(denominator.attributes['aria-hidden']).toBe('true')
    })

    it('should render 3/4 time signature correctly', () => {
      const timeSignature: ITimeSignature = {
        elementType: 'timeSignature',
        numerator: 3,
        denominator: 4,
        position: { line: 1, column: 1, position: 0 }
      }

      const position = { x: 100, y: 200 }
      const element = renderer.createTimeSignatureSymbol(timeSignature, position, DEFAULT_RENDERING_OPTIONS.timeSignature)

      expect(element.children![0].textContent).toBe('3')
      expect(element.children![1].textContent).toBe('4')
      expect(element.children![0].attributes['aria-label']).toBe('Time signature 3/4')
    })

    it('should render 6/8 time signature correctly', () => {
      const timeSignature: ITimeSignature = {
        elementType: 'timeSignature',
        numerator: 6,
        denominator: 8,
        position: { line: 1, column: 1, position: 0 }
      }

      const position = { x: 100, y: 200 }
      const element = renderer.createTimeSignatureSymbol(timeSignature, position, DEFAULT_RENDERING_OPTIONS.timeSignature)

      expect(element.children![0].textContent).toBe('6')
      expect(element.children![1].textContent).toBe('8')
      expect(element.children![0].attributes['aria-label']).toBe('Time signature 6/8')
    })

    it('should render 2/4 time signature correctly', () => {
      const timeSignature: ITimeSignature = {
        elementType: 'timeSignature',
        numerator: 2,
        denominator: 4,
        position: { line: 1, column: 1, position: 0 }
      }

      const position = { x: 100, y: 200 }
      const element = renderer.createTimeSignatureSymbol(timeSignature, position, DEFAULT_RENDERING_OPTIONS.timeSignature)

      expect(element.children![0].textContent).toBe('2')
      expect(element.children![1].textContent).toBe('4')
      expect(element.children![0].attributes['aria-label']).toBe('Time signature 2/4')
    })

    it('should use correct font and positioning attributes', () => {
      const timeSignature: ITimeSignature = {
        elementType: 'timeSignature',
        numerator: 4,
        denominator: 4,
        position: { line: 1, column: 1, position: 0 }
      }

      const position = { x: 100, y: 200 }
      const element = renderer.createTimeSignatureSymbol(timeSignature, position, DEFAULT_RENDERING_OPTIONS.timeSignature)

      const numerator = element.children![0]
      const denominator = element.children![1]

      expect(numerator.attributes['font-size']).toBe(DEFAULT_RENDERING_OPTIONS.timeSignature.fontSize)
      expect(numerator.attributes['font-family']).toBe(DEFAULT_RENDERING_OPTIONS.timeSignature.fontFamily)
      expect(numerator.attributes['text-anchor']).toBe('middle')
      expect(numerator.attributes.fill).toBe(DEFAULT_RENDERING_OPTIONS.timeSignature.color)

      expect(denominator.attributes['font-size']).toBe(DEFAULT_RENDERING_OPTIONS.timeSignature.fontSize)
      expect(denominator.attributes['font-family']).toBe(DEFAULT_RENDERING_OPTIONS.timeSignature.fontFamily)
      expect(denominator.attributes['text-anchor']).toBe('middle')
      expect(denominator.attributes.fill).toBe(DEFAULT_RENDERING_OPTIONS.timeSignature.color)
    })
  })

  describe('Staff Lines Rendering', () => {
    it('should render correct number of staff lines', () => {
      const position = { x: 50, y: 100 }
      const staffOptions = DEFAULT_RENDERING_OPTIONS.staff
      const element = renderer.renderStaff(position, staffOptions)

      expect(element.tagName).toBe('g')
      expect(element.attributes['aria-label']).toBe('Staff lines')
      expect(element.attributes.role).toBe('img')
      expect(element.children).toHaveLength(staffOptions.lineCount)
    })

    it('should position staff lines with correct spacing', () => {
      const position = { x: 50, y: 100 }
      const staffOptions = DEFAULT_RENDERING_OPTIONS.staff
      const element = renderer.renderStaff(position, staffOptions)

      const lines = element.children!
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        expect(line.tagName).toBe('line')
        expect(line.attributes.y1).toBe(position.y + (i * staffOptions.lineSpacing))
        expect(line.attributes.y2).toBe(position.y + (i * staffOptions.lineSpacing))
        expect(line.attributes.x1).toBe(position.x)
        expect(line.attributes.x2).toBe(position.x + staffOptions.width)
      }
    })

    it('should use correct stroke properties for staff lines', () => {
      const position = { x: 50, y: 100 }
      const staffOptions = DEFAULT_RENDERING_OPTIONS.staff
      const element = renderer.renderStaff(position, staffOptions)

      const firstLine = element.children![0]
      expect(firstLine.attributes.stroke).toBe(staffOptions.color)
      expect(firstLine.attributes['stroke-width']).toBe(staffOptions.strokeWidth)
      expect(firstLine.attributes['aria-hidden']).toBe('true')
    })
  })
})