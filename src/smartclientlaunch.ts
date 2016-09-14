import * as child_process from 'child_process';
import * as vscode from 'vscode';

export class smartClientLaunch
{
    private _Process: child_process.ChildProcess;
	private _Path: string;

	private _output: vscode.OutputChannel;
	private _statusbar: vscode.StatusBarItem;
    private _args = new Array<string>()
    constructor(path:string)
    {
        this._Path = path;        
    }
    public start() {
        if(process.platform == "darwin")
        {
            this._args.push(this._Path + "smartclient.app");
            this._Process = child_process.execFile("open", this._args);

        }
        else
        {
            this._args.push('-M');
            this._Process = child_process.spawn( this._Path + "smartclient.exe", this._args);
        }
        
        
    }   
    /*
    Precisa implementar para MAC Diferente
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
    */
}
