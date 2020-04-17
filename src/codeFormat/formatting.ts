import {
  DocumentFormattingEditProvider,
  TextDocument,
  FormattingOptions,
  CancellationToken,
  ProviderResult,
  TextEdit,
  DocumentRangeFormattingEditProvider,
  Range,
  Position
} from 'vscode';
import { FormattingRules, RuleMatch } from './formmatingRules';

// Regras de estruturas que não sofrem identação interna
let structsNoIdent: string[] = [
  'beginsql (alias)?',
  'comment',
  'protheus doc',
  'begin content',
  'no format'
];

class Formatting implements DocumentFormattingEditProvider {
  lineContinue: boolean = false;

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
  lineContinue: boolean = false;
  provideDocumentRangeFormattingEdits(
    document: TextDocument,
    range: Range,
    options: FormattingOptions,
    token: CancellationToken
  ): ProviderResult<TextEdit[]> {
    let cont: number = 0;
    const tab: string = options.insertSpaces
      ? ' '.repeat(options.tabSize)
      : '\t';
    // define comom está a identação quando é identação range
    if (range.start.line > 0) {
      let stringStart = document
        .lineAt(range.start.line)
        .text.replace(/(^\s*)(.*)/, '$1');
      while (stringStart.search(tab) >= 0) {
        cont++;
        stringStart = stringStart.replace(tab, '');
      }
    }
    const formattingRules = new FormattingRules();
    let identBlock: string = tab.repeat(cont);

    let result: TextEdit[] = [];
    const lc = range.end.line;
    const rulesIgnored: any[] = formattingRules
      .getClosedStructures()
      .filter(rule => {
        return structsNoIdent.indexOf(rule.id) !== -1;
      });

    for (let nl = range.start.line; nl <= lc; nl++) {
      const line = document.lineAt(nl);
      const text = line.text.trimRight();
      let lastRule: RuleMatch =
        formattingRules.openStructures[
          formattingRules.openStructures.length - 1
        ];
      let foundIgnore: any[] = rulesIgnored.filter(rule => {
        return lastRule && lastRule.rule && rule.id === lastRule.rule.id;
      });
      // dentro do BeginSql não mexe na identação
      if (foundIgnore.length > 0 && !text.match(foundIgnore[0].end)) {
        result.push(TextEdit.replace(line.range, text));
      } else {
        if (
          !line.isEmptyOrWhitespace &&
          !this.lineContinue &&
          formattingRules.match(text)
        ) {
          let ruleMatch: RuleMatch | null = formattingRules.getLastMatch();

          if (ruleMatch) {
            if (ruleMatch.decrement) {
              if (ruleMatch.decrementDouble) {
                cont = cont < 2 ? 0 : cont - 2;
              } else {
                cont = cont < 1 ? 0 : cont - 1;
              }
              identBlock = tab.repeat(cont);
            }
          }

          if (ruleMatch.incrementDouble) {
            cont += 1;
            identBlock = tab.repeat(cont);
          }

          const newLine: string = text.replace(/(\s*)?/, identBlock);
          result.push(TextEdit.replace(line.range, newLine));
          this.lineContinue =
            newLine
              .split('//')[0]
              .trim()
              .endsWith(';') && rulesIgnored.indexOf(ruleMatch.rule.id) === -1;

          if (ruleMatch) {
            if (ruleMatch.increment || ruleMatch.incrementDouble) {
              cont++;
              identBlock = tab.repeat(cont);
            }
          }
        } else {
          let newLine: string = '';
          if (!line.isEmptyOrWhitespace) {
            newLine = text
              .replace(/(\s*)?/, identBlock + (this.lineContinue ? tab : ''))
              .trimRight();
          }
          result.push(TextEdit.replace(line.range, newLine));
          this.lineContinue = newLine
            .split('//')[0]
            .trim()
            .endsWith(';');
        }
      }
    }

    return result;
  }
}

const formatter = new Formatting();
const rangeFormatter = new RangeFormatting();

export function formattingEditProvider() {
  return formatter;
}

export function rangeFormattingEditProvider() {
  return rangeFormatter;
}
