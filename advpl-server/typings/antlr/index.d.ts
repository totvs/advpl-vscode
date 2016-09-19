// index.d.ts - Hand-crafted typescript declarations of antlr4 runtime for JavaScript
//
// [The "BSD license"]
// Copyright (c) 2016 Burt Harris
// All rights reserved.
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions
// are met:
//
// 1. Redistributions of source code must retain the above copyright
//    notice, this list of conditions and the following disclaimer.
// 2. Redistributions in binary form must reproduce the above copyright
//    notice, this list of conditions and the following disclaimer in the
//    documentation and/or other materials provided with the distribution.
// 3. The name of the author may not be used to endorse or promote products
//    derived from this software without specific prior written permission.
//
// THIS SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS OR
// IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
// OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
// IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT, INDIRECT,
// INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
// NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
// DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
// THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
// THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
// This file includes TypeScript style declarations of the interfaces
// of the ANTLR4 JavaScript runtime.   This enables tools to provide more help
// by reasoning about the types object despite the fact that at runtime, JavaScript
// is dynamicly typed.
//
// The /*readonly*/ comments below can be uncommented when working with TypeScript 2.0 tool chain.
// At this time TypeScript 2.0 is still in Beta pre-relase.

 interface IntStream {
    /*readonly*/ _index: number;
    /*readonly*/ _size: number;

    mark(): number;
    release( marker: number );
    seek( index: number );
}

 interface CharStream extends IntStream {
    getText(interval: Interval): string;
}

declare class InputStream implements CharStream {
    public /*readonly*/ _index: number;
    public /*readonly*/ _size: number;
    public data: Array<number>;

    constructor( text: string );
    InputStream(): InputStream;
    public mark(): number;
    public release( marker: number );
    public seek( index: number );
    public getText(interval: Interval): string;
}

declare interface TokenStream extends IntStream {
    LT( i: number ): Token;
    get( i: number ): Token;
    getTokenSource(): TokenSource;
    getText( spec: Interval | RuleContext ): string;
    getText( start: Token, stop: Token ): string;
}

interface Interval {}
interface RuleContext {}

interface Vocabulary {}
interface ATN {}

declare class Recognizer {
    public state: number;

    constructor()

    // getVocabulary(): Vocabulary;
    //public getTokenTypeMap(): Map< string, number >;
    //public getRuleIndexMap(): Map< string, number >;
    public getTokenType( tokenName: string ): number;
    public getSerializedATN(): string;
    public getGrammarFileName(): string;
    public getATN(): ATN
    public getErrorHeader(exception): string;
    public getTokenErrorDisplay(t: Token): string;

    public addErrorListener( listener ): void;
    public removeErrorListeners(): void;

    public sempred( localctx, ruleIndex, actionIndex): boolean;
    public precpred( localctx , precedence ): boolean;

}

declare namespace Tree {

    interface Tree {
        // getParent(): Tree;
        getPayload(): any;
        // getChild(i: number): Tree;
        getChildCount(): number;
        // toStringTree(): string;
    }

    interface SyntaxTree extends Tree {
        getSourceInterval(): Interval;
    }

    interface ParseTree extends SyntaxTree {
        getParent(): ParseTree;
        getChild(i: number): ParseTree;
        accept( visitor );
        getText(): string;
        toStringTree( parser: Parser );
    }

    interface TerminalNode extends ParseTree {

    }

    interface ErrorNode extends TerminalNode {

    }

    interface RuleNode extends ParseTree {
        getRuleContext(): RuleContext;
    }

    class ParseTreeVisitor<T> {
        public visit( tree: ParseTree ): T;
        public visitChildren( node: RuleNode ): T;
        public visitTerminal( node: TerminalNode ): T;
        public visitErrorNode( node: ErrorNode ): T;
    }

    class ParseTreeListener {
        public visitTerminal(node: TerminalNode );
        public visitErrorNode(node: ErrorNode );
        public enterEveryRule(ctx: ParserRuleContext);
        public exitEveryRule(ctx: ParserRuleContext);
    }

    class  ParseTreeWalker {
        public walk( listener: ParseTreeListener, tree: ParseTree );
        protected enterRule( listener: ParseTreeListener, r: RuleNode );
        protected exitRule(  listener: ParseTreeListener, r: RuleNode );
    }

}

interface RuleContext extends Tree.RuleNode {
    parent: RuleContext;
    invokingState: number;
    depth(): number;
    isEmpty(): boolean;
    getSourceInterval(): Interval;
}

interface ParserRuleContext extends RuleContext {
    start: Token;
    stop: Token;
}

declare class Lexer extends Recognizer {
    public inputStream: InputStream;
    public symbolicNames: string[];

    public reset(): void;
    public nextToken(): Token;
    public skip(): void;
    public more(): void;
    public pushMode(): void;
    public popMode(): number;
}

declare class BufferedTokenStream implements TokenStream {
    public /*readonly*/ _index: number;
    public /*readonly*/ _size: number;

    constructor( tokenSource: TokenSource );

    public mark(): number;
    public release( marker: number );
    public seek( index: number );
    public getText(interval: Interval): string;
    public LT( i: number ): Token;
    public get( i: number ): Token;
    public getTokenSource(): TokenSource;
    public getText(spec: Interval | RuleContext): string;
    public getText(start: Token, stop: Token ): string;
}

declare class CommonTokenStream extends BufferedTokenStream {
    public /*readonly*/ index: number;
    public /*readonly*/ size: number;

    constructor( lexer: Lexer );

    public mark(): number;
    public release( marker: number );
    public seek( index: number );
    public getText(interval: Interval): string;
    public LT( i: number ): Token;
    public get( i: number ): Token;
    public getTokenSource(): TokenSource;
    public getText(spec: Interval | RuleContext): string;
    public getText(start: Token, stop: Token ): string;
    public fetch( count: number ): number;
    public getTokens( start?: number, stop?: number, types?: number[]): Token[];
}

declare class Parser {
    constructor( tokens: TokenStream )
}

declare interface TokenSource {
    getInputStream: CharStream;
    getSourceName: string;
    nextToken(): Token;
    getLine(): number;
    getCharPositionInLine(): number;
}


declare enum TokenType {
    EPSILON = -2,
    EOF = -1,
    INVALID_TYPE = 0,
    MIN_USER_TOKEN_TYPE = 1,
}



declare enum Channel {
    DEFAULT_CHANNEL = 0,
    HIDDEN_CHANNEL = 1,
}

// Tokens and related

declare interface Token {
	/*readonly*/ type: TokenType;
                 text: string;
	/*readonly*/ channel: Channel; // The parser ignores everything not on DEFAULT_CHANNEL
	/*readonly*/ start: number; // optional; return -1 if not implemented.
	/*readonly*/ stop: number; // optional; return -1 if not implemented.
	/*readonly*/ tokenIndex: number; // from 0..n-1 of the token object in the input stream
	/*readonly*/ line: number; // line=1..n of the 1st character
	/*readonly*/ column: number; // beginning of the line at which it occurs, 0..n-1
                 toString(): string;
                 getInputStream(): CharStream;
                 getTokenSource(): TokenSource;

}

//Error listener
declare class ErrorListener {
    syntaxError(recognizer: any, offendingSymbol: any, line: any, column: any, msg: any, e: any): any;
    reportAmbiguity(): any;
    reportAttemptingFullContext(): any;
    reportContextSensitivity(): any;
}
