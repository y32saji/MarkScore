import { describe, it, expect, beforeEach } from 'vitest'
import { SVGMusicRenderer } from '../svg'
import { DEFAULT_RENDERING_OPTIONS, IRenderingOptions } from '../../types/renderer'
import { INote } from '../../types/music'

describe('SVGMusicRenderer - Layout and Coordinate Calculations', () => {
  let renderer: SVGMusicRenderer

  beforeEach(() => {
    renderer = new SVGMusicRenderer()
  })

  describe('Note Position Calculations', () => {
    it('should calculate correct position for first note in first measure', () => {
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

    it('should calculate correct position for second note in first measure', () => {
      const note: INote = {
        elementType: 'note',
        pitch: { note: 'D', octave: 4 },
        duration: 'q',
        position: { line: 1, column: 2, position: 1 }
      }

      const position = renderer.calculateNotePosition(note, 0, 1, DEFAULT_RENDERING_OPTIONS)
      
      expect(position.x).toBe(DEFAULT_RENDERING_OPTIONS.canvas.padding + DEFAULT_RENDERING_OPTIONS.spacing.noteSpacing)
      expect(position.y).toBe(DEFAULT_RENDERING_OPTIONS.canvas.padding + 40)
    })

    it('should calculate correct position for third note in first measure', () => {
      const note: INote = {
        elementType: 'note',
        pitch: { note: 'E', octave: 4 },
        duration: 'q',
        position: { line: 1, column: 3, position: 2 }
      }

      const position = renderer.calculateNotePosition(note, 0, 2, DEFAULT_RENDERING_OPTIONS)
      
      expect(position.x).toBe(DEFAULT_RENDERING_OPTIONS.canvas.padding + (2 * DEFAULT_RENDERING_OPTIONS.spacing.noteSpacing))
      expect(position.y).toBe(DEFAULT_RENDERING_OPTIONS.canvas.padding + 40)
    })

    it('should calculate correct position for first note in second measure', () => {
      const note: INote = {
        elementType: 'note',
        pitch: { note: 'F', octave: 4 },
        duration: 'q',
        position: { line: 1, column: 1, position: 0 }
      }

      const position = renderer.calculateNotePosition(note, 1, 0, DEFAULT_RENDERING_OPTIONS)
      
      expect(position.x).toBe(DEFAULT_RENDERING_OPTIONS.canvas.padding + DEFAULT_RENDERING_OPTIONS.spacing.measureSpacing)
      expect(position.y).toBe(DEFAULT_RENDERING_OPTIONS.canvas.padding + 40)
    })

    it('should calculate correct position with custom spacing options', () => {
      const customOptions: IRenderingOptions = {
        ...DEFAULT_RENDERING_OPTIONS,
        canvas: {
          ...DEFAULT_RENDERING_OPTIONS.canvas,
          padding: 30
        },
        spacing: {
          ...DEFAULT_RENDERING_OPTIONS.spacing,
          noteSpacing: 50,
          measureSpacing: 200
        }
      }

      const note: INote = {
        elementType: 'note',
        pitch: { note: 'G', octave: 4 },
        duration: 'q',
        position: { line: 1, column: 2, position: 1 }
      }

      const position = renderer.calculateNotePosition(note, 1, 2, customOptions)
      
      expect(position.x).toBe(30 + 200 + (2 * 50)) // padding + measureSpacing + (noteIndex * noteSpacing)
      expect(position.y).toBe(30 + 40) // padding + 40
    })
  })

  describe('Staff Position Calculations', () => {
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

    it('should calculate correct position for third staff', () => {
      const position = renderer.calculateStaffPosition(2, DEFAULT_RENDERING_OPTIONS)
      
      expect(position.x).toBe(DEFAULT_RENDERING_OPTIONS.canvas.padding)
      expect(position.y).toBe(DEFAULT_RENDERING_OPTIONS.canvas.padding + 40 + 200)
    })

    it('should calculate correct position with custom canvas padding', () => {
      const customOptions: IRenderingOptions = {
        ...DEFAULT_RENDERING_OPTIONS,
        canvas: {
          ...DEFAULT_RENDERING_OPTIONS.canvas,
          padding: 50
        }
      }

      const position = renderer.calculateStaffPosition(0, customOptions)
      
      expect(position.x).toBe(50)
      expect(position.y).toBe(50 + 40)
    })

    it('should maintain consistent x-position for all staffs', () => {
      const positions = []
      for (let i = 0; i < 5; i++) {
        positions.push(renderer.calculateStaffPosition(i, DEFAULT_RENDERING_OPTIONS))
      }

      const xPositions = positions.map(p => p.x)
      expect(xPositions.every(x => x === xPositions[0])).toBe(true)
    })

    it('should increase y-position by 100 units for each subsequent staff', () => {
      const position1 = renderer.calculateStaffPosition(0, DEFAULT_RENDERING_OPTIONS)
      const position2 = renderer.calculateStaffPosition(1, DEFAULT_RENDERING_OPTIONS)
      const position3 = renderer.calculateStaffPosition(2, DEFAULT_RENDERING_OPTIONS)

      expect(position2.y - position1.y).toBe(100)
      expect(position3.y - position2.y).toBe(100)
    })
  })

  describe('Note Head Y Position Calculations', () => {
    it('should calculate correct Y position for middle C (C4)', () => {
      const note: INote = {
        elementType: 'note',
        pitch: { note: 'C', octave: 4 },
        duration: 'q',
        position: { line: 1, column: 1, position: 0 }
      }

      const staffY = 200
      const y = renderer.calculateNoteHeadY(note, staffY)
      
      // C4 should be positioned below the staff
      expect(y).toBeGreaterThan(staffY)
    })

    it('should calculate correct Y position for D4', () => {
      const noteC: INote = {
        elementType: 'note',
        pitch: { note: 'C', octave: 4 },
        duration: 'q',
        position: { line: 1, column: 1, position: 0 }
      }

      const noteD: INote = {
        elementType: 'note',
        pitch: { note: 'D', octave: 4 },
        duration: 'q',
        position: { line: 1, column: 1, position: 0 }
      }

      const staffY = 200
      const yC = renderer.calculateNoteHeadY(noteC, staffY)
      const yD = renderer.calculateNoteHeadY(noteD, staffY)
      
      // D should be higher than C (smaller Y coordinate)
      expect(yD).toBeLessThan(yC)
    })

    it('should calculate correct Y position for octave changes', () => {
      const noteC4: INote = {
        elementType: 'note',
        pitch: { note: 'C', octave: 4 },
        duration: 'q',
        position: { line: 1, column: 1, position: 0 }
      }

      const noteC5: INote = {
        elementType: 'note',
        pitch: { note: 'C', octave: 5 },
        duration: 'q',
        position: { line: 1, column: 1, position: 0 }
      }

      const staffY = 200
      const yC4 = renderer.calculateNoteHeadY(noteC4, staffY)
      const yC5 = renderer.calculateNoteHeadY(noteC5, staffY)
      
      // Higher octave should have smaller Y coordinate (higher on staff)
      expect(yC5).toBeLessThan(yC4)
    })

    it('should calculate correct Y position for lower octaves', () => {
      const noteC4: INote = {
        elementType: 'note',
        pitch: { note: 'C', octave: 4 },
        duration: 'q',
        position: { line: 1, column: 1, position: 0 }
      }

      const noteC3: INote = {
        elementType: 'note',
        pitch: { note: 'C', octave: 3 },
        duration: 'q',
        position: { line: 1, column: 1, position: 0 }
      }

      const staffY = 200
      const yC4 = renderer.calculateNoteHeadY(noteC4, staffY)
      const yC3 = renderer.calculateNoteHeadY(noteC3, staffY)
      
      // Lower octave should have larger Y coordinate (lower on staff)
      expect(yC3).toBeGreaterThan(yC4)
    })

    it('should handle all note names correctly', () => {
      const notes = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
      const staffY = 200
      const positions: number[] = []

      for (const noteName of notes) {
        const note: INote = {
          elementType: 'note',
          pitch: { note: noteName as any, octave: 4 },
          duration: 'q',
          position: { line: 1, column: 1, position: 0 }
        }
        positions.push(renderer.calculateNoteHeadY(note, staffY))
      }

      // Each subsequent note should be higher (smaller Y value) than the previous
      for (let i = 1; i < positions.length; i++) {
        expect(positions[i]).toBeLessThanOrEqual(positions[i - 1])
      }
    })
  })

  describe('Stem Direction Calculations', () => {
    it('should determine up stem for low notes', () => {
      const note: INote = {
        elementType: 'note',
        pitch: { note: 'C', octave: 4 },
        duration: 'q',
        position: { line: 1, column: 1, position: 0 }
      }

      const direction = renderer.determineStemDirection(note)
      expect(direction).toBe('up')
    })

    it('should determine up stem for D4', () => {
      const note: INote = {
        elementType: 'note',
        pitch: { note: 'D', octave: 4 },
        duration: 'q',
        position: { line: 1, column: 1, position: 0 }
      }

      const direction = renderer.determineStemDirection(note)
      expect(direction).toBe('up')
    })

    it('should determine down stem for high notes', () => {
      const note: INote = {
        elementType: 'note',
        pitch: { note: 'G', octave: 5 },
        duration: 'q',
        position: { line: 1, column: 1, position: 0 }
      }

      const direction = renderer.determineStemDirection(note)
      expect(direction).toBe('down')
    })

    it('should determine down stem for B4 (middle line)', () => {
      const note: INote = {
        elementType: 'note',
        pitch: { note: 'B', octave: 4 },
        duration: 'q',
        position: { line: 1, column: 1, position: 0 }
      }

      const direction = renderer.determineStemDirection(note)
      expect(direction).toBe('down')
    })

    it('should determine down stem for C5', () => {
      const note: INote = {
        elementType: 'note',
        pitch: { note: 'C', octave: 5 },
        duration: 'q',
        position: { line: 1, column: 1, position: 0 }
      }

      const direction = renderer.determineStemDirection(note)
      expect(direction).toBe('down')
    })

    it('should be consistent across octaves for same note', () => {
      const noteG4: INote = {
        elementType: 'note',
        pitch: { note: 'G', octave: 4 },
        duration: 'q',
        position: { line: 1, column: 1, position: 0 }
      }

      const noteG5: INote = {
        elementType: 'note',
        pitch: { note: 'G', octave: 5 },
        duration: 'q',
        position: { line: 1, column: 1, position: 0 }
      }

      const directionG4 = renderer.determineStemDirection(noteG4)
      const directionG5 = renderer.determineStemDirection(noteG5)
      
      expect(directionG4).toBe('down') // G4 is actually above middle line
      expect(directionG5).toBe('down')
    })
  })

  describe('Flag Path Generation', () => {
    it('should generate correct flag path for eighth note with up stem', () => {
      const path = renderer.createFlagPath(100, 150, 'up', 'e')
      
      expect(path).toContain('M 100 150')
      expect(path).toContain('C')
      expect(path).toContain('Z')
      expect(path).not.toContain('M 100 153') // Should not contain double flag
    })

    it('should generate correct flag path for sixteenth note with up stem', () => {
      const path = renderer.createFlagPath(100, 150, 'up', 's')
      
      expect(path).toContain('M 100 150')
      expect(path).toContain('C')
      expect(path).toContain('Z')
      expect(path).toContain('M 100 153') // Should contain double flag for sixteenth
    })

    it('should generate correct flag path for eighth note with down stem', () => {
      const path = renderer.createFlagPath(100, 200, 'down', 'e')
      
      expect(path).toContain('M 100 200')
      expect(path).toContain('C')
      expect(path).toContain('Z')
    })

    it('should generate correct flag path for sixteenth note with down stem', () => {
      const path = renderer.createFlagPath(100, 200, 'down', 's')
      
      expect(path).toContain('M 100 200')
      expect(path).toContain('M 100 197') // Should contain double flag for sixteenth
      expect(path).toContain('Z')
    })

    it('should generate different paths for up vs down stems', () => {
      const upPath = renderer.createFlagPath(100, 150, 'up', 'e')
      const downPath = renderer.createFlagPath(100, 150, 'down', 'e')
      
      expect(upPath).not.toBe(downPath)
    })

    it('should generate different paths for eighth vs sixteenth notes', () => {
      const eighthPath = renderer.createFlagPath(100, 150, 'up', 'e')
      const sixteenthPath = renderer.createFlagPath(100, 150, 'up', 's')
      
      expect(eighthPath).not.toBe(sixteenthPath)
      expect(sixteenthPath.length).toBeGreaterThan(eighthPath.length)
    })
  })

  describe('Spacing and Layout Consistency', () => {
    it('should maintain consistent spacing between notes', () => {
      const positions = []
      for (let i = 0; i < 5; i++) {
        const note: INote = {
          elementType: 'note',
          pitch: { note: 'C', octave: 4 },
          duration: 'q',
          position: { line: 1, column: i + 1, position: i }
        }
        positions.push(renderer.calculateNotePosition(note, 0, i, DEFAULT_RENDERING_OPTIONS))
      }

      for (let i = 1; i < positions.length; i++) {
        const spacing = positions[i].x - positions[i - 1].x
        expect(spacing).toBe(DEFAULT_RENDERING_OPTIONS.spacing.noteSpacing)
      }
    })

    it('should maintain consistent Y position for notes on same staff', () => {
      const positions = []
      for (let i = 0; i < 5; i++) {
        const note: INote = {
          elementType: 'note',
          pitch: { note: 'C', octave: 4 },
          duration: 'q',
          position: { line: 1, column: i + 1, position: i }
        }
        positions.push(renderer.calculateNotePosition(note, 0, i, DEFAULT_RENDERING_OPTIONS))
      }

      const yPositions = positions.map(p => p.y)
      expect(yPositions.every(y => y === yPositions[0])).toBe(true)
    })

    it('should properly space measures', () => {
      const note1: INote = {
        elementType: 'note',
        pitch: { note: 'C', octave: 4 },
        duration: 'q',
        position: { line: 1, column: 1, position: 0 }
      }

      const position1 = renderer.calculateNotePosition(note1, 0, 0, DEFAULT_RENDERING_OPTIONS)
      const position2 = renderer.calculateNotePosition(note1, 1, 0, DEFAULT_RENDERING_OPTIONS)
      const position3 = renderer.calculateNotePosition(note1, 2, 0, DEFAULT_RENDERING_OPTIONS)

      expect(position2.x - position1.x).toBe(DEFAULT_RENDERING_OPTIONS.spacing.measureSpacing)
      expect(position3.x - position2.x).toBe(DEFAULT_RENDERING_OPTIONS.spacing.measureSpacing)
    })
  })
})