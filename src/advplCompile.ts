import * as child_process from 'child_process';
import * as vscode from 'vscode';
import { readFileSync, existsSync, unlinkSync, statSync } from 'fs';
import { inspect } from 'util';
import { advplConsole } from './advplConsole';
import * as path from 'path';
import * as fs from 'fs';
import * as nls from 'vscode-nls';
import * as debugBrdige from './utils/debugBridge';

const localize = nls.loadMessageBundle();

export class advplCompile {
    private EnvInfos: string;
    private diagnosticCollection: vscode.DiagnosticCollection;
    private _lastAppreMsg: string;
    private debugPath: string;
    private afterCompile;
    private onError;
    private outChannel: advplConsole;
    private encoding: string;
    private compileStartTime;
    private isAlpha;
    constructor(jSonInfos?: string, d?: vscode.DiagnosticCollection, OutPutChannel?) {
        this.EnvInfos = jSonInfos;
        this.diagnosticCollection = d;
        this.outChannel = OutPutChannel;
        this._lastAppreMsg = "";
        this.debugPath = debugBrdige.getAdvplDebugBridge();
        this.encoding = "";
        if (jSonInfos) this.validateCompile(); // Throws exception
        const config = vscode.workspace.getConfiguration("advpl");
        this.isAlpha = config.get<boolean>("alpha_compile");
        if (process.platform != "win32")        
        {
            this.isAlpha = true;
        }
    }

    public validateCompile() {
        let retorno: boolean;
        retorno = true;

        if (retorno)    //Valida ambiente selecionado
        {
            let parsedEnvInfos = JSON.parse(this.EnvInfos);
            let selectedEnvironment: string;
            let foundEnvironment: boolean;

            selectedEnvironment = parsedEnvInfos.selectedEnvironment;
            foundEnvironment = false;
            for (let entry of parsedEnvInfos.environments) {
                if(selectedEnvironment === entry.environment || entry.hasOwnProperty('name') && selectedEnvironment === entry.name) {
                    foundEnvironment = true;
                    if (entry.hasOwnProperty('totvs_language') && entry.totvs_language === "4gl")
                    {
                        this.isAlpha = true;
                    }
                    break;
                }
            }

            if (!foundEnvironment) {
                throw new Error(localize('src.advplCompile.noSelectedEnvText', 'No selected environment!'));
            }
        }

        return retorno;
    }

    public setEncoding(enc) {
        this.encoding = enc;
    }

    public setAfterCompileOK(aftercomp) {
        this.afterCompile = aftercomp;
    }

    public setonError(func) {
        this.onError = func;
    }

    public CipherPassword() {
        let options: vscode.InputBoxOptions = {
            prompt: localize('src.advplCompile.passwordQueryText', 'Type in the password:'),
            password: true
        }
        var password = vscode.window.showInputBox(options).then(info => {
            if (password != undefined) {
                this.runCipherPassword(info, cipher => this.outChannel.log(localize('src.advplCompile.passwordText', 'Password:') + cipher));
            }
        });
    }

    public async runCipherPassword(password: string, done: Function) {
        var _args = new Array<string>();
        var that = this;
        if (password === "")
            _args.push("--CipherPasswordEmpty");
        else
            _args.push("--CipherPassword=" + password);

        var child = child_process.spawn(this.debugPath, _args);
        child.stdout.on("data", function (data) {
            that._lastAppreMsg = "" + data;
        });

        child.on("exit", function (data) {
            var lRunned = data == 0
            if (that.afterCompile) {
                that.afterCompile();
            }
            done(that._lastAppreMsg);
        });
    }

    public getHdId() {
        var _args = new Array<string>();
        var that = this;

        _args.push("--compileInfo=" + this.EnvInfos);
        _args.push("--getId");
        if (this.encoding != "") {
            _args.push("--encoding=" + this.encoding);
        }

        var child = child_process.spawn(this.debugPath, _args);
        child.stdout.on("data", function (data) {
            that._lastAppreMsg = data + "";
        });

        child.on("exit", data => {
            var lRunned = data == 0
            that.outChannel.log(localize("src.advplCompile.idText", "ID:") + that._lastAppreMsg);
            this.afterCompile();
        });
    }

    public compile(sourceName: string) {
        this.outChannel.log(localize("src.advplCompile.startCompilationSourceText", "Starting the compilation of the source:") + sourceName + "\n");
        this.diagnosticCollection.clear();
        this.genericCompile(sourceName,0);
    }

    public compileText(textFile: string) {
        this.outChannel.log(localize("src.advplCompile.startCompilationTXTText", "Starting the compilation of TXT file:") + textFile + "\n");
        this.diagnosticCollection.clear();
        //var regex = /.*\.(prw|prx)/i;
        var regex = "TEXTFILE:" + vscode.workspace.rootPath;// vscode.workspace.getConfiguration("advpl").get<string>("compileFolderRegex");
        //var files = this.walk(folder,regex);
        var files = textFile + "ª" + regex;
        this.genericCompile(files,4);
    }

    public compileFolder(folder: string) {
        this.outChannel.log(localize("src.advplCompile.startCompilationFolderText", "Starting recursive compilation of the folder:") + folder + "\n");
        this.diagnosticCollection.clear();
        //var regex = /.*\.(prw|prx)/i;
        var regex = vscode.workspace.getConfiguration("advpl").get<string>("compileFolderRegex");
        //var files = this.walk(folder,regex);
        let files;
        if (this.isAlpha)
        {
            files = folder + "/";
        }
        else
        {
            files = folder + "ª" + regex;
        }

        this.genericCompile(files,1);

    }

    public compileProject(project: string) {
        this.outChannel.log(localize("src.advplCompile.startCompilationProjectText", "Starting the compilation of the project:") + project + "\n");
        this.diagnosticCollection.clear();
        //var regex = /.*\.(prw|prx)/i;
        var regex = "PROJECT";// vscode.workspace.getConfiguration("advpl").get<string>("compileFolderRegex");
        //var files = this.walk(folder,regex);
        var files = project + "ª" + regex;
        this.genericCompile(files,3);
    }

    private genericCompile(sourceName: string, compileType : number) {
        this.compileStartTime = new Date();
        var _args = new Array<string>()
        var that = this;
        if(this.isAlpha)
        {
            _args.push("--compileType=" + compileType);
        }

        _args.push("--compileInfo=" + this.EnvInfos);
        _args.push("--source=" + sourceName);

        this.outChannel.log(localize("src.advplCompile.compilationStartedText", "Compilation started at ") + new Date() + "\n");
        var child = child_process.spawn(this.debugPath, _args);

        child.stdout.on("data", function (data) {
            that._lastAppreMsg += data;
        });

        child.on("exit", function (data) {
            var lRunned = data == 0
            console.log("exit: " + data);
            that.run_callBack(lRunned);
            var endTime;
            endTime = new Date();
            let timeDiff = (endTime - that.compileStartTime); //in ms
            timeDiff /= 1000;
            that.outChannel.log(localize("src.advplCompile.compilationFinishedText", "Compilation finished at ") + new Date() + localize("src.advplCompile.compilationElapsedText", " Elapsed (") + timeDiff + localize("src.advplCompile.compilationSecondsText", " secs.)") + "\n");
        });
    }

    public walk(dir: string, regex) {
        var results = "";
        var list = fs.readdirSync(dir);
        for (var i in list) {
            var file = dir + '/' + list[i];
            var stat = fs.statSync(file);
            if (stat && stat.isDirectory())
                results += "|" + this.walk(file, regex);
            else {
                if (file.match(regex)) {
                    this.outChannel.log("Compilando:" + file);
                    results += file + "|";
                }
                else {
                    this.outChannel.log("Pulando " + file);
                }

            }
        }
        return results;
    };

    private run_callBack(lOk) {
        let lErrorFound;
        let lAbort;

        try {
            if (this._lastAppreMsg != null) {
                var oEr = JSON.parse(this._lastAppreMsg);

                let source;

                for (let x = 0; x < oEr.msgs.length; x++) {
                    let sourceArray = oEr.msgs[x];
                    let diags: vscode.Diagnostic[] = [];
                    source = decodeURI(sourceArray.Key);
                    for (let y = 0; y < sourceArray.Value.length; y++) {
                        let msgerr = sourceArray.Value[y];
                        let lineIndex = Number(msgerr.Line) - 1;
                        if (lineIndex <= 0)
                            lineIndex = 1;
                        let col = Number(msgerr.Column);
                        let message = msgerr.Message;
                        let range = new vscode.Range(lineIndex, 0, lineIndex, 10);
                        if (source == "NOSOURCE") {
                            //vscode.window.showInformationMessage(message);
                            this.outChannel.log(message);
                            if(msgerr.Type == 0) {
                                lErrorFound = true;
                                lAbort = true;
                            }
                        }
                        else {
                            if (msgerr.Type == 0) {
                                lErrorFound = true;
                                this.outChannel.log(localize("src.advplCompile.errorText", "Error in ") + path.basename(source) + " " + message);
                                let regex = /\w+\.\w{3}\(\d{1,5}\)\s+(.*)/g
                                const regexResult = regex.exec(message);
                                if (regexResult != null)
                                    message = regexResult[1];
                            }
                            else{
                                this.outChannel.log(localize("src.advplCompile.warningText", "Warning: ") + message);
                                let regex = /\w+\.\w{3}\(\d{1,5}\)\s+warning\s(.*)/g
                                const regexResult = regex.exec(message);
                                if (regexResult != null)
                                    message = regexResult[1];
                            }
                            let diagnosis = new vscode.Diagnostic(range, message, msgerr.Type == 0 ? vscode.DiagnosticSeverity.Error : vscode.DiagnosticSeverity.Warning);
                            diags.push(diagnosis);
                        }
                    }
                    if (diags.length > 0) {
                        this.diagnosticCollection.set(vscode.Uri.file(source), diags);
                    }
                }
            }

            if (lOk) {
                this.outChannel.log(lErrorFound ?
                    ( lAbort ? localize("src.advplCompile.compilationAbortedText", "Compilation aborted, check the log or the Problems tab!") : localize("src.advplCompile.compilationFinishedErrorsText", "Compilation finished with errors, check the Problems tab!") ) :
                    localize("src.advplCompile.compilationFinishedOkText", "Compilation finished successfully."));
                this.afterCompile();
            }
            else {
                this.onError();
            }
        }
        catch (ex) {
            this.outChannel.log("Bridge Return:");
            this.outChannel.log(this._lastAppreMsg);
            this.outChannel.log(ex);
            this.onError();
        }
    }

    public deleteSource(): void {
        let options: vscode.InputBoxOptions = {
            prompt: localize("src.advplCompile.informSourcesExclusionText", "Inform the sources to be excluded:")
        }

        var dlg = vscode.window.showInputBox(options).then(info => {
            if (info != undefined) {
                this.outChannel.log(localize("src.advplCompile.istartSourcesExclusionText", "Starting the exclusion of the sources ") + info + "\n");
                this.diagnosticCollection.clear();
                var _args = new Array<string>()
                var that = this;
                _args.push("--compileInfo=" + this.EnvInfos);
                _args.push("--deleteSource=" + info);

                var child = child_process.spawn(this.debugPath, _args);

                child.stdout.on("data", function (data) {
                    that._lastAppreMsg += data;
                });

                child.on("exit", function (data) {
                    var lRunned = data == 0
                    console.log("exit: " + data);
                    that.run_callBack(lRunned);
                });

            }else{
                vscode.window.showErrorMessage(localize('src.advplCompile.notInformedSource', 'Source to be excluded not informed!'));
                this._lastAppreMsg = null
                this.run_callBack(false);
            }
        });
    }

    public defragRPO(): void {
        this.outChannel.log(localize("src.advplCompile.startingDefragText", "Starting the defragmentation of the RPO...") + "\n");
        this.diagnosticCollection.clear();
        var _args = new Array<string>()
        var that = this;
        _args.push("--compileInfo=" + this.EnvInfos);
        _args.push("--defragRpo");

        var child = child_process.spawn(this.debugPath, _args);

        child.stdout.on("data", function (data) {

            that._lastAppreMsg += data;
        });

        child.on("exit", function (data) {
            var lRunned = data == 0
            console.log("exit: " + data);
            that.run_callBack(lRunned);
        });
    }

    public BuildPPO(sourceName: string) {
        this.outChannel.log(localize("src.advplCompile.startCompilationSourceText", "Starting the compilation of the source:") + sourceName + "\n");
        this.diagnosticCollection.clear();
        this.buildPPOCall(sourceName);
    }

    private buildPPOCall(sourceName: string) {
        this.compileStartTime = new Date();
        var _args = new Array<string>()
        var that = this;
        _args.push("--compileInfo=" + this.EnvInfos);
        _args.push("--source=" + sourceName);
        _args.push("--buildPPO");

        this.outChannel.log(localize("src.advplCompile.ppoBuildStartText", "PPO buil started at ") + new Date() + "\n");
        var child = child_process.spawn(this.debugPath, _args);

        child.stdout.on("data", function (data) {
            that._lastAppreMsg += data;
        });

        child.on("exit", function (data) {

            var endTime;
            endTime = new Date();
            let timeDiff = (endTime - that.compileStartTime); //in ms
            timeDiff /= 1000;
            that.outChannel.log(localize("src.advplCompile.ppoBuildFinishedText", "PPO build finished at ") + new Date() + localize("src.advplCompile.compilationElapsedText", " Elapsed (") + timeDiff + localize("src.advplCompile.compilationSecondsText", " secs.)") + "\n");

            const newFile = vscode.Uri.parse('untitled:' + path.join(path.dirname(sourceName), path.basename(sourceName) + '_ppo'));
            vscode.workspace.openTextDocument(newFile).then(document => {
                const edit = new vscode.WorkspaceEdit();
                edit.insert(newFile, new vscode.Position(0, 0), that._lastAppreMsg);
                return vscode.workspace.applyEdit(edit).then(success => {
                    if (success) {
                        vscode.window.showTextDocument(document);
                        that.afterCompile();
                    } else {
                        vscode.window.showInformationMessage(localize("src.advplCompile.errorGeneralText", "Error!"));
                        that.onError();
                    }
                });
            });
        });
    }
}
