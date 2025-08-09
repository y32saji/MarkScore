import { describe, it, expect, beforeEach } from 'vitest'
import { SVGMusicRenderer } from '../svg'
import { DEFAULT_RENDERING_OPTIONS } from '../../types/renderer'
import { IMusicScore, INote, IRest, IClef, ITimeSignature, MusicElement } from '../../types/music'

describe('SVGMusicRenderer - Performance Tests', () => {
  let renderer: SVGMusicRenderer

  beforeEach(() => {
    renderer = new SVGMusicRenderer()
  })

  const createLargeScore = (noteCount: number): IMusicScore => {
    const elements: MusicElement[] = [
      {
        elementType: 'clef',
        type: 'treble',
        position: { line: 1, column: 1, position: 0 }
      } as IClef,
      {
        elementType: 'timeSignature',
        numerator: 4,
        denominator: 4,
        position: { line: 1, column: 2, position: 1 }
      } as ITimeSignature
    ]

    const notes: ('C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B')[] = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
    const durations: ('q' | 'h' | 'e' | 's' | 'w')[] = ['q', 'h', 'e', 's']
    const octaves = [3, 4, 5]
    const accidentals: (undefined | '#' | 'b')[] = [undefined, '#', 'b']

    for (let i = 0; i < noteCount; i++) {
      const noteIndex = i % notes.length
      const durationIndex = i % durations.length
      const octaveIndex = i % octaves.length
      const accidentalIndex = i % accidentals.length

      if (i % 8 === 7) {
        // Add rest every 8th element
        elements.push({
          elementType: 'rest',
          duration: durations[durationIndex],
          position: { line: 1, column: i + 3, position: i + 2 }
        } as IRest)
      } else {
        elements.push({
          elementType: 'note',
          pitch: { 
            note: notes[noteIndex], 
            octave: octaves[octaveIndex], 
            accidental: accidentals[accidentalIndex] 
          },
          duration: durations[durationIndex],
          position: { line: 1, column: i + 3, position: i + 2 }
        } as INote)
      }
    }

    return {
      measures: [{ elements, number: 1 }],
      metadata: {
        title: `Large Score with ${noteCount} notes`,
        composer: 'Performance Test'
      }
    }
  }

  const measurePerformance = (fn: () => void): number => {
    const start = performance.now()
    fn()
    const end = performance.now()
    return end - start
  }

  it('should render 10 notes within reasonable time', () => {
    const score = createLargeScore(10)
    
    const renderTime = measurePerformance(() => {
      renderer.renderScore(score)
    })

    expect(renderTime).toBeLessThan(10) // 10ms for 10 notes
  })

  it('should render 50 notes within reasonable time', () => {
    const score = createLargeScore(50)
    
    const renderTime = measurePerformance(() => {
      renderer.renderScore(score)
    })

    expect(renderTime).toBeLessThan(50) // 50ms for 50 notes
  })

  it('should render 100 notes within reasonable time', () => {
    const score = createLargeScore(100)
    
    const renderTime = measurePerformance(() => {
      renderer.renderScore(score)
    })

    expect(renderTime).toBeLessThan(100) // 100ms for 100 notes
  })

  it('should render 500 notes within reasonable time', () => {
    const score = createLargeScore(500)
    
    const renderTime = measurePerformance(() => {
      renderer.renderScore(score)
    })

    expect(renderTime).toBeLessThan(500) // 500ms for 500 notes
  })

  it('should scale linearly with note count', () => {
    const smallScore = createLargeScore(50)
    const largeScore = createLargeScore(200)

    const smallTime = measurePerformance(() => {
      renderer.renderScore(smallScore)
    })

    const largeTime = measurePerformance(() => {
      renderer.renderScore(largeScore)
    })

    // Large score should not be more than 5x slower (allowing for some overhead)
    expect(largeTime / smallTime).toBeLessThan(5)
  })

  it('should maintain reasonable performance across multiple renders', () => {
    const score = createLargeScore(100)
    const renderTimes: number[] = []

    // Perform multiple renders to check performance
    for (let i = 0; i < 5; i++) {
      const renderTime = measurePerformance(() => {
        renderer.renderScore(score)
      })
      renderTimes.push(renderTime)
    }

    // All renders should be reasonably fast
    for (const renderTime of renderTimes) {
      expect(renderTime).toBeLessThan(200) // Each render should be under 200ms
    }

    // Average performance should be good
    const averageTime = renderTimes.reduce((sum, time) => sum + time, 0) / renderTimes.length
    expect(averageTime).toBeLessThan(150) // Average should be under 150ms
  })

  it('should handle large SVG output efficiently', () => {
    const score = createLargeScore(200)
    
    const renderTime = measurePerformance(() => {
      const result = renderer.renderScore(score)
      
      // Verify the output is actually generated
      expect(result).toContain('<svg')
      expect(result).toContain('</svg>')
      expect(result.length).toBeGreaterThan(1000) // Should be a substantial SVG
    })

    expect(renderTime).toBeLessThan(200) // Should complete within reasonable time
  })

  it('should efficiently handle notes with accidentals', () => {
    const elements: MusicElement[] = [
      {
        elementType: 'clef',
        type: 'treble',
        position: { line: 1, column: 1, position: 0 }
      } as IClef
    ]

    // Create 100 notes all with sharp accidentals (more complex rendering)
    for (let i = 0; i < 100; i++) {
      elements.push({
        elementType: 'note',
        pitch: { note: 'F', octave: 4, accidental: '#' },
        duration: 'q',
        position: { line: 1, column: i + 2, position: i + 1 }
      } as INote)
    }

    const score: IMusicScore = {
      measures: [{ elements, number: 1 }],
      metadata: { title: 'Sharp Test', composer: 'Performance' }
    }

    const renderTime = measurePerformance(() => {
      const result = renderer.renderScore(score)
      
      // Verify accidentals are rendered
      expect(result).toContain('aria-label="sharp accidental"')
    })

    expect(renderTime).toBeLessThan(150) // Accidentals add complexity but should still be fast
  })

  it('should efficiently render different note durations', () => {
    const elements: MusicElement[] = [
      {
        elementType: 'clef',
        type: 'treble',
        position: { line: 1, column: 1, position: 0 }
      } as IClef
    ]

    const durations: ('q' | 'h' | 'e' | 's' | 'w')[] = ['q', 'h', 'e', 's', 'w']
    
    // Create 100 notes with varying durations
    for (let i = 0; i < 100; i++) {
      elements.push({
        elementType: 'note',
        pitch: { note: 'C', octave: 4 },
        duration: durations[i % durations.length],
        position: { line: 1, column: i + 2, position: i + 1 }
      } as INote)
    }

    const score: IMusicScore = {
      measures: [{ elements, number: 1 }],
      metadata: { title: 'Duration Test', composer: 'Performance' }
    }

    const renderTime = measurePerformance(() => {
      const result = renderer.renderScore(score)
      
      // Verify different durations are handled
      expect(result).toContain('fill="none"') // Whole/half notes
      expect(result).toContain('<path') // Flags for eighth/sixteenth
    })

    expect(renderTime).toBeLessThan(120)
  })

  it('should efficiently handle mixed element types', () => {
    const elements: MusicElement[] = [
      {
        elementType: 'clef',
        type: 'treble',
        position: { line: 1, column: 1, position: 0 }
      } as IClef,
      {
        elementType: 'timeSignature',
        numerator: 4,
        denominator: 4,
        position: { line: 1, column: 2, position: 1 }
      } as ITimeSignature
    ]

    // Create alternating notes and rests
    for (let i = 0; i < 100; i++) {
      if (i % 2 === 0) {
        elements.push({
          elementType: 'note',
          pitch: { note: 'G', octave: 4 },
          duration: 'q',
          position: { line: 1, column: i + 3, position: i + 2 }
        } as INote)
      } else {
        elements.push({
          elementType: 'rest',
          duration: 'q',
          position: { line: 1, column: i + 3, position: i + 2 }
        } as IRest)
      }
    }

    const score: IMusicScore = {
      measures: [{ elements, number: 1 }],
      metadata: { title: 'Mixed Elements Test', composer: 'Performance' }
    }

    const renderTime = measurePerformance(() => {
      const result = renderer.renderScore(score)
      
      // Verify mixed elements are rendered
      expect(result).toContain('aria-label="treble clef"')
      expect(result).toContain('aria-label="Time signature 4/4"')
      expect(result).toContain('aria-label="G4 q note"')
      expect(result).toContain('aria-label="q rest"')
    })

    expect(renderTime).toBeLessThan(150)
  })

  it('should handle SVG string generation efficiently', () => {
    const score = createLargeScore(100)
    
    const renderTime = measurePerformance(() => {
      const result = renderer.renderScore(score)
      
      // Verify SVG structure is complete
      expect(result.startsWith('<svg')).toBe(true)
      expect(result.endsWith('</svg>')).toBe(true)
      expect(result).toContain('viewBox')
      expect(result).toContain('xmlns')
      
      // Should contain proper nesting
      const openTags = (result.match(/</g) || []).length
      const closeTags = (result.match(/>/g) || []).length
      expect(openTags).toBe(closeTags) // Basic XML validity check
    })

    expect(renderTime).toBeLessThan(150)
  })

  it('should efficiently handle coordinate calculations for many elements', () => {
    const notes: INote[] = []
    
    // Create 500 notes for coordinate calculation testing
    for (let i = 0; i < 500; i++) {
      notes.push({
        elementType: 'note',
        pitch: { note: 'C', octave: 4 },
        duration: 'q',
        position: { line: 1, column: i + 1, position: i }
      })
    }

    const renderTime = measurePerformance(() => {
      for (let i = 0; i < notes.length; i++) {
        const position = renderer.calculateNotePosition(notes[i], 0, i, DEFAULT_RENDERING_OPTIONS)
        
        // Verify calculations are reasonable
        expect(position.x).toBeGreaterThan(0)
        expect(position.y).toBeGreaterThan(0)
      }
    })

    expect(renderTime).toBeLessThan(50) // Coordinate calculations should be very fast
  })

  it('should maintain performance with custom rendering options', () => {
    const customOptions = {
      ...DEFAULT_RENDERING_OPTIONS,
      canvas: {
        ...DEFAULT_RENDERING_OPTIONS.canvas,
        width: 2000,
        height: 1000
      },
      noteHead: {
        ...DEFAULT_RENDERING_OPTIONS.noteHead,
        width: 10,
        height: 8
      }
    }

    const score = createLargeScore(100)

    const renderTime = measurePerformance(() => {
      const result = renderer.renderScore(score, customOptions)
      
      // Verify custom options are applied
      expect(result).toContain('width="2000"')
      expect(result).toContain('height="1000"')
    })

    expect(renderTime).toBeLessThan(120) // Custom options shouldn't significantly impact performance
  })
})