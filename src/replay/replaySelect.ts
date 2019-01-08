import { window } from "vscode";
import * as path from 'path';
import * as child_process from 'child_process';
import * as vscode from 'vscode';
import { advplConsole } from '../advplConsole';
import * as nls from 'vscode-nls';
import { getReplayExec } from "./replayUtil";
import CodeAdapter from "../adapter";
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
    public _callResult: string;

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


    private async getReplayInfo(sourceName: string) {    
        var _args = new Array<string>();
        _args.push("--replayInfo" );
        _args.push("--replayFile=" + sourceName);
        this._callResult = "";
        this.replayFile = sourceName;
        var that = this;
        this.outChannel.log("Get Replay Info"); //localize("src.advplCompile.compilationStartedText", "Compilation started at ") + new Date() + "\n");
        var child = child_process.spawn(this.replayPath, _args);
    
        child.stdout.on("data", function (data) {
            that._callResult += data;
        });
    
        child.on("exit", function (data) {
            var lRunned = data == 0
            console.log("exit: " + data);
            that.run_callBack(lRunned);
            var endTime;
            /*endTime = new Date();
            let timeDiff = (endTime - that.compileStartTime); //in ms
            timeDiff /= 1000;
            that.outChannel.log(localize("src.advplCompile.compilationFinishedText", "Compilation finished at ") + new Date() + localize("src.advplCompile.compilationElapsedText", " Elapsed (") + timeDiff + localize("src.advplCompile.compilationSecondsText", " secs.)") + "\n");*/
        });
        
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
        console.log(this.replayInfos);
        this.tmpDir = this.replayInfos.tmpDir;
        this.replayInfos.execs.forEach(element => {
            let start = new Date(element.recordingStart);
            choices.push(element.id + "-"+ start.toLocaleString())
        });
    
        const questions = [{
            message: "Escolha a execução",
            name: "Exec",
            type: "list",            
            choices
        }];
        adapter.prompt(questions, answers => {
            this.selectedReplay = answers.Exec.substring(0,answers.Exec.lastIndexOf("-"));
            console.log(answers);
        });  
    }

}



    //return "C:/temp/treplay/com_rpc_tdsReplay-2018-11-10.trplay";
/*    if( lastFile === null)
        lastFile= await window.showOpenDialog({canSelectFiles:true});
*/
        
  //console.log(replay);
 /*   let adapter = new CodeAdapter();
    let filename = path.basename(lastFile[0].fsPath);

    const questions = [{
        message: filename,
        name: "server",
        type: "list",
        default: "131227A",
        choices: ['131227A', '170117A',"Change File"]
    }];
    adapter.prompt(questions, answers => {});
*/    



