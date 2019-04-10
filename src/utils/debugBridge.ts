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
export function getAdvplDebugBridge(){    
    const config = vscode.workspace.getConfiguration("advpl");
    let alpha = config.get<boolean>("alpha_compile");
    let selectedEnvironment: string;        
    selectedEnvironment = config.selectedEnvironment;    
    for (let entry of config.environments) {
        if(selectedEnvironment === entry.environment || entry.hasOwnProperty('name') && selectedEnvironment === entry.name) {
            if (entry.hasOwnProperty('totvs_language') && entry.totvs_language === "4gl")
            {
                alpha = true;
            }
            break;
        }
    }
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
function runUnzip(path, args, file ,OutPutChannel)
{
    let ok : boolean;    
    //unzip -d ${HOME}/lib AdvtecDebugBridgeMAC.zip    
    args.push(file);
    const child = child_process.spawn("unzip", args,{cwd:path, shell:true });
    /*child.stdout.on("data", function (data) {
        OutPutChannel.log("unzip..")
        OutPutChannel.log(data);
    });*/

    child.on("exit", function (data) {
        fs.unlink(path+file);
    });
    
    return true;
}
export function installAdvplDebugBridge (OutPutChannel){
    if (process.platform == "darwin")
    {
        let path = getAdvplBinPath(false);
        //if (!fs.existsSync("${HOME}/lib/libboost_system.dylib"))
        if (fs.existsSync(path+'AdvtecDebugBridgeMAC_bin.zip'))
        {
            let _args = new Array<string>();            
            runUnzip(path,_args,'AdvtecDebugBridgeMAC_bin.zip', OutPutChannel);
        }
        if (fs.existsSync(path+'AdvtecDebugBridgeMAC_lib.zip'))
        {
            let _args2 = new Array<string>();
            _args2.push("-d");
            _args2.push("${HOME}/lib");            
            runUnzip(path,_args2,'AdvtecDebugBridgeMAC_lib.zip',OutPutChannel);
        }
    }
    else
    {
        if (process.platform == "linux")
        {
            let path = getAdvplBinPath(false);
            if (fs.existsSync(path+'AdvplDebugBridge-linux.tar.gz'))
            {
                let _args = new Array<string>();
                _args.push('-vzxf');
                _args.push('AdvplDebugBridge-linux.tar.gz');
                const child = child_process.spawn('tar', _args,{cwd:path, shell:true });
                child.on("exit", function (data) {
                    fs.unlink(path+'AdvplDebugBridge-linux.tar.gz');
                });
            }

        }
    }
    
}