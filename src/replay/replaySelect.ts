import { window } from "vscode";
import * as path from 'path';
import * as child_process from 'child_process';
import * as vscode from 'vscode';
import { advplConsole } from '../advplConsole';
import * as nls from 'vscode-nls';
import { getReplayExec } from "./replayUtil";
import CodeAdapter from "../adapter";
import fs = require('fs');
import { SourceTreeItem} from "./replaytTimeLineTree";
import { FileExistsRecursive } from "../utils/filesLocation";
let lastFile = null;

const localize = nls.loadMessageBundle();
export class replayPlay {
    private outChannel: advplConsole;
    private diagnosticCollection: vscode.DiagnosticCollection;
    private selectedReplay: string;
    private replayPath: string;
    private replayInfos : any;
    private replayFile: string;
    private tmpDir: string;
    private replayTimeLine : SourceTreeItem[];
    public _callResult: string;

	get timeLine(): SourceTreeItem[] {
		return this.replayTimeLine;
	}
    public getSelected() : string {
        return this.selectedReplay;
    }
    public getReplayFile() : string {
        return this.replayFile;
    }
    public getTmpDir() : string {
        return this.tmpDir;
    }
    

    constructor( d?: vscode.DiagnosticCollection, OutPutChannel?) {
        
        this.diagnosticCollection = d;
        this.outChannel = OutPutChannel;
        this.replayPath = getReplayExec();
    }

    public clearReplayInfos(){
        try{
            var files = fs.readdirSync(this.tmpDir);
            for (var i = 0; i < files.length; i++) {
                var filePath = this.tmpDir + '/' + files[i];
                if (fs.statSync(filePath).isFile())
                  fs.unlinkSync(filePath);
            }
            fs.rmdirSync(this.tmpDir);
        }
        catch(e)
        {

        }
        this.selectedReplay = undefined;    
        this.replayInfos = undefined;
        this.replayFile = undefined;
        this.tmpDir = undefined;
    
        lastFile = null;        
    }
    private async getReplayInfo(sourceName: string) {    
        var _args = new Array<string>();
        _args.push("--replayInfo" );
        _args.push("--replayFile=" + sourceName);
        this._callResult = "";
        this.replayFile = sourceName;
        var that = this;
        this.outChannel.log(localize("src.replay.replaySelect.getReplayInfo", "Getting replay Info...") );
        var child = child_process.spawn(this.replayPath, _args);
    
        child.stdout.on("data", function (data) {
            that._callResult += data;
        });
    
        child.on("exit", function (data) {
            var lRunned = data == 0
            console.log("exit: " + data);
            that.run_callBack(lRunned);
        });
        
    }
    private async getTimeLine() {    
        var _args = new Array<string>();
        _args.push("--getTimeLine" );
        _args.push("--tempDir=" + this.tmpDir);
        _args.push("--execId=" + this.selectedReplay);
        
        this._callResult = "";        
        var that = this;
        this.outChannel.log(localize("src.replay.replaySelect.getReplayInfo", "Getting replay Info...") );
        var child = child_process.spawn(this.replayPath, _args);
    
        child.stdout.on("data", function (data) {
            that._callResult += data;
        });
    
        child.on("exit", function (data) {
            var lRunned = data == 0            
            
            that.getTimeLinecallBack(lRunned);
        });
        
    }
    public async openFileInLine(source : string, line : string)
    {
        //console.log(source);
        let rootWorkspace = vscode.workspace.workspaceFolders[0];
        //let fileLoca : FileCache = new FileCache();
        let fileLoca = FileExistsRecursive ( rootWorkspace.uri.fsPath, source)
        if (fileLoca != undefined)
        {
            
            var openPath = vscode.Uri.file(fileLoca); //A request file path
            vscode.workspace.openTextDocument(openPath).then(doc => {
               vscode.window.showTextDocument(doc).then(e=> {
                   let range = e.document.lineAt(parseInt(line)-1).range;
                   e.selection = new vscode.Selection(range.start,range.end);
                   e.revealRange(range);
               })           
                });
        }
        //console.log(fileLoca);
    }
    private getTimeLinecallBack(lOk) {
        try {
            if (this._callResult != null) {
                var parserd = JSON.parse(this._callResult);                
                this.replayTimeLine = [];
                for (let entry of parserd.sources) {
                    let treeItem : SourceTreeItem = new SourceTreeItem(entry.source,entry.source, entry.compiledate,vscode.TreeItemCollapsibleState.Collapsed);
                    for (let tm of entry.timelines) {

                        let subItem= new SourceTreeItem(tm.function + "(" + tm.line+ ")" ,entry.source,null,vscode.TreeItemCollapsibleState.Expanded);
                        subItem.timestamp =  new Date(tm.timestamp);
                        subItem.line = tm.line;
                        subItem.command = {
                            command: 'advpl.replay.openFileInLine',
                            title: '',
                            arguments: [subItem.source,subItem.line]
                        };

                        treeItem.timelines.push(subItem);
                    }
                    /*let treeItem= new SourceTreeItem(entry.function + "(" + entry.source+")"  + "(" + entry.line+ ")" ,entry.source,entry.line, new Date(entry.timestamp),vscode.TreeItemCollapsibleState.None);
                    treeItem.command = {
                        command: 'advpl.replay.openFileInLine',
                        title: '',
                        arguments: [treeItem.source,treeItem.line]
                    };*/
                    this.replayTimeLine.push(treeItem);

                }
                
                vscode.commands.executeCommand("advpl.refreshReplay");
            }
            }
            catch (ex) {
                this.outChannel.log("replay Return:");               
                this.outChannel.log(ex);
             //   this.onError();
            }

    }
    private run_callBack(lOk) {
        try {
            if (this._callResult != null) {
                this.replayInfos = JSON.parse(this._callResult);
                this.promptInfo();
                
            }
            }
            catch (ex) {
                this.outChannel.log("replay Return:");               
                this.outChannel.log(ex);
             //   this.onError();
            }
    }
    public async cmdReplaySelect()  {
        if( lastFile === null)
            lastFile= await window.showOpenDialog({canSelectFiles:true});
            this.getReplayInfo(lastFile[0].fsPath);
            
    }
    private promptInfo(){
        let adapter = new CodeAdapter();        
        let choices = new Array<string>();
        let dateString = localize("src.replay.replaySelect.date", "Date");
        let startProgram = localize("src.replay.replaySelect.startProgram", "Start Program");
        let choosemsg =  localize("src.replay.replaySelect.choose", "Choose the recording you would like to replay");
        console.log(this.replayInfos);
        this.tmpDir = this.replayInfos.tmpDir;
        this.replayInfos.execs.forEach(element => {
            let start = new Date(element.recordingStart);
            choices.push(element.id + " | " + dateString +": " +start.toLocaleString() + " - " + startProgram+ ": " +element.startProgram);
        });
    
        const questions = [{
            message: choosemsg,
            name: "Exec",
            type: "list",            
            choices
        }];
        adapter.prompt(questions, answers => {
            let strThe =  localize("src.replay.replaySelect.strThe", "The");
            let strRec =  localize("src.replay.replaySelect.strRec", " recording is selected from the");
            let strDebug =  localize("src.replay.replaySelect.strDebug", " file. Please Launch debug with advplL-type=replay");
            this.selectedReplay = answers.Exec.substring(0,answers.Exec.lastIndexOf("|")-1);            
            this.outChannel.log(strThe +this.selectedReplay + strRec + this.replayFile+ strDebug);
            this.getTimeLine();
            //console.log(answers);
        });  
    }

}
