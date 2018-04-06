import * as child_process from 'child_process';
import * as vscode from 'vscode';
import { inspect } from 'util';
import { advplConsole } from './advplConsole';
import * as fs from 'fs';
import * as path from 'path';
import * as nls from 'vscode-nls';

const localize = nls.loadMessageBundle();

export class advplMonitor {
    private outChannel: advplConsole;
    private EnvInfos: string;
    private debugPath: string;
    private consoleReturn: string;

    constructor(jSonInfos: string, _outChannel: advplConsole) {
        this.outChannel = _outChannel;
        this.EnvInfos = jSonInfos;
        this.debugPath = vscode.extensions.getExtension("KillerAll.advpl-vscode").extensionPath;

        if (process.platform == "darwin") {
            this.debugPath += "/bin/AdvplDebugBridgeMac";
        }
        else {
            this.debugPath += "\\bin\\AdvplDebugBridge.exe";
        }
    }

    public getThreads() {
        var _args = new Array<string>();
        var that = this;

        _args.push("--compileInfo=" + this.EnvInfos);
        _args.push("--threadsInfo");

        var child = child_process.spawn(this.debugPath, _args);
        child.stdout.on("data", function (data) {
            var xRet = data + "";

            that.consoleReturn = xRet;
        });

        child.on("exit", function (data) {
            that.outChannel.log(that.consoleReturn);
        });
    }

    public getRpoInfos(lFunction: boolean) {
        var _args = new Array<string>();
        var that = this;

        _args.push("--compileInfo=" + this.EnvInfos);
        if (lFunction)
            _args.push("--getFunctions");
        else
            _args.push("--getMap");

        this.consoleReturn = "";
        this.outChannel.log(localize('src.advplMonitor.initializingText', 'Reading the APO, please wait...'));
        var child = child_process.spawn(this.debugPath, _args);

        child.stdout.on("data", function (data) {
            var xRet = data + "";

            that.consoleReturn += xRet;
        });

        child.on("exit", function (data) {
            that.outChannel.log(localize('src.advplMonitor.creationText', 'Configuration entries were successfully created.'));
            const newFile = vscode.Uri.parse('untitled:' + path.join(vscode.workspace.rootPath, 'rpoInfo' + (new Date()).getMilliseconds().toString() + '.log'));

            vscode.workspace.openTextDocument(newFile).then(document => {
                const edit = new vscode.WorkspaceEdit();
                edit.insert(newFile, new vscode.Position(0, 0), that.consoleReturn);

                return vscode.workspace.applyEdit(edit).then(success => {
                    if (success) {
                        vscode.window.showTextDocument(document);
                    } else {
                        vscode.window.showInformationMessage(localize('src.advplMonitor.errorText', 'Error!'));
                    }
                });
            });
        });
    }

    /**
     * Gerar o Client do WS
     */
    public buildWSClient(): void {
        var _args = new Array<string>();
        var that = this;
        this.consoleReturn = "";

        _args.push("--compileInfo=" + this.EnvInfos);
        let options: vscode.InputBoxOptions = {
            prompt: localize('src.advplMonitor.wsQueryUrlText', 'Inform the Web Service URL:')
        }
        var urlws = vscode.window.showInputBox(options).then(info => {
            if (urlws != undefined) {
                _args.push("--urlBuildWSClient=" + info);

                var child = child_process.spawn(this.debugPath, _args);
                child.stdout.on("data", function (data) {
                    that.consoleReturn += "" + data;
                });

                child.on("exit", function (data) {
                    that.outChannel.log(localize('src.advplMonitor.wsCreatedText', 'The Web Service was successfully created.'));

                    let initNamePos = that.consoleReturn.indexOf("WSCLIENT") + 9;
                    let endLine = that.consoleReturn.indexOf("\n", initNamePos);
                    let name = that.consoleReturn.substr(initNamePos, endLine - initNamePos);
                    const newFile = vscode.Uri.parse('untitled:' + path.join(vscode.workspace.rootPath, name + 'Client.prw'));

                    vscode.workspace.openTextDocument(newFile).then(document => {
                        const edit = new vscode.WorkspaceEdit();
                        edit.insert(newFile, new vscode.Position(0, 0), that.consoleReturn);

                        return vscode.workspace.applyEdit(edit).then(success => {
                            if (success) {
                                vscode.window.showTextDocument(document);
                            } else {
                                vscode.window.showInformationMessage(localize('src.advplMonitor.errorText', 'Error!'));
                            }
                        });
                    });
                });
            }
        });
    }
}
