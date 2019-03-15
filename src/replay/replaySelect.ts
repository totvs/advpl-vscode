import { window } from "vscode";
import * as path from 'path';
import * as child_process from 'child_process';
import * as vscode from 'vscode';
import { advplConsole } from '../advplConsole';
import * as nls from 'vscode-nls';
import { getReplayExec } from "./replayUtil";
import CodeAdapter from "../adapter";
import fs = require('fs');
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
            //console.log(answers);
        });  
    }

}
