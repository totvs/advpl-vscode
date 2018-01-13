import * as child_process from 'child_process';
import * as vscode from 'vscode';
import {readFileSync,existsSync,unlinkSync,statSync} from 'fs';
import {inspect}  from 'util';
import {advplConsole}  from './advplConsole';
import {advplDebugBridgePath} from './utils';
import * as path from 'path';
import * as fs from 'fs';
export class advplCompile {
    private EnvInfos :string;
    private diagnosticCollection :  vscode.DiagnosticCollection;
    private _lastAppreMsg :string;
    private debugPath : string;
    private afterCompile;
    private onError;
    private outChannel : advplConsole;
    private encoding : string;
    private compileStartTime
    constructor(jSonInfos : string ,d : vscode.DiagnosticCollection, OutPutChannel)
    {
        this.EnvInfos = jSonInfos;
        this.diagnosticCollection =d ;
        this.outChannel =  OutPutChannel;
        this._lastAppreMsg = "";
        this.debugPath = advplDebugBridgePath();
        this.encoding ="";
    }
    public setEncoding(enc)
    {
        this.encoding = enc;
    }
    public setAfterCompileOK(aftercomp)
    {
        this.afterCompile =aftercomp; 
    }
    public setonError(func)
    {
        this.onError =func;
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
        if(this.encoding != "")
        {
            _args.push("--encoding="+this.encoding);
        }            
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
    public compileText(textFile:string)
    {
        this.outChannel.log("Iniciando compilação de arquivo TXT "+ textFile + "\n");
        this.diagnosticCollection.clear();
        //var regex = /.*\.(prw|prx)/i;        
        var regex = "TEXTFILE:"+vscode.workspace.rootPath;// vscode.workspace.getConfiguration("advpl").get<string>("compileFolderRegex");
        //var files = this.walk(folder,regex);
        var files = textFile  + "ª" + regex;
        this.genericCompile(files);    
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
    public compileProject(project:string)
    {
        
        this.outChannel.log("Iniciando compilação do projeto "+ project + "\n");
        this.diagnosticCollection.clear();
        //var regex = /.*\.(prw|prx)/i;        
        var regex = "PROJECT";// vscode.workspace.getConfiguration("advpl").get<string>("compileFolderRegex");
        //var files = this.walk(folder,regex);
        var files = project + "ª" + regex;
        this.genericCompile(files);    
    }
    private genericCompile(sourceName :string )
    {
        this.compileStartTime = new Date(); 
        var _args = new Array<string>()
         var that = this;
        _args.push("--compileInfo=" + this.EnvInfos);
        _args.push("--source=" + sourceName);        
        
        this.outChannel.log("Compile Start at "+ new Date() + "\n");
        var child = child_process.spawn(this.debugPath,_args);
     
        child.stdout.on("data",function(data){
      
           that._lastAppreMsg += data;
        });
        
        child.on("exit",function(data){
            var lRunned = data == 0
            console.log("exit: " + data);
           that.run_callBack(lRunned);
           var endTime; 
           endTime = new Date();
           let timeDiff = (endTime - that.compileStartTime); //in ms            
           timeDiff /= 1000;
           that.outChannel.log("Compile Finish at "+ new Date() + " Elapsed  (" + timeDiff + " segs.)\n"); 
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
         
            try
            {
            if(this._lastAppreMsg != null)
                {
                    var oEr = JSON.parse(this._lastAppreMsg);
                    
                    let source;
                    
                    for (let x = 0; x < oEr.msgs.length;x++)
                    {
                        let sourceArray = oEr.msgs[x];
                        let diags: vscode.Diagnostic[] = [];                        
                        source = sourceArray.Key;
                        for (let y =0 ; y < sourceArray.Value.length; y++)
                        {
                            let msgerr = sourceArray.Value[y];
                            let lineIndex = Number(msgerr.Line)-1;
                            if(lineIndex<=0)
                                lineIndex = 1;
                            let col =  Number(msgerr.Column);
                            let message = msgerr.Message;
                            let range = new vscode.Range(lineIndex,0, lineIndex, 10);
                            if (source == "NOSOURCE")
                            {
                                //vscode.window.showInformationMessage(message);
                                this.outChannel.log(message);
                            }
                            else
                            {
                                if (msgerr.Type == 0)
                                    this.outChannel.log("Erro: "+ message );
                                else
                                    this.outChannel.log("Warning: "+ message );
                                let diagnosis = new vscode.Diagnostic(range, message, msgerr.Type == 0?vscode.DiagnosticSeverity.Error :vscode.DiagnosticSeverity.Warning);
                                //vscode.workspace.findFiles(source,"")
                                diags.push (diagnosis);
                            }
                        }
                        if(diags.length > 0)
                        {
                            this.diagnosticCollection.set(vscode.Uri.file(source), diags);
                        }
                        
                        
                        
                        
                    }
                    
                    
                }

                if (lOk)
                {
                    this.outChannel.log("Compilação OK");
                    this.afterCompile();
                }
                else
                {
                    this.onError();    
                }
            }       
            catch (ex)
            {
                this.outChannel.log(ex);
                this.onError();
            }
        

    }

    public deleteSource() : void
    {
                
        
        let options:vscode.InputBoxOptions = {
            prompt : "Informe o(s) nome(s) do(s) fonte(s) que serão excluido(s):"            
        }
        var dlg = vscode.window.showInputBox(options).then(info=>{
            if (info  != undefined)
            {      
                this.outChannel.log("Iniciando exclusão do(s) fonte(s) "+ info+ "\n");
                this.diagnosticCollection.clear();
            var _args = new Array<string>()
            var that = this;
            _args.push("--compileInfo=" + this.EnvInfos);
            _args.push("--deleteSource=" + info);        
            
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
        });

    }
    public defragRPO() : void
    {
        this.outChannel.log("Iniciando a Desfragmentação do RPO \n");
        this.diagnosticCollection.clear();
        var _args = new Array<string>()
        var that = this;
        _args.push("--compileInfo=" + this.EnvInfos);
        _args.push("--defragRpo");        
        
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
    public BuildPPO(sourceName:string)
    {
                
        this.outChannel.log("Iniciando compilação do fonte "+ sourceName + "\n");        
        this.diagnosticCollection.clear();        
        this.buildPPOCall(sourceName );
        
    }   
    private buildPPOCall(sourceName :string )
    {
        this.compileStartTime = new Date(); 
        var _args = new Array<string>()
         var that = this;
        _args.push("--compileInfo=" + this.EnvInfos);
        _args.push("--source=" + sourceName);        
        _args.push("--buildPPO");        
        
        this.outChannel.log("PPO build Start at "+ new Date() + "\n");
        var child = child_process.spawn(this.debugPath,_args);
        
        child.stdout.on("data",function(data){
            
                 that._lastAppreMsg += data;
              });
        child.on("exit",function(data){
            
            var endTime; 
            endTime = new Date();
            let timeDiff = (endTime - that.compileStartTime); //in ms            
            timeDiff /= 1000;
            that.outChannel.log("PPO Finish at "+ new Date() + " Elapsed  (" + timeDiff + " segs.)\n"); 
            
           const newFile = vscode.Uri.parse('untitled:' + path.join(path.dirname(sourceName), path.basename(sourceName)+ '_ppo'));
             vscode.workspace.openTextDocument(newFile).then(document => {
                 const edit = new vscode.WorkspaceEdit();
                 edit.insert(newFile, new vscode.Position(0, 0), that._lastAppreMsg);
                 return vscode.workspace.applyEdit(edit).then(success => {
                     if (success) {                     
                         vscode.window.showTextDocument(document);
                         that.afterCompile();
                     } else {
                         vscode.window.showInformationMessage('Error!');
                         that.onError();    
                     }
                 });
             });
         });      
         }
     
}

