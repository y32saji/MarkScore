export interface IMermaidPlugin {
  id: string
  detector: (text: string) => boolean
  loader: () => Promise<IDiagramDefinition>
}

export interface IDiagramDefinition {
  db: IDiagramDB
  renderer: IDiagramRenderer
  parser: IDiagramParser
  styles: IDiagramStyles
}

export interface IDiagramDB {
  clear: () => void
  setClef: (clef: string) => void
  setTimeSignature: (numerator: number, denominator: number) => void
  addNote: (note: string, duration: string) => void
  getNotes: () => INoteData[]
  getClef: () => string
  getTimeSignature: () => { numerator: number, denominator: number }
}

export interface IDiagramRenderer {
  draw: (text: string, id: string, version: string) => void
}

export interface IDiagramParser {
  parse: (input: string) => void
}

export interface IDiagramStyles {
  [key: string]: string
}

export interface INoteData {
  note: string
  octave: number
  accidental?: string
  duration: string
}

export interface IPluginConfig {
  theme: string
  width: number
  height: number
  fontSize: number
  fontFamily: string
}

export interface IErrorHandler {
  handleError: (error: Error, context?: string) => void
}

export enum DiagramType {
  MUSIC = 'music'
}