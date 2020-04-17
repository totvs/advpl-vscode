import { isNull } from 'util';

export interface Rule {
  id: string;
  options?: {
    ident: boolean;
    linesBefore: Number;
    linesAfter: Number;
    linesSameBlock: Number;
  };
}

export interface ClosedStructureRule extends Rule {
  begin: RegExp; // Expressão do começo
  noBegin?: RegExp[]; // Expressão que ignora quando dá o match no begin
  middle?: RegExp; // expressão de meio da sintaxe
  middleDouble?: RegExp; // expressão de meio da sintaxe que dá um up no meio da expressão
  end: RegExp; // expressão de fim da sintaxe
}

export interface OpenStructureRule extends Rule {
  expression: RegExp;
}

export interface RuleMatch {
  rule: Rule;
  increment?: boolean;
  incrementDouble?: boolean;
  decrement?: boolean;
  decrementDouble?: boolean;
}

export class FormattingRules {
  lastMatch: RuleMatch | null = null;
  insideOpenStructure: boolean = false;
  openStructures: RuleMatch[] = [];

  private instanceOfClosedStructureRule(
    object: any
  ): object is ClosedStructureRule {
    return 'begin' in object;
  }

  public match(line: string): boolean {
    let lastRule: RuleMatch = this.openStructures[
      this.openStructures.length - 1
    ];
    if (line.trim().length === 0) {
      return false;
    }

    let finddedRule: RuleMatch = null;

    this.getRules().every((rule: Rule) => {
      if (this.instanceOfClosedStructureRule(rule)) {
        // para facilitar a análise de expressões eu removo as funções internas quando a
        // linha conmeça com if(
        if (
          rule.id === 'if' &&
          line.match(rule.begin) &&
          line.match(/^(\s*)(if)(\t|\ |\!)*(\()+.+(\))/i)
        ) {
          // extrai o contepudo de dentro do IF
          line = line.replace(/^(\s*)(if)(\t|\ |\!)*(\()/i, '').slice(0, -1);
          let parts: string[] = line.split(')');
          line = '';
          parts.forEach(linepart => {
            line += (linepart + ')').replace(/(\()+(.|)+(\))/g, ' ');
          });
          line = 'if(' + line;
        }

        if (
          line.match(rule.end) &&
          lastRule &&
          lastRule.rule &&
          lastRule.rule.id === rule.id
        ) {
          finddedRule = {
            rule: rule,
            decrement: true,
            decrementDouble: lastRule.incrementDouble
          };
          this.openStructures.pop();
        } else if (
          line.match(rule.begin) &&
          (!rule.noBegin ||
            !rule.noBegin.filter(exp => {
              return line.match(exp);
            }).length)
        ) {
          finddedRule = { rule: rule, increment: true };
          this.openStructures.push(finddedRule);
        } else if (rule.middleDouble && line.match(rule.middleDouble)) {
          finddedRule = {
            rule: rule,
            decrement: true,
            incrementDouble: true,
            decrementDouble: lastRule.incrementDouble
          };
          this.openStructures[this.openStructures.length - 1] = finddedRule;
        } else if (rule.middle && line.match(rule.middle)) {
          finddedRule = { rule: rule, increment: true, decrement: true };
        }
      }

      return isNull(finddedRule);
    });

    if (!isNull(finddedRule)) {
      this.lastMatch = finddedRule;
      return true;
    }

    return false;
  }

  public getLastMatch(): RuleMatch | null {
    return this.lastMatch;
  }

  public getRules(): Rule[] {
    return [...this.getClosedStructures(), ...this.getCustomStructures()];
  }

  private getCustomStructures(): Rule[] {
    return [];
  }

  // marcadores regexp utilizados
  // (\s+) = um ou mais whitespaces
  // (\w+) = uma ou mais letras/digitos => palavra
  // (constante) = constante (palavra chave)
  // (.*) =  qualquer coisa
  // ? = 0 ou mais ocorrências
  // ^ = inicio da linha
  // /i = ignorar caixa

  public getClosedStructures(): ClosedStructureRule[] {
    return [
      {
        id: 'function',
        begin: /^(\s*)((user|static)(\s*))?(function)(\s+)(\w+)/i,
        noBegin: [
          /^(\s*)((user|static)(\s*))?(function)(\s+)(\w+)(\s*)(\;)(\s*)(return)/i
        ],
        end: /^(\s*)(return)/i
      },
      {
        id: 'method',
        begin: /^(\s*)(method)(\s+)(\w+)(\s*)(.*)(\s+)(class)(\s+)(\w+)/i,
        end: /^(\s*)(return)/i
      },
      {
        id: 'method rest e client',
        begin: /^(\s*)(wsmethod)(\s+)(\w+)(\s*)(.*)(\s+)(wsservice|wsclient)(\s+)(\w+)/i,
        end: /^(\s*)(return)/i
      },
      {
        id: '#ifdef/#ifndef',
        begin: /^(\s*)(#)(\s*)(ifdef|ifndef)/i,
        middle: /^(\s*)(#)(\s*)(else)/i,
        end: /^(\s*)(#)(\s*)(endif)/i
      },
      {
        id: 'begin report query',
        begin: /^(\s*)(begin)(\s+)(report)(\s+)(query)/i,
        end: /^(\s*)(end)(\s+)(report)(\s+)(query)/i
      },
      {
        id: 'begin transaction',
        begin: /^(\s*)(begin)(\s+)(transaction)/i,
        end: /^(\s*)(end)(\s+)(transaction)?/i
      },
      {
        id: 'beginsql (alias)?',
        begin: /^(\s*)(beginsql)(\s+)(\w+)/i,
        end: /^(\s*)(endsql)$/i
      },
      {
        id: 'begin content',
        begin: /^(\s*)(begincontent)(\s+)(var)(\s+)(\w+)/i,
        end: /^(\s*)(endcontent)$/i
      },
      {
        id: 'do case',
        begin: /^(\s*)(do)(\s+)(case)/i,
        middleDouble: /^(\s*)(case|otherwise)/i,
        end: /^(\s*)(end)(do)?(\s*)(case)?$/i
      },
      {
        id: 'try..catch',
        begin: /^(\s*)(try)/i,
        middle: /^(\s*)(catch)/i,
        end: /^(\s*)(end)(\s*)(try)?/i
      },
      {
        id: 'class',
        begin: /^(\s*)(class)(\s+)(\w+)/i,
        end: /^(\s*)(end)(\s*)(class)?/i
      },
      {
        id: 'endwsclient',
        begin: /^(\s*)(wsclient)(\s+)(\w+)/i,
        end: /^(\s*)(endwsclient)/i
      },
      {
        id: 'for',
        begin: /^(\s*)(for)(\s+)(\w+)/i,
        end: /^(\s*)(next|end)(\s*)/i
      },
      {
        id: 'if',
        begin: /^(\s*)(if)(\t|\ |\!|\()+/i,
        noBegin: [
          /^(\s*)(if)(\t|\ |\!)*(\()+(.)*(\,)+(.)*(\,)+(.)*(\))/i,
          /^(\s*)(if)(\t|\ |\!)*(.)*(\;)+(.)*(\;)+(.)*(endif)/i
        ],
        middle: /^(\s*)((else)|(elseif))(\t|\ |\(|;|\/\*|$)/i,
        end: /^(\s*)(end)(w*)(if)?$/i
      },
      {
        id: 'structure',
        begin: /^(\s*)(structure)/i,
        end: /^(\s*)(end)(\s*)(structure)/i
      },
      {
        id: 'while',
        begin: /^(\s*)(do)?(\s*)(while)/i,
        end: /^(\s*)(end)(do)?$/i
      },
      {
        id: 'wsrestful',
        begin: /^(\s*)(wsrestful)/i,
        end: /^(\s*)(end)(\s*)(wsrestful)/i
      },
      {
        id: 'wsservice',
        begin: /^(\s*)(wsservice)/i,
        end: /^(\s*)(end)(\s*)(wsservice)/i
      },
      {
        id: 'wsstruct',
        begin: /^(\s*)(wsstruct)/i,
        end: /^(\s*)(end)(\s*)(wsstruct)/i
      },
      {
        id: 'begin sequence',
        begin: /^(\s*)(begin)(\s*)(sequence)/i,
        middle: /^(\s*)(recover)(\s*)(sequence)/i,
        end: /^(\s*)(end)(\s*)(sequence)?$/i
      },
      {
        id: 'no format',
        begin: /^(\s*)(\/\*\s*\{\s*\*\/)/i,
        end: /^(\s*)(\/\*\s*\}\s*\*\/)/i
      },
      {
        id: 'protheus doc',
        begin: /^(\s*)(\/\*\/(.*)?\{Protheus.doc\}(.*)?)/i,
        end: /(\*\/)/i
      },
      {
        id: 'comment',
        begin: /^(\s*)(\/\*)/i,
        noBegin: [/^\s*(\/\*.*\*\/)/i],
        end: /(\*\/)/i
      }
    ];
  }
}
