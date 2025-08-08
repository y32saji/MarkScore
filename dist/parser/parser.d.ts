import { IToken, IParseResult, IParserOptions } from '../types/music';
import { GrammarValidator } from './grammar';
export declare class MusicParser {
    private tokenStream;
    private errors;
    private options;
    private currentMeasure;
    private measures;
    private measureNumber;
    constructor(tokens: IToken[], options?: Partial<IParserOptions>);
    parse(): IParseResult;
    private parseScore;
    private parseElement;
    private parseIdentifierElement;
    private parseNote;
    private parseRest;
    private parseClef;
    private parseTimeSignature;
    private finalizeMeasure;
    private isValidNoteName;
    private isValidDuration;
    private isValidClefType;
    private getTokenPosition;
    private addError;
    private handleParseError;
    private synchronize;
    static parseInput(input: string, options?: Partial<IParserOptions>): IParseResult;
}
export { GrammarValidator };
//# sourceMappingURL=parser.d.ts.map