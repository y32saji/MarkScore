import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { PluginErrorHandler } from './errorHandler'

describe('PluginErrorHandler', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
    consoleWarnSpy.mockRestore()
    delete process.env.NODE_ENV
  })

  describe('handleError', () => {
    it('should log error with context', () => {
      const handler = new PluginErrorHandler()
      const error = new Error('Test error')
      
      handler.handleError(error, 'test context')
      
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[MermaidMusicPlugin - test context] Test error',
        error.stack
      )
    })

    it('should log error without context', () => {
      const handler = new PluginErrorHandler()
      const error = new Error('Test error')
      
      handler.handleError(error)
      
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[MermaidMusicPlugin] Test error',
        error.stack
      )
    })

    it('should show development warning in development mode', () => {
      process.env.NODE_ENV = 'development'
      const handler = new PluginErrorHandler()
      const error = new Error('Test error')
      
      handler.handleError(error)
      
      expect(consoleWarnSpy).toHaveBeenCalledWith('Development mode: Full error details logged')
    })

    it('should not show development warning in production', () => {
      process.env.NODE_ENV = 'production'
      const handler = new PluginErrorHandler()
      const error = new Error('Test error')
      
      handler.handleError(error)
      
      expect(consoleWarnSpy).not.toHaveBeenCalledWith('Development mode: Full error details logged')
    })
  })

  describe('createPluginError', () => {
    it('should create error with plugin prefix', () => {
      const error = PluginErrorHandler.createPluginError('Custom message')
      
      expect(error.message).toBe('MermaidMusicPlugin: Custom message')
      expect(error).toBeInstanceOf(Error)
    })

    it('should preserve original error stack', () => {
      const originalError = new Error('Original')
      const pluginError = PluginErrorHandler.createPluginError('Custom', originalError)
      
      expect(pluginError.message).toBe('MermaidMusicPlugin: Custom')
      expect(pluginError.stack).toBe(originalError.stack)
    })
  })

  describe('validateInput', () => {
    it('should validate string input successfully', () => {
      expect(PluginErrorHandler.validateInput('test', 'string')).toBe(true)
    })

    it('should validate object input successfully', () => {
      expect(PluginErrorHandler.validateInput({}, 'object')).toBe(true)
      expect(PluginErrorHandler.validateInput({ key: 'value' }, 'object')).toBe(true)
    })

    it('should throw error for invalid string input', () => {
      expect(() => PluginErrorHandler.validateInput(123, 'string')).toThrow(
        'MermaidMusicPlugin: Expected string input, received number'
      )
      expect(() => PluginErrorHandler.validateInput(null, 'string')).toThrow(
        'MermaidMusicPlugin: Expected string input, received object'
      )
    })

    it('should throw error for invalid object input', () => {
      expect(() => PluginErrorHandler.validateInput('test', 'object')).toThrow(
        'MermaidMusicPlugin: Expected object input, received string'
      )
      expect(() => PluginErrorHandler.validateInput(null, 'object')).toThrow(
        'MermaidMusicPlugin: Expected object input, received object'
      )
    })
  })
})