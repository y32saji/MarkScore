import { IPluginConfig } from '../types/plugin';
export declare const DEFAULT_CONFIG: IPluginConfig;
export declare const DIAGRAM_KEYWORDS: string[];
export declare const NOTE_PATTERNS: {
    NOTE_REGEX: RegExp;
    DURATION_REGEX: RegExp;
    CLEF_REGEX: RegExp;
    TIME_SIGNATURE_REGEX: RegExp;
};
export declare class ConfigManager {
    private config;
    constructor(userConfig?: Partial<IPluginConfig>);
    getConfig(): IPluginConfig;
    updateConfig(updates: Partial<IPluginConfig>): void;
    resetConfig(): void;
}
//# sourceMappingURL=index.d.ts.map