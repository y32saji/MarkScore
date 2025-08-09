import { TokenType } from '../types/music';
import { KEYWORDS } from './grammar';
export class MusicLexer {
    constructor(input, options = {}) {
        this.position = 0;
        this.line = 1;
        this.column = 1;
        this.tokens = [];
        this.errors = [];
        this.input = input;
        this.options = {
            ignoreWhitespace: false,
            includePosition: true,
            ...options
        };
    }
    tokenize() {
        this.position = 0;
        this.line = 1;
        this.column = 1;
        this.tokens = [];
        this.errors = [];
        while (this.position < this.input.length) {
            this.scanToken();
        }
        this.addToken(TokenType.EOF, '');
        return {
            tokens: this.tokens,
            errors: this.errors
        };
    }
    scanToken() {
        const char = this.getCurrentChar();
        if (!char) {
            return;
        }
        switch (char) {
            case ' ':
            case '\t':
                if (!this.options.ignoreWhitespace) {
                    this.addToken(TokenType.WHITESPACE, char);
                }
                this.advance();
                break;
            case '\n':
                if (!this.options.ignoreWhitespace) {
                    this.addToken(TokenType.NEWLINE, char);
                }
                this.advanceLine();
                break;
            case '\r':
                this.advance();
                if (this.getCurrentChar() === '\n') {
                    if (!this.options.ignoreWhitespace) {
                        this.addToken(TokenType.NEWLINE, '\r\n');
                    }
                    this.advanceLine();
                }
                break;
            case ':':
                this.addToken(TokenType.COLON, char);
                this.advance();
                break;
            case '|':
                this.addToken(TokenType.PIPE, char);
                this.advance();
                break;
            case '/':
                this.addToken(TokenType.SLASH, char);
                this.advance();
                break;
            default:
                if (this.isLetter(char)) {
                    this.scanIdentifierOrKeyword();
                }
                else if (this.isDigit(char)) {
                    this.scanNumber();
                }
                else if (this.isAccidental(char)) {
                    this.addToken(TokenType.ACCIDENTAL, char);
                    this.advance();
                }
                else {
                    this.addError(`Unexpected character: '${char}'`);
                    this.advance();
                }
                break;
        }
    }
    scanIdentifierOrKeyword() {
        const start = this.position;
        // Check if this is a single note letter followed by an accidental
        const firstChar = this.getCurrentChar();
        if (this.isNoteLetter(firstChar)) {
            const secondChar = this.input[this.position + 1];
            // If we have a single note letter followed by an accidental, handle them separately
            if (secondChar && this.isAccidental(secondChar) && (this.position + 2 >= this.input.length || !this.isLetter(this.input[this.position + 2] ?? ''))) {
                this.advance();
                // Add the note token
                this.addToken(TokenType.NOTE, firstChar.toUpperCase());
                // Add the accidental token  
                this.addToken(TokenType.ACCIDENTAL, secondChar);
                this.advance();
                return;
            }
            // If it's just a single note letter followed by non-letter, treat as note
            if (this.position + 1 >= this.input.length || !this.isLetter(secondChar ?? '')) {
                this.advance();
                this.addToken(TokenType.NOTE, firstChar.toUpperCase());
                return;
            }
        }
        // Handle multi-character identifiers/keywords (like clef names)
        while (this.isLetter(this.getCurrentChar())) {
            this.advance();
        }
        const value = this.input.substring(start, this.position);
        const tokenType = this.getKeywordTokenType(value);
        this.addToken(tokenType, value);
    }
    scanNumber() {
        const start = this.position;
        while (this.isDigit(this.getCurrentChar())) {
            this.advance();
        }
        const value = this.input.substring(start, this.position);
        this.addToken(TokenType.NUMBER, value);
    }
    getKeywordTokenType(value) {
        const upperValue = value.toUpperCase();
        if (KEYWORDS.NOTES.includes(upperValue)) {
            return TokenType.NOTE;
        }
        if (KEYWORDS.DURATIONS.includes(value)) {
            return TokenType.DURATION;
        }
        if (KEYWORDS.CLEFS.includes(value.toLowerCase())) {
            return TokenType.CLEF;
        }
        if (value.toLowerCase() === 'r') {
            return TokenType.REST;
        }
        if (value.toLowerCase() === 'clef') {
            return TokenType.IDENTIFIER;
        }
        if (value.toLowerCase() === 'time') {
            return TokenType.IDENTIFIER;
        }
        return TokenType.IDENTIFIER;
    }
    isLetter(char) {
        return /[a-zA-Z]/.test(char);
    }
    isNoteLetter(char) {
        return /[A-Ga-g]/.test(char);
    }
    isDigit(char) {
        return /[0-9]/.test(char);
    }
    isAccidental(char) {
        return char === '#' || char === 'b';
    }
    getCurrentChar() {
        if (this.position >= this.input.length) {
            return '';
        }
        return this.input[this.position] ?? '';
    }
    advance() {
        this.position++;
        this.column++;
    }
    advanceLine() {
        this.position++;
        this.line++;
        this.column = 1;
    }
    addToken(type, value) {
        const token = {
            type,
            value,
            line: this.line,
            column: this.column - value.length,
            position: this.position - value.length
        };
        this.tokens.push(token);
    }
    addError(message) {
        const error = {
            message,
            position: {
                line: this.line,
                column: this.column,
                position: this.position
            }
        };
        this.errors.push(error);
    }
    getTokens() {
        return [...this.tokens];
    }
    getErrors() {
        return [...this.errors];
    }
    static tokenizeInput(input, options) {
        const lexer = new MusicLexer(input, options);
        return lexer.tokenize();
    }
}
export class TokenStream {
    constructor(tokens) {
        this.position = 0;
        this.tokens = tokens.filter(token => token.type !== TokenType.WHITESPACE &&
            token.type !== TokenType.NEWLINE);
    }
    current() {
        if (this.position >= this.tokens.length) {
            return this.tokens[this.tokens.length - 1] ?? this.createEOFToken();
        }
        return this.tokens[this.position] ?? this.createEOFToken();
    }
    peek(offset = 1) {
        const peekPosition = this.position + offset;
        if (peekPosition >= this.tokens.length) {
            return this.tokens[this.tokens.length - 1] ?? this.createEOFToken();
        }
        return this.tokens[peekPosition] ?? this.createEOFToken();
    }
    advance() {
        const token = this.current();
        if (this.position < this.tokens.length - 1) {
            this.position++;
        }
        return token;
    }
    isAtEnd() {
        return this.current().type === TokenType.EOF;
    }
    match(...types) {
        return types.includes(this.current().type);
    }
    consume(type, errorMessage) {
        if (this.current().type === type) {
            return this.advance();
        }
        throw new Error(errorMessage || `Expected token type ${type}, got ${this.current().type}`);
    }
    getPosition() {
        return this.position;
    }
    reset() {
        this.position = 0;
    }
    createEOFToken() {
        return {
            type: TokenType.EOF,
            value: '',
            line: 0,
            column: 0,
            position: 0
        };
    }
}
//# sourceMappingURL=lexer.js.map