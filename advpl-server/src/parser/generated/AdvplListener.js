// Generated from Advpl.g4 by ANTLR 4.5.2
// jshint ignore: start
var antlr4 = require('antlr4/index');

// This class defines a complete listener for a parse tree produced by AdvplParser.
function AdvplListener() {
	antlr4.tree.ParseTreeListener.call(this);
	return this;
}

AdvplListener.prototype = Object.create(antlr4.tree.ParseTreeListener.prototype);
AdvplListener.prototype.constructor = AdvplListener;

// Enter a parse tree produced by AdvplParser#program.
AdvplListener.prototype.enterProgram = function(ctx) {
};

// Exit a parse tree produced by AdvplParser#program.
AdvplListener.prototype.exitProgram = function(ctx) {
};


// Enter a parse tree produced by AdvplParser#preprocessorDeclaration.
AdvplListener.prototype.enterPreprocessorDeclaration = function(ctx) {
};

// Exit a parse tree produced by AdvplParser#preprocessorDeclaration.
AdvplListener.prototype.exitPreprocessorDeclaration = function(ctx) {
};


// Enter a parse tree produced by AdvplParser#includeDeclaration.
AdvplListener.prototype.enterIncludeDeclaration = function(ctx) {
};

// Exit a parse tree produced by AdvplParser#includeDeclaration.
AdvplListener.prototype.exitIncludeDeclaration = function(ctx) {
};


// Enter a parse tree produced by AdvplParser#ifdef.
AdvplListener.prototype.enterIfdef = function(ctx) {
};

// Exit a parse tree produced by AdvplParser#ifdef.
AdvplListener.prototype.exitIfdef = function(ctx) {
};


// Enter a parse tree produced by AdvplParser#defineDeclaration.
AdvplListener.prototype.enterDefineDeclaration = function(ctx) {
};

// Exit a parse tree produced by AdvplParser#defineDeclaration.
AdvplListener.prototype.exitDefineDeclaration = function(ctx) {
};


// Enter a parse tree produced by AdvplParser#sources.
AdvplListener.prototype.enterSources = function(ctx) {
};

// Exit a parse tree produced by AdvplParser#sources.
AdvplListener.prototype.exitSources = function(ctx) {
};


// Enter a parse tree produced by AdvplParser#modifiersFunction.
AdvplListener.prototype.enterModifiersFunction = function(ctx) {
};

// Exit a parse tree produced by AdvplParser#modifiersFunction.
AdvplListener.prototype.exitModifiersFunction = function(ctx) {
};


// Enter a parse tree produced by AdvplParser#staticVariable.
AdvplListener.prototype.enterStaticVariable = function(ctx) {
};

// Exit a parse tree produced by AdvplParser#staticVariable.
AdvplListener.prototype.exitStaticVariable = function(ctx) {
};


// Enter a parse tree produced by AdvplParser#classDeclaration.
AdvplListener.prototype.enterClassDeclaration = function(ctx) {
};

// Exit a parse tree produced by AdvplParser#classDeclaration.
AdvplListener.prototype.exitClassDeclaration = function(ctx) {
};


// Enter a parse tree produced by AdvplParser#fromClass.
AdvplListener.prototype.enterFromClass = function(ctx) {
};

// Exit a parse tree produced by AdvplParser#fromClass.
AdvplListener.prototype.exitFromClass = function(ctx) {
};


// Enter a parse tree produced by AdvplParser#dataDefinition.
AdvplListener.prototype.enterDataDefinition = function(ctx) {
};

// Exit a parse tree produced by AdvplParser#dataDefinition.
AdvplListener.prototype.exitDataDefinition = function(ctx) {
};


// Enter a parse tree produced by AdvplParser#methodDefinition.
AdvplListener.prototype.enterMethodDefinition = function(ctx) {
};

// Exit a parse tree produced by AdvplParser#methodDefinition.
AdvplListener.prototype.exitMethodDefinition = function(ctx) {
};


// Enter a parse tree produced by AdvplParser#methodBody.
AdvplListener.prototype.enterMethodBody = function(ctx) {
};

// Exit a parse tree produced by AdvplParser#methodBody.
AdvplListener.prototype.exitMethodBody = function(ctx) {
};


// Enter a parse tree produced by AdvplParser#wsServiceDeclaration.
AdvplListener.prototype.enterWsServiceDeclaration = function(ctx) {
};

// Exit a parse tree produced by AdvplParser#wsServiceDeclaration.
AdvplListener.prototype.exitWsServiceDeclaration = function(ctx) {
};


// Enter a parse tree produced by AdvplParser#wsdataDefinition.
AdvplListener.prototype.enterWsdataDefinition = function(ctx) {
};

// Exit a parse tree produced by AdvplParser#wsdataDefinition.
AdvplListener.prototype.exitWsdataDefinition = function(ctx) {
};


// Enter a parse tree produced by AdvplParser#wsmethodDefinition.
AdvplListener.prototype.enterWsmethodDefinition = function(ctx) {
};

// Exit a parse tree produced by AdvplParser#wsmethodDefinition.
AdvplListener.prototype.exitWsmethodDefinition = function(ctx) {
};


// Enter a parse tree produced by AdvplParser#wsmethodBody.
AdvplListener.prototype.enterWsmethodBody = function(ctx) {
};

// Exit a parse tree produced by AdvplParser#wsmethodBody.
AdvplListener.prototype.exitWsmethodBody = function(ctx) {
};


// Enter a parse tree produced by AdvplParser#wsReceive.
AdvplListener.prototype.enterWsReceive = function(ctx) {
};

// Exit a parse tree produced by AdvplParser#wsReceive.
AdvplListener.prototype.exitWsReceive = function(ctx) {
};


// Enter a parse tree produced by AdvplParser#wsSend.
AdvplListener.prototype.enterWsSend = function(ctx) {
};

// Exit a parse tree produced by AdvplParser#wsSend.
AdvplListener.prototype.exitWsSend = function(ctx) {
};


// Enter a parse tree produced by AdvplParser#wsDataType.
AdvplListener.prototype.enterWsDataType = function(ctx) {
};

// Exit a parse tree produced by AdvplParser#wsDataType.
AdvplListener.prototype.exitWsDataType = function(ctx) {
};


// Enter a parse tree produced by AdvplParser#wsServiceClientDeclaration.
AdvplListener.prototype.enterWsServiceClientDeclaration = function(ctx) {
};

// Exit a parse tree produced by AdvplParser#wsServiceClientDeclaration.
AdvplListener.prototype.exitWsServiceClientDeclaration = function(ctx) {
};


// Enter a parse tree produced by AdvplParser#wsmethodClientDefinition.
AdvplListener.prototype.enterWsmethodClientDefinition = function(ctx) {
};

// Exit a parse tree produced by AdvplParser#wsmethodClientDefinition.
AdvplListener.prototype.exitWsmethodClientDefinition = function(ctx) {
};


// Enter a parse tree produced by AdvplParser#wsmethodClientBody.
AdvplListener.prototype.enterWsmethodClientBody = function(ctx) {
};

// Exit a parse tree produced by AdvplParser#wsmethodClientBody.
AdvplListener.prototype.exitWsmethodClientBody = function(ctx) {
};


// Enter a parse tree produced by AdvplParser#endWSMethod.
AdvplListener.prototype.enterEndWSMethod = function(ctx) {
};

// Exit a parse tree produced by AdvplParser#endWSMethod.
AdvplListener.prototype.exitEndWSMethod = function(ctx) {
};


// Enter a parse tree produced by AdvplParser#funcDeclaration.
AdvplListener.prototype.enterFuncDeclaration = function(ctx) {
};

// Exit a parse tree produced by AdvplParser#funcDeclaration.
AdvplListener.prototype.exitFuncDeclaration = function(ctx) {
};


// Enter a parse tree produced by AdvplParser#formalParameters.
AdvplListener.prototype.enterFormalParameters = function(ctx) {
};

// Exit a parse tree produced by AdvplParser#formalParameters.
AdvplListener.prototype.exitFormalParameters = function(ctx) {
};


// Enter a parse tree produced by AdvplParser#formalParameter.
AdvplListener.prototype.enterFormalParameter = function(ctx) {
};

// Exit a parse tree produced by AdvplParser#formalParameter.
AdvplListener.prototype.exitFormalParameter = function(ctx) {
};


// Enter a parse tree produced by AdvplParser#initFuncOrMethod.
AdvplListener.prototype.enterInitFuncOrMethod = function(ctx) {
};

// Exit a parse tree produced by AdvplParser#initFuncOrMethod.
AdvplListener.prototype.exitInitFuncOrMethod = function(ctx) {
};


// Enter a parse tree produced by AdvplParser#staticVariableBeforeLocal.
AdvplListener.prototype.enterStaticVariableBeforeLocal = function(ctx) {
};

// Exit a parse tree produced by AdvplParser#staticVariableBeforeLocal.
AdvplListener.prototype.exitStaticVariableBeforeLocal = function(ctx) {
};


// Enter a parse tree produced by AdvplParser#localVariableDeclarationStatement.
AdvplListener.prototype.enterLocalVariableDeclarationStatement = function(ctx) {
};

// Exit a parse tree produced by AdvplParser#localVariableDeclarationStatement.
AdvplListener.prototype.exitLocalVariableDeclarationStatement = function(ctx) {
};


// Enter a parse tree produced by AdvplParser#staticVariableDeclarationStatement.
AdvplListener.prototype.enterStaticVariableDeclarationStatement = function(ctx) {
};

// Exit a parse tree produced by AdvplParser#staticVariableDeclarationStatement.
AdvplListener.prototype.exitStaticVariableDeclarationStatement = function(ctx) {
};


// Enter a parse tree produced by AdvplParser#publicVariableDeclarationStatement.
AdvplListener.prototype.enterPublicVariableDeclarationStatement = function(ctx) {
};

// Exit a parse tree produced by AdvplParser#publicVariableDeclarationStatement.
AdvplListener.prototype.exitPublicVariableDeclarationStatement = function(ctx) {
};


// Enter a parse tree produced by AdvplParser#privateVariableDeclarationStatement.
AdvplListener.prototype.enterPrivateVariableDeclarationStatement = function(ctx) {
};

// Exit a parse tree produced by AdvplParser#privateVariableDeclarationStatement.
AdvplListener.prototype.exitPrivateVariableDeclarationStatement = function(ctx) {
};


// Enter a parse tree produced by AdvplParser#defaultStatement.
AdvplListener.prototype.enterDefaultStatement = function(ctx) {
};

// Exit a parse tree produced by AdvplParser#defaultStatement.
AdvplListener.prototype.exitDefaultStatement = function(ctx) {
};


// Enter a parse tree produced by AdvplParser#arrayInitializer.
AdvplListener.prototype.enterArrayInitializer = function(ctx) {
};

// Exit a parse tree produced by AdvplParser#arrayInitializer.
AdvplListener.prototype.exitArrayInitializer = function(ctx) {
};


// Enter a parse tree produced by AdvplParser#blockInitializer.
AdvplListener.prototype.enterBlockInitializer = function(ctx) {
};

// Exit a parse tree produced by AdvplParser#blockInitializer.
AdvplListener.prototype.exitBlockInitializer = function(ctx) {
};


// Enter a parse tree produced by AdvplParser#blockParams.
AdvplListener.prototype.enterBlockParams = function(ctx) {
};

// Exit a parse tree produced by AdvplParser#blockParams.
AdvplListener.prototype.exitBlockParams = function(ctx) {
};


// Enter a parse tree produced by AdvplParser#block.
AdvplListener.prototype.enterBlock = function(ctx) {
};

// Exit a parse tree produced by AdvplParser#block.
AdvplListener.prototype.exitBlock = function(ctx) {
};


// Enter a parse tree produced by AdvplParser#statement.
AdvplListener.prototype.enterStatement = function(ctx) {
};

// Exit a parse tree produced by AdvplParser#statement.
AdvplListener.prototype.exitStatement = function(ctx) {
};


// Enter a parse tree produced by AdvplParser#returnStatement.
AdvplListener.prototype.enterReturnStatement = function(ctx) {
};

// Exit a parse tree produced by AdvplParser#returnStatement.
AdvplListener.prototype.exitReturnStatement = function(ctx) {
};


// Enter a parse tree produced by AdvplParser#returnvalues.
AdvplListener.prototype.enterReturnvalues = function(ctx) {
};

// Exit a parse tree produced by AdvplParser#returnvalues.
AdvplListener.prototype.exitReturnvalues = function(ctx) {
};


// Enter a parse tree produced by AdvplParser#statementExpression.
AdvplListener.prototype.enterStatementExpression = function(ctx) {
};

// Exit a parse tree produced by AdvplParser#statementExpression.
AdvplListener.prototype.exitStatementExpression = function(ctx) {
};


// Enter a parse tree produced by AdvplParser#ExprPrimary.
AdvplListener.prototype.enterExprPrimary = function(ctx) {
};

// Exit a parse tree produced by AdvplParser#ExprPrimary.
AdvplListener.prototype.exitExprPrimary = function(ctx) {
};


// Enter a parse tree produced by AdvplParser#Assignment.
AdvplListener.prototype.enterAssignment = function(ctx) {
};

// Exit a parse tree produced by AdvplParser#Assignment.
AdvplListener.prototype.exitAssignment = function(ctx) {
};


// Enter a parse tree produced by AdvplParser#ExprIncrPos.
AdvplListener.prototype.enterExprIncrPos = function(ctx) {
};

// Exit a parse tree produced by AdvplParser#ExprIncrPos.
AdvplListener.prototype.exitExprIncrPos = function(ctx) {
};


// Enter a parse tree produced by AdvplParser#ExprIncrPre.
AdvplListener.prototype.enterExprIncrPre = function(ctx) {
};

// Exit a parse tree produced by AdvplParser#ExprIncrPre.
AdvplListener.prototype.exitExprIncrPre = function(ctx) {
};


// Enter a parse tree produced by AdvplParser#ExprLogical.
AdvplListener.prototype.enterExprLogical = function(ctx) {
};

// Exit a parse tree produced by AdvplParser#ExprLogical.
AdvplListener.prototype.exitExprLogical = function(ctx) {
};


// Enter a parse tree produced by AdvplParser#AliasAssignment.
AdvplListener.prototype.enterAliasAssignment = function(ctx) {
};

// Exit a parse tree produced by AdvplParser#AliasAssignment.
AdvplListener.prototype.exitAliasAssignment = function(ctx) {
};


// Enter a parse tree produced by AdvplParser#ExprComp.
AdvplListener.prototype.enterExprComp = function(ctx) {
};

// Exit a parse tree produced by AdvplParser#ExprComp.
AdvplListener.prototype.exitExprComp = function(ctx) {
};


// Enter a parse tree produced by AdvplParser#ExprPlus.
AdvplListener.prototype.enterExprPlus = function(ctx) {
};

// Exit a parse tree produced by AdvplParser#ExprPlus.
AdvplListener.prototype.exitExprPlus = function(ctx) {
};


// Enter a parse tree produced by AdvplParser#ExprNot.
AdvplListener.prototype.enterExprNot = function(ctx) {
};

// Exit a parse tree produced by AdvplParser#ExprNot.
AdvplListener.prototype.exitExprNot = function(ctx) {
};


// Enter a parse tree produced by AdvplParser#ExprMul.
AdvplListener.prototype.enterExprMul = function(ctx) {
};

// Exit a parse tree produced by AdvplParser#ExprMul.
AdvplListener.prototype.exitExprMul = function(ctx) {
};


// Enter a parse tree produced by AdvplParser#Parens.
AdvplListener.prototype.enterParens = function(ctx) {
};

// Exit a parse tree produced by AdvplParser#Parens.
AdvplListener.prototype.exitParens = function(ctx) {
};


// Enter a parse tree produced by AdvplParser#VarArrayAccess.
AdvplListener.prototype.enterVarArrayAccess = function(ctx) {
};

// Exit a parse tree produced by AdvplParser#VarArrayAccess.
AdvplListener.prototype.exitVarArrayAccess = function(ctx) {
};


// Enter a parse tree produced by AdvplParser#Call.
AdvplListener.prototype.enterCall = function(ctx) {
};

// Exit a parse tree produced by AdvplParser#Call.
AdvplListener.prototype.exitCall = function(ctx) {
};


// Enter a parse tree produced by AdvplParser#CallWithAtt.
AdvplListener.prototype.enterCallWithAtt = function(ctx) {
};

// Exit a parse tree produced by AdvplParser#CallWithAtt.
AdvplListener.prototype.exitCallWithAtt = function(ctx) {
};


// Enter a parse tree produced by AdvplParser#ObjectAttribAccess.
AdvplListener.prototype.enterObjectAttribAccess = function(ctx) {
};

// Exit a parse tree produced by AdvplParser#ObjectAttribAccess.
AdvplListener.prototype.exitObjectAttribAccess = function(ctx) {
};


// Enter a parse tree produced by AdvplParser#ObjectMethodAccess.
AdvplListener.prototype.enterObjectMethodAccess = function(ctx) {
};

// Exit a parse tree produced by AdvplParser#ObjectMethodAccess.
AdvplListener.prototype.exitObjectMethodAccess = function(ctx) {
};


// Enter a parse tree produced by AdvplParser#ClassConstructor.
AdvplListener.prototype.enterClassConstructor = function(ctx) {
};

// Exit a parse tree produced by AdvplParser#ClassConstructor.
AdvplListener.prototype.exitClassConstructor = function(ctx) {
};


// Enter a parse tree produced by AdvplParser#Var.
AdvplListener.prototype.enterVar = function(ctx) {
};

// Exit a parse tree produced by AdvplParser#Var.
AdvplListener.prototype.exitVar = function(ctx) {
};


// Enter a parse tree produced by AdvplParser#Assume.
AdvplListener.prototype.enterAssume = function(ctx) {
};

// Exit a parse tree produced by AdvplParser#Assume.
AdvplListener.prototype.exitAssume = function(ctx) {
};


// Enter a parse tree produced by AdvplParser#lit.
AdvplListener.prototype.enterLit = function(ctx) {
};

// Exit a parse tree produced by AdvplParser#lit.
AdvplListener.prototype.exitLit = function(ctx) {
};


// Enter a parse tree produced by AdvplParser#ArrayOrBlock.
AdvplListener.prototype.enterArrayOrBlock = function(ctx) {
};

// Exit a parse tree produced by AdvplParser#ArrayOrBlock.
AdvplListener.prototype.exitArrayOrBlock = function(ctx) {
};


// Enter a parse tree produced by AdvplParser#IfCall.
AdvplListener.prototype.enterIfCall = function(ctx) {
};

// Exit a parse tree produced by AdvplParser#IfCall.
AdvplListener.prototype.exitIfCall = function(ctx) {
};


// Enter a parse tree produced by AdvplParser#MacroExecucao.
AdvplListener.prototype.enterMacroExecucao = function(ctx) {
};

// Exit a parse tree produced by AdvplParser#MacroExecucao.
AdvplListener.prototype.exitMacroExecucao = function(ctx) {
};


// Enter a parse tree produced by AdvplParser#chIdentifier.
AdvplListener.prototype.enterChIdentifier = function(ctx) {
};

// Exit a parse tree produced by AdvplParser#chIdentifier.
AdvplListener.prototype.exitChIdentifier = function(ctx) {
};


// Enter a parse tree produced by AdvplParser#identifier.
AdvplListener.prototype.enterIdentifier = function(ctx) {
};

// Exit a parse tree produced by AdvplParser#identifier.
AdvplListener.prototype.exitIdentifier = function(ctx) {
};


// Enter a parse tree produced by AdvplParser#arrayAccess.
AdvplListener.prototype.enterArrayAccess = function(ctx) {
};

// Exit a parse tree produced by AdvplParser#arrayAccess.
AdvplListener.prototype.exitArrayAccess = function(ctx) {
};


// Enter a parse tree produced by AdvplParser#methodAccessLoop.
AdvplListener.prototype.enterMethodAccessLoop = function(ctx) {
};

// Exit a parse tree produced by AdvplParser#methodAccessLoop.
AdvplListener.prototype.exitMethodAccessLoop = function(ctx) {
};


// Enter a parse tree produced by AdvplParser#arguments.
AdvplListener.prototype.enterArguments = function(ctx) {
};

// Exit a parse tree produced by AdvplParser#arguments.
AdvplListener.prototype.exitArguments = function(ctx) {
};


// Enter a parse tree produced by AdvplParser#expressionList.
AdvplListener.prototype.enterExpressionList = function(ctx) {
};

// Exit a parse tree produced by AdvplParser#expressionList.
AdvplListener.prototype.exitExpressionList = function(ctx) {
};


// Enter a parse tree produced by AdvplParser#optionalExpression.
AdvplListener.prototype.enterOptionalExpression = function(ctx) {
};

// Exit a parse tree produced by AdvplParser#optionalExpression.
AdvplListener.prototype.exitOptionalExpression = function(ctx) {
};


// Enter a parse tree produced by AdvplParser#expressionListComa.
AdvplListener.prototype.enterExpressionListComa = function(ctx) {
};

// Exit a parse tree produced by AdvplParser#expressionListComa.
AdvplListener.prototype.exitExpressionListComa = function(ctx) {
};


// Enter a parse tree produced by AdvplParser#LiteralNumber.
AdvplListener.prototype.enterLiteralNumber = function(ctx) {
};

// Exit a parse tree produced by AdvplParser#LiteralNumber.
AdvplListener.prototype.exitLiteralNumber = function(ctx) {
};


// Enter a parse tree produced by AdvplParser#LiteralStringDupla.
AdvplListener.prototype.enterLiteralStringDupla = function(ctx) {
};

// Exit a parse tree produced by AdvplParser#LiteralStringDupla.
AdvplListener.prototype.exitLiteralStringDupla = function(ctx) {
};


// Enter a parse tree produced by AdvplParser#LiteralStringSimples.
AdvplListener.prototype.enterLiteralStringSimples = function(ctx) {
};

// Exit a parse tree produced by AdvplParser#LiteralStringSimples.
AdvplListener.prototype.exitLiteralStringSimples = function(ctx) {
};


// Enter a parse tree produced by AdvplParser#LiteralLogical.
AdvplListener.prototype.enterLiteralLogical = function(ctx) {
};

// Exit a parse tree produced by AdvplParser#LiteralLogical.
AdvplListener.prototype.exitLiteralLogical = function(ctx) {
};


// Enter a parse tree produced by AdvplParser#LiteralNil.
AdvplListener.prototype.enterLiteralNil = function(ctx) {
};

// Exit a parse tree produced by AdvplParser#LiteralNil.
AdvplListener.prototype.exitLiteralNil = function(ctx) {
};


// Enter a parse tree produced by AdvplParser#ifFunctioncall.
AdvplListener.prototype.enterIfFunctioncall = function(ctx) {
};

// Exit a parse tree produced by AdvplParser#ifFunctioncall.
AdvplListener.prototype.exitIfFunctioncall = function(ctx) {
};


// Enter a parse tree produced by AdvplParser#ifStatement.
AdvplListener.prototype.enterIfStatement = function(ctx) {
};

// Exit a parse tree produced by AdvplParser#ifStatement.
AdvplListener.prototype.exitIfStatement = function(ctx) {
};


// Enter a parse tree produced by AdvplParser#forStatement.
AdvplListener.prototype.enterForStatement = function(ctx) {
};

// Exit a parse tree produced by AdvplParser#forStatement.
AdvplListener.prototype.exitForStatement = function(ctx) {
};


// Enter a parse tree produced by AdvplParser#doStatement.
AdvplListener.prototype.enterDoStatement = function(ctx) {
};

// Exit a parse tree produced by AdvplParser#doStatement.
AdvplListener.prototype.exitDoStatement = function(ctx) {
};


// Enter a parse tree produced by AdvplParser#exitOrLoopStatement.
AdvplListener.prototype.enterExitOrLoopStatement = function(ctx) {
};

// Exit a parse tree produced by AdvplParser#exitOrLoopStatement.
AdvplListener.prototype.exitExitOrLoopStatement = function(ctx) {
};


// Enter a parse tree produced by AdvplParser#whileStatement.
AdvplListener.prototype.enterWhileStatement = function(ctx) {
};

// Exit a parse tree produced by AdvplParser#whileStatement.
AdvplListener.prototype.exitWhileStatement = function(ctx) {
};


// Enter a parse tree produced by AdvplParser#docaseStatement.
AdvplListener.prototype.enterDocaseStatement = function(ctx) {
};

// Exit a parse tree produced by AdvplParser#docaseStatement.
AdvplListener.prototype.exitDocaseStatement = function(ctx) {
};


// Enter a parse tree produced by AdvplParser#chStatement.
AdvplListener.prototype.enterChStatement = function(ctx) {
};

// Exit a parse tree produced by AdvplParser#chStatement.
AdvplListener.prototype.exitChStatement = function(ctx) {
};


// Enter a parse tree produced by AdvplParser#arrobaDefine.
AdvplListener.prototype.enterArrobaDefine = function(ctx) {
};

// Exit a parse tree produced by AdvplParser#arrobaDefine.
AdvplListener.prototype.exitArrobaDefine = function(ctx) {
};


// Enter a parse tree produced by AdvplParser#forInit.
AdvplListener.prototype.enterForInit = function(ctx) {
};

// Exit a parse tree produced by AdvplParser#forInit.
AdvplListener.prototype.exitForInit = function(ctx) {
};


// Enter a parse tree produced by AdvplParser#crlf.
AdvplListener.prototype.enterCrlf = function(ctx) {
};

// Exit a parse tree produced by AdvplParser#crlf.
AdvplListener.prototype.exitCrlf = function(ctx) {
};



exports.AdvplListener = AdvplListener;