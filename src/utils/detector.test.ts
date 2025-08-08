import { describe, it, expect } from 'vitest'
import { DiagramDetector } from './detector'

describe('DiagramDetector', () => {
  describe('detectMusicDiagram', () => {
    it('should detect music keyword', () => {
      expect(DiagramDetector.detectMusicDiagram('music\n  clef: treble')).toBe(true)
      expect(DiagramDetector.detectMusicDiagram('MUSIC\n  time: 4/4')).toBe(true)
      expect(DiagramDetector.detectMusicDiagram('  music  ')).toBe(true)
    })

    it('should detect score keyword', () => {
      expect(DiagramDetector.detectMusicDiagram('score\n  notes: C4 q')).toBe(true)
      expect(DiagramDetector.detectMusicDiagram('SCORE')).toBe(true)
    })

    it('should detect notation keyword', () => {
      expect(DiagramDetector.detectMusicDiagram('notation\n  clef: bass')).toBe(true)
      expect(DiagramDetector.detectMusicDiagram('NOTATION')).toBe(true)
    })

    it('should detect musical patterns', () => {
      expect(DiagramDetector.detectMusicDiagram('clef: treble')).toBe(true)
      expect(DiagramDetector.detectMusicDiagram('time: 4/4')).toBe(true)
      expect(DiagramDetector.detectMusicDiagram('C4 q')).toBe(true)
      expect(DiagramDetector.detectMusicDiagram('| A')).toBe(true)
    })

    it('should not detect non-music content', () => {
      expect(DiagramDetector.detectMusicDiagram('graph TD\n  A --> B')).toBe(false)
      expect(DiagramDetector.detectMusicDiagram('sequenceDiagram')).toBe(false)
      expect(DiagramDetector.detectMusicDiagram('random text')).toBe(false)
    })

    it('should handle invalid input', () => {
      expect(DiagramDetector.detectMusicDiagram('')).toBe(false)
      expect(DiagramDetector.detectMusicDiagram(null as any)).toBe(false)
      expect(DiagramDetector.detectMusicDiagram(undefined as any)).toBe(false)
      expect(DiagramDetector.detectMusicDiagram(123 as any)).toBe(false)
    })
  })

  describe('extractDiagramContent', () => {
    it('should extract content starting from music keyword', () => {
      const input = 'some text\nmusic\n  clef: treble\n  C4 q'
      const expected = 'music\n  clef: treble\n  C4 q'
      expect(DiagramDetector.extractDiagramContent(input)).toBe(expected)
    })

    it('should extract content starting from score keyword', () => {
      const input = 'header\nscore\n  time: 4/4\n  D4 h'
      const expected = 'score\n  time: 4/4\n  D4 h'
      expect(DiagramDetector.extractDiagramContent(input)).toBe(expected)
    })

    it('should return full text if no keyword found', () => {
      const input = 'no music keywords here'
      expect(DiagramDetector.extractDiagramContent(input)).toBe(input)
    })

    it('should handle empty input', () => {
      expect(DiagramDetector.extractDiagramContent('')).toBe('')
    })
  })
})