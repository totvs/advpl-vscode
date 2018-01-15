'use strict';

import {window, QuickPickItem, QuickPickOptions} from 'vscode';
import Prompt from './prompt';
import EscapeException from '../utils/EscapeException';

export default class ConfirmPrompt extends Prompt {

	constructor(question: any) {
		super(question);
	}

	public render() {
		const choices = {
			Yes: true,
			No: false
		};

		const options: QuickPickOptions = {
			placeHolder: this._question.message
		};

		return window.showQuickPick(Object.keys(choices), options)
			.then(result => {
				if (result === undefined) {
					throw new EscapeException();
				}

				return choices[result] || false;
			});
	}
}
