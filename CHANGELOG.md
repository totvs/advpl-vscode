## 0.4.8
 - Liberação da versão MAC atualizada
 - Feito melhoria de perguntar se o usuario quer salvar o arquivo ao compilar, caso o mesmo não esteja salvo

## 0.4.6
 - Correção na aplicação de patch
 - Correção na compilação de pasta com apenas resources
 - Leitura do encoding no ambiente, para ser possivel compilar em 1251 e utf8 tambem.

## 0.4.5
 - Correção da validação de compilação

## 0.4.3
 - Correção da Correção;

## 0.4.2
 - Corrigido pequenos problemas;
 - Implementação inicial para disponibilizar a lista de fonte e resources do rpo.

## 0.4.1
 - Corrigido a geração de alguns IDs de cipth, que não deixa a extensão funcionar.
 - Liberado [Trazer última execução quando for debugar](https://github.com/killerall/advpl-vscode/issues/15)

## 0.4.0
 - Liberado a possibilidade de configuração de diversos Enviroments, adicionado possiblidade de seleção do ambiente atual;
 - Reconstrução do Launch agora com e sem Debug (Agora para executar o smartclient com as mesmas configurações 
 do debug, porem sem debugar, pode-se utilizar o ctrl+F5);
 - Correção de como o Debug se comportava em relação aos breakpoints, que causava quedas estranhas no debug.
 - Atualização da extensão para ultima versão do TypeScript;

## 0.3.8
 - Adicionado validação caso a string de include estiver errada.

## 0.3.7
 - Correção de colateral do colateral da 0.3.6
 - Correção [Warnings estão sendo exibidos como erro no output](https://github.com/killerall/advpl-vscode/issues/43)

## 0.3.6
 - Correção de colateral de não compilar da 0.3.5

## 0.3.5

 - Adiciona possibilidade de se visualizar as [tabelas](https://github.com/killerall/advpl-vscode/issues/37) e variáveis publics, statics, e privates no Debug 
 - Adicionado snipett de case via [pull request](https://github.com/killerall/advpl-vscode/pull/41) 
 - Correção de compilação com folders ou arquivos com [espaço no nome](https://github.com/killerall/advpl-vscode/issues/39) e [fonte não compila](https://github.com/killerall/advpl-vscode/issues/36)
 - Correção [Not showing error message when missing or wrong passwordCipher](https://github.com/killerall/advpl-vscode/issues/6)

## 0.3.4
 - Corrigido problema de compilação de folders quando tinha caracteres especias no nome da folder

## 0.3.3
 - Corrigido problema de compilação de folders

## 0.3.1
 - Liberado configuração para ignorar fontes não encontrados no debug

## 0.3.0
 - Liberado o debug multi Thread : [Não é possível debugar em múltiplas threads](https://github.com/killerall/advpl-vscode/issues/19)
 - Melhorias e correções no Debug Issues: [Debug não para em uma user function chamada sem interface na primeira tentativa de debug](https://github.com/killerall/advpl-vscode/issues/1) e [Debug not launch if breakpoints are disabled](https://github.com/killerall/advpl-vscode/issues/27)
 - Adicionado mais palavras chaves na Syntax highlighting, e feito a separação entre comandos e funções 

## 0.2.0
 - Liberada a funcionalidade de geração e aplicação de patch
 - Correção de pequenos problemas no eval do Debug

## 0.1.0

 - Liberação Alpha da versão em OSX, não é possivel compilar ainda, apenas debugar.
 - [Compilação de pastas](https://github.com/killerall/advpl-vscode/issues/18). Liberada a função de compilar um pasta inteira. Para utiliza, na barra lateral, escolha a pasta que deseja compilar, clique com o botão direito em Advpl - Compile Folder.
O comando iria compilar a pasta e suas sub-pastas, respeitando o Regex configurado em `compileFolderRegex`. 

## 0.0.10 

 - Corrigido a data e hora do fonte na compilação [23](https://github.com/killerall/advpl-vscode/issues/23)
 - Correção do Readme, a versão do server informada estava errada.
 - Melhorias de operadores na Syntax highlighting [24](https://github.com/killerall/advpl-vscode/pull/24)

## 0.0.9 

 - Alterado o lunch de debug, pois na versão liberada no VSCODE 1.5 caso carregue o valor padrão da rotina para se debugar, ele não chama o debug.
 - Por hora não ira sugerir nenhuma rotina
 - Corrigido a avaliação de arrays no watchs.

## 0.0.8 
 - Corrigido o caminho para o Debug  

## 0.0.7
Bugfixes:  
 - Compilação com caracteres especiais - [14](https://github.com/killerall/advpl-vscode/issues/14)  
 - Avaliar Array no Debug - [20](https://github.com/killerall/advpl-vscode/issues/20)  
Features:
 - Snippets adicionados : Das estruturas basicas do ADVPL  

## 0.0.6
 - Implementação do console Advpl - As Messagens da extensão são mostradas nele agora.
 - Padronização dos comandos. Todos começam com Advpl para facilitar a busca.
 - Inicio da implementação de geração de patch(nada funcional ainda).
 - Snippets adicionados : Protheus DOC
 - Correções significativas na parte de debug, Correção de Access Violation que o debug as vezes causava no server.

## 0.0.5  
 - Melhorias nas menssagens quando os diretorios da app esta errado  
 - Correção da issue [3](https://github.com/killerall/advpl-vscode/issues/3)  
 - Correção da issue [7](https://github.com/killerall/advpl-vscode/issues/7)  
 - Correção da issue [9](https://github.com/killerall/advpl-vscode/issues/9)  
 - Correção da issue [10](https://github.com/killerall/advpl-vscode/issues/10)  

## 0.0.4
 - Correção da issue [2](https://github.com/killerall/advpl-vscode/issues/2)

## 0.0.1
 - Versão inicial.
