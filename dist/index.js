import { DiagramType } from './types/plugin';
import { DiagramDetector } from './utils/detector';
import { PluginErrorHandler } from './utils/errorHandler';
import { ConfigManager, DEFAULT_CONFIG } from './config';
class MermaidMusicPlugin {
    constructor() {
        this.id = 'music';
        this.errorHandler = new PluginErrorHandler();
    }
    detector(text) {
        try {
            PluginErrorHandler.validateInput(text, 'string');
            return DiagramDetector.detectMusicDiagram(text);
        }
        catch (error) {
            this.errorHandler.handleError(error, 'detector');
            return false;
        }
    }
    async loader() {
        try {
            const diagramDefinition = {
                db: {
                    clear: () => {
                        // Clear diagram state
                    },
                    setClef: (_clef) => {
                        // Set clef implementation
                    },
                    setTimeSignature: (_numerator, _denominator) => {
                        // Set time signature implementation  
                    },
                    addNote: (_note, _duration) => {
                        // Add note implementation
                    },
                    getNotes: () => [],
                    getClef: () => 'treble',
                    getTimeSignature: () => ({ numerator: 4, denominator: 4 })
                },
                renderer: {
                    draw: (_text, _id, _version) => {
                        // Render implementation
                    }
                },
                parser: {
                    parse: (_input) => {
                        // Parse implementation
                    }
                },
                styles: {
                    default: 'fill: #000; stroke: #000; stroke-width: 1px;'
                }
            };
            return diagramDefinition;
        }
        catch (error) {
            const pluginError = PluginErrorHandler.createPluginError('Failed to load diagram definition', error);
            this.errorHandler.handleError(pluginError, 'loader');
            throw pluginError;
        }
    }
    register() {
        try {
            if (typeof window !== 'undefined' && window.mermaid) {
                const mermaid = window.mermaid;
                if (mermaid.registerPlugin) {
                    mermaid.registerPlugin(this);
                }
                else {
                    console.warn('Mermaid registerPlugin method not available');
                }
            }
            else {
                console.warn('Mermaid not found in global scope');
            }
        }
        catch (error) {
            this.errorHandler.handleError(error, 'register');
            throw PluginErrorHandler.createPluginError('Failed to register plugin', error);
        }
    }
}
const plugin = new MermaidMusicPlugin();
export default plugin;
export { DiagramType, ConfigManager, DEFAULT_CONFIG };
//# sourceMappingURL=index.js.map