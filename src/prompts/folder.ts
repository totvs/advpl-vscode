'use strict';

import {window, OpenDialogOptions} from 'vscode';
import Prompt from './prompt';
import EscapeException from '../utils/EscapeException';

export default class FolderPrompt extends Prompt {

	constructor(question: any) {
		super(question);
	}

	public render() {
		const options: OpenDialogOptions = {
			canSelectFolders : true,
			canSelectMany : this._question.canSelectMany || false,
			openLabel : this._question.message
		};

		return window.showOpenDialog(options)
			.then( folderUris => {
				if (this._question.canSelectMany) {
					let path = "";
					folderUris.forEach(folderUri => path += folderUri.fsPath+'\\;');
					return path.substr(0,path.length-1);
				}else{
					return folderUris[0].fsPath;
				}
			});

	}
}
