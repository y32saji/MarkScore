export declare enum ClefType {
    TREBLE = "treble",
    BASS = "bass",
    ALTO = "alto",
    TENOR = "tenor"
}
export declare enum NoteValue {
    QUARTER = "q",
    HALF = "h",
    WHOLE = "w",
    EIGHTH = "e",
    SIXTEENTH = "s"
}
export interface INoteConfig {
    note: string;
    octave: number;
    accidental?: string;
    duration: NoteValue;
}
export interface ITimeSignature {
    numerator: number;
    denominator: number;
}
export interface IMusicScore {
    clef: ClefType;
    timeSignature: ITimeSignature;
    notes: INoteConfig[];
}
//# sourceMappingURL=index.d.ts.map