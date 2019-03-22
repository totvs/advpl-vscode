import * as vscode from 'vscode';

export class replaytTimeLineTree implements vscode.TreeDataProvider<TimeLine> {
    constructor(private workspaceRoot: string) {

	}
    
    onDidChangeTreeData?: vscode.Event<TimeLine>;
    getTreeItem(element: TimeLine): vscode.TreeItem | Thenable<vscode.TreeItem> {
        throw new Error("Method not implemented.");
    }
    getChildren(element?: TimeLine): vscode.ProviderResult<TimeLine[]> {
        throw new Error("Method not implemented.");
    }
    getParent?(element: TimeLine): vscode.ProviderResult<TimeLine> {
        throw new Error("Method not implemented.");
    }

    
	


}


export class TimeLine extends vscode.TreeItem {


}