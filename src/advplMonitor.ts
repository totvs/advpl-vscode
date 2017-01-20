import * as child_process from 'child_process';
import * as vscode from 'vscode';
import {inspect}  from 'util';
import {advplConsole}  from './advplConsole';
import * as fs from 'fs';
import * as path from 'path';
export class advplMonitor {
    private outChannel : advplConsole;
    private EnvInfos :string;
    private debugPath : string;
    private consoleReturn : string;
    constructor(jSonInfos : string, _outChannel : advplConsole )
    {
        this.outChannel = _outChannel;
        this.EnvInfos = jSonInfos;
        this.debugPath = vscode.extensions.getExtension("KillerAll.advpl-vscode").extensionPath;
        if(process.platform == "darwin")
        {
            this.debugPath += "/bin/AdvplDebugBridgeMac";
        }
        else
        {
            this.debugPath += "\\bin\\AdvplDebugBridge.exe";
        }
             
        
    }

   public getThreads()
    {
        var _args = new Array<string>();
        var that = this;        
                
        _args.push("--compileInfo=" + this.EnvInfos);
        _args.push("--threadsInfo");

        var child = child_process.spawn(this.debugPath,_args);
        child.stdout.on("data",function(data){      
           var xRet = data + "";
          
               that.consoleReturn = xRet;
          
           
        });
        

        child.on("exit",function(data){
           that.outChannel.log(that.consoleReturn);
        });        
    }
    public getRpoInfos()
    {
        var _args = new Array<string>();
        var that = this;        
                
        _args.push("--compileInfo=" + this.EnvInfos);
        _args.push("--getMap");
        this.consoleReturn = "";
        this.outChannel.log("Iniciando a leitura do RPO. Aguarde.")
        var child = child_process.spawn(this.debugPath,_args);
        child.stdout.on("data",function(data){      
           var xRet = data + "";
          
               that.consoleReturn += xRet;
          
           
        });
        

        child.on("exit",function(data){
           that.outChannel.log("RpoInfo criado com sucesso");
          const newFile = vscode.Uri.parse('untitled:' + path.join(vscode.workspace.rootPath, 'rpoInfo.log'));
            vscode.workspace.openTextDocument(newFile).then(document => {
                const edit = new vscode.WorkspaceEdit();
                edit.insert(newFile, new vscode.Position(0, 0), that.consoleReturn);
                return vscode.workspace.applyEdit(edit).then(success => {
                    if (success) {                     
                        vscode.window.showTextDocument(document);
                    } else {
                        vscode.window.showInformationMessage('Error!');
                    }
                });
            });
        });        
    }
    /**
     * Gerar o Client do WS
     */
    public  buildWSClient() : void
    {
        var _args = new Array<string>();
        var that = this;
        this.consoleReturn = "";
        _args.push("--compileInfo=" + this.EnvInfos);
        let options:vscode.InputBoxOptions = {
            prompt : "Informe o URL do Web Service:"            
        }
        var urlws = vscode.window.showInputBox(options).then(info=>{
        if (urlws  != undefined)
        {      
            _args.push("--urlBuildWSClient="+info);

            var child = child_process.spawn(this.debugPath,_args);
            child.stdout.on("data",function(data){
        
            that.consoleReturn += "" + data;
            });
            
            child.on("exit",function(data){
           that.outChannel.log("Web Service criado com sucesso");

           let initNamePos = that.consoleReturn.indexOf("WSCLIENT") + 9;
           let endLine = that.consoleReturn.indexOf("\n",initNamePos);
           let name = that.consoleReturn.substr(initNamePos,endLine-initNamePos);
          const newFile = vscode.Uri.parse('untitled:' + path.join(vscode.workspace.rootPath, name+ 'Client.prw'));
            vscode.workspace.openTextDocument(newFile).then(document => {
                const edit = new vscode.WorkspaceEdit();
                edit.insert(newFile, new vscode.Position(0, 0), that.consoleReturn);
                return vscode.workspace.applyEdit(edit).then(success => {
                    if (success) {                     
                        vscode.window.showTextDocument(document);
                    } else {
                        vscode.window.showInformationMessage('Error!');
                    }
                });
            });
        });      
        }
    });  
    }
}
