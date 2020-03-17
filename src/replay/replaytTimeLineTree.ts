import * as vscode from 'vscode';
import { replayPlay } from './replaySelect';

export class replaytTimeLineTree implements vscode.TreeDataProvider<SourceTreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<SourceTreeItem | undefined> = new vscode.EventEmitter<SourceTreeItem | undefined>();
    readonly onDidChangeTreeData: vscode.Event<SourceTreeItem | undefined> = this._onDidChangeTreeData.event;
    constructor(private workspaceRoot: string,private oreplayPlay: replayPlay) {

    }    
    refresh(): void {
		this._onDidChangeTreeData.fire();
	}

    getTreeItem(element: SourceTreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }
    getChildren(element?: SourceTreeItem): vscode.ProviderResult<SourceTreeItem[]> {        
        if (element === undefined)
            return this.oreplayPlay.timeLine;
        else
            return element.timelines;
    }
    getParent?(element: SourceTreeItem): vscode.ProviderResult<SourceTreeItem> {
        throw new Error("Method not implemented.");
    }

    
	


}

export class SourceTreeItem extends vscode.TreeItem {
    public timelines : SourceTreeItem[];
    public timestamp : Date;
    public line: string;
    constructor(
        public readonly label: string,
        public source :string,
        public datacompilacao : Date,                
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        
        //public readonly command?: vscode.Command
    ) {
        super(label, collapsibleState);
        this.timelines = [];
    }
    
    get tooltip(): string {
        if (this.datacompilacao === null)
            return `${this.label}-${this.timestamp}`;
        else
            return `${this.label}- Compiled at ${this.datacompilacao}`;
    }    
    contextValue = 'timeline'; 
}
