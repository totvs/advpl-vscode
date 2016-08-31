'use strict';
import * as vscode from 'vscode';
import {advplCompile} from './advplCompile';
import {smartClientLaunch} from './smartClientLaunch';

let advplDiagnosticCollection = vscode.languages.createDiagnosticCollection();

export function activate(context: vscode.ExtensionContext) {

    context.subscriptions.push(getProgramName());
    context.subscriptions.push(startSmartClient());    
    context.subscriptions.push(addGetDebugInfosCommand());
    context.subscriptions.push(compile());
    context.subscriptions.push(getAuthorizationId()); 
    context.subscriptions.push(CipherPassword());
}


export function deactivate() {
}
function getProgramName()
{
   let disposable = vscode.commands.registerCommand('advpl.getProgramName', () => {
        var startProgram = vscode.workspace.getConfiguration("advpl").get<string>("startProgram");
		return vscode.window.showInputBox({
			placeHolder: "Informe o program",
			value: startProgram
		});
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
        scPath += "smartclient.exe";
        var obj2  = new smartClientLaunch(scPath);
        obj2.start();
    });
    return disposable;
}
function compile()
{
   
let disposable = vscode.commands.registerCommand('advpl.compile', function (context)  {
        
        var editor = vscode.window.activeTextEditor;
        var cSource = editor.document.fileName;
        vscode.window.setStatusBarMessage('Starting advpl compile...' + editor.document.fileName,3000);
        var compile = new advplCompile(JSON.stringify(vscode.workspace.getConfiguration("advpl")),advplDiagnosticCollection);
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
     return  JSON.stringify(vscode.workspace.getConfiguration("advpl"));   
    });
return disposable
}

function getAuthorizationId() 
{
let disposable = vscode.commands.registerCommand('advpl.getAuthorizationId', function (context)  {
       var compile = new advplCompile(JSON.stringify(vscode.workspace.getConfiguration("advpl")),advplDiagnosticCollection);
       compile.getHdId();
          
    });
return disposable
}

function CipherPassword() 
{
let disposable = vscode.commands.registerCommand('advpl.CipherPassword', function (context)  {
       var compile = new advplCompile(JSON.stringify(vscode.workspace.getConfiguration("advpl")),advplDiagnosticCollection);
       compile.CipherPassword();
          
    });
return disposable
}

