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

## Localização

### Estrutura

O diretório que conterá os recursos de localização é

`./i18n/{iso639-2}/`

Para maiores informações referentes aos códigos dos países, consulte a [ISO639-2](https://www.loc.gov/standards/iso639-2/php/code_list.php)

Cada recurso de localização deverá ter o caminho relativo equivalente dentro do diretório raiz de localização. Exemplo:

Os recursos de localização em inglês utilizados pelo fonte TypeScript

`./src/advplConsole.ts`

Deverão estar no caminho

`./i18n/enu/out/src/advplConsole.i18n.json`

### Arquivos de configuração JSON

Esses recursos de localização estarão contidos no seguinte arquivo:

`./i18n/{iso639-2}/package.i18n.json`

No arquivo destino da localização, no exemplo, o ./package.json, deverá ser utilizado o seguinte formato:

```json
"description": "%advpl.contributes.debuggers.configurationattributes.launch.properties.stoponentry%",
```

No arquivo de recurso de localização, para a entrada exemplo acima, deverá ser utilizado o seguinte formato:

```json
"advpl.contributes.debuggers.configurationattributes.launch.properties.stoponentry": "Stop automatically at the beginning of Debug?",
```

### Mensagens de programa

AS rotinas que utilizarem localização deverão incluir a biblioteca vscode-nls

```typescript
import * as nls from 'vscode-nls';
const localize = nls.loadMessageBundle();
```

A função de localização deve ser implementada conforme exemplo abaixo:

`./i18n/enu/out/src/advplConsole.i18n.json`

```json
{
    "src.advplConsole.text": "AdvPL Started"
}
```

`./src/advplConsole.ts`

```typescript
this.log(localize('src.advplConsole.text', 'AdvPL Started'));
```

O segundo parâmetro da localize recebe uma mensagem de fallback que será utilizada caso a tradução não seja localizada para a linguagem local. Ela preferencialmente deve estar em inglês.

### Compilação dos recursos de localização

Será necessário instalar o [Gulp](https://gulpjs.com/)

A lista de línguas localizadas está definida no arquivo `./gulpfile.json` no seguinte trecho de código (formato [ISO639-2](https://www.loc.gov/standards/iso639-2/php/code_list.php)):

```js
const languages = ['ptb','enu','rus'];
```

Para compilar os recursos de localização, deve-se executar o seguinte comando:

```bash
$ npm run resources

> advpl-vscode@0.8.0 compile /home/vlopes/dev/github/advpl-vscode
> tsc -p ./ && gulp build

[22:58:01] Using gulpfile ~/dev/github/advpl-vscode/gulpfile.js
[22:58:01] Starting 'build'...
[22:58:01] Starting 'clean'...
[22:58:01] Finished 'clean' after 24 ms
[22:58:01] Starting 'internal-nls-compile'...
[22:58:03] Finished 'internal-nls-compile' after 1.81 s
[22:58:03] Starting 'add-i18n'...
[22:58:03] Finished 'add-i18n' after 35 ms
[22:58:03] Finished 'build' after 1.88 s
```

Ele irá construir arquivos conforme ISO639-3 na raiz do projeto e nos sub-diretórios configurados para cada language especificada no gulpfile.json