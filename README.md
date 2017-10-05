# Advpl Language Support

Bem vindo a extensão para desenvolvimento de Advpl no visual code. [VsCode MarketPlace](https://marketplace.visualstudio.com/items?itemName=KillerAll.advpl-vscode)

Essa extensão adiciona suporte a edição, compilação e debugging de ADVPL no Visual Code.

Caso você encontre algum problema, por favor abra uma issue no [GitHub](https://github.com/killerall/advpl-vscode/issues). 

> Atenção! Essa extensão não é desenvolvida ou suportada pela TOTVS. Utilize por sua conta e risco.

> Existe um migrador de projetos antigos do IDE Totvs (.PRJ) que pode se encontrado [aqui](https://github.com/killerall/advpl-vscode/blob/master/TDSProjectToVscode.jar).

> Caso esteje com problema para debugar, apos a atualização do VSCODE 1.10 apague o launch.json e o recrie dando F5.


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
* Mac OSX (Configuração a baixo)

As próximas planejadas são:

* Auto complete
* Linux


## Requisitos para utilização

Para utilizar os recursos de compilação e debug é necessário que o AppServer esteja na build 131227A ou superior, tendo essa versão de binário tanto o Protheus 11 e 12 são suportados.
Essa extensão ainda não está disponível no Linux. 

## Configurações

Veja nossa [Wiki](https://github.com/killerall/advpl-vscode/wiki/Configura%C3%A7%C3%A3o)

## Teclas de Atalho padrões
* F5  - Inicia o Debug
* CTRL + F5  - Inicia o SmartClient sem debugar
* CTRL + F9 - Compila o fonte atual
* CTRL + SHIFT +  F9 - Compila o fonte atual
* CTRL + F11 - Executa o smartClient sem configuração e mostrando a tela de parametros

# No Debug
Utilizada as teclas padrões do VsCode
* F5 - Run/Contiue
* F10 - Step Into
* F11 - Step Over

## Para versão MAC
Efetuar o download do [executavel](https://github.com/killerall/advpl-vscode/raw/master/bin/AdvplDebugBridgeMac)
Copiar o mesmo para a pasta:
~/.vscode/extensions/KillerAll.advpl-vscode-x.x.x/bin
Dar acesso a execução no arquivo.
