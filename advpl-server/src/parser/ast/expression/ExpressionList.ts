
import Expression from './Expression.ts';

export default class ExpressionList extends Expression{
    protected expressions: Expression[];
    constructor(ctx: ParserRuleContext){
        super(ctx);
    }

    set(exp: Expression[]){
        this.expressions = exp;
    }

    add(exp: Expression){
        if(this.expressions == null) {
            this.expressions = [];
        }
        this.expressions.push(exp);
    }

    getExpressions(): Expression[]{
        return this.expressions;
    }
}