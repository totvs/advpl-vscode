import {window, commands, Disposable, ExtensionContext, StatusBarAlignment, StatusBarItem, TextDocument,workspace} from 'vscode';

export class Enviroment
{
    private _statusBarItem;
    private _selectEnv;
    
    public update(envSeted : string)
    {
        if(!this._statusBarItem)
        {
            this._statusBarItem = window.createStatusBarItem(StatusBarAlignment.Right);
            this._statusBarItem.command = "advpl.selectEnviroment";
        }
        this._statusBarItem.text = "$(squirrel) Ambiente: " + envSeted;
        this._statusBarItem.show();
/*
        let editor = window.activeTextEditor;
        if (!editor) {
            this._statusBarItem.hide();
            return;
        }

        let doc = editor.document;
            
        if (doc.languageId === "advpl") {            
        
        } else { 
            this._statusBarItem.hide();
        }*/
        
    }        


}