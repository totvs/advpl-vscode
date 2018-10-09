import CodeAdapter from "../adapter";
import { window } from "vscode";

export default function cmdReplaySelect(context): any {

  let replay=window.showOpenDialog({canSelectFiles:true});
  console.log(replay);
    /*  let adapter = new CodeAdapter();
    const questions = [{
        message: "Replay file",
        name: "server",
        default: "localhost"
    }];
    adapter.prompt(questions, answers => {});*/
}