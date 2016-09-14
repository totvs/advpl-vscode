'use strict';

import {
	IPCMessageReader, IPCMessageWriter,
	createConnection, IConnection, TextDocumentSyncKind,
	TextDocuments, TextDocument, Diagnostic, DiagnosticSeverity,
	InitializeParams, InitializeResult, TextDocumentPositionParams,
	CompletionItem, CompletionItemKind
} from 'vscode-languageserver';

import * as proto from 'vscode-languageserver-types';

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
			workspaceSymbolProvider: false,
			// Tell the client that the server support code complete
			completionProvider: {
				resolveProvider: false
			}
		}
	}
});


// Listen on the connection
connection.listen();