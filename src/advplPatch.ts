import * as child_process from 'child_process';
import * as vscode from 'vscode';
import { inspect } from 'util';
import { advplConsole } from './advplConsole';
import * as fs from 'fs';
import * as path from 'path';
import * as nls from 'vscode-nls';
import * as debugBrdige from  './utils/debugBridge';
import { advplCompile } from './advplCompile';

const localize = nls.loadMessageBundle();

export class advplPatch {
    private outChannel: advplConsole;
    private EnvInfos: string;
    private debugPath: string;
    private consoleReturn

    constructor(jSonInfos: string, _outChannel: advplConsole) {
        this.outChannel = _outChannel;
        this.EnvInfos = jSonInfos;
        this.debugPath = debugBrdige.getAdvplDebugBridge();
    }

    public build(file: String) {
        var _args = new Array<string>();
        var that = this;

        _args.push("--compileInfo=" + this.EnvInfos);
        _args.push("--patchBuild=" + file);

        var child = child_process.spawn(this.debugPath, _args);
        child.stdout.on("data", function (data) {
            var xRet = data + "";
            if (xRet.indexOf("|") > 0) {
                var values = String.fromCharCode.apply(null, data).split('|');
                that.consoleReturn = localize('src.advplPatch.buildFailureText', 'Build failure:') + values[3];
            }
            else {
                that.consoleReturn = xRet;
            }
        });

        child.on("exit", function (data) {
            that.outChannel.log(that.consoleReturn);
        });
    }

    public apply(patchApply: string, applyOldProgram: boolean=false) {
        var _args = new Array<string>();
        var that = this;

        _args.push("--compileInfo=" + this.EnvInfos);
        _args.push("--patchApply=" + patchApply);

        // Parâmetro da Bridge para aplicar somente fontes atualizados ou não
        if (applyOldProgram && advplCompile.getIsAlpha()) {
            _args.push("--applyOldProgram");
        }

        var child = child_process.spawn(this.debugPath, _args);
        child.stdout.on("data", function (data) {
            var xRet = data + "";
            if (xRet.indexOf("|") > 0) {
                var values = String.fromCharCode.apply(null, data).split('|');
                that.consoleReturn = localize('src.advplPatch.applyFailureText', 'Apply failure:') + values[3] + "\n";
            }
            else {
                that.consoleReturn = xRet + "\n";
            }

        });

        child.on("exit", function (data) {
            that.outChannel.log(that.consoleReturn);
        });
    }

    public info(patchApply: string) {
        var _args = new Array<string>();
        var that = this;

        _args.push("--compileInfo=" + this.EnvInfos);
        _args.push("--patchInfo=" + patchApply);

        this.outChannel.log(localize('src.advplPatch.startPatchAnalysisText', 'Starting patch analysis...'));
        this.consoleReturn = "";

        var child = child_process.spawn(this.debugPath, _args);
        child.stdout.on("data", function (data) {
            var xRet = data + "";
            that.consoleReturn += xRet;
        });

        child.on("exit", function (data) {
            const patchLogFileName: string = 'patchInfo.log';

            that.outChannel.log(patchLogFileName + localize('src.advplPatch.patchCreateSuccessText', 'created successfully!'));
            const newFile = vscode.Uri.parse('untitled:' + path.join(vscode.workspace.rootPath, patchLogFileName));

            vscode.workspace.openTextDocument(newFile).then(document => {
                const edit = new vscode.WorkspaceEdit();
                edit.insert(newFile, new vscode.Position(0, 0), that.consoleReturn);

                return vscode.workspace.applyEdit(edit).then(success => {
                    if (success) {
                        vscode.window.showTextDocument(document);
                    } else {
                        vscode.window.showInformationMessage(localize('src.advplPatch.errorText', 'Error!'));
                    }
                });
            });
        });
    }
}