'use strict';
import * as nls from 'vscode-nls';
const _NLSOptions = {
    locale : process.env.VSCODE_NLS_CONFIG,
    bundleFormat : nls.BundleFormat.standalone,
    messageFormat: nls.MessageFormat.file
}
let localize = nls.config(_NLSOptions)();

import * as vscode from 'vscode';
import { WorkspaceFolder, DebugConfiguration, ProviderResult, CancellationToken } from 'vscode';
import { advplCompile } from './advplCompile';
import { smartClientLaunch } from './smartClientLaunch';
import { advplConsole } from './advplConsole';
import { advplPatch } from './advplPatch';
import { advplMonitor } from './advplMonitor';
import { Environment } from './advplEnvironment';
import { MultiThread } from './MultiThread';
import EnvObject from './Environment';
import { spawn, execFile, ChildProcess } from 'child_process';
import * as path from 'path';
import { LanguageClient, LanguageClientOptions, StreamInfo } from 'vscode-languageclient';
import * as net from 'net';
import * as url from 'url';
import * as fs from 'fs';
import { StringDecoder } from 'string_decoder';
import { getConfigurationAsString, hasCompileKey } from './utils';
import generateConfigFromAuthorizationFile from './authorizationFile';
import cmdAddAdvplEnvironment from './commands/addAdvplEnvironment';
import * as debugBrdige from  './utils/debugBridge';
import {replayPlay} from './replay/replaySelect';
import {getReplayExec} from './replay/replayUtil';
import {replaytTimeLineTree}  from  './replay/replaytTimeLineTree';
import { ServerManagementView } from './serversManagementView';
import { WhatsNewAdvPLContentProvider } from './whatsNew';
import { WhatsNewManager } from './vscode-whats-new/Manager';
import { formattingEditProvider, rangeFormattingEditProvider } from './codeFormat/formatting';

let advplDiagnosticCollection = vscode.languages.createDiagnosticCollection();
let OutPutChannel = new advplConsole();
let isCompiling = false;
let env;
let multiThread: MultiThread;
let oreplayPlay: replayPlay;
let cancelCompile: boolean;
function __getReplayInstance() {
    return oreplayPlay;
}
export async function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(getProgramName());
    context.subscriptions.push(startSmartClient());
    context.subscriptions.push(addGetDebugInfosCommand());
    context.subscriptions.push(compile());
    context.subscriptions.push(buildPPO());
    context.subscriptions.push(menucompile());
    context.subscriptions.push(menucompilemulti());
    context.subscriptions.push(menucompileProjet());
    context.subscriptions.push(menucompiletextfile());
    context.subscriptions.push(GetINI());
    context.subscriptions.push(compileFilesOpened());

    context.subscriptions.push(getAuthorizationId());
    context.subscriptions.push(CipherPassword());
    context.subscriptions.push(selectEnvironment());

    context.subscriptions.push(generateAuthorizationConfig());
    context.subscriptions.push(addAdvplEnvironment());
    context.subscriptions.push(aaddAvplMultiThread());

    //Binds dos comandos de patch
    //context.subscriptions.push(PathSelectSource());
    context.subscriptions.push(PathApply());
    context.subscriptions.push(PathApplyFile());
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
    context.subscriptions.push(DeleteSourceContext());
    context.subscriptions.push(DefragRpo());
    context.subscriptions.push(GetDebugPath());
    context.subscriptions.push(ReplaySelect());
    context.subscriptions.push(getReplayTmpDir());
    context.subscriptions.push(getReplayExecId());
/* Trace de Debug
    vscode.debug.registerDebugAdapterTrackerFactory('advpl', {
        createDebugAdapterTracker(session: vscode.DebugSession) {
          return {
            onWillReceiveMessage: m => fs.appendFileSync('debugtrace.txt', "\n#################DIDSEND START#####################" +`> ${JSON.stringify(m, undefined, 2)}` + "\n#################DIDSEND STOP#####################" ),
            onDidSendMessage: m =>  fs.appendFileSync('debugtrace.txt', "\n#################Receive START#####################" +`> ${JSON.stringify(m, undefined, 2)}` + "\n#################Receive STOP#####################" )
          };
        }
      });*/
    //context.subscriptions.push(getReplayPath());

    // Binds do Servers View
    context.subscriptions.push(addServer(context));


    const providerAdvpl = new AdvplConfigurationProvider();
    context.subscriptions.push(vscode.debug.registerDebugConfigurationProvider('advpl', providerAdvpl));

    const factoryAdvpl = new AdvplDebugAdapterDescriptorFactory();
		context.subscriptions.push(vscode.debug.registerDebugAdapterDescriptorFactory('advpl', factoryAdvpl));
        context.subscriptions.push(factoryAdvpl);


    // register a configuration provider for 'Replay' debug type
	const provider = new ReplayConfigurationProvider();
    context.subscriptions.push(vscode.debug.registerDebugConfigurationProvider('advpl-replay', provider));

    const factory = new ReplayDebugAdapterDescriptorFactory();
		context.subscriptions.push(vscode.debug.registerDebugAdapterDescriptorFactory('advpl-replay', factory));
		context.subscriptions.push(factory);

    //vscode.debug.registerDebugConfigurationProvider("advpl-ty")
    //const debugProvider = new AdvplDebugConfigurationProvider();
    //context.subscriptions.push(vscode.debug.registerDebugConfigurationProvider("advpl", debugProvider));
    await ensureRuntimeDependencies();
    //Environment no bar
    env = new Environment();
    env.update(vscode.workspace.getConfiguration("advpl").get("selectedEnvironment"));

    // Multi-Thread no Bar
    multiThread = new MultiThread();

    oreplayPlay = new replayPlay(advplDiagnosticCollection, OutPutChannel);
    const replayTimeLineProvider = new replaytTimeLineTree(vscode.workspace.rootPath, oreplayPlay);
    vscode.window.registerTreeDataProvider('replayTimeLine', replayTimeLineProvider);
    //initLanguageServer(context);
    let api = {
        writeAdvplConsole(cLog) {
            OutPutChannel.log(cLog);
        },
        compile(cSource: string, cDescription: string = localize('src.extension.sourceText', 'Source'), ignoreEvents: boolean = false) {
            return createAdvplCompile(cSource, cDescription, ignoreEvents);
        },
        async cipherPassword(password: string): Promise<string> {
            const compile = new advplCompile();
            return new Promise<string>((resolve, reject) => {
                compile.runCipherPassword(password, (cipher: string) => {
                    resolve(cipher.replace(/\r?\n?/g, ''));
                });
            });
        }
    };
    vscode.commands.registerCommand('advpl.replay.openFileInLine', (source, line) => oreplayPlay.openFileInLine(source, line));
    vscode.commands.registerCommand('advpl.refreshReplay', () => replayTimeLineProvider.refresh());

    const serverView = new ServerManagementView();

    vscode.window.createTreeView("serversManagement", {
        treeDataProvider : serverView.provider,
        showCollapseAll : true
    });

    // Evento acionado sempre que uma configuração é alterada no Workspace
    context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(e => {
        // Atualiza o Status Bar de Multi-Thread
        if (e.affectsConfiguration('advpl.debug_multiThread')) {
            multiThread.changeItem();
        }

        // Atualiza o Status Bar de Ambientes
        if (e.affectsConfiguration('advpl.selectedEnvironment')) {
            env.update(vscode.workspace.getConfiguration("advpl").get("selectedEnvironment"));
        }

        // Mostra o disclaimer quando houver atualização do token ou chave de compilação
        if ((e.affectsConfiguration('advpl.compileToken') || e.affectsConfiguration('advpl.authorization_code')) && hasCompileKey()) {
            OutPutChannel.showDisclaimer();
        }

        // Atualiza o TreeView de servidores
        serverView.provider.refresh();
	}));

	vscode.languages.registerDocumentFormattingEditProvider(
		'advpl',
		formattingEditProvider()
	);

	vscode.languages.registerDocumentRangeFormattingEditProvider(
		'advpl',
		rangeFormattingEditProvider()
	);

    // Provider What's new
    const providerWhatsNew = new WhatsNewAdvPLContentProvider();
    const viewer = new WhatsNewManager(context).registerContentProvider("advpl-vscode", providerWhatsNew);

    // show the page (if necessary)
    viewer.showPageInActivation();

    // register the additional command (not really necessary, unless you want a command registered in your extension)
    context.subscriptions.push(vscode.commands.registerCommand("advpl.whatsNew", () => viewer.showPage()));

    // Registra as expressões AdvPL tratadas para o Hover Inspect Debug
    context.subscriptions.push(vscode.languages.registerEvaluatableExpressionProvider('advpl', {
        provideEvaluatableExpression(document: vscode.TextDocument, position: vscode.Position):
            vscode.ProviderResult<vscode.EvaluatableExpression> {

            const wordRange = document.getWordRangeAtPosition(position);
            const fieldAlias = document.getWordRangeAtPosition(position, /((\(\s*\w+\s*\)|\w+)->)\w+/i);
            // const array = document.getWordRangeAtPosition(position, /\w+\s*[^º]*]/i);
            const macroSubstituicao = document.getWordRangeAtPosition(position, /&[^:]*/i);

            const regexAtributo = new RegExp("((::|self:)|([^:(\\s\\,\\!\\+\\-\\[\\{]+\\:)+)(" + document.getText(wordRange) + ")", 'i')
            const atributo = document.getWordRangeAtPosition(position, regexAtributo);

            // Obs.: Comentado por conta das dificuldades de inspeção usando essa abordagem, pois o usuário poderia querere inspecionar a variável e não o item do array.
            // Tratamento para inspeções de Arrays: aTeste[1][2]
            // if (array) {
            //     return new vscode.EvaluatableExpression(array);
            // }

            // Tratamento para inspeções de Fields: (cAlias)->TB_FIELD ou TBL->TB_FIELD
            if (fieldAlias) {
                return new vscode.EvaluatableExpression(fieldAlias);
            }

            // Tratamento para inspeções de Macro Substituíções: &cNomeVar
            // Obs.: Conforme acordado na issue #417 seria criado uma configuração para o usuário escolher se deseja inspecionar esse tipo de estrutura.
            if (macroSubstituicao && vscode.workspace.getConfiguration("advpl").get("debug_inspect_macro")) {
                return new vscode.EvaluatableExpression(macroSubstituicao);
            }

            // Tratamento para inspeções de atributos de classe: oClasse:oAtributo1:oAtributoFilho
            if (atributo) {
                return new vscode.EvaluatableExpression(atributo);
            }

            // TODO: Pensar numa forma de implementar a inspeção de variáveis em EmbededSQL %Exp:cVar% desconsiderando a sintaxe do EmbededSQL

            // Tratamento default para inspecionar palavras
            if (wordRange) {
                return new vscode.EvaluatableExpression(wordRange);
            }

        }
    }));

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
                if (element.environment === ambienteAtual || element.name === ambienteAtual)
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

export function createAdvplCompile(cSource: string, cDescription: string, ignoreEvents: Boolean = false) {
    let compile: advplCompile;

    try {
        compile = new advplCompile(
            getConfigurationAsString(),
            advplDiagnosticCollection,
            OutPutChannel
        );

        if (!ignoreEvents) {

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
        }

        isCompiling = true;
    } catch (e) {
        OutPutChannel.log(localize('src.extension.compileInitializationErrorText', 'Error in compilation initialization:') + (<Error>e).message);
    }

    return compile;
}

function addAdvplEnvironment() {
    return vscode.commands.registerCommand('advpl.addAdvplEnvironment', cmdAddAdvplEnvironment);
}

function aaddAvplMultiThread() {
    let disposable = vscode.commands.registerCommand('advpl.multiThread', function (context) {

        let advplConfig = vscode.workspace.getConfiguration("advpl");
        let newMultiThread = !advplConfig.get<boolean>("debug_multiThread");
        let newMultiThreadTarget = undefined;

        // Caso nao haja workspace configurado, altera nas configurações globais
        if (!vscode.workspace.workspaceFolders){
            newMultiThreadTarget = true;
        }

        // Inverte a configuração de Multi-Thread
        advplConfig.update("debug_multiThread", newMultiThread, newMultiThreadTarget).then(e => {
            // Atualiza o status bar de Multi-Thread
            multiThread.changeItem(newMultiThread);
        });

    });

    return disposable;
}

function ReplaySelect() {
    return vscode.commands.registerCommand('advpl.replaySelect', function (context) {

        oreplayPlay.clearReplayInfos();
        //oreplayPlay = new replayPlay(advplDiagnosticCollection,OutPutChannel);

        return oreplayPlay.cmdReplaySelect();
    });
}
function getReplayTmpDir()
{
    return vscode.commands.registerCommand('advpl.replayTmpDir', function (context){
        /*if (oreplayPlay === undefined){
            oreplayPlay = new replayPlay(advplDiagnosticCollection,OutPutChannel);
            await oreplayPlay.cmdReplaySelect();
        } */
        return oreplayPlay.getTmpDir();
    });
}
function getReplayExecId()
{
    return vscode.commands.registerCommand('advpl.replayExecId', function (context){
        /*if (oreplayPlay === undefined){
            oreplayPlay = new replayPlay(advplDiagnosticCollection,OutPutChannel);
            await oreplayPlay.cmdReplaySelect();
        } */
        return oreplayPlay.getSelected();
    });
}


function menucompileProjet() {
    let disposable = vscode.commands.registerCommand('advpl.menucompileProjet', function (context) {

        var cSource = context.fsPath;
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
            var cSource = context.fsPath;
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
            var cSource = context.fsPath;
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
        var cResource = context.fsPath;
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

        if (editor.document.isDirty || editor.document.isUntitled) {
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

function compileFilesOpened() {
    let disposable = vscode.commands.registerCommand('advpl.compileFilesOpened', async function (context) {
        let textDocuments = new Array<vscode.TextDocument>();
        let firstDocument: vscode.TextEditor;
        let finish: boolean = false;
        let hasDirty = false;

        if (!isEnvironmentSelected()) {
            return;
        }

        if (isCompiling) {
            OutPutChannel.log(localize('src.extension.compilationIgnoredText', 'Compilation ignored, there is other compilation in progress.'));
            return;
        }

        /**
         * Verifica se o tipo de arquivo é AdvPL.
         * @param editor Contexto do editor posicionado.
         */
        function isAdvPL(editor: vscode.TextEditor): boolean {
            return editor.document.languageId === "advpl";
        }

        // Se tiver algum arquivo aberto no editor
        if (vscode.window.activeTextEditor) {

            // Percorre todos os arquivos abertos do editor
            do {

                // Posiciona no próximo arquivo
                await vscode.commands.executeCommand("workbench.action.nextEditor").then(e => {

                    // Verifica se o arquivo é do tipo AdvPLs
                    if (isAdvPL(vscode.window.activeTextEditor)) {

                        // Caso o primeiro documento AdvPL não tenha sido definido, adiciona no array e define este como o primeiro.
                        if (!firstDocument) {
                            firstDocument = vscode.window.activeTextEditor;
                            textDocuments.push(firstDocument.document);
                        } else {
                            // Caso o documento posicionado seja o mesmo do primeiro, termina o loop
                            if (firstDocument.document.fileName == vscode.window.activeTextEditor.document.fileName) {
                                finish = true;
                            } else {
                                // Se não adiciona no array
                                textDocuments.push(vscode.window.activeTextEditor.document);
                            }
                        }
                    }

                });

                // Caso tenha finalizado o Loop, volta para o primeiro arquivo do posicionamento, pois o Loop já começa mudando de arquivo
                if (finish) {
                    await vscode.commands.executeCommand("workbench.action.previousEditor");
                }

            } while (!finish);

        }

        // Verifica se todos os arquivos do tipo AdvPL abertos estão salvos.
        if (textDocuments.find(file => file.isDirty || file.isUntitled)) {
            let list = [localize('src.extension.yesText', 'Yes'), localize('src.extension.noText', 'No')];

            // Força o usuário a salvar as alterações antes de continuar
            await vscode.window.showQuickPick(list, { placeHolder: localize('src.extension.saveDirty', 'There are unsaved open files. Do you want to save to continue?') }).then(async function (select) {
                if (select === list[0]) {
                    for (const element of textDocuments) {
                        await element.save();
                    }
                } else {
                    hasDirty = true;
                }
            });
        }

        // Caso não hajam arquivos pendentes de salvamento continua a compilação
        if (!hasDirty) {

            vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                // title: "Compilando arquivos...",
                cancellable: true
            }, (progress, token) => {

                token.onCancellationRequested(e => {
                    cancelCompile = true;
                });

                return new Promise(resolve => {
                    progress.report({ increment: 0 });

                    __internal_compile_callback(textDocuments, progress).then(() => {
                        cancelCompile = false;
                        resolve(null);
                    });

                });
            });
        }

    });

    return disposable;
}

async function __internal_compile_callback(documents: vscode.TextDocument[],
    progress: vscode.Progress<{ message?: string; increment?: number }>) {

    let processed = 0;

    // Verifica se está selecionado um ambiente
    if (!isEnvironmentSelected()) {
        return;
    }

    if (isCompiling) {
        OutPutChannel.log(localize('src.extension.compilationIgnoredText', 'Compilation ignored, there is other compilation in progress.'));
        return;
    }

    // Cria o objeto de compilação
    let compile = createAdvplCompile(null, null, true);

    if (!(compile == null)) {

        // Limpa a aba de problemas aqui, pois a função de compilação utilizada irá fazer várias compilações em Loop.
        advplDiagnosticCollection.clear();

        // Percorre os arquivos abertos do Workspace para compilar. A função "For Of" aguarda a finalização de cada operação await.
        for (const element of documents) {

            // Quebra o caminho do arquivo em Array para capturar somente o nome do arquivo.
            progress.report({ increment: (100 / documents.length), message: localize('src.extension.compiling', 'Compiling ') + path.parse(element.fileName).base });

            // Aguarda o retorno da chamada de compilação pelo Bridge
            await new Promise(function (resolve, reject) {
                // Chama o método da classe que compila o arquivo com Callback
                compile.setonError(function () {
                    reject();
                });

                // Antes de chamar a compilação, verifica se foi solicitado um cancelamento
                if (cancelCompile) {
                    reject();
                } else {
                    compile.compileCallBack(element.fileName,
                        function (compileCallback) {
                            // Limpa o Buffer de retorno do Bridge a cada interação, para não gerar um JSON inválido para cada retorno.
                            compileCallback._lastAppreMsg = "";
                            processed++;
                            resolve(null);
                        }
                    );
                }
            }).catch(() => console.log("Error on Promise of __internal_compile_callback"));
        }

        // Retira o modo de compilação da Extensão
        isCompiling = false;

        // Notifica o usuário quantos arquivos foram processados (solicitados compilação)
        OutPutChannel.log(`${processed + localize('src.extension.processed', ' processed files (see log output). ')}\n`);
    }

}

function GetDebugPath() {

    let disposable = vscode.commands.registerCommand('advpl.getDebugPath', function (context) {
        let path = debugBrdige.getAdvplDebugBridge();
        return { command: path};

    });
    return disposable;
}
/*function getReplayPath()
{

    let disposable = vscode.commands.registerCommand('advpl.getReplayPath', function (context) {
        let path = getReplayExec();
        return { command: path};

    });
    return disposable;
}*/

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

        var cResource = context.fsPath;

        if (fs.lstatSync(cResource).isFile()) {
            var patch = new advplPatch(JSON.stringify(vscode.workspace.getConfiguration("advpl")), OutPutChannel)

            if (advplCompile.getIsAlpha()){

                let list = [localize('src.extension.yesText', 'Yes'), localize('src.extension.noText', 'No')];
                vscode.window.showQuickPick(list, { placeHolder: localize('src.extension.applyNewest', 'Apply only newest files?') }).then(function (select) {

                    if (select === list[0])
                        patch.apply(cResource, false);
                    else if (select === list[1])
                        patch.apply(cResource, true);
                });
            }else{
                OutPutChannel.log("\n" + localize('src.extension.patchAlphaInfo', 'To apply only updated patch files it is necessary that the advpl.alpha_compile setting is enabled.'))
                OutPutChannel.log(localize('src.extension.patchAlphaSee', 'Find out more at: https://github.com/totvs/advpl-vscode/wiki/Trabalhando-com-Patchs') + "\n")
                patch.apply(cResource);
            }

        }
        else {
            vscode.window.showErrorMessage(localize('src.extension.patchSelectFileErrorText', 'Please, select a patch file (*.ptm)'));
        }
    });

    return disposable;
}

function PathApplyFile() {
    let disposable = vscode.commands.registerCommand('advpl.applyPatchFile', function (context) {
        if (!isEnvironmentSelected()) {
            return;
        }

        const options: vscode.OpenDialogOptions = {
            canSelectFolders: false,
            canSelectFiles: true,
            canSelectMany: false,
            openLabel: "Selecione o Patch a aplicar",
            filters: {'PTM Files': ['ptm']}
        };

        return vscode.window.showOpenDialog(options).then(folderUris => {

            if (folderUris) {

                let resource = folderUris[0].fsPath;

                if (fs.lstatSync(resource).isFile() && path.parse(resource).ext.toLowerCase() == ".ptm") {
                    var patch = new advplPatch(JSON.stringify(vscode.workspace.getConfiguration("advpl")), OutPutChannel)

                    if (advplCompile.getIsAlpha()){
                        let list = [localize('src.extension.yesText', 'Yes'), localize('src.extension.noText', 'No')];
                        vscode.window.showQuickPick(list, { placeHolder: localize('src.extension.applyNewest', 'Apply only newest files?') }).then(function (select) {

                            if (select === list[0])
                                patch.apply(resource, false);
                            else if (select === list[1])
                                patch.apply(resource, true);
                        });
                    }else{
                        OutPutChannel.log("\n" + localize('src.extension.patchAlphaInfo', 'To apply only updated patch files it is necessary that the advpl.alpha_compile setting is enabled.'))
                        OutPutChannel.log(localize('src.extension.patchAlphaSee', 'Find out more at: https://github.com/totvs/advpl-vscode/wiki/Trabalhando-com-Patchs') + "\n")
                        patch.apply(resource);
                    }
                }
                else {
                    vscode.window.showErrorMessage(localize('src.extension.patchSelectFileErrorText', 'Please, select a patch file (*.ptm)'));
                }

            } else {
                vscode.window.showWarningMessage(localize('src.extension.patchSelectFileErrorText', 'Please, select a patch file (*.ptm)'));
            }

        });

    });

    return disposable;
}

function PathInfo() {
    let disposable = vscode.commands.registerCommand('advpl.patch.info', function (context) {
        if (!isEnvironmentSelected()) {
            return;
        }
        var cResource = context.fsPath;
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
        let fileToBuildPath = context.fsPath;
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

function DeleteSourceContext() {
    let disposable = vscode.commands.registerCommand('advpl.monitor.deleteSourceContext', function (context) {
        if (!isEnvironmentSelected()) {
            return;
        }
        if (isCompiling) {
            OutPutChannel.log(localize('src.extension.compilationIgnoredText', 'Compilation ignored, there is other compilation in progress.'));
        }
        else {
            if (context) {

                function getFiles(dir, files_?) {
                    files_ = files_ || [];
                    var files = fs.readdirSync(dir);
                    for (var i in files) {
                        var name = dir + '/' + files[i];
                        if (fs.statSync(name).isDirectory()) {
                            getFiles(name, files_);
                        } else {
                            files_.push(name);
                        }
                    }
                    return files_;
                }

                let list = [localize('src.extension.yesText', 'Yes'), localize('src.extension.noText', 'No')];

                vscode.window.showQuickPick(list, { placeHolder: localize('src.extension.confirmDelete', 'Do you really want to delete the file (s) from the RPO?') }).then(function (select) {

                    if (select === list[0]) {

                        let cFiles = ""
                        let cResource = context.fsPath;

                        if (fs.lstatSync(cResource).isDirectory()) {
                            getFiles(cResource).forEach(dir => {
                                cFiles += path.basename(dir) + ";"
                            });

                            if (cFiles.length > 0) {
                                cFiles = cFiles.substr(0, cFiles.length - 1)
                            }

                        } else {
                            cFiles = path.basename(cResource);
                        }

                        var compile = createAdvplCompile(null, null);
                        let encoding =
                            vscode.workspace
                                .getConfiguration("files")
                                .get("encoding");
                        if (!(compile == null)) {
                            compile.setEncoding(encoding);
                            compile.deleteSourceContext(cFiles);
                        }
                        else {
                            vscode.window.showInformationMessage(localize('src.extension.deleteSourceContext', 'Need to select a folder or file in Explorer!'));
                        }
                    }
                });
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
        let envs = obj.filter(env => env["enable"] != false).map(env => env["environment"]); // Filtra somente os ambientes que não estão desabilitados
        let envnames = obj.filter(env => env["enable"] != false).map(env => env["name"]); // Filtra somente os ambientes que não estão desabilitados
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

function GetINI() {
    let disposable = vscode.commands.registerCommand('advpl.getINI', function (context) {
        if (!isEnvironmentSelected()) {
            return;
        }

        // Cria o objeto de compilação
        let compile = createAdvplCompile(null, null);

        // Sobrescreve o evento após compilação do objeto 'compile'
        compile.setAfterCompileOK(function (iniContent: string) {
            const newFile = vscode.Uri.parse('untitled:' + path.join(vscode.workspace.rootPath, 'getIni' + (new Date()).getMilliseconds().toString() + '.ini'));

            vscode.workspace.openTextDocument(newFile).then(document => {
                const edit = new vscode.WorkspaceEdit();
                edit.insert(newFile, new vscode.Position(0, 0), iniContent);

                return vscode.workspace.applyEdit(edit).then(success => {
                    if (success) {
                        vscode.window.showTextDocument(document);
                        isCompiling = false;
                    } else {
                        vscode.window.showInformationMessage(localize('src.advplMonitor.errorText', 'Error!'));
                    }
                });
            });

            OutPutChannel.log(localize('src.extension.getINIOkText', 'Obtaining the successful INI.') + "\n");
        });

        // Chama o método da classe que busca o INI
        if (!(compile == null)) {
            OutPutChannel.log(localize("src.extension.startingGetINI", "Starting INI File Search...") + "\n");
            compile.getINI();
        }
    });

    return disposable;
}

function addServer(context){
    let disposable = vscode.commands.registerCommand('advpl.serversManagement.AddServer', async () => {
        vscode.commands.executeCommand('advpl.addAdvplEnvironment');
    });

    return disposable;
}

export function isEnvironmentSelected(): boolean {
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
async function ensureRuntimeDependencies()
{
    debugBrdige.installAdvplDebugBridge(OutPutChannel);

}

class ReplayConfigurationProvider implements vscode.DebugConfigurationProvider {
    resolveDebugConfiguration(folder: WorkspaceFolder | undefined, config: DebugConfiguration, token?: CancellationToken): ProviderResult<DebugConfiguration> {

		// if launch.json is missing or empty
		if (!config.type && !config.request && !config.name) {
			const editor = vscode.window.activeTextEditor;
			if (editor && editor.document.languageId === 'advpl') {
				config.type = 'advpl-replay';
				config.name = 'Launch';
				config.request = 'launch';
				config.stopOnEntry = true;
			}
        }
        let instance = __getReplayInstance();
        let replayExec = instance.getSelected();

		if (replayExec === undefined) {
			return vscode.window.showInformationMessage("Please select a Replay file before.").then(_ => {
				return undefined;	// abort launch
			});
		}

		return config;
	}

}


class ReplayDebugAdapterDescriptorFactory implements vscode.DebugAdapterDescriptorFactory {



	createDebugAdapterDescriptor(session: vscode.DebugSession, executable: vscode.DebugAdapterExecutable | undefined): vscode.ProviderResult<vscode.DebugAdapterDescriptor> {

        const args = []; //Vai os parametros vai onLaunch

        const program =  getReplayExec(); //"/home/rodrigo/totvs/vscode/AdvtecMiddleware/build/TdsReplayPlay";

		return new vscode.DebugAdapterExecutable(program, args);
	}

	dispose() {

	}
}

class AdvplConfigurationProvider implements vscode.DebugConfigurationProvider {
    resolveDebugConfiguration(folder: WorkspaceFolder | undefined, config: DebugConfiguration, token?: CancellationToken): ProviderResult<DebugConfiguration> {

		// if launch.json is missing or empty
		if (!config.type && !config.request && !config.name) {
			const editor = vscode.window.activeTextEditor;
			if (editor && editor.document.languageId === 'advpl') {
				config.type = 'advpl';
				config.name = 'Advpl Debug';
				config.request = 'launch';
                config.stopOnEntry = false;
                config.cwd= "${workspaceRoot}";
                config.programRun ="${command:AskForProgramName}";
                config.enviromentInfo= "${command:GetEnvInfos}";
                config.workspace= "${workspaceFolder}/";
			}
        }
		return config;
	}

}
class AdvplDebugAdapterDescriptorFactory implements vscode.DebugAdapterDescriptorFactory {



	createDebugAdapterDescriptor(session: vscode.DebugSession, executable: vscode.DebugAdapterExecutable | undefined): vscode.ProviderResult<vscode.DebugAdapterDescriptor> {

        const args = []; //Vai os parametros vai onLaunch

        const program = debugBrdige.getAdvplDebugBridge();

       /* const program = "/snap/bin/valgrind";
        const args = [ "--tool=massif", "--massif-out-file=/home/rodrigo/tmp/valgrid-log/massif.out.%p", "/home/rodrigo/totvs/vscode/AdvtecMiddleware/build/AdvplDebugBridgeC"]*/
		return new vscode.DebugAdapterExecutable(program, args);
	}

	dispose() {

	}
}