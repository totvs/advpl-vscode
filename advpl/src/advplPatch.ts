import * as child_process from 'child_process';
import * as vscode from 'vscode';
import {inspect}  from 'util';
import {advplConsole}  from './advplConsole';
import * as fs from 'fs';
export class advplPatch {
    private outChannel : advplConsole;
    constructor( _outChannel : advplConsole )
    {
        this.outChannel = _outChannel;
    }

}