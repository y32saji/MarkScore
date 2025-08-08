import { IErrorHandler } from '../types/plugin';
export declare class PluginErrorHandler implements IErrorHandler {
    handleError(error: Error, context?: string): void;
    static createPluginError(message: string, originalError?: Error): Error;
    static validateInput(input: unknown, expectedType: string): boolean;
}
//# sourceMappingURL=errorHandler.d.ts.map