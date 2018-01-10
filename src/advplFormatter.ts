'use strict';

import * as vscode from 'vscode';

export function advplFormatterActivate(context: vscode.ExtensionContext) {
    const formatProvider = new advplFormatProvider();
    vscode.languages.registerDocumentFormattingEditProvider('advpl', formatProvider);
}

class advplFormatProvider implements vscode.DocumentFormattingEditProvider {
    provideDocumentFormattingEdits(
        document: vscode.TextDocument,
        options: vscode.FormattingOptions,
        token: vscode.CancellationToken)
        {
            return this.processaFormatAsync(document, options, token);
        }
    
    private async processaFormatAsync(
        document: vscode.TextDocument,
        options: vscode.FormattingOptions,
        token: vscode.CancellationToken)
        {
            try {
                const result = await processaAdvplFormatter(
                    document.getText(),
                    options);
                const edits: vscode.TextEdit[] = [];
                if (result)
                {
                    const range = new vscode.Range(
                        new vscode.Position(0, 0),
                        document.lineAt(document.lineCount - 1).range.end);
                    edits.push(new vscode.TextEdit(range, result));
                }
                return edits;
            } catch (ex) {
                vscode.window.showWarningMessage(ex);
            }
        }
}

const processaAdvplFormatter = (
    content: string,
    options: vscode.FormattingOptions): Promise<string> => {
        return new Promise<string>((resolve, reject) => {
            try {
                //TODO - Implementar formatação AdvPL
                content = "Implementar formatação AdvPL";
                resolve(content);
            } catch (ex) {
                reject(`Erro interno formatação do fonte AdvPL: ${ex.message}`);
            }
        });
    };