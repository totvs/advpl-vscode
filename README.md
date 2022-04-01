![Version](https://vsmarketplacebadge.apphb.com/version/KillerAll.advpl-vscode.svg) ![Installs](https://vsmarketplacebadge.apphb.com/installs/KillerAll.advpl-vscode.svg) ![Rating](https://vsmarketplacebadge.apphb.com/rating-short/KillerAll.advpl-vscode.svg)

# Advpl Language Support

Bem vindo a extensão para desenvolvimento de Advpl no visual code. [VsCode MarketPlace](https://marketplace.visualstudio.com/items?itemName=KillerAll.advpl-vscode)

Essa extensão adiciona suporte a edição, compilação e debugging de ADVPL no Visual Code.

Caso você encontre algum problema, por favor abra uma issue no [GitHub](https://github.com/killerall/advpl-vscode/issues).

> Existe um migrador de projetos antigos do IDE Totvs (.PRJ) que pode se encontrado [aqui](https://github.com/killerall/advpl-vscode/blob/master/TDSProjectToVscode.jar).


# 4GL Language Support

Essa extensão adiciona suporte a edição, compilação e debugging de 4GL no Visual Code.

## Features

Essa extensão possui as seguintes features implementadas:

* Syntax highlighting
* Compilação de fonte
* Chave de Compilação
* Debug single Thread e Multi Thread
* Compilação de multiplos fontes
* Geração e aplicação de Path [Wiki](https://github.com/killerall/advpl-vscode/wiki/Trabalhando-com-Patchs)
* Exclusão de fontes do RPO
* Lista dos fontes/resources do rpo
* Geração Cliente WS Protheus
* Geração de PPO do fonte(Para fazer isso utilize CTRL+SHIFT+F9)
* Mac OSX
* Linux
* TL++
* TdsReplay
* Suporte ao remote WEBAPP
* Compilação de fontes Abertos
* Formatação de Código [Wiki](https://github.com/totvs/advpl-vscode/wiki/Identação)

## Build 191205P

 A Build 191205P utiliza SSL na conexão, para maiores informações consulte [aqui.](https://github.com/totvs/advpl-vscode/wiki/Suporte-ao-bin%C3%A1rio-191205P)

## Requisitos para utilização

Para utilizar os recursos de compilação e debug é necessário que o AppServer esteja na build 131227A ou superior, tendo essa versão de binário tanto o Protheus 11 e 12 são suportados.

## Para a instalação da versão MAC e Linux:

Veja a seguinte pagina na [Wiki](https://github.com/killerall/advpl-vscode/wiki/Instala%C3%A7%C3%A3o-em-Linux-Mac-OS)

## Configurações

Veja nossa [Wiki](https://github.com/killerall/advpl-vscode/wiki/Configura%C3%A7%C3%A3o)

## Gerenciador de Ambiente

Agora é possível Gerenciar de forma intuitiva todos os ambientes já configurados e até mesmo os novos que forem sendo criados:

![Demo Gerenciador de Ambientes](https://user-images.githubusercontent.com/10109480/74032899-d02f4380-4993-11ea-8410-63a2a663d232.png)

[Leia mais](https://github.com/totvs/advpl-vscode/wiki/Gerenciador-de-Ambientes)

## Teclas de Atalho padrões

* F5  - Inicia o Debug
* CTRL + F5  - Inicia o SmartClient sem debugar
* CTRL + F9 - Compila o fonte atual
* CTRL + SHIFT + F9 - Gera o PPO do fonte atual
* CTRL + F11 - Executa o smartClient sem configuração e mostrando a tela de parametros
* ALT + F9 - Compilar fontes Abertos
* SHIFT + ALT + F - Identação de Fonte
* CTRL + K CTRL + F - Identação de Trecho de Código

# No Debug

Utilizada as teclas padrões do VsCode

* F5 - Run/Contiue
* F10 - Step Over
* F11 - Step Into

## Localização

Atualmente as seguintes linguas estão suportadas:

* Português
* Inglês
* Espanhol
* Russo

## Replay

Esté plugin tem a capacidade de reproduzir arquivos gerados pelo Totvs Replay.
Não é possivel gerar o replay pela extensão apenas reproduzir o debug.
Para maiores informações de como utilizar, veja a wiki.


Para mudar a configuração do vscode veja [aqui.](https://code.visualstudio.com/docs/getstarted/locales)

Obs. Para português, é necessario instalar uma extensão da [microsoft.](https://marketplace.visualstudio.com/items?itemName=MS-CEINTL.vscode-language-pack-pt-BR)

Caso você queira contribuir com a localização [veja.](https://github.com/killerall/advpl-vscode/wiki/Localiza%C3%A7%C3%A3o)

# Aviso legal sobre o uso de Tokens e Chaves de compilação

As chaves de compilação ou tokens empregados na construção do Protheus e suas funcionalidades, são de uso restrito dos desenvolvedores de cada módulo.

Em caso de mau uso destas chaves ou tokens, por qualquer outra parte, que não a referida acima, a mesma irá se responsabilizar, direta ou regressivamente, única e exclusivamente, por todos os prejuízos, perdas, danos, indenizações, multas, condenações judiciais, arbitrais e administrativas e quaisquer outras despesas relacionadas ao mau uso, causados tanto à TOTVS, quanto a terceiros, eximindo a TOTVS de toda e qualquer responsabilidade.