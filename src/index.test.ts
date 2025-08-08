import { describe, it, expect } from 'vitest'
import plugin from './index'

describe('Mermaid Music Plugin', () => {
  it('should export a plugin with register function', () => {
    expect(plugin).toBeDefined()
    expect(plugin.register).toBeTypeOf('function')
  })
})