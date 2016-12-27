'use strict';
import * as vscode from 'vscode';
import {advplCompile} from './advplCompile';
import {smartClientLaunch} from './smartClientLaunch';
import {advplConsole} from './advplConsole';
import {advplPatch} from './advplPatch';
import {advplMonitor} from './advplMonitor';
import {Enviroment} from './advplEnviroment';
import EnvObject from './Environment';
import { spawn, execFile, ChildProcess } from 'child_process';
import * as path from 'path';
import { LanguageClient, LanguageClientOptions, StreamInfo } from 'vscode-languageclient';
import * as net from 'net';
import * as url from 'url';
import * as fs from 'fs';
import { StringDecoder } from 'string_decoder';
let advplDiagnosticCollection = vscode.languages.createDiagnosticCollection();
let OutPutChannel = new advplConsole() ; 
let fileToBuildPath;
let env;
export function activate(context: vscode.ExtensionContext) {


    context.subscriptions.push(getProgramName());
    context.subscriptions.push(startSmartClient());    
    context.subscriptions.push(addGetDebugInfosCommand());
    context.subscriptions.push(compile());
    context.subscriptions.push(menucompile());
    context.subscriptions.push(menucompilemulti());
    context.subscriptions.push(getAuthorizationId()); 
    context.subscriptions.push(CipherPassword());
    context.subscriptions.push(selectEnviroment());
    

    //Binds dos comandos de patch
    context.subscriptions.push(PathSelectSource());
    context.subscriptions.push(PathApply());
    context.subscriptions.push(PathBuild());
    context.subscriptions.push(PathInfo());
    context.subscriptions.push(PathSelectFolder());
    context.subscriptions.push(PathFileToBuild());
    //Binds do monitor
    context.subscriptions.push(GetThreads());
    context.subscriptions.push(GetRpoInfos());
    
    //Enviroment no bar
    env = new Enviroment();
    env.update(vscode.workspace.getConfiguration("advpl").get("selectedEnvironment"));
    //initLanguageServer(context);
}


export function deactivate() {
}
var lastProgram : string = "";
function getProgramName()
{
   let disposable = vscode.commands.registerCommand('advpl.getProgramName', () => {        
        let p = vscode.window.showInputBox({placeHolder: "Informe o program",value:  lastProgram});
        p.then(function(select){
            lastProgram = select;
        });
         
        return p;
	});
    return disposable;
}
/**
 * Inicia Language Server
 */
function initLanguageServer(context: vscode.ExtensionContext)
{
  let executablePath = "D:\\vscode_advpl\\advpl-language-server\\bin\\x86\\Debug\\advpl-language-server.exe"; 
  const serverOptions = () => new Promise<ChildProcess | StreamInfo>((resolve, reject) => {
        function spawnServer(...args: string[]): ChildProcess {
            // The server is implemented in C#         
            const childProcess = spawn(executablePath, args);
            childProcess.stderr.on('data', (chunk: Buffer) => {
                console.error(chunk + '');
            });
            childProcess.stdout.on('data', (chunk: Buffer) => {
                console.log(chunk + '');
            });
            return childProcess;
        }
    resolve(spawnServer());

    });
      // Options to control the language client
    const clientOptions: LanguageClientOptions = {
        // Register the server for php documents
        documentSelector: ['advpl'],
        
        synchronize: {
            // Synchronize the setting section 'php' to the server
            configurationSection: 'advpl'
            // Notify the server about file changes to composer.json files contain in the workspace
            
        }
    };

    // Create the language client and start the client.
    const disposable = new LanguageClient('Advpl Language Server', serverOptions, clientOptions).start();

    // Push the disposable to the context's subscriptions so that the
    // client can be deactivated on extension deactivation
    context.subscriptions.push(disposable);

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
        if (editor.document.isDirty)
        {
            let list = ["Sim","Não"];
            vscode.window.showQuickPick(list,{placeHolder:"O arquivo não está salvo e foi modificado, deseja salva-lo antes de compilar?"}).then(function(select){
            console.log(select);
            
            if (select==="Sim")
            {
                editor.document.save().then(function(select){
                __internal_compile(cSource,editor);
            }
            )
               
            }
            else
            {
                vscode.window.setStatusBarMessage('Ação cancelado pelo usuario, fonte não compilado!!!',5000);
            }
        })
            
            
        }
        else
        {
            __internal_compile(cSource,editor);
        }
       

});
return disposable;
}
function __internal_compile(cSource,editor)
{

     vscode.window.setStatusBarMessage('Starting advpl compile...' + editor.document.fileName,3000);
        var compile = new advplCompile(JSON.stringify(vscode.workspace.getConfiguration("advpl")),advplDiagnosticCollection, OutPutChannel);
        let encoding = vscode.workspace.getConfiguration("files").get("encoding");
        compile.setEncoding(encoding);
                compile.setAfterCompileOK(function (){
                   // vscode.window.showInformationMessage('Source ' + editor.document.fileName + ' Compiled!!! :D') ;
                    vscode.window.setStatusBarMessage('Source ' + editor.document.fileName + ' Compiled!!! :D',3000);
                });
                compile.compile(cSource);
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
/***
 * Patchs
 */
function PathSelectSource() 
{
let disposable = vscode.commands.registerCommand('advpl.patch.selectSource', function (context)  {
            vscode.window.showInformationMessage("Não implementado ainda.");
    });
return disposable;
}
function PathApply() 
{
let disposable = vscode.commands.registerCommand('advpl.patch.apply', function (context)  {
            var cResource = context._fsPath;
            if(fs.lstatSync(cResource).isFile())
            {
                var patch = new advplPatch(JSON.stringify(vscode.workspace.getConfiguration("advpl")),OutPutChannel)
                patch.apply(cResource);
                
            }
            else
            {
                vscode.window.showErrorMessage("Escolha uma arquivo PTM.");
            }
    });
return disposable;
}
function PathInfo() 
{
let disposable = vscode.commands.registerCommand('advpl.patch.info', function (context)  {
            var cResource = context._fsPath;
            if(fs.lstatSync(cResource).isFile())
            {
                var patch = new advplPatch(JSON.stringify(vscode.workspace.getConfiguration("advpl")),OutPutChannel)
                patch.info(cResource);
                
            }
            else
            {
                vscode.window.showErrorMessage("Escolha uma arquivo PTM.");
            }
    });
return disposable;
}
function PathBuild() 
{
let disposable = vscode.commands.registerCommand('advpl.patch.build', function (context)  {         
            var patch = new advplPatch(JSON.stringify(vscode.workspace.getConfiguration("advpl")),OutPutChannel)
            if (fileToBuildPath == null )
            {
                vscode.window.showErrorMessage("Informe o arquivo texto para com os fontes para serem gerados.");
            }                
           else
           {
                if (!fs.lstatSync(fileToBuildPath).isFile())
                    vscode.window.showErrorMessage("Informe o arquivo texto para com os fontes para serem gerados.");
                else
                    patch.build(fileToBuildPath);
           }
             
    });
return disposable;
}

  
function PathSelectFolder() 
{
let disposable = vscode.commands.registerCommand('advpl.patch.selectFolder', function (context)  {
            vscode.window.showInformationMessage("Não implementado ainda.");
    });
return disposable;
}

function PathFileToBuild() 
{
let disposable = vscode.commands.registerCommand('advpl.patch.setFileToBuild', function (context)  {
            var cResource = context._fsPath;
            if(fs.lstatSync(cResource).isFile())
            {
                fileToBuildPath = cResource;
                vscode.window.showInformationMessage("O arquivo " + cResource + " foi selecionado para se a lista de fontes para patch.");
            }
            else
            {
                vscode.window.showInformationMessage("Informe um arquivo. ");
            }
    });
return disposable;
}

function GetThreads()
{
let disposable = vscode.commands.registerCommand('advpl.monitor.getThreads', function (context)  {
        var monitor = new advplMonitor(JSON.stringify(vscode.workspace.getConfiguration("advpl")),OutPutChannel)
        monitor.getThreads();
    });
    
return disposable;


}
function GetRpoInfos()
{
let disposable = vscode.commands.registerCommand('advpl.monitor.getRpoInfos', function (context)  {
        var monitor = new advplMonitor(JSON.stringify(vscode.workspace.getConfiguration("advpl")),OutPutChannel)
        monitor.getRpoInfos();
    });
    
return disposable;


}


function selectEnviroment()
{
let disposable = vscode.commands.registerCommand('advpl.selectEnviroment', function (context)  {
        
        var obj = vscode.workspace.getConfiguration("advpl").get<any>("environments");
        let list = obj.map(env => env["environment"]);
        vscode.window.showQuickPick(list).then(function(select){
            console.log(select);
            let oSelectEnv = obj.find(env =>env["environment"] === select);
            if (oSelectEnv)
            {
                let error = validEnvironment(oSelectEnv);
                if(error){
                    vscode.window.showErrorMessage(error);
                }else{
                    let updObj = vscode.workspace.getConfiguration("advpl");

                    updObj.update("selectedEnvironment",select);
                    vscode.window.showInformationMessage("Ambiente " + select + " selecionado com sucesso.");
                    env.update(select);
                }
                

            }
            else
            {
                vscode.window.showErrorMessage("Environment não encontrado.!!!");
            }
        })
        
        //vscode.window.showQuickPick(obj.environments)
    });
    
return disposable;

}


function validEnvironment(environment){
    let env = new EnvObject().deserialize(environment),
        errors = env.getErrors(),
        msgError;
    if(errors.length > 0){
        msgError = errors.join(' - ');
    }

    return msgError;
}
