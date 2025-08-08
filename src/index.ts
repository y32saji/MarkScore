import { IMermaidPlugin, IDiagramDefinition, DiagramType } from './types/plugin'
import { DiagramDetector } from './utils/detector'
import { PluginErrorHandler } from './utils/errorHandler'
import { ConfigManager, DEFAULT_CONFIG } from './config'

export interface IMermaidMusicPlugin {
  register: () => void
  id: string
  detector: (text: string) => boolean
  loader: () => Promise<IDiagramDefinition>
}

class MermaidMusicPlugin implements IMermaidMusicPlugin {
  public readonly id = 'music'
  private errorHandler = new PluginErrorHandler()

  detector(text: string): boolean {
    try {
      PluginErrorHandler.validateInput(text, 'string')
      return DiagramDetector.detectMusicDiagram(text)
    } catch (error) {
      this.errorHandler.handleError(error as Error, 'detector')
      return false
    }
  }

  async loader(): Promise<IDiagramDefinition> {
    try {
      const diagramDefinition: IDiagramDefinition = {
        db: {
          clear: (): void => {
            // Clear diagram state
          },
          setClef: (_clef: string): void => {
            // Set clef implementation
          },
          setTimeSignature: (_numerator: number, _denominator: number): void => {
            // Set time signature implementation  
          },
          addNote: (_note: string, _duration: string): void => {
            // Add note implementation
          },
          getNotes: () => [],
          getClef: () => 'treble',
          getTimeSignature: () => ({ numerator: 4, denominator: 4 })
        },
        renderer: {
          draw: (_text: string, _id: string, _version: string): void => {
            // Render implementation
          }
        },
        parser: {
          parse: (_input: string): void => {
            // Parse implementation
          }
        },
        styles: {
          default: 'fill: #000; stroke: #000; stroke-width: 1px;'
        }
      }

      return diagramDefinition
    } catch (error) {
      const pluginError = PluginErrorHandler.createPluginError('Failed to load diagram definition', error as Error)
      this.errorHandler.handleError(pluginError, 'loader')
      throw pluginError
    }
  }

  register(): void {
    try {
      if (typeof window !== 'undefined' && (window as any).mermaid) {
        const mermaid = (window as any).mermaid
        
        if (mermaid.registerPlugin) {
          mermaid.registerPlugin(this as IMermaidPlugin)
        } else {
          console.warn('Mermaid registerPlugin method not available')
        }
      } else {
        console.warn('Mermaid not found in global scope')
      }
    } catch (error) {
      this.errorHandler.handleError(error as Error, 'register')
      throw PluginErrorHandler.createPluginError('Failed to register plugin', error as Error)
    }
  }
}

const plugin = new MermaidMusicPlugin()

export default plugin
export { DiagramType, ConfigManager, DEFAULT_CONFIG }
export type { IMermaidPlugin, IDiagramDefinition }