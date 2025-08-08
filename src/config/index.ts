import { IPluginConfig } from '../types/plugin'

export const DEFAULT_CONFIG: IPluginConfig = {
  theme: 'default',
  width: 800,
  height: 600,
  fontSize: 14,
  fontFamily: 'Arial, sans-serif'
}

export const DIAGRAM_KEYWORDS = [
  'music',
  'score',
  'notation'
]

export const NOTE_PATTERNS = {
  NOTE_REGEX: /^[A-G][#b]?\d+$/,
  DURATION_REGEX: /^[whqes]$/,
  CLEF_REGEX: /^(treble|bass|alto|tenor)$/,
  TIME_SIGNATURE_REGEX: /^\d+\/\d+$/
}

export class ConfigManager {
  private config: IPluginConfig

  constructor(userConfig?: Partial<IPluginConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...userConfig }
  }

  getConfig(): IPluginConfig {
    return { ...this.config }
  }

  updateConfig(updates: Partial<IPluginConfig>): void {
    this.config = { ...this.config, ...updates }
  }

  resetConfig(): void {
    this.config = { ...DEFAULT_CONFIG }
  }
}