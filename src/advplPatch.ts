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
    public build(file : String)
    {
        var _args = new Array<string>();
        var that = this;        
                
        _args.push("--compileInfo=" + this.EnvInfos);
        _args.push("--patchBuild=" + file);

        var child = child_process.spawn(this.debugPath,_args);
        child.stdout.on("data",function(data){
      
            var xRet = data + "";
           if (xRet.indexOf("|") > 0) 
           {
                var values = String.fromCharCode.apply(null, data).split('|');
                that.consoleReturn = "Build Failure:" + values[3];
           }
           else
           {
               that.consoleReturn = xRet;
           }
        });
        

        child.on("exit",function(data){         
           that.outChannel.log(that.consoleReturn);
            
           
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
           var xRet = data + "";
           if (xRet.indexOf("|") > 0) 
           {
                var values = String.fromCharCode.apply(null, data).split('|');
                that.consoleReturn = "Apply Failure:" + values[3];
           }
           else
           {
               that.consoleReturn = xRet;
           }
           
        });
        

        child.on("exit",function(data){
           that.outChannel.log(that.consoleReturn);
        });        
    }

}