'use strict';

abstract class Prompt {

	protected _question: any;

	constructor(question: any) {
		this._question = question;
	}

	public abstract render();
}

export default Prompt;
