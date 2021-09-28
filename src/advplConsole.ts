import * as vscode from 'vscode';
import * as nls from 'vscode-nls';
import { hasCompileKey } from './utils';

const localize = nls.loadMessageBundle();

export class advplConsole {
    private outPutChannel: vscode.OutputChannel;

    constructor() {
        this.outPutChannel = vscode.window.createOutputChannel('Advpl');
        this.outPutChannel.show();
        this.showInit();

        // Só mostra o disclaimer quando houver token ou chave de compilação
        if (hasCompileKey()) {
            this.showDisclaimer();
        }
    }

    public showInit() {
        this.log(`${localize('src.advplConsole.text', 'AdvPL Started')}\n`);
    }

    public showDisclaimer() {
		switch (vscode.env.language.toLowerCase()) {
			case 'pt-br':
				this.log("AVISO LEGAL SOBRE O USO DE TOKENS E CHAVES DE COMPILAÇÃO:\n");
				this.log("As chaves de compilação ou tokens empregados na construção do Protheus e suas funcionalidades, são de uso restrito dos desenvolvedores de cada módulo.\n");
				this.log("Em caso de mau uso destas chaves ou tokens, por qualquer outra parte, que não a referida acima, a mesma irá se responsabilizar, direta ou " +
					"regressivamente, única e exclusivamente, por todos os prejuízos, perdas, danos, indenizações, multas, condenações judiciais, arbitrais e administrativas e " +
					"quaisquer outras despesas relacionadas ao mau uso, causados tanto à TOTVS, quanto a terceiros, eximindo a TOTVS de toda e qualquer responsabilidade.\n");
				break;

			case 'es':
				this.log("AVISO LEGAL SOBRE EL USO DE TOKENS Y CLAVES DE COMPILACIÓN:\n");
				this.log("Las claves de compilación o tokens utilizados en la construcción del Protheus y sus funcionalidades, son de uso restringido de los desarrolladores de cada módulo.\n");
				this.log("En caso de mal uso de estas claves o tokens, por cualquier otra parte, que no sea la referida anteriormente, está se responsabilizará, de forma directa o " +
					"retroactiva, única y exclusivamente, por todas las perjuicios, pérdidas, daños, indemnizaciones, multas, condenaciones judiciales, arbitrales y administrativas y " +
					"cualquier otro gasto relacionado al mal uso, causado tanto a TOTVS, como a terceros, eximiendo a TOTVS de toda y cualquier responsabilidad.\n");
				break;

			default:
				this.log("LEGAL NOTICE ON THE USE OF TOKENS AND COMPILATION KEYS:\n");
				this.log("The compilation keys or tokens employed in construction of Protheus and its features, are used exclusively by the developers of each module.\n");
				this.log("In case of undue use of these keys or tokens, by any other party, other than the aforementioned one, it will be responsible, directly or " +
					"retroactively, singly and exclusively, for all liabilities, losses, damages, compensations, fines, legal, arbitrational and administrative sentences and " +
					"whichever other expenses related to wrongful use, caused to TOTVS and also to third parties, releasing TOTVS from all and any responsibility.\n");
				break;
		}
	}

    public log(message: string) {
        this.outPutChannel.appendLine(message);
    }
}
