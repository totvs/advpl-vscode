'use strict';

import {window, OpenDialogOptions} from 'vscode';
import Prompt from './prompt';
import EscapeException from '../utils/EscapeException';

export default class FilePrompt extends Prompt {

	constructor(question: any) {
		super(question);
	}

	public render() {
		const options: OpenDialogOptions = {
			filters : this._question.filters,
			openLabel: this._question.message
		};

		return window.showOpenDialog(options)
			.then( fileUri => {
				return fileUri[0].fsPath;
			});

	}
}
