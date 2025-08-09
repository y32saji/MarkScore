import { describe, it, expect, beforeEach, vi } from 'vitest'
import { SVGMusicRenderer } from '../svg'
import { DEFAULT_RENDERING_OPTIONS } from '../../types/renderer'
import { IMusicScore, INote } from '../../types/music'

// Mock DOM manipulation functions for testing
const mockDOMEnvironment = () => {
  global.document = {
    createElement: vi.fn((tagName: string) => ({
      tagName: tagName.toLowerCase(),
      attributes: {} as Record<string, any>,
      children: [] as any[],
      appendChild: vi.fn(),
      setAttribute: vi.fn(),
      getAttribute: vi.fn(),
      removeAttribute: vi.fn(),
      innerHTML: '',
      textContent: '',
      style: {},
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
      querySelector: vi.fn(),
      querySelectorAll: vi.fn(),
      id: '',
      className: '',
      parentNode: null,
      firstChild: null,
      lastChild: null,
      nextSibling: null,
      previousSibling: null,
      nodeType: 1,
      nodeName: tagName.toUpperCase(),
      nodeValue: null
    })),
    createTextNode: vi.fn((text: string) => ({
      nodeType: 3,
      nodeValue: text,
      textContent: text,
      parentNode: null
    })),
    getElementById: vi.fn(),
    querySelector: vi.fn(),
    querySelectorAll: vi.fn(),
    body: {
      appendChild: vi.fn(),
      removeChild: vi.fn()
    }
  } as any

  global.window = {
    document: global.document,
    getComputedStyle: vi.fn(() => ({})),
    requestAnimationFrame: vi.fn((callback: (time: number) => void) => {
      setTimeout(() => callback(performance.now()), 16)
      return 1
    }),
    cancelAnimationFrame: vi.fn(),
    performance: {
      now: vi.fn(() => Date.now())
    }
  } as any
}

describe('SVGMusicRenderer - DOM Mocking Tests', () => {
  let renderer: SVGMusicRenderer

  beforeEach(() => {
    mockDOMEnvironment()
    renderer = new SVGMusicRenderer()
  })

  describe('SVG Element Creation Mocking', () => {
    it('should create SVG elements without actual DOM', () => {
      const element = renderer.createSVGElement('rect', {
        width: 100,
        height: 50,
        fill: 'blue'
      })

      expect(element).toEqual({
        tagName: 'rect',
        attributes: {
          width: 100,
          height: 50,
          fill: 'blue'
        }
      })
    })

    it('should create SVG elements with children without DOM', () => {
      const child1 = renderer.createSVGElement('circle', { r: 5 })
      const child2 = renderer.createSVGElement('rect', { width: 10, height: 10 })
      const parent = renderer.createSVGElement('g', { id: 'container' }, [child1, child2])

      expect(parent.children).toHaveLength(2)
      expect(parent.children![0]).toBe(child1)
      expect(parent.children![1]).toBe(child2)
    })

    it('should create SVG elements with text content without DOM', () => {
      const textElement = renderer.createSVGElement('text', { x: 10, y: 20 }, [], 'Hello SVG')

      expect(textElement.textContent).toBe('Hello SVG')
      expect(textElement.attributes.x).toBe(10)
      expect(textElement.attributes.y).toBe(20)
    })
  })

  describe('SVG String Generation Mocking', () => {
    it('should convert elements to SVG string without DOM dependencies', () => {
      const element = renderer.createSVGElement('rect', {
        width: 100,
        height: 50,
        fill: 'red'
      })

      const svgString = renderer.elementToSVG(element)
      expect(svgString).toBe('<rect width="100" height="50" fill="red" />')
    })

    it('should handle nested elements without DOM dependencies', () => {
      const child = renderer.createSVGElement('circle', { r: 5, fill: 'blue' })
      const parent = renderer.createSVGElement('g', { transform: 'translate(10,10)' }, [child])

      const svgString = renderer.elementToSVG(parent)
      expect(svgString).toBe('<g transform="translate(10,10)"><circle r="5" fill="blue" /></g>')
    })

    it('should handle text content without DOM dependencies', () => {
      const textElement = renderer.createSVGElement('text', { x: 0, y: 15 }, [], 'Test Text')

      const svgString = renderer.elementToSVG(textElement)
      expect(svgString).toBe('<text x="0" y="15">Test Text</text>')
    })
  })

  describe('Music Rendering with Mocked DOM', () => {
    it('should render complete score without DOM dependencies', () => {
      const note: INote = {
        elementType: 'note',
        pitch: { note: 'C', octave: 4 },
        duration: 'q',
        position: { line: 1, column: 1, position: 0 }
      }

      const score: IMusicScore = {
        measures: [{ elements: [note], number: 1 }],
        metadata: {
          title: 'Mock Test',
          composer: 'Test Composer'
        }
      }

      const result = renderer.renderScore(score)

      expect(result).toContain('<svg')
      expect(result).toContain('</svg>')
      expect(result).toContain('aria-label="Musical score"')
      expect(result).toContain('aria-label="C4 q note"')
    })

    it('should handle coordinate calculations without DOM dependencies', () => {
      const note: INote = {
        elementType: 'note',
        pitch: { note: 'G', octave: 5 },
        duration: 'e',
        position: { line: 1, column: 1, position: 0 }
      }

      const position = renderer.calculateNotePosition(note, 0, 0, DEFAULT_RENDERING_OPTIONS)

      expect(position.x).toBe(DEFAULT_RENDERING_OPTIONS.canvas.padding)
      expect(position.y).toBe(DEFAULT_RENDERING_OPTIONS.canvas.padding + 40)
    })

    it('should calculate note head positions without DOM dependencies', () => {
      const noteC4: INote = {
        elementType: 'note',
        pitch: { note: 'C', octave: 4 },
        duration: 'q',
        position: { line: 1, column: 1, position: 0 }
      }

      const noteD4: INote = {
        elementType: 'note',
        pitch: { note: 'D', octave: 4 },
        duration: 'q',
        position: { line: 1, column: 2, position: 1 }
      }

      const staffY = 200
      const yC4 = renderer.calculateNoteHeadY(noteC4, staffY)
      const yD4 = renderer.calculateNoteHeadY(noteD4, staffY)

      expect(yD4).toBeLessThan(yC4) // D should be higher than C
      expect(typeof yC4).toBe('number')
      expect(typeof yD4).toBe('number')
    })

    it('should determine stem directions without DOM dependencies', () => {
      const lowNote: INote = {
        elementType: 'note',
        pitch: { note: 'C', octave: 4 },
        duration: 'q',
        position: { line: 1, column: 1, position: 0 }
      }

      const highNote: INote = {
        elementType: 'note',
        pitch: { note: 'G', octave: 5 },
        duration: 'q',
        position: { line: 1, column: 2, position: 1 }
      }

      const lowDirection = renderer.determineStemDirection(lowNote)
      const highDirection = renderer.determineStemDirection(highNote)

      expect(lowDirection).toBe('up')
      expect(highDirection).toBe('down')
    })
  })

  describe('Performance with Mocked DOM', () => {
    it('should maintain performance without real DOM operations', () => {
      const elements = []
      for (let i = 0; i < 50; i++) {
        elements.push({
          elementType: 'note',
          pitch: { note: 'C', octave: 4 },
          duration: 'q',
          position: { line: 1, column: i + 1, position: i }
        } as INote)
      }

      const score: IMusicScore = {
        measures: [{ elements, number: 1 }],
        metadata: { title: 'Performance Test', composer: 'Mock' }
      }

      const startTime = performance.now()
      const result = renderer.renderScore(score)
      const endTime = performance.now()

      expect(result).toContain('<svg')
      expect(result).toContain('</svg>')
      expect(endTime - startTime).toBeLessThan(100) // Should be fast with mocked DOM
    })

    it('should handle many SVG element creations efficiently', () => {
      const startTime = performance.now()
      
      for (let i = 0; i < 1000; i++) {
        renderer.createSVGElement('circle', {
          cx: i * 10,
          cy: 50,
          r: 5,
          fill: '#000000'
        })
      }
      
      const endTime = performance.now()
      expect(endTime - startTime).toBeLessThan(50) // Should be very fast without DOM
    })

    it('should handle SVG string generation for many elements efficiently', () => {
      const elements = []
      for (let i = 0; i < 200; i++) {
        elements.push(renderer.createSVGElement('rect', {
          x: i * 5,
          y: 10,
          width: 4,
          height: 20,
          fill: '#000000'
        }))
      }

      const container = renderer.createSVGElement('g', {}, elements)

      const startTime = performance.now()
      const svgString = renderer.elementToSVG(container)
      const endTime = performance.now()

      expect(svgString).toContain('<g>')
      expect(svgString).toContain('</g>')
      expect((svgString.match(/<rect/g) || []).length).toBe(200)
      expect(endTime - startTime).toBeLessThan(50)
    })
  })

  describe('Error Handling with Mocked DOM', () => {
    it('should handle invalid attributes gracefully', () => {
      const element = renderer.createSVGElement('rect', {
        width: 100,
        height: null as any,
        fill: undefined as any,
        stroke: 'blue'
      })

      expect(element.attributes.width).toBe(100)
      expect(element.attributes.height).toBeNull()
      expect(element.attributes.fill).toBeUndefined()
      expect(element.attributes.stroke).toBe('blue')
    })

    it('should handle empty children arrays gracefully', () => {
      const element = renderer.createSVGElement('g', { id: 'empty' }, [])

      expect(element.children).toBeUndefined()
      
      const svgString = renderer.elementToSVG(element)
      expect(svgString).toBe('<g id="empty" />')
    })

    it('should handle missing text content gracefully', () => {
      const element = renderer.createSVGElement('text', { x: 10, y: 20 }, [], '')

      expect(element.textContent).toBeUndefined()
      
      const svgString = renderer.elementToSVG(element)
      expect(svgString).toBe('<text x="10" y="20" />')
    })
  })

  describe('Mock Verification', () => {
    it('should verify that DOM methods are mocked', () => {
      expect(global.document).toBeDefined()
      expect(global.window).toBeDefined()
      expect(vi.isMockFunction(global.document.createElement)).toBe(true)
      expect(vi.isMockFunction(global.document.createTextNode)).toBe(true)
    })

    it('should verify that performance methods are mocked', () => {
      expect(global.window.performance.now).toBeDefined()
      expect(vi.isMockFunction(global.window.performance.now)).toBe(true)
      expect(typeof global.window.performance.now()).toBe('number')
    })

    it('should verify that animation frame methods are mocked', () => {
      expect(global.window.requestAnimationFrame).toBeDefined()
      expect(global.window.cancelAnimationFrame).toBeDefined()
      expect(vi.isMockFunction(global.window.requestAnimationFrame)).toBe(true)
      expect(vi.isMockFunction(global.window.cancelAnimationFrame)).toBe(true)
    })
  })
})