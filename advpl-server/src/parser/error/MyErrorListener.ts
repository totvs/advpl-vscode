import {IConnection, Diagnostic, DiagnosticSeverity} from 'vscode-languageserver';
import ErrorListener from './ErrorListener';

const antlr4 = require('antlr4');

export default class MyErrorListener extends ErrorListener {
    conn: IConnection;
    onError: Function;
    constructor(onError: Function){
        super();
        this.onError = onError;
    }
    syntaxError(recognizer, offendingSymbol, line, column, msg, e){
        this.onError(recognizer, offendingSymbol, line, column, msg, e);
    }
}
