import { window, commands, Disposable, ExtensionContext, StatusBarAlignment, StatusBarItem, TextDocument, workspace } from 'vscode';
import * as nls from 'vscode-nls';

const localize = nls.loadMessageBundle();

export class Environment {
    private _statusBarItem;
    private _selectEnv;

    public update(envSeted: string) {
        if (!this._statusBarItem) {
            this._statusBarItem = window.createStatusBarItem(StatusBarAlignment.Right);
            this._statusBarItem.command = "advpl.selectEnvironment";
        }
        this._statusBarItem.text = "$(squirrel) " + localize('src.advplEnvironment.text', 'Environment (en)') + envSeted;
        this._statusBarItem.show();
    }
}