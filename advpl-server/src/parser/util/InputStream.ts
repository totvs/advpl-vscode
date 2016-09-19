const antlr4 = require('antlr4');

export default class InputStream {
    _index:any;
	_size:any;
	data:any;
	constructor(input) {
        antlr4.InputStream.apply(this, arguments);   
        return new antlr4.InputStream(input);
    }
}

InputStream["prototype"] = antlr4.InputStream.prototype;