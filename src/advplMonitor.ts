import * as child_process from 'child_process';
import * as vscode from 'vscode';
import {inspect}  from 'util';
import {advplConsole}  from './advplConsole';
import * as fs from 'fs';
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

}
