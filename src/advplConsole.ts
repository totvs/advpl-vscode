import * as vscode from 'vscode';
import * as nls from 'vscode-nls';

const localize = nls.loadMessageBundle();

export class advplConsole {
    private outPutChannel: vscode.OutputChannel;

    constructor() {
        this.outPutChannel = vscode.window.createOutputChannel('Advpl');
        this.outPutChannel.show();
        
        this.log(localize('src.advplConsole.text', 'AdvPL Started (en)'));
    }

    public log(message: string) {
        this.outPutChannel.appendLine(message);
    }
}
