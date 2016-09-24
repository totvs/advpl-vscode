'use strict';
import * as vscode from 'vscode';
import {advplCompile} from './advplCompile';
import {smartClientLaunch} from './smartClientLaunch';
import {advplConsole} from './advplConsole';
import * as path from 'path';
import * as fs from 'fs';
import { LanguageClient, LanguageClientOptions, SettingMonitor, ServerOptions, TransportKind } from 'vscode-languageclient';
let advplDiagnosticCollection = vscode.languages.createDiagnosticCollection();
let OutPutChannel = new advplConsole() ; 
export function activate(context: vscode.ExtensionContext) {

    

    context.subscriptions.push(getProgramName());
    context.subscriptions.push(startSmartClient());    
    context.subscriptions.push(addGetDebugInfosCommand());
    context.subscriptions.push(compile());
    context.subscriptions.push(menucompile());
    context.subscriptions.push(menucompilemulti());
    context.subscriptions.push(getAuthorizationId()); 
    context.subscriptions.push(CipherPassword());

    //Binds dos comandos de patch
    context.subscriptions.push(PathSelectSource());
    context.subscriptions.push(PathBuild());
    context.subscriptions.push(PathClear());
    context.subscriptions.push(PathList());


    //Configuração do Language Server
    context.subscriptions.push(LanguageServer(context))


}


export function deactivate() {
}
function getProgramName()
{
   let disposable = vscode.commands.registerCommand('advpl.getProgramName', () => {
        var startProgram = vscode.workspace.getConfiguration("advpl").get<string>("startProgram");
		//value: startProgram/
        const p = vscode.window.showInputBox({placeHolder: "Informe o program"});
        
        return p;
	});
    return disposable;
}
/**
 * Inicia o smartClient
 */
function startSmartClient()
{
let disposable = vscode.commands.registerCommand('advpl.startSmartClient', () => {
        
        var scPath :string; 
        scPath = vscode.workspace.getConfiguration("advpl").get<string>("smartClientPath");
       // scPath += "smartclient.exe";
        var obj2  = new smartClientLaunch(scPath);
        obj2.start();
    });
    return disposable;
}
function menucompile()
{
   
let disposable = vscode.commands.registerCommand('advpl.menucompile', function (context)  {
        
        //var editor = vscode.window.activeTextEditor;
        var cSource = context._fsPath;
        vscode.window.setStatusBarMessage('Starting advpl compile...' + cSource,3000);
        var compile = new advplCompile(JSON.stringify(vscode.workspace.getConfiguration("advpl")),advplDiagnosticCollection, OutPutChannel);
                compile.setAfterCompileOK(function (){
                   // vscode.window.showInformationMessage('Source ' + editor.document.fileName + ' Compiled!!! :D') ;
                    vscode.window.setStatusBarMessage('Source ' + cSource + ' Compiled!!! :D',3000);
                });
                compile.compile(cSource);

});
return disposable;
}
function menucompilemulti()
{
   
let disposable = vscode.commands.registerCommand('advpl.menucompilemulti', function (context)  {
        
        //var editor = vscode.window.activeTextEditor;
        var cResource = context._fsPath;
        if(fs.lstatSync(cResource).isDirectory())
        {
            vscode.window.setStatusBarMessage('Starting advpl folder compiler...' + cResource,3000);
              var compile = new advplCompile(JSON.stringify(vscode.workspace.getConfiguration("advpl")),advplDiagnosticCollection, OutPutChannel);
                compile.setAfterCompileOK(function (){            
                    vscode.window.setStatusBarMessage('Folder ' + cResource + ' Compiled!!! :D',3000);
                });
                compile.compileFolder(cResource);
        }
            
        else
            vscode.window.showInformationMessage('Por favor selecione uma pasta.') ;
      /*  var compile = new advplCompile(JSON.stringify(vscode.workspace.getConfiguration("advpl")),advplDiagnosticCollection, OutPutChannel);
                compile.setAfterCompileOK(function (){
                   // vscode.window.showInformationMessage('Source ' + editor.document.fileName + ' Compiled!!! :D') ;
                    vscode.window.setStatusBarMessage('Source ' + cSource + ' Compiled!!! :D',3000);
                });
                compile.compile(cSource);*/

});
return disposable;
}

function compile()
{
   
let disposable = vscode.commands.registerCommand('advpl.compile', function (context)  {
        
        var editor = vscode.window.activeTextEditor;
        var cSource = editor.document.fileName;
        vscode.window.setStatusBarMessage('Starting advpl compile...' + editor.document.fileName,3000);
        var compile = new advplCompile(JSON.stringify(vscode.workspace.getConfiguration("advpl")),advplDiagnosticCollection, OutPutChannel);
                compile.setAfterCompileOK(function (){
                   // vscode.window.showInformationMessage('Source ' + editor.document.fileName + ' Compiled!!! :D') ;
                    vscode.window.setStatusBarMessage('Source ' + editor.document.fileName + ' Compiled!!! :D',3000);
                });
                compile.compile(cSource);

});
return disposable;
}

function addGetDebugInfosCommand()
{
let disposable = vscode.commands.registerCommand('advpl.getDebugInfos', function (context)  {
    var _jSon = vscode.workspace.getConfiguration("advpl");
    var Jstring = JSON.stringify(_jSon);  
     return Jstring;    
    });
return disposable;
}

function getAuthorizationId() 
{
let disposable = vscode.commands.registerCommand('advpl.getAuthorizationId', function (context)  {
       var compile = new advplCompile(JSON.stringify(vscode.workspace.getConfiguration("advpl")),advplDiagnosticCollection,OutPutChannel);
       compile.getHdId();
          
    });
return disposable;
}

function CipherPassword() 
{
let disposable = vscode.commands.registerCommand('advpl.CipherPassword', function (context)  {
       var compile = new advplCompile(JSON.stringify(vscode.workspace.getConfiguration("advpl")),advplDiagnosticCollection,OutPutChannel);
       compile.CipherPassword();
          
    });
return disposable;
}

function PathSelectSource() 
{
let disposable = vscode.commands.registerCommand('advpl.patch.selectSource', function (context)  {
            vscode.window.showInformationMessage("Não implementado ainda.");
    });
return disposable;
}

function PathBuild() 
{
let disposable = vscode.commands.registerCommand('advpl.patch.build', function (context)  {
            vscode.window.showInformationMessage("Não implementado ainda.");
    });
return disposable;
}

function PathClear() 
{
let disposable = vscode.commands.registerCommand('advpl.patch.clear', function (context)  {
            vscode.window.showInformationMessage("Não implementado ainda.");
    });
return disposable;
}

function PathList() 
{
let disposable = vscode.commands.registerCommand('advpl.patch.list', function (context)  {
            vscode.window.showInformationMessage("Não implementado ainda.");
    });
return disposable;
}



function LanguageServer( context ){
  	// The server is implemented in node
	let serverModule = context.asAbsolutePath(path.join('server', 'server.js'));
	// The debug options for the server
	let debugOptions = { execArgv: ["--nolazy", "--debug=6004"] };
	
	// If the extension is launched in debug mode then the debug server options are used
	// Otherwise the run options are used
	let serverOptions: ServerOptions = {
		run : { module: serverModule, transport: TransportKind.ipc },
		debug: { module: serverModule, transport: TransportKind.ipc, options: debugOptions }
	}
	
	// Options to control the language client
	let clientOptions: LanguageClientOptions = {
		// Register the server for plain text documents
		documentSelector: ['advpl'],
		synchronize: {
			// Notify the server about file changes to '.clientrc files contain in the workspace
			fileEvents: vscode.workspace.createFileSystemWatcher('**/.clientrc')
		}
	}
	
	// Create the language client and start the client.
	let disposable = new LanguageClient('Advpl Language Server', serverOptions, clientOptions).start();
    return disposable;  
}
