import * as child_process from 'child_process';
import * as vscode from 'vscode';
import {inspect}  from 'util';
import {advplConsole}  from './advplConsole';
import * as fs from 'fs';
export class advplPatch {
    private outChannel : advplConsole;
    private EnvInfos :string;
    private debugPath : string;
    private consoleReturn
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
    public build()
    {
        var _args = new Array<string>();
        var that = this;        
                
        _args.push("--compileInfo=" + this.EnvInfos);
        _args.push("--patchBuild=C:\\temp\\patch.txt");

        var child = child_process.spawn(this.debugPath,_args);
        child.stdout.on("data",function(data){
      
           that.consoleReturn = data;
        });
        

        child.on("exit",function(data){
            var lRunned = data == 0
            console.log("exit: " + data);
           that.outChannel.log("ID:"+that.consoleReturn);
            //vscode.window.showInformationMessage("ID:"+that._lastAppreMsg);
           
        });        
    }

     public apply(patchApply : string)
    {
        var _args = new Array<string>();
        var that = this;        
                
        _args.push("--compileInfo=" + this.EnvInfos);
        _args.push("--patchApply="+ patchApply);

        var child = child_process.spawn(this.debugPath,_args);
        child.stdout.on("data",function(data){
      
           that.consoleReturn = data;
        });
        

        child.on("exit",function(data){
            var lRunned = data == 0
            console.log("exit: " + data);
           that.outChannel.log("ID:"+that.consoleReturn);
            //vscode.window.showInformationMessage("ID:"+that._lastAppreMsg);
           
        });        
    }

}