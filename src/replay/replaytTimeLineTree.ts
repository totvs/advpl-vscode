import * as vscode from 'vscode';
import { replayPlay } from './replaySelect';

export class replaytTimeLineTree implements vscode.TreeDataProvider<TimeLine> {
    constructor(private workspaceRoot: string,private oreplayPlay: replayPlay) {

	}    
    onDidChangeTreeData?: vscode.Event<TimeLine>;
    getTreeItem(element: TimeLine): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }
    getChildren(element?: TimeLine): vscode.ProviderResult<TimeLine[]> {
        //let times:TimeLine[];
        /*for (let tl in this.oreplayPlay.timeLine)
        {
            times.push(new TimeLine(tl.source,tl.line ,vscode.TreeItemCollapsibleState.None));
        }*/
        return this.oreplayPlay.timeLine;
        
        //throw new Error("Method not implemented.");
    }
    getParent?(element: TimeLine): vscode.ProviderResult<TimeLine> {
        throw new Error("Method not implemented.");
    }

    
	


}


export class TimeLine extends vscode.TreeItem {
constructor(
    public readonly label: string,
    public source,
    public line: string,
    public datacompilacao : Date,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    
    //public readonly command?: vscode.Command
) {
    super(label, collapsibleState);
}

get tooltip(): string {
    return `${this.label}-${this.datacompilacao}`;
}

get description(): string {
    return this.line;
}
/*
iconPath = {
    light: path.join(__filename, '..', '..', 'resources', 'light', 'dependency.svg'),
    dark: path.join(__filename, '..', '..', 'resources', 'dark', 'dependency.svg')
};*/

contextValue = 'timeline';
}