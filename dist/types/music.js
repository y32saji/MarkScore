export var TokenType;
(function (TokenType) {
    TokenType["NOTE"] = "NOTE";
    TokenType["DURATION"] = "DURATION";
    TokenType["CLEF"] = "CLEF";
    TokenType["TIME_SIGNATURE"] = "TIME_SIGNATURE";
    TokenType["BAR"] = "BAR";
    TokenType["REST"] = "REST";
    TokenType["ACCIDENTAL"] = "ACCIDENTAL";
    TokenType["OCTAVE"] = "OCTAVE";
    TokenType["WHITESPACE"] = "WHITESPACE";
    TokenType["NEWLINE"] = "NEWLINE";
    TokenType["COLON"] = "COLON";
    TokenType["PIPE"] = "PIPE";
    TokenType["SLASH"] = "SLASH";
    TokenType["IDENTIFIER"] = "IDENTIFIER";
    TokenType["NUMBER"] = "NUMBER";
    TokenType["EOF"] = "EOF";
    TokenType["UNKNOWN"] = "UNKNOWN";
})(TokenType || (TokenType = {}));
export var NoteName;
(function (NoteName) {
    NoteName["C"] = "C";
    NoteName["D"] = "D";
    NoteName["E"] = "E";
    NoteName["F"] = "F";
    NoteName["G"] = "G";
    NoteName["A"] = "A";
    NoteName["B"] = "B";
})(NoteName || (NoteName = {}));
export var Accidental;
(function (Accidental) {
    Accidental["SHARP"] = "#";
    Accidental["FLAT"] = "b";
    Accidental["NATURAL"] = "n";
})(Accidental || (Accidental = {}));
export var Duration;
(function (Duration) {
    Duration["WHOLE"] = "w";
    Duration["HALF"] = "h";
    Duration["QUARTER"] = "q";
    Duration["EIGHTH"] = "e";
    Duration["SIXTEENTH"] = "s";
})(Duration || (Duration = {}));
export var ClefType;
(function (ClefType) {
    ClefType["TREBLE"] = "treble";
    ClefType["BASS"] = "bass";
    ClefType["ALTO"] = "alto";
    ClefType["TENOR"] = "tenor";
})(ClefType || (ClefType = {}));
//# sourceMappingURL=music.js.map