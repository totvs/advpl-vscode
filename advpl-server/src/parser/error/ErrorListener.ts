import {IConnection, Diagnostic, DiagnosticSeverity} from 'vscode-languageserver';

const antlr4 = require('antlr4');

export default class ErrorListener {
    constructor(){
        antlr4.error.ErrorListener.apply(this, arguments)
        return new antlr4.error.ErrorListener();
    }
}

ErrorListener["prototype"] = antlr4.error.ErrorListener.prototype;
