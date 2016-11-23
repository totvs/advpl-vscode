import * as child_process from 'child_process';
import * as vscode from 'vscode';
import {readFileSync,existsSync,unlinkSync,statSync} from 'fs';
import {inspect}  from 'util';
import {advplConsole}  from './advplConsole';
import * as fs from 'fs';
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
        this._lastAppreMsg = "";
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

            var child = child_process.spawn(this.debugPath,_args);
            child.stdout.on("data",function(data){
        
            that._lastAppreMsg = "" + data;
            });
            
            child.on("exit",function(data){
                var lRunned = data == 0                
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

        var child = child_process.spawn(this.debugPath,_args);
        child.stdout.on("data",function(data){
      
           that._lastAppreMsg = data+"";
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
                
        this.outChannel.log("Iniciando compilação do fonte "+ sourceName + "\n");
        this.diagnosticCollection.clear();
        this.genericCompile(sourceName );
        
    }
    public compileFolder(folder:string)
    {
        this.outChannel.log("Iniciando compilação da Pasta e sub-Pastas "+ folder + "\n");
        this.diagnosticCollection.clear();
        //var regex = /.*\.(prw|prx)/i;        
        var regex = vscode.workspace.getConfiguration("advpl").get<string>("compileFolderRegex");
        //var files = this.walk(folder,regex);
        var files = folder + "ª" + regex;
        this.genericCompile(files);    
        
    }
    private genericCompile(sourceName :string )
    {
         var _args = new Array<string>()
         var that = this;
        _args.push("--compileInfo=" + this.EnvInfos);
        _args.push("--source=" + sourceName);        
        
        var child = child_process.spawn(this.debugPath,_args);
     
        child.stdout.on("data",function(data){
      
           that._lastAppreMsg += data;
        });
        
        child.on("exit",function(data){
            var lRunned = data == 0
            console.log("exit: " + data);
           that.run_callBack(lRunned);
        });
    }
    public  walk(dir : string,regex){
    var results = "";
    var list = fs.readdirSync(dir);
    for(var i in list) {
        var file = dir + '/' + list[i];
        var stat = fs.statSync(file);
        if (stat && stat.isDirectory()) 
            results += "|" + this.walk(file,regex);
        else 
        {
            if(file.match(regex))
            {
                this.outChannel.log("Compilando:" +file );
                results += file + "|";
            }
            else
            {
                this.outChannel.log("Pulando " +file );
            }
                
        }
    }
    return results;
};
    private run_callBack(lOk)
    {
        
        
         
                if(this._lastAppreMsg != null)
                {
                    var oEr = JSON.parse(this._lastAppreMsg);
                    for (let x = 0; x < oEr.msgs.length;x++)
                    {
                        let msgerr = oEr.msgs[x];

                        
                        let source = msgerr.Source;
                        let lineIndex = Number(msgerr.Line)-1;
                        if(lineIndex<=0)
                            lineIndex = 1;
                        let col =  Number(msgerr.Column);
                        let message = msgerr.Message;
                        let range = new vscode.Range(lineIndex,0, lineIndex, 10);
                        if (source == "NOSOURCE")
                        {
                            vscode.window.showInformationMessage(message);                    
                        }
                        if (msgerr.Type == 0)
                            this.outChannel.log("Erro: "+ message );
                        else
                            this.outChannel.log("Warning: "+ message );
                        let diagnosis = new vscode.Diagnostic(range, message, msgerr.Type == 0?vscode.DiagnosticSeverity.Error :vscode.DiagnosticSeverity.Warning);
                        vscode.workspace.findFiles(source,"")
                        this.diagnosticCollection.set(vscode.Uri.file(source), [diagnosis]);
                        
                    }
                    
                }

                if (lOk)
                {
                    this.outChannel.log("Compilação OK");
                    this.afterCompile();
                }
                    
            
        

    }
}

