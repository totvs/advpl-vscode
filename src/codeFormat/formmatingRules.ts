export interface Rule {
  id: string;
  options?: {
    ident: boolean;
    linesBefore: number;
    linesAfter: number;
    linesSameBlock: number;
  };
}

export interface StructureRule extends Rule {
  begin: RegExp; // Expressão do começo
  noBegin?: RegExp[]; // Expressão que ignora quando dá o match no begin
  middle?: RegExp; // expressão de meio da sintaxe
  middleDouble?: RegExp; // expressão de meio da sintaxe que dá um up no meio da expressão
  end: RegExp; // expressão de fim da sintaxe
  assincStruct?: boolean; // indica que a estrutura é assincrona ou seja pode fechar sem o fechamento de estruturas internas(#if)
}

export class RuleMatch {
  rule: StructureRule;
  increment?: boolean;
  incrementDouble?: boolean;
  decrement?: boolean;
  initialPosition: number; // posição inicial da tabulação para voltar quando a estrutura fechar
}

export function getStructsNoIdent(): string[] {
  return [
    "beginsql (alias)?",
    "comment",
    "protheus doc",
    "begin content",
    "no format",
  ];
}

export class FormattingRules {
  lastMatch: RuleMatch | null = null;
  insideOpenStructure = false;
  openStructures: RuleMatch[] = [];

  public match(lineGet: string, initialPosition: number): boolean {
    let line: string = lineGet.toString();
    const lastRule: RuleMatch =
      this.openStructures[this.openStructures.length - 1];
    if (line.trim().length === 0) {
      return false;
    }

    let finddedRule: RuleMatch = null;

    // se não estiver em estrutura não identável
    if (!lastRule || !getStructsNoIdent().find((x) => x === lastRule.rule.id)) {
      // removo comentários que terminam a linha
      line = line.split("//")[0];

      // para facilitar a análise de expressões eu removo as funções internas quando a
      // linha conmeça com if(
      if (line.match(/^(\s*)(if)(\t| |!)*(\()+.+(\))/i)) {
        // extrai o conteúdo de dentro do IF
        line = line.replace(/^(\s*)(if)(\t| |!)*(\()/i, "").slice(0, -1);
        const parts: string[] = line.split(")");
        line = "";
        parts.forEach((linepart) => {
          line += (linepart + ")").replace(/(\()+(.|)+(\))/g, " ");
        });
        line = "if(" + line;
      }
      // remove espaços a direita
      line = line.trim();
    }

    if (line.trim().length === 0) {
      return false;
    }

    // rule a remover pilha pode ser a ultima aberta da pilha ou uma estrutura assincrona aberta
    const closeseableRules: RuleMatch[] = this.openStructures.filter(
      (x) => x.rule.assincStruct
    );
    if (lastRule && lastRule.rule) {
      closeseableRules.push(lastRule);
    }

    // verifica se está no mid ou close de alguma estrutura fechável
    closeseableRules.every((rule: RuleMatch) => {
      if (line.match(rule.rule.end)) {
        // Procura o último aberto
        finddedRule = this.getLastOpenMatch(rule);
        // para não incrementar para a próxima regra
        finddedRule.incrementDouble = false;

        // remove a partir do último encontrado se for assincrona
        const originalStructures = [];
        this.openStructures.every((structItem: RuleMatch) => {
          if (structItem !== finddedRule) {
            originalStructures.push(structItem);
            return true;
          }
          return false;
        });
        this.openStructures = originalStructures;
        return false;
      } else if (rule.rule.middleDouble && line.match(rule.rule.middleDouble)) {
        // Procura o último aberto
        finddedRule = this.getLastOpenMatch(rule);
        finddedRule.decrement = true;
        finddedRule.incrementDouble = true;
        return false;
      } else if (rule.rule.middle && line.match(rule.rule.middle)) {
        // Procura o último aberto
        finddedRule = this.getLastOpenMatch(rule);
        finddedRule.decrement = true;
        finddedRule.increment = true;
        return false;
      }
      return true;
    });

    // verifica se tem estrutura sendo aberta
    if (finddedRule === null) {
      this.getRules().every((rule: StructureRule) => {
        if (
          line.match(rule.begin) &&
          (!rule.noBegin ||
            !rule.noBegin.filter((exp) => {
              return line.match(exp);
            }).length)
        ) {
          finddedRule = { rule: rule, increment: true, initialPosition };
          this.openStructures.push({ ...finddedRule });
        }
        return finddedRule === null;
      });
    }

    if (finddedRule !== null) {
      this.lastMatch = finddedRule;
      return true;
    }

    return false;
  }

  public getLastMatch(): RuleMatch | null {
    return this.lastMatch;
  }

  public getRules(): Rule[] {
    return [...this.getStructures(), ...this.getCustomStructures()];
  }

  public getLastOpenMatch(rule: RuleMatch): RuleMatch {
    let finddedRule: RuleMatch = null;

    let i;
    for (i = this.openStructures.length - 1; i >= 0; i--) {
      if (rule.rule.id === this.openStructures[i].rule.id) {
        finddedRule = this.openStructures[i];
        finddedRule.decrement = true;
        finddedRule.increment = false;
        break;
      }
    }
    return finddedRule;
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

  public getStructures(): StructureRule[] {
    return [
      {
        id: "function",
        begin: /^(\s*)((user|static)(\s*))?(function)(\s+)(\w+)/i,
        noBegin: [
          /^(\s*)((user|static)(\s*))?(function)(\s+)(\w+)(\s*)(;)(\s*)(return)/i,
        ],
        end: /^(\s*)(return)/i,
      },
      {
        id: "method",
        begin: /^(\s*)(method)(\s+)(\w+)(\s*)(.*)(\s+)(class)(\s+)(\w+)/i,
        end: /^(\s*)(return)/i,
      },
      {
        id: "method rest e client",
        begin:
          /^(\s*)(wsmethod)(\s+)(\w+)(\s*)(.*)(\s+)(wsservice|wsclient)(\s+)(\w+)/i,
        end: /^(\s*)(return)/i,
      },
      {
        id: "#ifdef/#ifndef",
        begin: /^(\s*)(#)(\s*)(ifdef|ifndef)/i,
        middle: /^(\s*)(#)(\s*)(else)/i,
        end: /^(\s*)(#)(\s*)(endif)/i,
        assincStruct: true,
      },
      {
        id: "begin report query",
        begin: /^(\s*)(begin)(\s+)(report)(\s+)(query)/i,
        end: /^(\s*)(end)(\s+)(report)(\s+)(query)/i,
      },
      {
        id: "begin transaction",
        begin: /^(\s*)(begin)(\s+)(transaction)/i,
        end: /^(\s*)(end)(\s+)(transaction)?/i,
      },
      {
        id: "beginsql (alias)?",
        begin: /^(\s*)(beginsql)(\s+)(\w+)/i,
        end: /^(\s*)(endsql)$/i,
      },
      {
        id: "begin content",
        begin: /^(\s*)(begincontent)(\s+)(var)(\s+)(\w+)/i,
        end: /^(\s*)(endcontent)$/i,
      },
      {
        id: "do case",
        begin: /^(\s*)(do)(\s+)(case)/i,
        middleDouble: /^(\s*)(case|otherwise)/i,
        end: /^(\s*)(end)(do)?(\s*)(case)?$/i,
      },
      {
        id: "try..catch",
        begin: /^(\s*)(try)/i,
        middle: /^(\s*)(catch)/i,
        end: /^(\s*)(end)(\s*)(try)?/i,
      },
      {
        id: "class",
        begin: /^(\s*)(class)(\s+)(\w+)/i,
        end: /^(\s*)(end)(\s*)(class)?/i,
      },
      {
        id: "endwsclient",
        begin: /^(\s*)(wsclient)(\s+)(\w+)/i,
        end: /^(\s*)(endwsclient)/i,
      },
      {
        id: "for",
        begin: /^(\s*)(for)(\s+)(\w+)/i,
        end: /^(\s*)(next|end)(\s+|$)/i,
      },
      {
        id: "if",
        begin: /^(\s*)(if)(\t| |!|\()+/i,
        noBegin: [
          /^(\s*)(if)(\t| |!)*(\()+(.)*(,)+(.)*(,)+(.)*(\))/i,
          /^(\s*)(if)(\t| |!)*(.)*(;)+(.)*(;)+(.)*(endif)/i,
        ],
        middle: /^(\s*)((else)|(elseif))(\t| |\(|;|\/\*|$)/i,
        end: /^(\s*)(end)(\s*)(if)?$/i,
      },
      {
        id: "structure",
        begin: /^(\s*)(structure)/i,
        end: /^(\s*)(end)(\s*)(structure)/i,
      },
      {
        id: "while",
        begin: /^(\s*)(do)?(\s*)(while)/i,
        end: /^(\s*)(end)(\s*)(do)?(\s*while)?$/i,
      },
      {
        id: "wsrestful",
        begin: /^(\s*)(wsrestful)/i,
        end: /^(\s*)(end)(\s*)(wsrestful)/i,
      },
      {
        id: "wsservice",
        begin: /^(\s*)(wsservice)/i,
        end: /^(\s*)(end)(\s*)(wsservice)/i,
      },
      {
        id: "wsstruct",
        begin: /^(\s*)(wsstruct)/i,
        end: /^(\s*)(end)(\s*)(wsstruct)/i,
      },
      {
        id: "begin sequence",
        begin: /^(\s*)(begin)(\s*)(sequence)/i,
        middle: /^(\s*)(recover)(\s*)(sequence)/i,
        end: /^(\s*)(end)(\s*)(sequence)?$/i,
      },
      {
        id: "no format",
        begin: /^(\s*)(\/\*\s*\{\s*\*\/)/i,
        end: /^(\s*)(\/\*\s*\}\s*\*\/)/i,
      },
      {
        id: "protheus doc",
        begin: /^(\s*)(\/\*\/(.*)?\{Protheus.doc\}(.*)?)/i,
        end: /(\*\/)/i,
      },
      {
        id: "comment",
        begin: /^(\s*)(\/\*)/i,
        noBegin: [/^\s*(\/\*.*\*\/)/i],
        end: /(\*\/)/i,
      },
    ];
  }
}
