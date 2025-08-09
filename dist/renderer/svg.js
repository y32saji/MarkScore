import { DEFAULT_RENDERING_OPTIONS } from '../types/renderer';
export class SVGMusicRenderer {
    renderScore(score, options = DEFAULT_RENDERING_OPTIONS) {
        const context = {
            svg: this.createSVGElement('svg', {
                width: options.canvas.width,
                height: options.canvas.height,
                viewBox: `0 0 ${options.canvas.width} ${options.canvas.height}`,
                xmlns: 'http://www.w3.org/2000/svg',
                'aria-label': 'Musical score'
            }),
            currentPosition: { x: options.canvas.padding, y: options.canvas.padding },
            staffPosition: { x: options.canvas.padding, y: options.canvas.padding + 40 },
            options,
            viewBox: { x: 0, y: 0, width: options.canvas.width, height: options.canvas.height }
        };
        const elements = [];
        // Add background
        elements.push(this.createSVGElement('rect', {
            width: options.canvas.width,
            height: options.canvas.height,
            fill: options.canvas.backgroundColor
        }));
        // Render staff lines
        elements.push(this.renderStaff(context.staffPosition, options.staff));
        // Render score elements
        for (let measureIndex = 0; measureIndex < score.measures.length; measureIndex++) {
            const measure = score.measures[measureIndex];
            if (measure) {
                for (let elementIndex = 0; elementIndex < measure.elements.length; elementIndex++) {
                    const element = measure.elements[elementIndex];
                    if (element) {
                        const renderedElement = this.renderElement(element, context, elementIndex);
                        if (renderedElement) {
                            elements.push(...renderedElement);
                        }
                    }
                }
            }
        }
        context.svg.children = elements;
        return this.elementToSVG(context.svg);
    }
    renderElement(element, context, index) {
        switch (element.elementType) {
            case 'note':
                return this.renderNote(element, context, index);
            case 'rest':
                return this.renderRest(element, context, index);
            case 'clef':
                return this.renderClef(element, context);
            case 'timeSignature':
                return this.renderTimeSignature(element, context);
            default:
                return null;
        }
    }
    renderNote(note, context, index) {
        const position = this.calculateNotePosition(note, 0, index, context.options);
        const elements = [];
        // Render accidental if present
        if (note.pitch.accidental) {
            const accidentalPosition = { x: position.x - 12, y: position.y };
            elements.push(this.renderAccidental(note.pitch.accidental === '#' ? 'sharp' : 'flat', accidentalPosition, context.options.accidental));
        }
        // Render note head
        elements.push(this.renderNoteHead(note, position, context.options.noteHead));
        // Render stem for notes shorter than whole notes
        if (note.duration !== 'w') {
            elements.push(this.renderStem(note, position, context.options.stem));
        }
        // Render flag for eighth notes and shorter
        if (note.duration === 'e' || note.duration === 's') {
            const flag = this.renderFlag(note, position, context.options.flag);
            if (flag) {
                elements.push(flag);
            }
        }
        // Update current position
        context.currentPosition.x += context.options.spacing.noteSpacing;
        return elements;
    }
    renderRest(rest, context, _index) {
        const position = { x: context.currentPosition.x, y: context.staffPosition.y };
        const restElement = this.createRestSymbol(rest, position);
        // Update current position
        context.currentPosition.x += context.options.spacing.noteSpacing;
        return [restElement];
    }
    renderClef(clef, context) {
        const position = { x: context.currentPosition.x, y: context.staffPosition.y };
        const clefElement = this.createClefSymbol(clef, position, context.options.clef);
        // Update current position
        context.currentPosition.x += context.options.spacing.clefSpacing;
        return [clefElement];
    }
    renderTimeSignature(timeSignature, context) {
        const position = { x: context.currentPosition.x, y: context.staffPosition.y };
        const timeSignatureElement = this.createTimeSignatureSymbol(timeSignature, position, context.options.timeSignature);
        // Update current position
        context.currentPosition.x += context.options.spacing.timeSignatureSpacing;
        return [timeSignatureElement];
    }
    renderStaff(position, options) {
        const lines = [];
        for (let i = 0; i < options.lineCount; i++) {
            const y = position.y + (i * options.lineSpacing);
            lines.push(this.createSVGElement('line', {
                x1: position.x,
                y1: y,
                x2: position.x + options.width,
                y2: y,
                stroke: options.color,
                'stroke-width': options.strokeWidth,
                'aria-hidden': 'true'
            }));
        }
        return this.createSVGElement('g', {
            'aria-label': 'Staff lines',
            role: 'img'
        }, lines);
    }
    renderNoteHead(note, position, options) {
        const y = this.calculateNoteHeadY(note, position.y);
        const accidentalSymbol = note.pitch.accidental === '#' ? '#' : note.pitch.accidental === 'b' ? 'b' : '';
        if (note.duration === 'q' || note.duration === 'e' || note.duration === 's') {
            return this.createSVGElement('ellipse', {
                cx: position.x,
                cy: y,
                rx: options.width / 2,
                ry: options.height / 2,
                fill: options.color,
                'aria-label': `${note.pitch.note}${accidentalSymbol}${note.pitch.octave} ${note.duration} note`
            });
        }
        else {
            return this.createSVGElement('ellipse', {
                cx: position.x,
                cy: y,
                rx: options.width / 2,
                ry: options.height / 2,
                fill: 'none',
                stroke: options.color,
                'stroke-width': 1,
                'aria-label': `${note.pitch.note}${accidentalSymbol}${note.pitch.octave} ${note.duration} note`
            });
        }
    }
    renderStem(note, position, options) {
        const noteY = this.calculateNoteHeadY(note, position.y);
        const stemDirection = this.determineStemDirection(note);
        const x = stemDirection === 'up' ? position.x + 3 : position.x - 3;
        const y1 = noteY;
        const y2 = stemDirection === 'up' ? noteY - options.height : noteY + options.height;
        return this.createSVGElement('line', {
            x1: x,
            y1,
            x2: x,
            y2,
            stroke: options.color,
            'stroke-width': options.width,
            'aria-hidden': 'true'
        });
    }
    renderFlag(note, position, options) {
        if (note.duration !== 'e' && note.duration !== 's') {
            return null;
        }
        const noteY = this.calculateNoteHeadY(note, position.y);
        const stemDirection = this.determineStemDirection(note);
        const stemX = stemDirection === 'up' ? position.x + 3 : position.x - 3;
        const stemEndY = stemDirection === 'up' ? noteY - 24 : noteY + 24;
        // Simple flag representation using a path
        const flagPath = this.createFlagPath(stemX, stemEndY, stemDirection, note.duration);
        return this.createSVGElement('path', {
            d: flagPath,
            fill: options.color,
            'aria-hidden': 'true'
        });
    }
    renderAccidental(type, position, options) {
        let path;
        if (type === 'sharp') {
            path = `M ${position.x} ${position.y - 6} L ${position.x} ${position.y + 6} M ${position.x + 3} ${position.y - 6} L ${position.x + 3} ${position.y + 6} M ${position.x - 2} ${position.y - 2} L ${position.x + 5} ${position.y - 4} M ${position.x - 2} ${position.y + 2} L ${position.x + 5} ${position.y + 4}`;
        }
        else {
            path = `M ${position.x} ${position.y - 8} Q ${position.x - 3} ${position.y - 4} ${position.x} ${position.y} Q ${position.x + 3} ${position.y + 4} ${position.x} ${position.y + 8}`;
        }
        return this.createSVGElement('path', {
            d: path,
            stroke: options.color,
            'stroke-width': 1,
            fill: 'none',
            'aria-label': `${type} accidental`
        });
    }
    createRestSymbol(rest, position) {
        let restPath;
        switch (rest.duration) {
            case 'w':
                restPath = `M ${position.x - 6} ${position.y - 2} L ${position.x + 6} ${position.y - 2} L ${position.x + 6} ${position.y + 2} L ${position.x - 6} ${position.y + 2} Z`;
                break;
            case 'h':
                restPath = `M ${position.x - 6} ${position.y + 2} L ${position.x + 6} ${position.y + 2} L ${position.x + 6} ${position.y + 6} L ${position.x - 6} ${position.y + 6} Z`;
                break;
            case 'q':
                restPath = `M ${position.x} ${position.y - 6} Q ${position.x - 4} ${position.y} ${position.x} ${position.y + 6} Q ${position.x + 4} ${position.y + 3} ${position.x} ${position.y - 3}`;
                break;
            case 'e':
                restPath = `M ${position.x} ${position.y - 4} C ${position.x - 2} ${position.y - 2} ${position.x - 2} ${position.y + 2} ${position.x} ${position.y + 4} C ${position.x + 2} ${position.y + 2} ${position.x + 2} ${position.y - 2} ${position.x} ${position.y - 4}`;
                break;
            case 's':
                restPath = `M ${position.x} ${position.y - 6} C ${position.x - 3} ${position.y - 3} ${position.x - 3} ${position.y + 3} ${position.x} ${position.y + 6} C ${position.x + 3} ${position.y + 3} ${position.x + 3} ${position.y - 3} ${position.x} ${position.y - 6} M ${position.x - 1} ${position.y - 2} L ${position.x + 1} ${position.y + 2}`;
                break;
            default:
                restPath = `M ${position.x} ${position.y} L ${position.x} ${position.y}`;
        }
        return this.createSVGElement('path', {
            d: restPath,
            fill: '#000000',
            'aria-label': `${rest.duration} rest`
        });
    }
    createClefSymbol(clef, position, options) {
        let clefPath;
        switch (clef.type) {
            case 'treble':
                clefPath = `M ${position.x} ${position.y + 16} C ${position.x - 4} ${position.y + 20} ${position.x - 8} ${position.y + 12} ${position.x - 4} ${position.y + 8} C ${position.x} ${position.y + 4} ${position.x + 4} ${position.y + 8} ${position.x} ${position.y + 12} C ${position.x - 2} ${position.y + 14} ${position.x - 2} ${position.y + 18} ${position.x} ${position.y + 16} M ${position.x} ${position.y - 8} L ${position.x} ${position.y + 24}`;
                break;
            case 'bass':
                clefPath = `M ${position.x - 6} ${position.y + 4} C ${position.x - 8} ${position.y} ${position.x - 4} ${position.y - 4} ${position.x} ${position.y} C ${position.x + 4} ${position.y + 4} ${position.x} ${position.y + 8} ${position.x - 6} ${position.y + 4} M ${position.x + 2} ${position.y + 2} L ${position.x + 4} ${position.y + 2} M ${position.x + 2} ${position.y + 6} L ${position.x + 4} ${position.y + 6}`;
                break;
            default:
                clefPath = `M ${position.x} ${position.y} L ${position.x} ${position.y + 16}`;
        }
        return this.createSVGElement('path', {
            d: clefPath,
            stroke: options.color,
            'stroke-width': 2,
            fill: 'none',
            'aria-label': `${clef.type} clef`
        });
    }
    createTimeSignatureSymbol(timeSignature, position, options) {
        const numeratorElement = this.createSVGElement('text', {
            x: position.x,
            y: position.y - 4,
            'font-size': options.fontSize,
            'font-family': options.fontFamily,
            fill: options.color,
            'text-anchor': 'middle',
            'aria-label': `Time signature ${timeSignature.numerator}/${timeSignature.denominator}`
        }, [], timeSignature.numerator.toString());
        const denominatorElement = this.createSVGElement('text', {
            x: position.x,
            y: position.y + 12,
            'font-size': options.fontSize,
            'font-family': options.fontFamily,
            fill: options.color,
            'text-anchor': 'middle',
            'aria-hidden': 'true'
        }, [], timeSignature.denominator.toString());
        return this.createSVGElement('g', {
            role: 'img'
        }, [numeratorElement, denominatorElement]);
    }
    calculateNoteHeadY(note, staffY) {
        const noteNames = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
        const noteIndex = noteNames.indexOf(note.pitch.note);
        const octave = note.pitch.octave;
        // C4 is middle C, positioned on a ledger line below the treble clef staff
        const middleC = staffY + 32 + 4; // Below the staff with some spacing
        // Each semitone is 2 units apart vertically
        const semitoneOffset = ((octave - 4) * 12 + (noteIndex * 2)) * -2;
        return middleC + semitoneOffset;
    }
    determineStemDirection(note) {
        // Middle line (B4 in treble clef) and above get down stems
        const noteNames = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
        const noteIndex = noteNames.indexOf(note.pitch.note);
        const totalPosition = (note.pitch.octave - 4) * 7 + noteIndex;
        return totalPosition >= 2 ? 'down' : 'up'; // B4 and above get down stems
    }
    createFlagPath(x, y, direction, duration) {
        if (direction === 'up') {
            if (duration === 'e') {
                return `M ${x} ${y} C ${x + 6} ${y - 2} ${x + 8} ${y + 4} ${x + 2} ${y + 6} L ${x} ${y + 4} Z`;
            }
            else {
                return `M ${x} ${y} C ${x + 6} ${y - 2} ${x + 8} ${y + 4} ${x + 2} ${y + 6} L ${x} ${y + 4} Z M ${x} ${y + 3} C ${x + 6} ${y + 1} ${x + 8} ${y + 7} ${x + 2} ${y + 9} L ${x} ${y + 7} Z`;
            }
        }
        else {
            if (duration === 'e') {
                return `M ${x} ${y} C ${x - 6} ${y + 2} ${x - 8} ${y - 4} ${x - 2} ${y - 6} L ${x} ${y - 4} Z`;
            }
            else {
                return `M ${x} ${y} C ${x - 6} ${y + 2} ${x - 8} ${y - 4} ${x - 2} ${y - 6} L ${x} ${y - 4} Z M ${x} ${y - 3} C ${x - 6} ${y - 1} ${x - 8} ${y - 7} ${x - 2} ${y - 9} L ${x} ${y - 7} Z`;
            }
        }
    }
    calculateNotePosition(_note, measureIndex, noteIndex, options) {
        const baseX = options.canvas.padding + (measureIndex * options.spacing.measureSpacing);
        const noteX = baseX + (noteIndex * options.spacing.noteSpacing);
        const noteY = options.canvas.padding + 40; // Staff position
        return { x: noteX, y: noteY };
    }
    calculateStaffPosition(staffIndex, options) {
        return {
            x: options.canvas.padding,
            y: options.canvas.padding + 40 + (staffIndex * 100)
        };
    }
    createSVGElement(tagName, attributes, children = [], textContent) {
        const element = {
            tagName,
            attributes
        };
        if (children.length > 0) {
            element.children = children;
        }
        if (textContent) {
            element.textContent = textContent;
        }
        return element;
    }
    elementToSVG(element) {
        let result = `<${element.tagName}`;
        for (const [key, value] of Object.entries(element.attributes)) {
            result += ` ${key}="${value}"`;
        }
        if (element.children || element.textContent) {
            result += '>';
            if (element.textContent) {
                result += element.textContent;
            }
            if (element.children) {
                for (const child of element.children) {
                    result += this.elementToSVG(child);
                }
            }
            result += `</${element.tagName}>`;
        }
        else {
            result += ' />';
        }
        return result;
    }
}
//# sourceMappingURL=svg.js.map