'use strict';

import {window, QuickPickOptions} from 'vscode';
import Prompt from './prompt';
import EscapeException from '../utils/EscapeException';

export default class ExpandPrompt extends Prompt {

	constructor(question: any) {
		super(question);
	}

	public render() {
		const choices = this._question.choices.reduce((result, choice) => {
			result[choice.name] = choice.value;
			return result;
		}, {});

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
