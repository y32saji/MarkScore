export const DEFAULT_CONFIG = {
    theme: 'default',
    width: 800,
    height: 600,
    fontSize: 14,
    fontFamily: 'Arial, sans-serif'
};
export const DIAGRAM_KEYWORDS = [
    'music',
    'score',
    'notation'
];
export const NOTE_PATTERNS = {
    NOTE_REGEX: /^[A-G][#b]?\d+$/,
    DURATION_REGEX: /^[whqes]$/,
    CLEF_REGEX: /^(treble|bass|alto|tenor)$/,
    TIME_SIGNATURE_REGEX: /^\d+\/\d+$/
};
export class ConfigManager {
    constructor(userConfig) {
        this.config = { ...DEFAULT_CONFIG, ...userConfig };
    }
    getConfig() {
        return { ...this.config };
    }
    updateConfig(updates) {
        this.config = { ...this.config, ...updates };
    }
    resetConfig() {
        this.config = { ...DEFAULT_CONFIG };
    }
}
//# sourceMappingURL=index.js.map