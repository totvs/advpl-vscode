'use strict';

export default class Expression {
    content: String;
    ctx: ParserRuleContext;

    constructor(ctx: ParserRuleContext){
        this.ctx = ctx;
        this.content = ctx.getText();
    }

    getContext():  ParserRuleContext {
        return this.ctx;
    }

    setContext(ctx: ParserRuleContext){
        this.ctx = ctx;
    }

    getToken(): Token {
        return this.ctx.start;
    }

    getContent(): String {
        return this.content;
    }

    setContent(value: String){
        this.content = value;
    }

    getContentToUpper(){
        return this.getContent().toUpperCase();
    }
    
}