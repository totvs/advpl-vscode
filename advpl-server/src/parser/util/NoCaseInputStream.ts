import InputStream from './InputStream';
const Token = require('antlr4').Token;

export default class NoCaseInputStream extends InputStream{
    lookaheadData: number[];
	constructor(input: string){
		super(input);
		this.lookaheadData = input.toUpperCase().split("").map((char)=>char.charCodeAt(0));
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
		
		return this.lookaheadData[pos];
	};
}
