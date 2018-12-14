import CodeAdapter from "../adapter";
import { window } from "vscode";
import * as path from 'path';

let lastFile = null;

export default async function cmdReplaySelect(context): Promise<any>  {

    return "teste";
    if( lastFile === null)
        lastFile= await window.showOpenDialog({canSelectFiles:true});
  //console.log(replay);
    let adapter = new CodeAdapter();
    let filename = path.basename(lastFile[0].fsPath);

    const questions = [{
        message: filename,
        name: "server",
        type: "list",
        default: "131227A",
        choices: ['131227A', '170117A',"Change File"]
    }];
    adapter.prompt(questions, answers => {});
    
}