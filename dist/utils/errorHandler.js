export class PluginErrorHandler {
    handleError(error, context) {
        const errorMessage = context
            ? `[MermaidMusicPlugin - ${context}] ${error.message}`
            : `[MermaidMusicPlugin] ${error.message}`;
        console.error(errorMessage, error.stack);
        if (process.env.NODE_ENV === 'development') {
            console.warn('Development mode: Full error details logged');
        }
    }
    static createPluginError(message, originalError) {
        const pluginError = new Error(`MermaidMusicPlugin: ${message}`);
        if (originalError && originalError.stack) {
            pluginError.stack = originalError.stack;
        }
        return pluginError;
    }
    static validateInput(input, expectedType) {
        if (expectedType === 'string' && typeof input !== 'string') {
            throw this.createPluginError(`Expected string input, received ${typeof input}`);
        }
        if (expectedType === 'object' && (typeof input !== 'object' || input === null)) {
            throw this.createPluginError(`Expected object input, received ${typeof input}`);
        }
        return true;
    }
}
//# sourceMappingURL=errorHandler.js.map