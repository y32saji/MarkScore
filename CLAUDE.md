# Mermaid Music Notation Plugin

## Project Overview
A Mermaid.js plugin that converts markdown-like notation into SVG musical scores. This plugin extends Mermaid's diagramming capabilities to support musical notation rendering.

## Technology Stack
- **TypeScript** - Primary development language
- **SVG/HTML** - Output format for musical scores
- **Vitest** - Unit testing framework
- **Playwright** - End-to-end testing

## Development Commands
- `npm run build` - Build the TypeScript project
- `npm run test` - Run unit tests with Vitest
- `npm run test:e2e` - Run end-to-end tests with Playwright
- `npm run lint` - Run ESLint for code quality
- `npm run typecheck` - Run TypeScript compiler checks
- `npm run dev` - Start development server with hot reload

## Code Style & Conventions
- Use 2-space indentation
- Use TypeScript strict mode
- Prefer `const` over `let` when possible
- Use descriptive variable names for musical elements (e.g., `noteValue`, `clefType`)
- Interface names should start with `I` (e.g., `INoteConfig`)
- Enum names should be PascalCase (e.g., `ClefType`, `NoteValue`)

## Architecture Patterns
- **Plugin Architecture**: Follow Mermaid.js plugin pattern with `register()` function
- **SVG Generation**: Use DOM manipulation or template strings for SVG creation
- **Parser Pattern**: Implement lexer/parser for music notation syntax
- **Command Pattern**: Use for different note types and musical symbols

## Music Notation Syntax
- Notes: `C4`, `D#5`, `Bb3` (note + accidental + octave)
- Duration: `q` (quarter), `h` (half), `w` (whole), `e` (eighth), `s` (sixteenth)
- Clefs: `treble`, `bass`, `alto`, `tenor`
- Time signatures: `4/4`, `3/4`, `2/4`, `6/8`

## File Structure
```
src/
├── parser/          # Music notation parser
├── renderer/        # SVG rendering logic
├── types/           # TypeScript type definitions
├── utils/           # Helper utilities
└── index.ts         # Main plugin entry point
```

## Testing Guidelines
- Unit tests for parser logic using Vitest
- E2E tests for full rendering pipeline using Playwright
- Test both valid and invalid music notation inputs
- Mock SVG rendering for faster unit tests
- Include visual regression tests for SVG output

## SVG Generation Best Practices
- Use `viewBox` for scalable graphics
- Group related elements with `<g>` tags
- Use semantic class names for styling
- Ensure accessibility with `aria-label` attributes
- Optimize path data for file size

## Performance Considerations
- Cache parsed notation to avoid re-parsing
- Use requestAnimationFrame for smooth animations
- Lazy load complex musical symbols
- Minimize SVG DOM manipulations during rendering

## Integration with Mermaid
- Register plugin using `mermaid.registerPlugin()`
- Follow Mermaid's configuration pattern
- Support theming through CSS custom properties
- Maintain compatibility with Mermaid's rendering pipeline