import * as process from 'child_process';
import * as vscode from 'vscode';
import {readFileSync,existsSync,unlinkSync,statSync} from 'fs';
import {inspect}  from 'util';
import {advplConsole}  from './advplConsole';

export class advplCompile {
    private EnvInfos :string;
    private diagnosticCollection :  vscode.DiagnosticCollection;
    private _lastAppreMsg :string;
    private debugPath : string;
    private afterCompile
    private outChannel : advplConsole;
    constructor(jSonInfos : string ,d : vscode.DiagnosticCollection, OutPutChannel)
    {
        this.EnvInfos = jSonInfos;
        this.diagnosticCollection =d ;
        this.outChannel =  OutPutChannel;
        this.debugPath = vscode.extensions.getExtension("KillerAll.advpl-vscode").extensionPath+"\\bin\\AdvplDebugBridge.exe";
        //this.debugPath ="C:\\vscode\\cSharpDebug\\AdvplDebugBridge\\AdvplDebugBridge\\AdvplDebugBridge\\bin\\Debug\\AdvplDebugBridge.exe";
//        this.debugPath ="D:\\vscode_advpl\\cSharpDebug\\AdvplDebugBridge\\AdvplDebugBridge\\AdvplDebugBridge\\bin\\Debug\\AdvplDebugBridge.exe";
/*        if(serverVersion === "131327A")
            this._timestamp = "20131227104539";*/
    }
    public setAfterCompileOK(aftercomp)
    {
        this.afterCompile =aftercomp 
    }
    public CipherPassword()
    {
       var _args = new Array<string>();
        var that = this;
        let options:vscode.InputBoxOptions = {
            prompt : "Informe a senha:",
            password : true
        }
        var password = vscode.window.showInputBox(options).then(info=>{
        if (password != undefined)
        {      
            _args.push("--CipherPassword="+info);

            var child = process.spawn(this.debugPath,_args);
            child.stdout.on("data",function(data){
        
            that._lastAppreMsg = data;
            });
            
            child.on("exit",function(data){
                var lRunned = data == 0
                //console.log("exit: " + data);
                //vscode.window.showInformationMessage("Password:"+ that._lastAppreMsg);
                that.outChannel.log("Password:"+ that._lastAppreMsg);
            });
        }
    });  
}
    
    public getHdId()
    {
        var _args = new Array<string>();
        var that = this;        
        //var debugPath = JSON.parse(this.EnvInfos).DebugPath;
        
        _args.push("--compileInfo=" + this.EnvInfos);
        _args.push("--getId");

        var child = process.spawn(this.debugPath,_args);
        child.stdout.on("data",function(data){
      
           that._lastAppreMsg = data;
        });
        
        child.on("exit",function(data){
            var lRunned = data == 0
            console.log("exit: " + data);
           that.outChannel.log("ID:"+that._lastAppreMsg);
            //vscode.window.showInformationMessage("ID:"+that._lastAppreMsg);
           
        });        
    }
    public compile(sourceName:string)
    {
        var that = this;
        var _args = new Array<string>()
        
         
        this.outChannel.log("Iniciando compilação do fonte "+ sourceName + "\n");
        this.diagnosticCollection.clear();
        _args.push("--compileInfo=" + this.EnvInfos);
        _args.push("--source=" + sourceName);        
        
        var child = process.spawn(this.debugPath,_args);
     
        child.stdout.on("data",function(data){
      
           that._lastAppreMsg = data;
        });
        
        child.on("exit",function(data){
            var lRunned = data == 0
            console.log("exit: " + data);
           that.run_callBack(lRunned);
        });
        
    }
    private run_callBack(lOk)
    {
        
        
            if (!lOk)
            {
                var values = String.fromCharCode.apply(null, this._lastAppreMsg).split('|');
                var source = values[0];
                var lineIndex = Number(values[1])-1;
                var col =  Number(values[2]);
                var message = values[3];
               if (source == "NOSOURCE")
               {
                vscode.window.showInformationMessage(message);
                this.outChannel.log("Erro: "+ message );
               }
               else
               {
                this.outChannel.log("Compiler Erro." );
                var range = new vscode.Range(lineIndex,0, lineIndex, 10);
                let diagnosis = new vscode.Diagnostic(range, message, vscode.DiagnosticSeverity.Error);
                vscode.workspace.findFiles(source,"")
                this.diagnosticCollection.set(vscode.Uri.file(source), [diagnosis]);
                }
            }
            else
            {
                this.outChannel.log("" + this._lastAppreMsg);
                this.outChannel.log("Compilação OK");
                this.afterCompile();
            }
        

    }
}

