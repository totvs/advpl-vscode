'use strict';

import {window, InputBoxOptions} from 'vscode';
import Prompt from './prompt';
import EscapeException from '../utils/EscapeException';

const figures = require('figures');

export default class InputPrompt extends Prompt {

	protected _options: InputBoxOptions;

	constructor(question: any) {
		super(question);

		this._options = {
			prompt: this._question.message
		};
	}

	public render() {
		let placeHolder = this._question.default;

		if (this._question.default instanceof Error) {
			placeHolder = this._question.default.message;
			this._question.default = undefined;
		}

		this._options.placeHolder = placeHolder;

		return window.showInputBox(this._options)
			.then(result => {
				if (result === undefined) {
					throw new EscapeException();
				}

				if (result === '') {
					result = this._question.default || '';
				}

				const valid = this._question.validate ? this._question.validate(result || '') : true;

				if (valid !== true) {
					this._question.default = new Error(`${figures.warning} ${valid}`);

					return this.render();
				}

				return result;
			});
	}
}
