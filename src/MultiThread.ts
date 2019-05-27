import { window, StatusBarAlignment, StatusBarItem } from 'vscode';
import * as nls from 'vscode-nls';
import * as vscode from 'vscode';

const localize = nls.loadMessageBundle();

/**
 * @description Classe para manipular a StatusBar de Multi-Thread
 * @see https://github.com/totvs/advpl-vscode/issues/304
 * @author https://github.com/AlencarGabriel
*/
export class MultiThread {
    private _statusBarItem: StatusBarItem;

    constructor() {
        this._statusBarItem = window.createStatusBarItem(StatusBarAlignment.Left);
        this._statusBarItem.tooltip = "Depurar Múltiplas Threads";
        this._statusBarItem.command = "advpl.multiThread";
        this.changeItem();
        this._statusBarItem.show();
    }

    public changeItem(debug_multiThread? : boolean) {
        // Caso não tenha informado se está habilitado ou não, busca das configurações
        // Obs.: Buscando dentro do Promise do métódo WorkspaceConfiguration.update() retorna leitura não consolidada nas configurações.
        if (debug_multiThread === undefined) {
            debug_multiThread = vscode.workspace.getConfiguration("advpl").get("debug_multiThread");
        }

        // Caso a configuração seja Verdadeira, anima o ícone para chaar atenção da configuração que está habilitada
        if (debug_multiThread === true) {
            this._statusBarItem.text = "$(kebab-horizontal~spin) Multi-Thread: " + localize('src.extension.yesText', 'Yes');
        }
        else {
            this._statusBarItem.text = "$(kebab-horizontal) Multi-Thread: " + localize('src.extension.noText', 'No');
        }
    }

}