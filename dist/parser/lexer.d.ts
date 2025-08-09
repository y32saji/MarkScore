import { TokenType, IToken, ILexerOptions, IParserError } from '../types/music';
export declare class MusicLexer {
    private input;
    private position;
    private line;
    private column;
    private tokens;
    private errors;
    private options;
    constructor(input: string, options?: Partial<ILexerOptions>);
    tokenize(): {
        tokens: IToken[];
        errors: IParserError[];
    };
    private scanToken;
    private scanIdentifierOrKeyword;
    private scanNumber;
    private getKeywordTokenType;
    private isLetter;
    private isNoteLetter;
    private isDigit;
    private isAccidental;
    private getCurrentChar;
    private advance;
    private advanceLine;
    private addToken;
    private addError;
    getTokens(): IToken[];
    getErrors(): IParserError[];
    static tokenizeInput(input: string, options?: Partial<ILexerOptions>): {
        tokens: IToken[];
        errors: IParserError[];
    };
}
export declare class TokenStream {
    private tokens;
    private position;
    constructor(tokens: IToken[]);
    current(): IToken;
    peek(offset?: number): IToken;
    advance(): IToken;
    isAtEnd(): boolean;
    match(...types: TokenType[]): boolean;
    consume(type: TokenType, errorMessage?: string): IToken;
    getPosition(): number;
    reset(): void;
    private createEOFToken;
}
//# sourceMappingURL=lexer.d.ts.map