export const DEFAULT_RENDERING_OPTIONS = {
    staff: {
        lineSpacing: 8,
        lineCount: 5,
        width: 400,
        strokeWidth: 1,
        color: '#000000'
    },
    noteHead: {
        width: 6,
        height: 4,
        filled: true,
        color: '#000000'
    },
    stem: {
        width: 1,
        height: 24,
        color: '#000000',
        direction: 'up'
    },
    flag: {
        width: 8,
        height: 12,
        color: '#000000',
        type: 'eighth'
    },
    clef: {
        width: 16,
        height: 32,
        color: '#000000',
        type: 'treble'
    },
    timeSignature: {
        fontSize: 16,
        fontFamily: 'Arial, sans-serif',
        color: '#000000',
        numerator: 4,
        denominator: 4
    },
    accidental: {
        width: 6,
        height: 12,
        color: '#000000',
        type: 'sharp'
    },
    spacing: {
        noteSpacing: 24,
        measureSpacing: 48,
        clefSpacing: 32,
        timeSignatureSpacing: 24
    },
    canvas: {
        width: 800,
        height: 200,
        padding: 20,
        backgroundColor: '#ffffff'
    }
};
//# sourceMappingURL=renderer.js.map