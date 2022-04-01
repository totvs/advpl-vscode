
// tslint:disable-next-line:max-line-length
import { ChangeLogItem, ChangeLogKind, ContentProvider, Header, Image, Sponsor } from "./vscode-whats-new/ContentProvider";

export class WhatsNewAdvPLContentProvider implements ContentProvider {

    public provideHeader(logoUrl: string): Header {
        return <Header>{
            logo: <Image>{ src: logoUrl, height: 25, width: 25 },
            message: `<b>I Love AdvPL</b> provê os recursos necessários para edição,
                      compilação e debugging em AdvPL, 4GL e TL++ no Visual Code, além de recursos específicos
                      para gerenciamento de ambientes Protheus.`,
            notice: `Agora a configuração <code>"advpl.alpha_compile"</code> já vem habilitada por padrão.
                     Caso a sua esteja como <code>false</code> recomendamos habilitar,
                     pois as melhorias no Bridge (intermediador do VsCode com AppServer) estão sendo feitas
                     somente nessa versão.`};
    }

    public provideChangeLog(): ChangeLogItem[] {
        const changeLog: ChangeLogItem[] = [];

        changeLog.push({
            kind: ChangeLogKind.NEW, message: `Melhoria de performace no formart.`
        });

        changeLog.push({
            kind: ChangeLogKind.NEW, message: `Suporte ao novos tipos nativos do tlpp.`
        });
        changeLog.push({
            kind: ChangeLogKind.NEW, message: `Suporte a novos tipos, namespace, tipagem com atribuição na sintaxe do TLPP.`
        });
        changeLog.push({
            kind: ChangeLogKind.FIXED, message: `Correções no inspetor de objetos para a build 210324P.`
        });
        changeLog.push({
            kind: ChangeLogKind.NEW, message: `Implementação da chave additionalSmartClientArgs.`
        });
        changeLog.push({
            kind: ChangeLogKind.CHANGED, message: `Tornado alpha_compile habilitado por default.`
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