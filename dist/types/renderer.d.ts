import { IMusicScore, INote, IRest, IClef, ITimeSignature } from './music';
export interface ICoordinate {
    x: number;
    y: number;
}
export interface IDimensions {
    width: number;
    height: number;
}
export interface IViewBox {
    x: number;
    y: number;
    width: number;
    height: number;
}
export interface ISVGElement {
    tagName: string;
    attributes: Record<string, string | number>;
    children?: ISVGElement[];
    textContent?: string;
}
export interface IStaffConfig {
    lineSpacing: number;
    lineCount: number;
    width: number;
    strokeWidth: number;
    color: string;
}
export interface INoteHeadConfig {
    width: number;
    height: number;
    filled: boolean;
    color: string;
}
export interface IStemConfig {
    width: number;
    height: number;
    color: string;
    direction: 'up' | 'down';
}
export interface IFlagConfig {
    width: number;
    height: number;
    color: string;
    type: 'eighth' | 'sixteenth' | 'thirty-second';
}
export interface IClefSymbolConfig {
    width: number;
    height: number;
    color: string;
    type: 'treble' | 'bass' | 'alto' | 'tenor';
}
export interface ITimeSignatureConfig {
    fontSize: number;
    fontFamily: string;
    color: string;
    numerator: number;
    denominator: number;
}
export interface IAccidentalConfig {
    width: number;
    height: number;
    color: string;
    type: 'sharp' | 'flat' | 'natural';
}
export interface IRenderingOptions {
    staff: IStaffConfig;
    noteHead: INoteHeadConfig;
    stem: IStemConfig;
    flag: IFlagConfig;
    clef: IClefSymbolConfig;
    timeSignature: ITimeSignatureConfig;
    accidental: IAccidentalConfig;
    spacing: {
        noteSpacing: number;
        measureSpacing: number;
        clefSpacing: number;
        timeSignatureSpacing: number;
    };
    canvas: {
        width: number;
        height: number;
        padding: number;
        backgroundColor: string;
    };
}
export interface IRenderContext {
    svg: ISVGElement;
    currentPosition: ICoordinate;
    staffPosition: ICoordinate;
    options: IRenderingOptions;
    viewBox: IViewBox;
}
export interface IRenderable {
    render(context: IRenderContext): ISVGElement[];
}
export interface INoteRenderer extends IRenderable {
    renderNoteHead(note: INote, position: ICoordinate, options: INoteHeadConfig): ISVGElement;
    renderStem(note: INote, position: ICoordinate, options: IStemConfig): ISVGElement;
    renderFlag(note: INote, position: ICoordinate, options: IFlagConfig): ISVGElement | null;
}
export interface IRestRenderer extends IRenderable {
    renderRest(rest: IRest, position: ICoordinate): ISVGElement;
}
export interface IClefRenderer extends IRenderable {
    renderClef(clef: IClef, position: ICoordinate, options: IClefSymbolConfig): ISVGElement;
}
export interface ITimeSignatureRenderer extends IRenderable {
    renderTimeSignature(timeSignature: ITimeSignature, position: ICoordinate, options: ITimeSignatureConfig): ISVGElement;
}
export interface IStaffRenderer extends IRenderable {
    renderStaff(position: ICoordinate, options: IStaffConfig): ISVGElement;
}
export interface IAccidentalRenderer extends IRenderable {
    renderAccidental(type: 'sharp' | 'flat' | 'natural', position: ICoordinate, options: IAccidentalConfig): ISVGElement;
}
export interface IMusicRenderer {
    renderScore(score: IMusicScore, options: IRenderingOptions): string;
    createSVGElement(tagName: string, attributes: Record<string, string | number>, children?: ISVGElement[], textContent?: string): ISVGElement;
    elementToSVG(element: ISVGElement): string;
    calculateNotePosition(note: INote, measureIndex: number, noteIndex: number, options: IRenderingOptions): ICoordinate;
    calculateStaffPosition(staffIndex: number, options: IRenderingOptions): ICoordinate;
}
export declare const DEFAULT_RENDERING_OPTIONS: IRenderingOptions;
//# sourceMappingURL=renderer.d.ts.map