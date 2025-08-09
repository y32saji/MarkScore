import { IMusicRenderer, ISVGElement, ICoordinate, IRenderingOptions } from '../types/renderer';
import { IMusicScore, INote } from '../types/music';
export declare class SVGMusicRenderer implements IMusicRenderer {
    renderScore(score: IMusicScore, options?: IRenderingOptions): string;
    private renderElement;
    private renderNote;
    private renderRest;
    private renderClef;
    private renderTimeSignature;
    private renderStaff;
    private renderNoteHead;
    private renderStem;
    private renderFlag;
    private renderAccidental;
    private createRestSymbol;
    private createClefSymbol;
    private createTimeSignatureSymbol;
    private calculateNoteHeadY;
    private determineStemDirection;
    private createFlagPath;
    calculateNotePosition(_note: INote, measureIndex: number, noteIndex: number, options: IRenderingOptions): ICoordinate;
    calculateStaffPosition(staffIndex: number, options: IRenderingOptions): ICoordinate;
    createSVGElement(tagName: string, attributes: Record<string, string | number>, children?: ISVGElement[], textContent?: string): ISVGElement;
    elementToSVG(element: ISVGElement): string;
}
//# sourceMappingURL=svg.d.ts.map