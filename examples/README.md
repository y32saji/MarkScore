# Music Notation Examples

This directory contains basic notation examples demonstrating the Mermaid Music Notation Plugin syntax and functionality.

## Directory Structure

```
examples/
├── README.md                    # This documentation file
├── treble-clef-basic.md        # Basic treble clef notation
├── bass-clef-basic.md          # Basic bass clef notation  
├── alto-clef-basic.md          # Basic alto clef notation
├── tenor-clef-basic.md         # Basic tenor clef notation
├── time-signature-3-4.md       # 3/4 time signature example
├── time-signature-2-4.md       # 2/4 time signature example
├── time-signature-6-8.md       # 6/8 time signature example
├── accidentals-sharp.md        # Sharp accidentals example
├── accidentals-flat.md         # Flat accidentals example
├── mixed-durations.md          # Various note durations
└── complex-melody.md           # Complex melody with mixed elements
```

## Music Notation Syntax Reference

### Basic Structure

```mermaid
music-abc
  clef [clef-type]
  time [time-signature]
  [notes and durations]
```

### Supported Clefs

| Clef Type | Description | Example |
|-----------|-------------|---------|
| `treble`  | Treble clef (G clef) | `clef treble` |
| `bass`    | Bass clef (F clef) | `clef bass` |
| `alto`    | Alto clef (C clef) | `clef alto` |
| `tenor`   | Tenor clef (C clef) | `clef tenor` |

### Time Signatures

| Time Signature | Description | Example |
|----------------|-------------|---------|
| `4/4` | Four quarter notes per measure | `time 4/4` |
| `3/4` | Three quarter notes per measure (waltz time) | `time 3/4` |
| `2/4` | Two quarter notes per measure | `time 2/4` |
| `6/8` | Six eighth notes per measure | `time 6/8` |

### Note Notation

#### Note Names
- **Basic notes**: A, B, C, D, E, F, G
- **Accidentals**: 
  - Sharp: `#` (e.g., `C#4`)
  - Flat: `b` (e.g., `Db4`)
- **Octaves**: Numbers 0-9 (e.g., `C4`, `A3`, `G5`)

#### Note Durations

| Duration | Symbol | Description |
|----------|---------|-------------|
| Whole note | `w` | Four beats in 4/4 time |
| Half note | `h` | Two beats in 4/4 time |
| Quarter note | `q` | One beat in 4/4 time |
| Eighth note | `e` | Half beat in 4/4 time |
| Sixteenth note | `s` | Quarter beat in 4/4 time |

### Example Patterns

#### Simple Scale
```
C4 q D4 q E4 q F4 q G4 q A4 q B4 q C5 q
```

#### Chord Progression (represented as sequence)
```
C4 q E4 q G4 q C5 q
```

#### Mixed Durations
```
C4 w D4 h E4 q F4 e G4 s
```

#### Accidentals
```
C#4 q Db4 q E4 q F#4 q Gb4 q A4 q Bb4 q
```

## Usage Instructions

1. **View Examples**: Each `.md` file contains a complete example with:
   - Description of the musical elements
   - Mermaid code block with notation
   - Expected visual output description

2. **Test Examples**: Use the demo page in the `../demo/` directory to see rendered examples

3. **Create New Examples**: Follow the existing file structure:
   - Descriptive title and overview
   - Mermaid code block with `music-abc` identifier
   - Documentation of elements used
   - Expected output description

## Integration with Mermaid

To use these examples in a Mermaid-enabled environment:

1. Ensure the Music Notation Plugin is registered with Mermaid
2. Copy the notation content from the example files
3. Place in a standard Mermaid code block:

```markdown
\`\`\`mermaid
music-abc
  clef treble
  time 4/4
  C4 q D4 q E4 q F4 q
\`\`\`
```

## Demo

For interactive examples, see the HTML demo in the `../demo/index.html` file, which provides:
- Live rendering of all examples
- Visual comparison of different notations
- Interactive demonstration of plugin capabilities

## Contributing

When adding new examples:

1. Follow the established naming convention: `[category]-[description].md`
2. Include comprehensive documentation for each example
3. Test the notation syntax for correctness
4. Update this README with any new syntax elements
5. Add the example to the demo page for visual verification

## Notes

- All examples use the `music-abc` identifier for Mermaid integration
- Notation follows standard musical conventions
- Examples progress from simple to complex to demonstrate capabilities
- Each example is self-contained and can be used independently