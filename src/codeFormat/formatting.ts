import {
  DocumentFormattingEditProvider,
  TextDocument,
  FormattingOptions,
  CancellationToken,
  ProviderResult,
  TextEdit,
  DocumentRangeFormattingEditProvider,
  Range,
  Position,
  workspace,
  window,
} from "vscode";
import {
  FormattingRules,
  RuleMatch,
  getStructsNoIdent,
  StructureRule,
} from "./formmatingRules";
import * as sqlFormatterPlus from "sql-formatter-plus";
import * as nls from 'vscode-nls';
const localize = nls.loadMessageBundle();

// Regras de estruturas que não sofrem identação interna
const structsNoIdent: string[] = getStructsNoIdent();

class Formatting implements DocumentFormattingEditProvider {
  lineContinue = false;

  provideDocumentFormattingEdits(
    document: TextDocument,
    options: FormattingOptions,
    token: CancellationToken
  ): ProviderResult<TextEdit[]> {
    const formatter: RangeFormatting = new RangeFormatting();
    // define o range como todo o documento
    const range: Range = new Range(
      new Position(0, 0),
      new Position(document.lineCount - 1, 0)
    );
    return formatter.provideDocumentRangeFormattingEdits(
      document,
      range,
      options,
      token
    );
  }
}

class RangeFormatting implements DocumentRangeFormattingEditProvider {
  lineContinue = false;
  provideDocumentRangeFormattingEdits(
    document: TextDocument,
    range: Range,
    options: FormattingOptions,
    token: CancellationToken
  ): ProviderResult<TextEdit[]> {
    let noQueryFormatter: boolean = workspace
      .getConfiguration()
      .get("advplformat.noQueryFormatter");
    let queryLanguage: string = workspace
      .getConfiguration()
      .get("advplformat.queryLanguage");

    if (!queryLanguage && !noQueryFormatter) {
      askSqlLanguage();
      noQueryFormatter = workspace
        .getConfiguration()
        .get("advplformat.noQueryFormatter");
      queryLanguage = workspace
        .getConfiguration()
        .get("advplformat.queryLanguage");
    }

    queryLanguage = queryLanguage ? queryLanguage : "sql";

    let cont = 0;
    // eslint-disable-next-line @typescript-eslint/member-delimiter-style
    let query: { expression: string; range: Range };
    const tab: string = options.insertSpaces
      ? " ".repeat(options.tabSize)
      : "\t";
    // define comom está a identação quando é identação range
    if (range.start.line > 0) {
      let stringStart = document
        .lineAt(range.start.line)
        .text.replace(/(^\s*)(.*)/, "$1");
      while (stringStart.search(tab) >= 0) {
        cont++;
        stringStart = stringStart.replace(tab, "");
      }
    }
    const formattingRules = new FormattingRules();

    const result: TextEdit[] = [];
    const lc = range.end.line;
    const rulesIgnored: StructureRule[] = formattingRules
      .getStructures()
      .filter((rule) => {
        return structsNoIdent.indexOf(rule.id) !== -1;
      });

    for (let nl = range.start.line; nl <= lc; nl++) {
      // check operation Cancel
      if (token.isCancellationRequested) {
        console.log("cancelado");
        return [];
      }

      const line = document.lineAt(nl);
      const text = line.text.trimRight();
      const lastRule: RuleMatch =
        formattingRules.openStructures[
          formattingRules.openStructures.length - 1
        ];
      const foundIgnore: StructureRule[] = rulesIgnored.filter((rule) => {
        return lastRule && lastRule.rule && rule.id === lastRule.rule.id;
      });
      // dentro do BeginSql não mexe na identação
      if (foundIgnore.length > 0 && !text.match(foundIgnore[0].end)) {
        // verifica se está em query
        if (!noQueryFormatter && foundIgnore[0].id === "beginsql (alias)?") {
          if (!query || query.expression.length === 0) {
            query = { expression: "", range: line.range };
          }
          // replace para comentários
          query.expression +=
            " " +
            text.replace("//", "--REPLACE--").replace(/^\s*/gim, "") +
            "\n";
          // replace para correção de problema de '\' que quebra a identação
          query.expression = query.expression.replace(
            /'\\'/gim,
            "'******\\******'"
          );
          // define o range que será substituído
          // usando o range inicial da primeira linha
          // e o atual da ultima linha com a query
          query.range = new Range(query.range.start, line.range.end);
        } else {
          if (document.lineAt(nl).text !== text) {
            result.push(TextEdit.replace(line.range, text));
          }
        }
      } else {
        if (
          !line.isEmptyOrWhitespace &&
          !this.lineContinue &&
          formattingRules.match(text, cont)
        ) {
          const ruleMatch: RuleMatch | null = formattingRules.getLastMatch();

          if (ruleMatch) {
            if (ruleMatch.decrement) {
              cont = ruleMatch.initialPosition;
              // trata query
              if (
                !noQueryFormatter &&
                ruleMatch.rule.id === "beginsql (alias)?"
              ) {
                let queryResult: string = sqlFormatterPlus.format(
                  query.expression,
                  { indent: tab, language: queryLanguage }
                );

                // volta comentários
                queryResult = queryResult.replace(/--REPLACE--/gim, "//");
                // adiciona tabulações no início de cada linha
                queryResult =
                  tab.repeat(cont + 1) +
                  queryResult.replace(/\n/gim, "\n" + tab.repeat(cont + 1));
                // Remove os espaçamentos dentro das expressões %%
                queryResult = queryResult.replace(
                  /(%)\s+(table|temp-table|exp|xfilial|order)\s*(:)((\w|\+|\\|\*|\(|\)|\[|\]|-|>|_|\s|,|\n|"|')*)\s+(:*\w*)\s*(%)/gim,
                  "$1$2$3$4$6$7"
                );
                // Remove espacos quando usar array dentro de expressões de query
                while (
                  queryResult.match(
                    /(%(table|temp-table|exp|xfilial|order):.+)\s*\[\s+(.+%)/gim
                  )
                ) {
                  queryResult = queryResult.replace(
                    /(%(table|temp-table|exp|xfilial|order):.+)\s*\[\s+(.+%)/gim,
                    "$1[$3"
                  );
                }
                while (
                  queryResult.match(
                    /(%(table|temp-table|exp|xfilial|order):.+)\s+\]\s*(.*%)/gim
                  )
                ) {
                  queryResult = queryResult.replace(
                    /(%(table|temp-table|exp|xfilial|order):.+)\s+\]\s*(.*%)/gim,
                    "$1]$3"
                  );
                }

                // Como coloca quebras de linhas no orderby por conta da vírgula removo
                queryResult = queryResult.replace(
                  /(%order:\w*)(,\n\s*)(\w%)/gim,
                  "$1,$3"
                );
                // Ajusta os sem expressões
                queryResult = queryResult.replace(
                  /(%)(\s+)(notDel|noparser)(\s+)(%)/gim,
                  "$1$3$5"
                );
                // se houver espaço entre o . e o %NotDel% remove
                queryResult = queryResult.replace(/\.\s(%notDel%)/gim, ".$1");
                //quebra de linha depois do no parser
                queryResult = queryResult.replace(
                  /((\s*)%noparser%)\s+/gim,
                  "$1\n\n$2"
                );
                //quebra linha no column x as  antes do primeiro select
                if (queryResult.match(/(.*)(\n\s*select)/im)) {
                  let columnsText: string = queryResult
                    .match(/(.*)(\n\s*select)/im)[0]
                    .replace(/(.*)(\n\s*select)/im, "$1");
                  // pego tamnho de tabulação na linha
                  const tabColumn = columnsText.replace(/column\s.*/gim, "");
                  if (tabColumn) {
                    // quebro cada column em uma linha
                    columnsText = columnsText.replace(
                      /(\s*)(column\s[0-z]*\sas\s[0-z]*)/gim,
                      "\n" + tabColumn + "$2"
                    );
                    // remove a primeira quebra de linha
                    columnsText = columnsText.replace(/\n/, "");
                    // Troco o que tem antes do primeiro select pelo texto tratado
                    queryResult = queryResult.replace(
                      /(.*)(\n\s*select)/im,
                      columnsText + "$2"
                    );
                  }
                }
                // remove espaços entre ->
                queryResult = queryResult.replace(/\s*->\s*/gim, "->");
                // remove espaços antes de colchetes
                queryResult = queryResult.replace(/\s*\[\s*/gim, "[");
                // remove espaços antes de , + - \ * dentro de %
                while (
                  queryResult.match(/(%.*)(\s+)(,|\+|-|\\|\*)(\s*)(.*%)/gim)
                ) {
                  queryResult = queryResult.replace(
                    /(%.*)(\s+)(,|\+|-|\\|\*)(\s*)(.*%)/gim,
                    "$1$3$5"
                  );
                }
                // remove espaços depois de , + - \ * dentro de %
                while (
                  queryResult.match(/(%.*)(\s*)(,|\+|-|\\|\*)(\s+)(.*%)/gim)
                ) {
                  queryResult = queryResult.replace(
                    /(%.*)(\s*)(,|\+|-|\\|\*)(\s+)(.*%)/gim,
                    "$1$3$5"
                  );
                }

                // Ajustes visuais de query alinhamento de Between em uma linha
                queryResult = queryResult.replace(
                  /(^\s*.*between\s*.*)\n\s*(and\s.*)/gim,
                  "$1 $2"
                );

                // Quebra linha no ON do JOIN
                queryResult = queryResult.replace(
                  /(^(\s*)(.*join\s*.*\s|\)\s\w*\s))(on(\s|\n))/gim,
                  "$1\n$2$4"
                );
                // Quebra linha no THEN do CASE
                queryResult = queryResult.replace(
                  /(^(\s*)when.*)\n*\s*(then.*)/gim,
                  "$1\n$2" + tab + "$3"
                );
                // remove espaço no fim de linha de cima quando quebra on, join, when ou then
                queryResult = queryResult.replace(
                  /\s*(\n\s*(on|join|when|then))/gim,
                  "$1"
                );
                // Remove uma das tabulações dos Join's e ON
                if (queryResult.match(/^\s*(\w*\sjoin|on)\s/gim)) {
                  const queryLines: string[] = queryResult.split("\n");
                  queryResult = "";
                  queryLines.forEach((line) => {
                    if (line.match(/^\s*(\w*\sjoin|on)\s/gim)) {
                      queryResult += line.replace(tab, "") + "\n"; // remove uma tabulação
                    } else {
                      queryResult += line + "\n";
                    }
                  });
                }

                // Correção de Problemas externos -----
                // Existe um erro na compilação quando a linha começa com * (PROBLEMA NO APPSERVER)
                queryResult = queryResult.replace(/\n\s*(\*)/gim, " $1");
                // volta replace de '\' (PROBLEMA NA EXTENSÃO sql-formatter-plus)
                queryResult = queryResult.replace(
                  /'\*\*\*\*\*\*\\\*\*\*\*\*\*'/gim,
                  "'\\'"
                );
                // erro na identação de case quando enviada , CASE (PROBLEMA NA EXTENSÃO sql-formatter-plus)
                queryResult = queryResult.replace(
                  /(^(\s*).*,\n)\s*(case)/gim,
                  "$1$2$3"
                );

                result.push(
                  TextEdit.replace(query.range, queryResult.trimEnd())
                );

                query = { expression: "", range: undefined };
              }
            }
          }

          if (ruleMatch.incrementDouble) {
            cont += 1;
          }

          const newLine: string = text.replace(/(\s*)?/, tab.repeat(cont));
          if (document.lineAt(nl).text !== newLine) {
            result.push(TextEdit.replace(line.range, newLine));
          }
          this.lineContinue =
            newLine.split("//")[0].trim().endsWith(";") &&
            rulesIgnored.indexOf(ruleMatch.rule) === -1;

          if (ruleMatch) {
            if (ruleMatch.increment || ruleMatch.incrementDouble) {
              cont++;
            }
          }
        } else {
          let newLine = "";
          if (!line.isEmptyOrWhitespace) {
            newLine = text
              .replace(
                /(\s*)?/,
                tab.repeat(cont) + (this.lineContinue ? tab : "")
              )
              .trimRight();
          }
          if (document.lineAt(nl).text !== newLine) {
            result.push(TextEdit.replace(line.range, newLine));
          }
          this.lineContinue = newLine.split("//")[0].trim().endsWith(";");
        }
      }
    }
    return result;
  }
}

export function askSqlLanguage(): void {
  const sqlLaguages: any[] = [
    { sigla: "sql", descricao: "Standard SQL" },
    { sigla: "n1ql", descricao: "Couchbase N1QL" },
    { sigla: "db2", descricao: "IBM DB2" },
    { sigla: "pl/sql", descricao: "Oracle PL/SQL" },
  ];
  const workspaceFolders = workspace["workspaceFolders"];
  // check if there is an open folder
  if (workspaceFolders === undefined) {
    return;
  }

  const quetionArray: string[] = sqlLaguages.map((lang) => {
    return lang.descricao;
  });

  quetionArray.push(localize("formatting.query.disable","Disable"));

  const defaultConfig = workspace.getConfiguration();

  window
  .showWarningMessage(localize("formatting.query.question","Do you want to enable query formatting for:"), ...quetionArray)
  .then((clicked) => {
    if (clicked === localize("formatting.query.disable","Disable")) {
        defaultConfig.update("advplformat.noQueryFormatter", true);
      } else {
        const config = sqlLaguages.find((lang) => {
          return lang.descricao === clicked;
        });
        if (config) {
          defaultConfig.update("advplformat.noQueryFormatter", false);
          defaultConfig.update("advplformat.queryLanguage", config.sigla);
        }
      }
    });
}

const formatter = new Formatting();
const rangeFormatter = new RangeFormatting();

export function formattingEditProvider(): any {
  return formatter;
}

export function rangeFormattingEditProvider(): any {
  return rangeFormatter;
}
