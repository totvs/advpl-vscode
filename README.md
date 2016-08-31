# advpl-vscode README

Bem vindo a extensão para desenvolvimento de Advpl no visual code.

Essa extensão adiciona suporte a edição, compilação e debugging de ADVPL no Visual Code.

Caso você encontre algum problema, por favor abra uma issue no GitHub. 

> Atenção! Essa extensão não é desenvolvida ou suportada pela TOTVS. Utilize por sua conta e risco.

> Veja um video explicando a configuração e uso dessa extensão em: xxxxxxxxxxx

> Existe um migrador de projetos antigos do IDE Totvs (.PRJ) que pode se encontrado aqui.

## Features

Essa extensão possui as seguintes features implementadas:

* Syntax highlighting
* Compilação de fonte
* Chave de Compilação
* Debug single Thread  

As próximas planejadas são:
* Compilação de multiplos fontes
* Multi Thread Debug
* Auto complete
* Suporte a Mac e Linux


## Requisitos para utilização

Para utilizar os recursos de compilação e debug é necessário que o AppServer esteja na build 131327A ou superior, tendo essa versão de binário
tanto o Protheus 11 e 12 são suportados.
Essa extensão ainda não está disponível em MAC ou Linux. 

## Configurações da extensão

Essa extensão contribui com as seguintes configurações.

* `advpl.smartClientPath`: Caminho completo para o diretório do smartclient. Esse diretório precisa possuir o apppre.exe e o smartclient.exe. Exemplo: `C:\\Protheus\\smartclient\\`
* `advpl.environment`: Nome do ambiente que será feito o debug e a compilação
* `advpl.language`: Língua do repositório, se não informado será português, valores permitidos: PORTUGUESE, ENGLISH, SPANISH
* `advpl.rpoType`: Tipo do RPO, se não informado será  "TOP", valores permitidos: TOP, CTREE, DBF
* `advpl.user`: Nome do usuário para se conectar no Protheus, se não informado utiliza "Admin"
* `advpl.passwordCipher` : Senha criptografada do usuário de login no Protheus, para gerá-la utilize o comando CipherPassword

    
* `advpl.includeList`: Lista de diretórios separado por ponto-e-vírugla. Exemplo: `C:\\Protheus\\include\\;C:\\Protheus\\include_2\\`
* `advpl.startProgram`: Módulo ou função que será sugerido no launch do Debug



As variáveis abaixo devem ser preenchidas caso você tenha uma senha de compilação.
Caso você deseje pegar o ID utilizado pelo VSCODE para gerar uma nova chave, veja o comando getAuthorizationId 
* `advpl.authorization_generation`: Data de geração da chave no formato yyyyMMdd
* `advpl.authorization_validation`: Data de validade da chave no formato yyyyMMdd
* `advpl.authorization_permission`: 1 - Para permitir substituir fontes TOTVS, 0 - para não pemitir
* `advpl.authorization_code`: Chave de Autorização


## Issues conhecidas

* 1 [Debug não para em uma user function chamada sem interface na primeira tentativa de debug](https://github.com/killerall/advpl-vscode/issues/1)- 

## Release Notes

### 0.0.1

Versão inicial. 
