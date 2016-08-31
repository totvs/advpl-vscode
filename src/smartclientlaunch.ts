import * as process from 'child_process';
import * as vscode from 'vscode';

export class smartClientLaunch
{
    private _Process: process.ChildProcess;
	private _Path: string;

	private _output: vscode.OutputChannel;
	private _statusbar: vscode.StatusBarItem;
    private _args = new Array<string>()
    constructor(path:string)
    {
        this._Path = path;
        this._args.push('-M');
    }
    public start() {
        this._Process = process.spawn(this._Path, this._args);
        
    }
    public setProgram(program :string) :void{
        this.addArg('-P='+program);
    }
    public setEnviromentInfo(andress : string , port : string,env:string)
    {
        this.addArg("-Y="+port);
        this.addArg("-Z="+andress);
        this.addArg("-E="+env);
    }
    public setDebugThread(thread :string)
    {
        this.addArg("-DEBUG="+thread);
    }
    private addArg (value : string) :void{
        this._args.push(value);
    }
}
