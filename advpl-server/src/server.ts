'use strict';

import {
	IPCMessageReader, IPCMessageWriter,
	createConnection, IConnection, TextDocumentSyncKind,
	TextDocuments, TextDocument, Diagnostic, DiagnosticSeverity,
	InitializeParams, InitializeResult, TextDocumentPositionParams,
	CompletionItem, CompletionItemKind
} from 'vscode-languageserver';

import * as proto from 'vscode-languageserver-types';

import InputStream from './parser/util/NoCaseInputStream';
import MyErrorListener from './parser/error/MyErrorListener';

// Create a connection for the server. The connection uses Node's IPC as a transport
let connection: IConnection = createConnection(new IPCMessageReader(process), new IPCMessageWriter(process));

// Create a simple text document manager. The text document manager
// supports full document sync only
let documents: TextDocuments = new TextDocuments();

let symbols: proto.SymbolInformation[] = [];
// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);

// After the server has started the client sends an initilize request. The server receives
// in the passed params the rootPath of the workspace plus the client capabilites. 
let workspaceRoot: string;
connection.onInitialize((params): InitializeResult => {
	workspaceRoot = params.rootPath;
	connection.console.log('Starting Advpl Language Server...');
	return {
		capabilities: {
			// Tell the client that the server works in FULL text document sync mode
			textDocumentSync: documents.syncKind,
			documentSymbolProvider: false,
			workspaceSymbolProvider: false
		}
	}
});

connection.onDidOpenTextDocument((params) => {
	// A text document got opened in VSCode.
	// params.uri uniquely identifies the document. For documents store on disk this is a file URI.
	// params.text the initial full content of the document.
	connection.console.log(params.textDocument.uri + ' opened.');
	parseText(params.textDocument.text, params.textDocument.uri);
	//console.log(this.tree);
});

documents.onDidChangeContent((change) => {
	connection.console.log(change.document.uri + ' changed. onDidChangeContent');
	parseText(change.document.getText(),change.document.uri);
});
var timeout;
connection.onDidChangeTextDocument((params) => {
    // The content of a text document did change in VS Code.
    // params.uri uniquely identifies the document.
    // params.contentChanges describe the content changes to the document.
	if (timeout != null)
        clearTimeout(timeout);
    timeout = setInterval(function () {
		clearTimeout(timeout);
        timeout = null;
		parseText(params.contentChanges[0].text, params.textDocument.uri);
	},500);
	
});

function parseText(input: string, uri: string){
	const antlr4 = require('antlr4');
	const AdvplLexer=require("./parser/generated/AdvplLexer");
	const AdvplParser=require("./parser/generated/AdvplParser");
	let diagnostics: Diagnostic[] = [];
	
	var chars = new InputStream(input);
	var lexer = new AdvplLexer.AdvplLexer(chars);
	lexer.removeErrorListeners();
	var tokens  = new antlr4.CommonTokenStream(lexer);
	var parser = new AdvplParser.AdvplParser(tokens);
	parser.removeErrorListeners();
	parser.addErrorListener(new MyErrorListener(onError));
	parser.buildParseTrees = true;
	parser.program();

	//Quando finaliza o parser, manda as mensagens para o VSCODE
	connection.sendDiagnostics({ uri: uri, diagnostics : diagnostics })

	function onError(recognizer, offendingSymbol, line, column, msg, e){
		
        diagnostics.push({
                severity: DiagnosticSeverity.Error,
                range: {
                    start: { line: line-1, character: column},
                    end: { line: line-1, character: column }
                },
                message: msg,
                source: 'ex'
            });
	}
}

// Listen on the connection
connection.listen();