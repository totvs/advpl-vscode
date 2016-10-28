# advpl-vscode README

Bem vindo a extensão para desenvolvimento de Advpl no visual code. [VsCode MarketPlace](https://marketplace.visualstudio.com/items?itemName=KillerAll.advpl-vscode)

Essa extensão adiciona suporte a edição, compilação e debugging de ADVPL no Visual Code.

Caso você encontre algum problema, por favor abra uma issue no [GitHub](https://github.com/killerall/advpl-vscode/issues). 

> Atenção! Essa extensão não é desenvolvida ou suportada pela TOTVS. Utilize por sua conta e risco.

> Veja um video explicando a configuração e uso dessa extensão em:

> Existe um migrador de projetos antigos do IDE Totvs (.PRJ) que pode se encontrado aqui.

## Features

Essa extensão possui as seguintes features implementadas:

* Syntax highlighting
* Compilação de fonte
* Chave de Compilação
* Debug single Thread e Multi Thread   
* Compilação de multiplos fontes
* Geração e aplicação de Path [Wiki](https://github.com/killerall/advpl-vscode/wiki/Trabalhando-com-Patchs)

As próximas planejadas são:

* Auto complete
* Mac e Linux



## Requisitos para utilização

Para utilizar os recursos de compilação e debug é necessário que o AppServer esteja na build 131227A ou superior, tendo essa versão de binário tanto o Protheus 11 e 12 são suportados.
Essa extensão ainda não está disponível no Linux. Em OSX o suporte do editor e do debug já esta funcional. 

## Configurações da extensão

Essa extensão contribui com as seguintes configurações.

* `advpl.smartClientPath`: Caminho completo para o diretório do smartclient. Esse diretório precisa possuir o apppre.exe e o smartclient.exe. 

Exemplo: `C:\\Protheus\\smartclient\\`
No caso de OSX:
Exemplo: `/Applications/`


* `advpl.serverVersion`.": Versão do server - Atualmente suporta apenas o 131227A
* `advpl.server`: Server IP, Padrão: localhost                  
* `advpl.port` : Porta do servidor
* `advpl.environment`: Nome do ambiente que será feito o debug e a compilação
* `advpl.language`: Língua do repositório, se não informado será português, valores permitidos: PORTUGUESE, ENGLISH, SPANISH
* `advpl.rpoType`: Tipo do RPO, se não informado será  "TOP", valores permitidos: TOP, CTREE, DBF
* `advpl.user`: Nome do usuário para se conectar no Protheus, se não informado utiliza "Admin"
* `advpl.passwordCipher` : Senha criptografada do usuário de login no Protheus, para gerá-la utilize o comando CipherPassword

    
* `advpl.includeList`: Lista de diretórios separado por ponto-e-vírugla. Exemplo: `C:\\Protheus\\include\\;C:\\Protheus\\include_2\\`
* `advpl.startProgram`: Módulo ou função que será sugerido no launch do Debug
* `compileFolderRegex`: Regex que ira validar se na compilação de folders, o arquivo irá ser compilado ou não.


As variáveis abaixo devem ser preenchidas caso você tenha uma senha de compilação.
Caso você deseje pegar o ID utilizado pelo VSCODE para gerar uma nova chave, veja o comando getAuthorizationId 
* `advpl.authorization_generation`: Data de geração da chave no formato yyyyMMdd
* `advpl.authorization_validation`: Data de validade da chave no formato yyyyMMdd
* `advpl.authorization_permission`: 1 - Para permitir substituir fontes TOTVS, 0 - para não pemitir
* `advpl.authorization_code`: Chave de Autorização

Configuração de Patchs
* `advpl.pathPatchBuild` :  Patch do cliente que deve existir para geracao de patchs. Caso o arquivo ja exista, será sobrescrito.

Debug
* `advpl.debug_multiThread` : Caso seja colocado com true, habilita o debug multi Thread
* `advpl.debug_ignoreSourceNotFound` : Ignorar os fontes não encotrados no debug.

## Configurações

Veja nossa [Wiki](https://github.com/killerall/advpl-vscode/wiki/Configura%C3%A7%C3%A3o)

## Teclas de Atalho padrões
* CTRL + F9 - Compila o fonte atual
* CTRL + F11 - Executa o smartClient sem debugar
* F5  - Inicia o Debug
# No Debug
Utilizada as teclas padrões do VsCode
* F5 - Run/Contiue
* F10 - Step Into
* F11 - Step Over


## Release Notes
### 0.3.3
* Corrigido problema de compilação de folders

### 0.3.1
* Liberado configuração para ignorar fontes não encontrados no debug

### 0.3.0
* Liberado o debug multi Thread : [Não é possível debugar em múltiplas threads](https://github.com/killerall/advpl-vscode/issues/19)
* Melhorias e correções no Debug Issues: [Debug não para em uma user function chamada sem interface na primeira tentativa de debug](https://github.com/killerall/advpl-vscode/issues/1) e [Debug not launch if breakpoints are disabled](https://github.com/killerall/advpl-vscode/issues/27)
* Adicionado mais palavras chaves na Syntax highlighting, e feito a separação entre comandos e funções 

### 0.2.0
* Liberada a funcionalidade de geração e aplicação de patch
* Correção de pequenos problemas no eval do Debug

### 0.1.0

* Liberação Alpha da versão em OSX, não é possivel compilar ainda, apenas debugar.
* [Compilação de pastas](https://github.com/killerall/advpl-vscode/issues/18). Liberada a função de compilar um pasta inteira. Para utiliza, na barra lateral, escolha a pasta que deseja compilar, clique com o botão direito em Advpl - Compile Folder.
O comando iria compilar a pasta e suas sub-pastas, respeitando o Regex configurado em `compileFolderRegex`. 

### 0.0.10 

* Corrigido a data e hora do fonte na compilação [23](https://github.com/killerall/advpl-vscode/issues/23)
* Correção do Readme, a versão do server informada estava errada.
* Melhorias de operadores na Syntax highlighting [24](https://github.com/killerall/advpl-vscode/pull/24)

### 0.0.9 

* Alterado o lunch de debug, pois na versão liberada no VSCODE 1.5 caso carregue o valor padrão da rotina para se debugar, ele não chama o debug.
* Por hora não ira sugerir nenhuma rotina
* Corrigido a avaliação de arrays no watchs.



### 0.0.8 
Corrigido o caminho para o Debug  


### 0.0.7
Correção das issues:  
Compilação com caracteres especiais - [14](https://github.com/killerall/advpl-vscode/issues/14)  
Avaliar Array no Debug - [20](https://github.com/killerall/advpl-vscode/issues/20)  
* Snippets adicionados : Das estruturas basicas do ADVPL  

### 0.0.6
* Implementação do console Advpl - As Messagens da extensão são mostradas nele agora.
* Padronização dos comandos. Todos começam com Advpl para facilitar a busca.
* Inicio da implementação de geração de patch(nada funcional ainda).
* Snippets adicionados : Protheus DOC
* Correções significativas na parte de debug, Correção de Access Violation que o debug as vezes causava no server.

### 0.0.5  
Melhorias nas menssagens quando os diretorios da app esta errado  
Correção da issue [3](https://github.com/killerall/advpl-vscode/issues/3)  
Correção da issue [7](https://github.com/killerall/advpl-vscode/issues/7)  
Correção da issue [9](https://github.com/killerall/advpl-vscode/issues/9)  
Correção da issue [10](https://github.com/killerall/advpl-vscode/issues/10)  

### 0.0.4
Correção da issue [2](https://github.com/killerall/advpl-vscode/issues/2)



### 0.0.1

Versão inicial.


