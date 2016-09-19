import ExpressionList from './ExpressionList.ts';


export default class ArrayExpression extends ExpressionList{
    constructor(ctx: ParserRuleContext){
        super(ctx);
    }

}
