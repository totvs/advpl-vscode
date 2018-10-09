import * as child_process from 'child_process';
import * as vscode from 'vscode';
import { readFileSync, existsSync, unlinkSync, statSync } from 'fs';
//import { advplConsole } from './advplConsole';
import * as path from 'path';
import * as fs from 'fs';
import * as nls from 'vscode-nls';

const localize = nls.loadMessageBundle();

function getReplayBinPath (){
    let path = vscode.extensions.getExtension("KillerAll.advpl-vscode").extensionPath;
    if (process.platform == "win32") {
            path+= "\\bin\\";
    }
    else
    {
        if (process.platform == "darwin")
        {
            path+= "/bin/mac/";
        }
        else {
            path+=  "/bin/linux/";
        }
    }

    return path;
}

export function getReplayExec(){    
    let path = getReplayBinPath ();
    if (process.platform == "win32") {        
        path += "TdsReplayPlay.exe";
    }
    else
    {
        path +=  "TdsReplayPlay";        
    }        
    return path;
}
