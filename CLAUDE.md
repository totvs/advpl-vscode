# CLAUDE.md — advpl-vscode

Extensão VS Code para desenvolvimento ADVPL/4GL/TLPP (TOTVS Protheus).
Publisher: KillerAll | Versão atual: 0.17.0

## Build e execução

```bash
npm install              # instalar dependências
npm run compile          # compilar TypeScript → out/
npm run vscode:prepublish # build completo (tsc + gulp)
```

Pressione F5 no VS Code para abrir uma janela de extensão em modo debug.

## Testes

```bash
# Abrir Debug viewlet (Ctrl+Shift+D) → selecionar "Launch Tests" → F5
```

Arquivos de teste ficam em `/test/`, convenção `**.test.ts`, runner Mocha.

## Estrutura do projeto

```
src/
  extension.ts              # Ponto de entrada (activate()), ~1372 linhas
  advplCompile.ts           # Motor de compilação
  advplPatch.ts             # Geração e aplicação de patches
  advplMonitor.ts           # Monitoramento RPO/threads
  serversManagementView.ts  # UI tree view de ambientes
  serverManagement.ts       # Modelos de dados (servidor/ambiente/serviço)
  Environment.ts            # Status bar de ambiente
  authorizationFile.ts      # Gerenciamento de chaves de compilação
  smartClientLaunch.ts      # Integração com SmartClient
  MultiThread.ts            # Status bar para debug multi-thread
  advplConsole.ts           # Canal de output
  whatsNew.ts               # Página "What's New"
  codeFormat/
    formatting.ts           # Provedores de formatação (documento/range)
    formmatingRules.ts      # Motor de regras de indentação
  replay/
    replaySelect.ts         # Seleção de arquivo de replay
    replaytTimeLineTree.ts  # TreeDataProvider da timeline
    replayUtil.ts           # Utilitários de replay
  prompts/                  # Sistema de prompts interativos (factory pattern)
  utils/                    # Helpers (debugBridge path, filesLocation, interfaces)
  commands/                 # Handlers de comandos individuais
bin/
  AdvplDebugBridge.exe      # Executável bridge do debugger (processo externo)
syntaxes/                   # Gramáticas TextMate (ADVPL, 4GL, TLPP)
snippets/                   # Snippets de código ADVPL
i18n/                       # Strings de localização (pt-br, en, es, ru)
out/                        # Saída compilada (gerado, não versionar)
```

## Arquitetura e padrões

- **Extensão VS Code** pura — sem LSP ativo em produção (código LSP existe mas está comentado)
- **Debug via processo externo**: `AdvplDebugBridge.exe` (Windows) / equivalente (Linux/Mac) é spawned via `child_process.spawn()`
- **Classes OOP**: módulos exportam classes com responsabilidades únicas
- **Factory pattern**: `prompts/factory.ts` para inputs interativos
- **Provider pattern VS Code**: `TreeDataProvider`, `DocumentFormattingEditProvider`, `DebugAdapterDescriptorFactory`, `EvaluatableExpressionProvider`
- **i18n via vscode-nls**: strings em `package.nls.*.json` e `i18n/`

## Comandos VS Code registrados (~70+)

Todos prefixados com `advpl.`. Exemplos:
- `advpl.compile` — Compilar arquivo atual
- `advpl.menucompilemulti` — Compilar múltiplos arquivos
- `advpl.applyPatch` / `advpl.buildPatch` — Gerenciamento de patches
- `advpl.startSmartClient` — Iniciar SmartClient

## Atalhos importantes

| Atalho | Ação |
|--------|------|
| `Ctrl+F9` / `Cmd+F9` | Compilar arquivo atual |
| `Ctrl+Shift+F9` | Gerar PPO |
| `F5` | Iniciar debug |
| `Ctrl+F11` | Iniciar SmartClient |
| `Shift+Alt+F` | Formatar documento |

## Linguagens suportadas

- **ADVPL** — `.prw`, `.prx`, `.prg`, `.apw`, `.aph`
- **4GL** — `.4gl`
- **TLPP** — `.tres`, `.tlpp`

## Versões de servidor Protheus suportadas

`131227A`, `170117A`, `191205P`, `210324P`, `240223P`

## Dependências principais

```json
"vscode-languageclient": LSP client (infraestrutura, não ativo)
"vscode-nls": internacionalização
"sql-formatter-plus": formatação de SQL embutido
"semver": versionamento semântico
```

## Convenções

- TypeScript ES6, CommonJS modules
- Saída em `out/` (nunca commitar)
- Encoding legado `windows1252` para compatibilidade com Protheus
- Evitar usar `console.log` — usar `advplConsole` ou output channels do VS Code
- i18n obrigatório para strings visíveis ao usuário (via `vscode-nls`)
