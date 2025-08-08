import { DIAGRAM_KEYWORDS } from '../config';
export class DiagramDetector {
    static detectMusicDiagram(text) {
        if (!text || typeof text !== 'string') {
            return false;
        }
        const normalizedText = text.toLowerCase().trim();
        for (const keyword of DIAGRAM_KEYWORDS) {
            if (normalizedText.includes(keyword)) {
                return true;
            }
        }
        if (this.hasMusicalPatterns(normalizedText)) {
            return true;
        }
        return false;
    }
    static hasMusicalPatterns(text) {
        const musicalPatterns = [
            /clef\s*:\s*(treble|bass|alto|tenor)/i,
            /time\s*:\s*\d+\/\d+/i,
            /\b[A-G][#b]?\d+\s+[whqes]\b/i,
            /\|\s*[A-G]/i
        ];
        return musicalPatterns.some(pattern => pattern.test(text));
    }
    static extractDiagramContent(text) {
        const lines = text.split('\n');
        const musicKeywordIndex = lines.findIndex(line => DIAGRAM_KEYWORDS.some(keyword => line.toLowerCase().trim().includes(keyword)));
        if (musicKeywordIndex === -1) {
            return text;
        }
        return lines.slice(musicKeywordIndex).join('\n');
    }
}
//# sourceMappingURL=detector.js.map