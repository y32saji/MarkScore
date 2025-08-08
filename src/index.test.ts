import { describe, it, expect, vi, beforeEach } from 'vitest'
import plugin from './index'

describe('Mermaid Music Plugin', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Plugin Interface', () => {
    it('should have required plugin properties', () => {
      expect(plugin).toBeDefined()
      expect(plugin.id).toBe('music')
      expect(plugin.register).toBeTypeOf('function')
      expect(plugin.detector).toBeTypeOf('function')
      expect(plugin.loader).toBeTypeOf('function')
    })
  })

  describe('Diagram Detection', () => {
    it('should detect music diagrams with music keyword', () => {
      const musicDiagram = 'music\n  clef: treble\n  C4 q'
      expect(plugin.detector(musicDiagram)).toBe(true)
    })

    it('should detect music diagrams with score keyword', () => {
      const scoreDiagram = 'score\n  time: 4/4\n  D4 h'
      expect(plugin.detector(scoreDiagram)).toBe(true)
    })

    it('should detect music diagrams with notation keyword', () => {
      const notationDiagram = 'notation\n  clef: bass'
      expect(plugin.detector(notationDiagram)).toBe(true)
    })

    it('should detect musical patterns without keywords', () => {
      const musicalPattern = 'clef: treble\ntime: 4/4\nC4 q | D4 q'
      expect(plugin.detector(musicalPattern)).toBe(true)
    })

    it('should not detect non-music content', () => {
      const nonMusicContent = 'graph TD\n  A --> B'
      expect(plugin.detector(nonMusicContent)).toBe(false)
    })

    it('should handle empty or invalid input', () => {
      expect(plugin.detector('')).toBe(false)
      expect(plugin.detector('   ')).toBe(false)
    })

    it('should handle invalid input types gracefully', () => {
      expect(plugin.detector(null as any)).toBe(false)
      expect(plugin.detector(undefined as any)).toBe(false)
      expect(plugin.detector(123 as any)).toBe(false)
    })
  })

  describe('Plugin Loader', () => {
    it('should return diagram definition with required methods', async () => {
      const definition = await plugin.loader()
      
      expect(definition).toBeDefined()
      expect(definition.db).toBeDefined()
      expect(definition.renderer).toBeDefined()
      expect(definition.parser).toBeDefined()
      expect(definition.styles).toBeDefined()
      
      expect(definition.db.clear).toBeTypeOf('function')
      expect(definition.db.setClef).toBeTypeOf('function')
      expect(definition.db.setTimeSignature).toBeTypeOf('function')
      expect(definition.db.addNote).toBeTypeOf('function')
      expect(definition.db.getNotes).toBeTypeOf('function')
      expect(definition.db.getClef).toBeTypeOf('function')
      expect(definition.db.getTimeSignature).toBeTypeOf('function')
      
      expect(definition.renderer.draw).toBeTypeOf('function')
      expect(definition.parser.parse).toBeTypeOf('function')
    })

    it('should provide default values from db methods', async () => {
      const definition = await plugin.loader()
      
      expect(definition.db.getNotes()).toEqual([])
      expect(definition.db.getClef()).toBe('treble')
      expect(definition.db.getTimeSignature()).toEqual({ numerator: 4, denominator: 4 })
    })

    it('should include default styles', async () => {
      const definition = await plugin.loader()
      
      expect(definition.styles.default).toBeDefined()
      expect(typeof definition.styles.default).toBe('string')
    })
  })

  describe('Plugin Registration', () => {
    it('should register with mermaid when available', () => {
      const mockMermaid = {
        registerPlugin: vi.fn()
      }
      
      const originalWindow = global.window
      global.window = { mermaid: mockMermaid } as any
      
      expect(() => plugin.register()).not.toThrow()
      expect(mockMermaid.registerPlugin).toHaveBeenCalledWith(plugin)
      
      global.window = originalWindow
    })

    it('should handle missing mermaid gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const originalWindow = global.window
      global.window = {} as any
      
      expect(() => plugin.register()).not.toThrow()
      expect(consoleSpy).toHaveBeenCalledWith('Mermaid not found in global scope')
      
      global.window = originalWindow
      consoleSpy.mockRestore()
    })

    it('should handle mermaid without registerPlugin method', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const originalWindow = global.window
      global.window = { mermaid: {} } as any
      
      expect(() => plugin.register()).not.toThrow()
      expect(consoleSpy).toHaveBeenCalledWith('Mermaid registerPlugin method not available')
      
      global.window = originalWindow
      consoleSpy.mockRestore()
    })

    it('should handle server-side environment gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const originalWindow = global.window
      delete (global as any).window
      
      expect(() => plugin.register()).not.toThrow()
      expect(consoleSpy).toHaveBeenCalledWith('Mermaid not found in global scope')
      
      global.window = originalWindow
      consoleSpy.mockRestore()
    })
  })
})