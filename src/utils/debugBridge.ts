import * as vscode from 'vscode';
export function getAdvplDebugBridge (){
    let path = vscode.extensions.getExtension("KillerAll.advpl-vscode").extensionPath;
    const config = vscode.workspace.getConfiguration("advpl");
    const alpha = config.get<boolean>("alpha_compile"); 

    if (process.platform == "win32") {
        if(alpha)        
            path+= "\\bin\\alpha\\win\\AdvplDebugBridgeC.exe";
        else
            path+= "\\bin\\AdvplDebugBridge.exe";
    }
    else
    {
        if (process.platform == "darwin")
        {
            path+= "/bin/alpha/mac/AdvplDebugBridgeC";
        }
        else {
            path+=  "/bin/alpha/linux/AdvplDebugBridgeC";
        }
    }
    
    return path;

}