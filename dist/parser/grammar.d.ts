import { TokenType } from '../types/music';
export declare const GRAMMAR_PATTERNS: {
    readonly NOTE_NAME: RegExp;
    readonly ACCIDENTAL: RegExp;
    readonly OCTAVE: RegExp;
    readonly DURATION: RegExp;
    readonly CLEF: RegExp;
    readonly TIME_SIGNATURE_NUM: RegExp;
    readonly BAR_LINE: RegExp;
    readonly REST: RegExp;
    readonly WHITESPACE: RegExp;
    readonly NEWLINE: RegExp;
    readonly COLON: RegExp;
    readonly SLASH: RegExp;
    readonly IDENTIFIER: RegExp;
    readonly NUMBER: RegExp;
};
export declare const KEYWORDS: {
    readonly CLEFS: readonly ["treble", "bass", "alto", "tenor"];
    readonly DURATIONS: readonly ["w", "h", "q", "e", "s"];
    readonly NOTES: readonly ["C", "D", "E", "F", "G", "A", "B"];
    readonly ACCIDENTALS: readonly ["#", "b"];
    readonly REST: readonly ["r"];
};
export interface IGrammarRule {
    name: string;
    pattern: string;
    description: string;
    examples: string[];
}
export declare const GRAMMAR_RULES: IGrammarRule[];
export declare class GrammarValidator {
    static validateNotePattern(input: string): boolean;
    static validateRestPattern(input: string): boolean;
    static validateClefPattern(input: string): boolean;
    static validateTimeSignaturePattern(input: string): boolean;
    static validateMeasurePattern(input: string): boolean;
    static getExpectedTokens(context: string): TokenType[];
}
export declare const PRECEDENCE: {
    readonly CLEF: 1;
    readonly TIME_SIGNATURE: 2;
    readonly NOTE: 3;
    readonly REST: 3;
    readonly BAR: 4;
};
export type PrecedenceLevel = typeof PRECEDENCE[keyof typeof PRECEDENCE];
//# sourceMappingURL=grammar.d.ts.map