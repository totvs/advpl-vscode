'use strict';

import {
	IPCMessageReader, IPCMessageWriter,
	createConnection, IConnection, TextDocumentSyncKind,
	TextDocuments, TextDocument, Diagnostic, DiagnosticSeverity,
	InitializeParams, InitializeResult, TextDocumentPositionParams,
	CompletionItem, CompletionItemKind
} from 'vscode-languageserver';
import * as proto from 'vscode-languageserver-types';
import * as child_process from 'child_process';

import InputStream from './parser/util/NoCaseInputStream';
import MyErrorListener from './parser/error/MyErrorListener';
import {consoleProtocol} from './consoleProtocol';

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
let parseConsole:consoleProtocol;
let child;
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
// The settings interface describe the server relevant settings part
interface Settings {
	languageServerAdvpl: AdvplSettings;
}

// These are the example settings we defined in the client's package.json
// file
interface AdvplSettings {
	advplParserPath: string;
}

// hold the maxNumberOfProblems setting
let advplParserPath: string;
connection.onDidChangeConfiguration((change) => {
	let settings = <Settings>change.settings;
	advplParserPath = settings.languageServerAdvpl.advplParserPath;
	
});
connection.onDidOpenTextDocument((params) => {
	// A text document got opened in VSCode.
	// params.uri uniquely identifies the document. For documents store on disk this is a file URI.
	// params.text the initial full content of the document.
	if (child==null)
	{
		//C:\\vscode\\advpl-vscode\\advpl\\server
		 
		child = child_process.spawn( advplParserPath + "advpl-parser.exe");
		parseConsole = new consoleProtocol();
		parseConsole.connect(child.stdout,child.stdin);
	}
	connection.console.log(params.textDocument.uri + ' opened.');
	parseText(params.textDocument.text, params.textDocument.uri);
	//console.log(this.tree);
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
	/*const antlr4 = require('antlr4');
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
*/
	
	//Quando finaliza o parser, manda as mensagens para o VSCODE
	//connection.sendDiagnostics({ uri: uri, diagnostics : diagnostics })
	parseConsole.doSend("parse",{source : input},function(parserInfo){
	if(parserInfo.success)
	{
	let diagnostics: Diagnostic[] = [];
	var line;
	var column;
	var msg;
	var size;
	var data = parserInfo.body;
	for (var key in data.Errors) {
		var obj = data.Errors[key];
		line = obj.Line;	
		column = 1;// obj.Column;
		msg =  obj.Message;
		size = obj.TokenSize;
	
	

	//function onError(recognizer, offendingSymbol, line, column, msg, e){
			connection.console.log(JSON.stringify(parserInfo));
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
	connection.sendDiagnostics({ uri: uri, diagnostics : diagnostics })
	}

});
	
}

// Listen on the connection
connection.listen();