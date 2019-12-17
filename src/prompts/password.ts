'use strict';

import InputPrompt from './input';

export default class PasswordPrompt extends InputPrompt {

	constructor(question: any) {
		super(question);

		this._options.password = true;
		this._options.ignoreFocusOut = true;
	}
}
