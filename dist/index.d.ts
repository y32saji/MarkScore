import { IMermaidPlugin, IDiagramDefinition, DiagramType } from './types/plugin';
import { ConfigManager, DEFAULT_CONFIG } from './config';
export interface IMermaidMusicPlugin {
    register: () => void;
    id: string;
    detector: (text: string) => boolean;
    loader: () => Promise<IDiagramDefinition>;
}
declare class MermaidMusicPlugin implements IMermaidMusicPlugin {
    readonly id = "music";
    private errorHandler;
    detector(text: string): boolean;
    loader(): Promise<IDiagramDefinition>;
    register(): void;
}
declare const plugin: MermaidMusicPlugin;
export default plugin;
export { DiagramType, ConfigManager, DEFAULT_CONFIG };
export type { IMermaidPlugin, IDiagramDefinition };
//# sourceMappingURL=index.d.ts.map