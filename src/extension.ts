'use strict';
import * as nls from 'vscode-nls';
const localize = nls.config(process.env.VSCODE_NLS_CONFIG)();

import * as vscode from 'vscode';
import { advplCompile } from './advplCompile';
import { smartClientLaunch } from './smartClientLaunch';
import { advplConsole } from './advplConsole';
import { advplPatch } from './advplPatch';
import { advplMonitor } from './advplMonitor';
import { Environment } from './advplEnvironment';
import EnvObject from './Environment';
import { spawn, execFile, ChildProcess } from 'child_process';
import * as path from 'path';
import { LanguageClient, LanguageClientOptions, StreamInfo } from 'vscode-languageclient';
import * as net from 'net';
import * as url from 'url';
import * as fs from 'fs';
import { StringDecoder } from 'string_decoder';
import { getConfigurationAsString } from './utils';
import generateConfigFromAuthorizationFile from './authorizationFile';
import cmdAddAdvplEnvironment from './commands/addAdvplEnvironment';

let advplDiagnosticCollection = vscode.languages.createDiagnosticCollection();
let OutPutChannel = new advplConsole();
let isCompiling = false;
let env;

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(getProgramName());
    context.subscriptions.push(startSmartClient());
    context.subscriptions.push(addGetDebugInfosCommand());
    context.subscriptions.push(compile());
    context.subscriptions.push(buildPPO());
    context.subscriptions.push(menucompile());
    context.subscriptions.push(menucompilemulti());
    context.subscriptions.push(menucompileProjet());
    context.subscriptions.push(menucompiletextfile());

    context.subscriptions.push(getAuthorizationId());
    context.subscriptions.push(CipherPassword());
    context.subscriptions.push(selectEnvironment());

    context.subscriptions.push(generateAuthorizationConfig());
    context.subscriptions.push(addAdvplEnvironment());

    //Binds dos comandos de patch
    //context.subscriptions.push(PathSelectSource());
    context.subscriptions.push(PathApply());
    context.subscriptions.push(PathBuild());
    context.subscriptions.push(PathInfo());
    //context.subscriptions.push(PathSelectFolder());
    //context.subscriptions.push(PathFileToBuild());

    //Binds do monitor
    context.subscriptions.push(GetThreads());
    context.subscriptions.push(GetRpoInfos());
    context.subscriptions.push(GetRpoFunctions());
    context.subscriptions.push(BuildWSClient());
    context.subscriptions.push(DeleteSource());
    context.subscriptions.push(DefragRpo());

    //Environment no bar
    env = new Environment();
    env.update(vscode.workspace.getConfiguration("advpl").get("selectedEnvironment"));

    //initLanguageServer(context);
    let api = {
        writeAdvplConsole(cLog) {
            OutPutChannel.log(cLog);
        }
    };

    return api;
}

export function deactivate() {
}

var lastProgram: string = "";
function getProgramName() {
    let disposable = vscode.commands.registerCommand('advpl.getProgramName', () => {
        let p = vscode.window.showInputBox({ placeHolder: "Informe o program", value: lastProgram });
        p.then(function (select) {
            if (select) lastProgram = select;
        });

        return p;
    });
    return disposable;
}

/**
 * Inicia Language Server
 */
function initLanguageServer(context: vscode.ExtensionContext) {
    let executablePath = "C:\\Totvs\\vscode\\advpl-language-server\\bin\\Debug\\advpl-language-server.exe";
    //let executablePath = vscode.extensions.getExtension("KillerAll.advpl-vscode").extensionPath + "\\bin\\advpl-language-server.exe";

    const serverOptions = () => new Promise<ChildProcess | StreamInfo>((resolve, reject) => {
        function spawnServer(...args: string[]): ChildProcess {
            // The server is implemented in C#         
            const childProcess = spawn(executablePath, args);
            childProcess.stderr.on('data', (chunk: Buffer) => {
                console.error(chunk + '');
            });
            childProcess.stdout.on('data', (chunk: Buffer) => {
                console.log(chunk + '');
            });
            return childProcess;
        }
        resolve(spawnServer());

    });

    // Options to control the language client
    const clientOptions: LanguageClientOptions = {
        // Register the server for php documents
        documentSelector: ['advpl'],

        synchronize: {
            // Synchronize the setting section 'php' to the server
            configurationSection: 'advpl'
            // Notify the server about file changes to composer.json files contain in the workspace

        }
    };

    // Create the language client and start the client.
    const disposable = new LanguageClient('Advpl Language Server', serverOptions, clientOptions).start();

    // Push the disposable to the context's subscriptions so that the
    // client can be deactivated on extension deactivation
    context.subscriptions.push(disposable);
}

/**
 * Inicia o smartClient
 */
function startSmartClient() {
    let disposable = vscode.commands.registerCommand('advpl.startSmartClient', () => {
        var scPath: string = vscode.workspace.getConfiguration("advpl").get<string>("smartClientPath");
        var ambientes: Array<any> = vscode.workspace.getConfiguration("advpl").get<Array<any>>("environments");
        var ambienteAtual: string = vscode.workspace.getConfiguration("advpl").get<string>("selectedEnvironment");

        if (scPath === undefined || scPath === null) {
            ambientes.forEach(element => {
                if (element.environment == ambienteAtual)
                    scPath = element.smartClientPath
            });
        }

        // scPath += "smartclient.exe";
        var obj2 = new smartClientLaunch(scPath);
        obj2.start();
    });
    return disposable;
}

function generateAuthorizationConfig() {
    return vscode.commands.registerCommand('advpl.generateAuthorizationConfig', generateConfigFromAuthorizationFile);
}

function createAdvplCompile(cSource: string, cDescription: string) {
    let compile: advplCompile;

    try {
        compile = new advplCompile(
            getConfigurationAsString(),
            advplDiagnosticCollection,
            OutPutChannel
        );
        compile.setonError(function () {
            isCompiling = false;
        });
        compile.setAfterCompileOK(function () {
            if (!(cSource == null)) {
                vscode.window.setStatusBarMessage(
                    cDescription + ' ' + cSource + localize('src.extension.compiledText', ' compiled!'), 3000
                );
            } else if (!(cDescription == null)) {
                OutPutChannel.log(cDescription)
            }
            isCompiling = false;
        });
        isCompiling = true;
    } catch (e) {
        OutPutChannel.log(localize('src.extension.compileInitializationErrorText', 'Error in compilation initialization:') + (<Error>e).message);
    }

    return compile;
}

function addAdvplEnvironment() {
    return vscode.commands.registerCommand('advpl.addAdvplEnvironment', cmdAddAdvplEnvironment);
}

function menucompileProjet() {
    let disposable = vscode.commands.registerCommand('advpl.menucompileProjet', function (context) {

        var cSource = context._fsPath;
        if (isCompiling) {
            OutPutChannel.log(localize('src.extension.compilationIgnoredText', 'Compilation ignored, there is other compilation in progress.'));
        }
        else {
            if (fs.lstatSync(cSource).isFile() && cSource.substr(cSource.lastIndexOf('.') + 1).toUpperCase() == "PRJ") {
                vscode.window.setStatusBarMessage(localize('src.extension.startingProjectCompilationText', 'Starting project compilation...') + cSource, 3000);
                var compile = createAdvplCompile(cSource, localize('src.extension.projectText', 'Project'));
                if (!(compile == null)) {
                    compile.compileProject(cSource);
                }
            }
            else {
                vscode.window.showInformationMessage(localize('src.extension.projectSelectFileErrorText', 'Please, select a project file (*.prj)'));
            }
        }

    });
    return disposable;
}

function menucompiletextfile() {
    let disposable = vscode.commands.registerCommand('advpl.menucompiletextfile', function (context) {
        if (isCompiling) {
            OutPutChannel.log(localize('src.extension.compilationIgnoredText', 'Compilation ignored, there is other compilation in progress.'));
        }
        else {
            var cSource = context._fsPath;
            if (fs.lstatSync(cSource).isFile()) {
                vscode.window.setStatusBarMessage(localize('src.extension.projectStartTextFileText', 'Starting project files from text file') + cSource, 3000);
                var compile = createAdvplCompile(cSource, localize('src.extension.projectText', 'Project'));
                if (!(compile == null)) {
                    compile.compileText(cSource);
                }
            }
            else {
                vscode.window.showInformationMessage(localize('src.extension.textSelectFileErrorText', 'Please, select a text file!'));
            }
        }
    });
    return disposable;
}

function menucompile() {
    let disposable = vscode.commands.registerCommand('advpl.menucompile', function (context) {

        //var editor = vscode.window.activeTextEditor;
        if (isCompiling) {
            OutPutChannel.log(localize('src.extension.compilationIgnoredText', 'Compilation ignored, there is other compilation in progress.'));
        }
        else {
            var cSource = context._fsPath;
            vscode.window.setStatusBarMessage(localize('src.extension.startingAdvplCompilationText', 'Starting AdvPL compilation...') + cSource, 3000);
            var compile = createAdvplCompile(cSource, localize('src.extension.sourceText', 'Source'));
            if (!(compile == null)) {
                compile.compile(cSource);
            }
        }
    });
    return disposable;
}

function menucompilemulti() {
    let disposable = vscode.commands.registerCommand('advpl.menucompilemulti', function (context) {

        //var editor = vscode.window.activeTextEditor;
        var cResource = context._fsPath;
        if (fs.lstatSync(cResource).isDirectory()) {
            if (isCompiling) {
                OutPutChannel.log(localize('src.extension.compilationIgnoredText', 'Compilation ignored, there is other compilation in progress.'));
            }
            else {
                vscode.window.setStatusBarMessage(localize('src.extension.startingAdvplFolderCompilationText', 'Starting AdvPL Folder compilation...') + cResource, 3000);
                var compile = createAdvplCompile(cResource, localize('src.extension.folderText', 'Folder'));
                if (!(compile == null)) {
                    compile.compileFolder(cResource);
                }
            }
        }
        else {
            vscode.window.showInformationMessage(localize('src.extension.folderSelectErrorText', 'Please, select a folder!'));
        }
    });
    return disposable;
}

function compile() {
    let disposable = vscode.commands.registerCommand('advpl.compile', function (context) {
        if (!isEnvironmentSelected()) {
            return;
        }

        var editor = vscode.window.activeTextEditor;
        var cSource = editor.document.fileName;

        if (editor.document.isDirty) {
            let list = [localize('src.extension.yesText', 'Yes'), localize('src.extension.noText', 'No')];
            vscode.window.showQuickPick(list, { placeHolder: localize('src.extension.saveConfirmationText', 'The file is not saved and was modified. Save file before compilation?') }).then(function (select) {
                console.log(select);

                if (select === list[0]) {
                    editor.document.save().then(function (select) {
                        __internal_compile(cSource, editor, false);
                    }
                    )
                }
                else {
                    vscode.window.setStatusBarMessage(localize('src.extension.userCancelText', 'Action canceled by the user, the source was not compiled!'), 5000);
                }
            })
        }
        else {
            __internal_compile(cSource, editor, false);
        }
    });

    return disposable;
}

function __internal_compile(cSource, editor, lbuildPPO) {
    if (isCompiling) {
        OutPutChannel.log(localize('src.extension.compilationIgnoredText', 'Compilation ignored, there is other compilation in progress.'));
    }
    else {
        vscode.window.setStatusBarMessage(localize('src.extension.startingAdvplCompilationText', 'Starting AdvPL compilation...') + editor.document.fileName, 3000);
        var compile = createAdvplCompile(cSource, localize('src.extension.sourceText', 'Source'));
        let encoding =
            vscode.workspace
                .getConfiguration("files")
                .get("encoding");
        if (!(compile == null)) {
            compile.setEncoding(encoding);
            if (!lbuildPPO) {
                compile.compile(cSource);
            }
            else {
                compile.BuildPPO(cSource);
            }
        }
    }
}

function addGetDebugInfosCommand() {
    let disposable = vscode.commands.registerCommand('advpl.getDebugInfos', function (context) {
        var workSpaceInfo = vscode.workspace.getConfiguration("advpl");
        var workspaceFolders = vscode.workspace.workspaceFolders;
        var cWork = "";
        workspaceFolders.forEach(function (value) {
            cWork += value.uri.fsPath + ";"
        });
        workSpaceInfo.update("workspaceFolders", cWork);
        //_jSon.workspaceFolders = cWork;
        var Jstring = JSON.stringify(workSpaceInfo);
        return Jstring;
    });
    return disposable;
}

function getAuthorizationId() {
    let disposable = vscode.commands.registerCommand('advpl.getAuthorizationId', function (context) {
        var compile = createAdvplCompile(null, null);
        if (!(compile == null)) {
            compile.getHdId();
        }
    });
    return disposable;
}

function CipherPassword() {
    let disposable = vscode.commands.registerCommand('advpl.CipherPassword', function (context) {
        var compile = createAdvplCompile(null, null);
        if (!(compile == null)) {
            compile.CipherPassword();
        }
    });
    return disposable;
}

/***
 * Patchs
 */
/*function PathSelectSource() 
{
let disposable = vscode.commands.registerCommand('advpl.patch.selectSource', function (context)  {
            vscode.window.showInformationMessage("Não implementado ainda.");
    });
return disposable;
}*/
function PathApply() {
    let disposable = vscode.commands.registerCommand('advpl.patch.apply', function (context) {
        if (!isEnvironmentSelected()) {
            return;
        }
        var cResource = context._fsPath;
        if (fs.lstatSync(cResource).isFile()) {
            var patch = new advplPatch(JSON.stringify(vscode.workspace.getConfiguration("advpl")), OutPutChannel)
            patch.apply(cResource);

        }
        else {
            vscode.window.showErrorMessage(localize('src.extension.patchSelectFileErrorText', 'Please, select a patch file (*.ptm)'));
        }
    });
    return disposable;
}

function PathInfo() {
    let disposable = vscode.commands.registerCommand('advpl.patch.info', function (context) {
        if (!isEnvironmentSelected()) {
            return;
        }
        var cResource = context._fsPath;
        if (fs.lstatSync(cResource).isFile()) {
            var patch = new advplPatch(getConfigurationAsString(), OutPutChannel)
            patch.info(cResource);

        }
        else {
            vscode.window.showErrorMessage(localize('src.extension.patchSelectFileErrorText', 'Please, select a patch file (*.ptm)'));
        }
    });
    return disposable;
}

function PathBuild() {
    let disposable = vscode.commands.registerCommand('advpl.patch.build', function (context) {
        if (!isEnvironmentSelected()) {
            return;
        }
        var patch = new advplPatch(getConfigurationAsString(), OutPutChannel)
        let fileToBuildPath = context._fsPath;
        if (fileToBuildPath == null) {
            vscode.window.showErrorMessage(localize('src.extension.textPatchSelectFileErrorText', 'Please, select a text file with the sources to be included!'));
        }
        else {
            if (!fs.lstatSync(fileToBuildPath).isFile())
                vscode.window.showErrorMessage(localize('src.extension.textPatchSelectFileErrorText', 'Please, select a text file with the sources to be included!'));
            else
                patch.build(fileToBuildPath);
        }
    });
    return disposable;
}

/*  
function PathSelectFolder() 
{
let disposable = vscode.commands.registerCommand('advpl.patch.selectFolder', function (context)  {
            vscode.window.showInformationMessage("Não implementado ainda.");
    });
return disposable;
}
*/
/*
function PathFileToBuild() 
{
let disposable = vscode.commands.registerCommand('advpl.patch.setFileToBuild', function (context)  {
            var cResource = context._fsPath;
            if(fs.lstatSync(cResource).isFile())
            {
                fileToBuildPath = cResource;
                vscode.window.showInformationMessage("O arquivo " + cResource + " foi selecionado para se a lista de fontes para patch.");
            }
            else
            {
                vscode.window.showInformationMessage("Informe um arquivo. ");
            }
    });
return disposable;
}
*/

function GetThreads() {
    let disposable = vscode.commands.registerCommand('advpl.monitor.getThreads', function (context) {
        if (!isEnvironmentSelected()) {
            return;
        }
        var monitor = new advplMonitor(getConfigurationAsString(), OutPutChannel)
        monitor.getThreads();
    });

    return disposable;
}

function GetRpoInfos() {
    let disposable = vscode.commands.registerCommand('advpl.monitor.getRpoInfos', function (context) {
        if (!isEnvironmentSelected()) {
            return;
        }
        var monitor = new advplMonitor(getConfigurationAsString(), OutPutChannel)
        monitor.getRpoInfos(false);
    });

    return disposable;
}

function GetRpoFunctions() {
    let disposable = vscode.commands.registerCommand('advpl.monitor.getRpoFunctions', function (context) {
        if (!isEnvironmentSelected()) {
            return;
        }
        var monitor = new advplMonitor(getConfigurationAsString(), OutPutChannel)
        monitor.getRpoInfos(true);
    });

    return disposable;
}

function DeleteSource() {
    let disposable = vscode.commands.registerCommand('advpl.monitor.deleteSource', function (context) {
        if (!isEnvironmentSelected()) {
            return;
        }
        if (isCompiling) {
            OutPutChannel.log(localize('src.extension.compilationIgnoredText', 'Compilation ignored, there is other compilation in progress.'));
        }
        else {
            var compile = createAdvplCompile(null, null);
            let encoding =
                vscode.workspace
                    .getConfiguration("files")
                    .get("encoding");
            if (!(compile == null)) {
                compile.setEncoding(encoding);
                compile.deleteSource();
            }
        }
    });
    return disposable;
}

function DefragRpo() {
    let disposable = vscode.commands.registerCommand('advpl.monitor.defragRpo', function (context) {
        if (!isEnvironmentSelected()) {
            return;
        }
        let compile = createAdvplCompile(null, localize('src.extension.defragOkText', 'Defragmentation was successful.'));
        let encoding = vscode.workspace.getConfiguration("files").get("encoding");
        if (!(compile == null)) {
            compile.setEncoding(encoding);
            compile.defragRPO();
        }
    });
    return disposable;
}

function BuildWSClient() {
    let disposable = vscode.commands.registerCommand('advpl.buildWSClient', function (context) {
        if (!isEnvironmentSelected()) {
            return;
        }

        var monitor = new advplMonitor(getConfigurationAsString(), OutPutChannel)
        monitor.buildWSClient();
    });

    return disposable;
}

function selectEnvironment() {
    let disposable = vscode.commands.registerCommand('advpl.selectEnvironment', function (context) {

        var obj = vscode.workspace.getConfiguration("advpl").get<any>("environments");
        let envs = obj.map(env => env["environment"]);
        let envnames = obj.map(env => env["name"]);
        let list = envs.map((a, i) => envnames[i] == null ? a : envnames[i]);


        vscode.window.showQuickPick(list).then(function (select) {
            console.log(select);
            let oSelectEnv = obj.find(env => env["environment"] === select);
            if (!(oSelectEnv)) {
                let npos = obj.findIndex(env => env["name"] === select);
                oSelectEnv = obj[npos];
                //select = oSelectEnv.environment;
            }
            if (oSelectEnv) {
                let error = validEnvironment(oSelectEnv);
                if (error) {
                    vscode.window.showErrorMessage(error);
                } else {
                    let updObj = vscode.workspace.getConfiguration("advpl");

                    updObj.update("selectedEnvironment", select);
                    vscode.window.showInformationMessage(localize('src.extension.environmentText', 'Environment') + select + localize('src.extension.environmentSelectedText', ' selection was successful.'));
                    env.update(select);
                }
            }
            else {
                vscode.window.showErrorMessage(localize('src.extension.environmentNotFoundText', 'Environment not found!'));
            }
        })
    });

    return disposable;
}

function buildPPO() {
    let disposable = vscode.commands.registerCommand('advpl.createPPO', function (context) {
        if (!isEnvironmentSelected()) {
            return;
        }
        var editor = vscode.window.activeTextEditor;
        var cSource = editor.document.fileName;
        if (editor.document.isDirty) {
            let list = [localize('src.extension.yesText', 'Yes'), localize('src.extension.noText', 'No')];
            vscode.window.showQuickPick(list, { placeHolder: localize('src.extension.modifiedPpoText', 'The file is not saved and was modified. Save file before generation of PPO?') }).then(function (select) {
                console.log(select);

                if (select === list[0]) {
                    editor.document.save().then(function (select) {
                        __internal_compile(cSource, editor, true);
                    }
                    )
                }
                else {
                    vscode.window.setStatusBarMessage(localize('src.extension.userCancelPpoText', 'Action canceled by the user, the PPO was not generated!'), 5000);
                }
            })


        }
        else {
            __internal_compile(cSource, editor, true);
        }
    });
    return disposable;
}

function isEnvironmentSelected(): boolean {
    let env = vscode.workspace.getConfiguration("advpl").get("selectedEnvironment");
    if (env === "" || env == undefined) {
        vscode.window.showInformationMessage(localize('src.extension.environmentSelectErrorText', 'Please, select an environment!'));
        return false;
    }
    return true;
}

function validEnvironment(environment) {
    let env = new EnvObject().deserialize(environment),
        errors = env.getErrors(),
        msgError;
    if (errors.length > 0) {
        msgError = errors.join(' - ');
    }

    return msgError;
}
