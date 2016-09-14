import * as vscode from 'vscode';
export class advplConsole {
    private outPutChannel :vscode.OutputChannel;

constructor()
    {
        this.outPutChannel = vscode.window.createOutputChannel('Advpl');
        this.outPutChannel.show();
        this.log("Advpl Iniciando");
    }
    public log(message : string)
    {
     this.outPutChannel.appendLine(message);   
    }


}
