import InputStream from './InputStream';
const Token = require('antlr4').Token;

export default class NoCaseInputStream extends InputStream{
    filename: String;
	constructor(input){
		super(input);
		this.filename = "teste";
	}
	LA(offset) :number {
		if (offset === 0) {
			return 0; // undefined
		}
		if (offset < 0) {
			offset += 1; // e.g., translate LA(-1) to use offset=0
		}
		var pos = this._index + offset - 1;
		if (pos < 0 || pos >= this._size) { // invalid
			return Token.EOF;
		}
		let str: String = String.fromCharCode(this.data[pos]);
		//console.log(str);
		//console.log(str.toUpperCase());
		return this.data[pos];//.toUpperCase().charCodeAt(0);
	};
}
