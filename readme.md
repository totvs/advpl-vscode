# advpl-vscode README

Essa extensão adiciona suporte a edição, compilação e debugging de ADVPL no Visual Code.

> Atenção! Essa extensão não é desenvolvida ou suportada pela TOTVS. Utilize por sua conta e risco.

## Development setup
- run npm install inside the `advpl` and `advpl-server` folders
- open VS Code on `advpl` and `advpl-server`

## Developing the server
- open VS Code on `advpl-server`
- run `npm run compile` or `npm run watch` to build the server and copy it into the `advpl` folder
- to debug press F5 which attaches a debugger to the server

## Developing the extension/client
- open VS Code on `advpl`
- run F5 to build and debug the extension