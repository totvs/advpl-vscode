
// tslint:disable-next-line:max-line-length
import { ChangeLogItem, ChangeLogKind, ContentProvider, Header, Image, Sponsor } from "./vscode-whats-new/ContentProvider";

export class WhatsNewAdvPLContentProvider implements ContentProvider {

    public provideHeader(logoUrl: string): Header {
        return <Header>{
            logo: <Image>{ src: logoUrl, height: 25, width: 25 },
            message: `<b>I Love AdvPL</b> provê os recursos necessários para edição, 
                      compilação e debugging em AdvPL, 4GL e TL++ no Visual Code, além de recursos específicos
                      para gerenciamento de ambientes Protheus.`,
            notice: `Recomenda-se em ambientes Windows habilitar a configuração <code>"advpl.alpha_compile": true</code> 
                     pois as melhorias no Bridge (intermediador do VsCode com AppServer) estão sendo feitas 
                     somente nessa versão.`};
    }

    public provideChangeLog(): ChangeLogItem[] {
        const changeLog: ChangeLogItem[] = [];

        changeLog.push({ kind: ChangeLogKind.NEW, message: "Aprimorado suporte ao <b>TLPP</b> e edição de .ch e .th" });
        changeLog.push({ kind: ChangeLogKind.NEW, message: "Adicionado <b>What's New</b> para apresentar as novidades e correções da extensão" });

        changeLog.push({
            kind: ChangeLogKind.NEW, message: `0.13.0 - Adicionado suporte ao <b>binário 191205P</b> - (<a title=\"Documentação para uso do binário 191205P\" 
                href=\"https://github.com/totvs/advpl-vscode/wiki/Suporte-ao-bin%C3%A1rio-191205P\">Documentação</a>)`
        });

        changeLog.push({
            kind: ChangeLogKind.NEW, message: `Implementado <b>Hover Inspect</b> no debug - (<a title=\"Open Issue #417\" 
                href=\"https://github.com/totvs/advpl-vscode/issues/417\">Issue #417</a> | <a title=\"Documentação do Hover Inspect\"
                href=\"https://github.com/totvs/advpl-vscode/wiki/Debugando-e-executando#hover-inspect\">Documentação</a>)`
        });

        changeLog.push({
            kind: ChangeLogKind.NEW, message: `Adicionado suporte para <b>formatação de código</b> - (<a title=\"Open Issue #420\" 
                href=\"https://github.com/totvs/advpl-vscode/pull/420\">PR #420</a> | <a title=\"Documentação da Feature\"
                href=\"https://github.com/totvs/advpl-vscode/wiki/Identação\">Documentação</a>)`
        });
    
        changeLog.push({
            kind: ChangeLogKind.NEW, message: `Permitir excluir fontes via <b>menu Explorer</b> - (<a title=\"Open Issue #445\" 
                href=\"https://github.com/totvs/advpl-vscode/issues/445\">Issue #445</a>)`
        });

        changeLog.push({
            kind: ChangeLogKind.NEW, message: `Alterar senha de ambiente pelo <b>gerenciador de ambientes</b> - (<a title=\"Open Issue #448\" 
                href=\"https://github.com/totvs/advpl-vscode/issues/448\">Issue #448</a>)`
        });

        changeLog.push({
            kind: ChangeLogKind.NEW, message: `Implementado cancelamento na <b>compilação de arquivos abertos</b>`
        });

        changeLog.push({
            kind: ChangeLogKind.CHANGED, message: `<b>Compilação de pasta</b> não mostra nome do fonte compilado sem warnings - (<a title=\"Open Issue #436\" 
                href=\"https://github.com/totvs/advpl-vscode/issues/436\">Issue #436</a>)`
        });

        changeLog.push({
            kind: ChangeLogKind.CHANGED, message: `Permitir <b>excluir um ambiente</b> pelo gerenciador de ambientes - (<a title=\"Open Issue #408\" 
                href=\"https://github.com/totvs/advpl-vscode/issues/408\">Issue #408</a>)`
        });

        changeLog.push({
            kind: ChangeLogKind.CHANGED, message: `Adicionado <i>type</i> <code>Object</code> na sintaxe dos <b>atributos de classe</b>`
        });

        changeLog.push({
            kind: ChangeLogKind.FIXED, message: `Ao compilar arquivos abertos, compilava a Workspace inteira - (<a title=\"Open Issue #411\" 
                href=\"https://github.com/totvs/advpl-vscode/issues/411\">Issue #411</a>)`
        });

        changeLog.push({
            kind: ChangeLogKind.FIXED, message: `JSON Bridge Return Invalid - (<a title=\"Open Issue #409\" 
                href=\"https://github.com/totvs/advpl-vscode/issues/409\">Issue #409</a>)`
        });
        
        changeLog.push({
            kind: ChangeLogKind.FIXED, message: `Problemas com Debug com path com acentos - (<a title=\"Open Issue #422\" 
                href=\"https://github.com/totvs/advpl-vscode/issues/422\">Issue #422</a>)`
        });

        changeLog.push({
            kind: ChangeLogKind.FIXED, message: `Exclusão de fonte do RPO no binário 191205P - (<a title=\"Open Issue #416\" 
                href=\"https://github.com/totvs/advpl-vscode/issues/416\">Issue #416</a>)`
        });

        changeLog.push({
            kind: ChangeLogKind.FIXED, message: `Conexão com repositorio SQLite`
        });

        return changeLog;
    }

    public provideSponsors(): Sponsor[] {
        const sponsors: Sponsor[] = [];
        // const sponsorCodeStream: Sponsor = <Sponsor>{
        //     title: "Try Codestream",
        //     link: "https://sponsorlink.codestream.com/?utm_source=vscmarket&utm_campaign=bookmarks&utm_medium=banner",
        //     image: "https://alt-images.codestream.com/codestream_logo_bookmarks.png",
        //     width: 35,
        //     message: `<p>Discussing code is now as easy as highlighting a block and typing a comment right 
        //               from your IDE. Take the pain out of code reviews and improve code quality.</p>`,
        //     extra:
        //         `<a title="Try CodeStream" href="https://sponsorlink.codestream.com/?utm_source=vscmarket&utm_campaign=bookmarks&utm_medium=banner">
        //          Try it free</a>`
        // };
        // sponsors.push(sponsorCodeStream);
        return sponsors
    }

}