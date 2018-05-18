import * as vscode from 'vscode';
import * as child_process from 'child_process';
import fs = require('fs');
function getAdvplBinPath (alpha){
    let path = vscode.extensions.getExtension("KillerAll.advpl-vscode").extensionPath;
    if (process.platform == "win32") {
        if(alpha)        
            path+= "\\bin\\alpha\\win\\";
        else
            path+= "\\bin\\";
    }
    else
    {
        if (process.platform == "darwin")
        {
            path+= "/bin/alpha/mac/";
        }
        else {
            path+=  "/bin/alpha/linux/";
        }
    }

    return path;
}
export function getAdvplDebugBridge (){    
    const config = vscode.workspace.getConfiguration("advpl");
    const alpha = config.get<boolean>("alpha_compile"); 
    let path = getAdvplBinPath (alpha);

    if (process.platform == "win32") {
        if(alpha)        
            path+= "AdvplDebugBridgeC.exe";
        else
            path+= "AdvplDebugBridge.exe";
    }
    else
    {
        path+=  "AdvplDebugBridgeC";        
    }    
    return path;
}
function runUnzip(path, args,OutPutChannel)
{
    let ok : boolean;    
    //unzip -d ${HOME}/lib AdvtecDebugBridgeMAC.zip    
    const child = child_process.spawn("unzip", args,{cwd:path, shell:true });
    child.stdout.on("data", function (data) {
        OutPutChannel.log("unzip..")
        OutPutChannel.log(data);
    });
/*
    child.on("exit", function (data) {
        ok = false;
    });*/
    
    return true;
}
export function installAdvplDebugBridge (OutPutChannel){
    if (process.platform == "darwin")
    {
        let path = getAdvplBinPath(false);
        if (!fs.existsSync("${HOME}/lib/libboost_system.dylib"))
        {
            let _args2 = new Array<string>();
            _args2.push("-d");
            _args2.push("${HOME}/lib");
            _args2.push("AdvtecDebugBridgeMAC_lib.zip");
            runUnzip(path,_args2,OutPutChannel);

            let _args = new Array<string>();            
            _args.push("AdvtecDebugBridgeMAC_bin.zip");         
            runUnzip(path,_args,OutPutChannel);
        }
    }
    
}