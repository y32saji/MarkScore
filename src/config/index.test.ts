import { describe, it, expect } from 'vitest'
import { ConfigManager, DEFAULT_CONFIG, DIAGRAM_KEYWORDS, NOTE_PATTERNS } from './index'

describe('Config', () => {
  describe('DEFAULT_CONFIG', () => {
    it('should have required default values', () => {
      expect(DEFAULT_CONFIG.theme).toBe('default')
      expect(DEFAULT_CONFIG.width).toBe(800)
      expect(DEFAULT_CONFIG.height).toBe(600)
      expect(DEFAULT_CONFIG.fontSize).toBe(14)
      expect(DEFAULT_CONFIG.fontFamily).toBe('Arial, sans-serif')
    })
  })

  describe('DIAGRAM_KEYWORDS', () => {
    it('should contain expected keywords', () => {
      expect(DIAGRAM_KEYWORDS).toContain('music')
      expect(DIAGRAM_KEYWORDS).toContain('score')
      expect(DIAGRAM_KEYWORDS).toContain('notation')
    })
  })

  describe('NOTE_PATTERNS', () => {
    it('should have valid regex patterns', () => {
      expect(NOTE_PATTERNS.NOTE_REGEX.test('C4')).toBe(true)
      expect(NOTE_PATTERNS.NOTE_REGEX.test('F#5')).toBe(true)
      expect(NOTE_PATTERNS.NOTE_REGEX.test('Bb3')).toBe(true)
      expect(NOTE_PATTERNS.NOTE_REGEX.test('invalid')).toBe(false)

      expect(NOTE_PATTERNS.DURATION_REGEX.test('q')).toBe(true)
      expect(NOTE_PATTERNS.DURATION_REGEX.test('h')).toBe(true)
      expect(NOTE_PATTERNS.DURATION_REGEX.test('invalid')).toBe(false)

      expect(NOTE_PATTERNS.CLEF_REGEX.test('treble')).toBe(true)
      expect(NOTE_PATTERNS.CLEF_REGEX.test('bass')).toBe(true)
      expect(NOTE_PATTERNS.CLEF_REGEX.test('invalid')).toBe(false)

      expect(NOTE_PATTERNS.TIME_SIGNATURE_REGEX.test('4/4')).toBe(true)
      expect(NOTE_PATTERNS.TIME_SIGNATURE_REGEX.test('3/4')).toBe(true)
      expect(NOTE_PATTERNS.TIME_SIGNATURE_REGEX.test('invalid')).toBe(false)
    })
  })

  describe('ConfigManager', () => {
    it('should initialize with default config', () => {
      const manager = new ConfigManager()
      const config = manager.getConfig()
      
      expect(config).toEqual(DEFAULT_CONFIG)
    })

    it('should initialize with user config override', () => {
      const userConfig = { theme: 'dark', width: 1000 }
      const manager = new ConfigManager(userConfig)
      const config = manager.getConfig()
      
      expect(config.theme).toBe('dark')
      expect(config.width).toBe(1000)
      expect(config.height).toBe(DEFAULT_CONFIG.height)
    })

    it('should return copy of config to prevent mutation', () => {
      const manager = new ConfigManager()
      const config1 = manager.getConfig()
      const config2 = manager.getConfig()
      
      expect(config1).toEqual(config2)
      expect(config1).not.toBe(config2)
    })

    it('should update config', () => {
      const manager = new ConfigManager()
      
      manager.updateConfig({ theme: 'custom', fontSize: 16 })
      const config = manager.getConfig()
      
      expect(config.theme).toBe('custom')
      expect(config.fontSize).toBe(16)
      expect(config.width).toBe(DEFAULT_CONFIG.width)
    })

    it('should reset config to defaults', () => {
      const manager = new ConfigManager({ theme: 'custom' })
      
      manager.updateConfig({ fontSize: 20 })
      expect(manager.getConfig().theme).toBe('custom')
      expect(manager.getConfig().fontSize).toBe(20)
      
      manager.resetConfig()
      expect(manager.getConfig()).toEqual(DEFAULT_CONFIG)
    })
  })
})