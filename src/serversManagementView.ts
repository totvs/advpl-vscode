import * as nls from 'vscode-nls';
const localize = nls.config(process.env.VSCODE_NLS_CONFIG)();

import * as vscode from 'vscode';
import * as path from 'path';
import { ServerManagement, Context, ServerView, ServiceView, EnvironmentView } from './serverManagement';
import { IniManagement } from './iniManagement';
import IDictionary from './utils/IDictionary';
import IEnvironment from './utils/IEnvironment';

export class ServerManagementView {

	private _provider: ServerProvider;

	constructor() {
		// Grava a instancia do Server Provider para registrar
		this._provider = new ServerProvider();

		// Registra o comando de conexão ao ambiente
		vscode.commands.registerCommand("advpl.serversManagement.connect", (element) => this.connect(element));
		// Registra o comando para obter e configurar todos os ambientes do INIs
		vscode.commands.registerCommand("advpl.serversManagement.getAllEnvironments", (element) => this.getAllEnvironments(element));
		// Registra o comando para renomear os ambientes/servidores ou serviços
		vscode.commands.registerCommand("advpl.serversManagement.rename", (element) => this.rename(element));
	}

	get provider() {
		return this._provider;
	}

	public connect(element: Dependency) {
		let updObj = vscode.workspace.getConfiguration("advpl");

		// Atualiza a configuração de ambiente selecionado
		updObj.update("selectedEnvironment", element.label);
		vscode.window.showInformationMessage(localize('src.extension.environmentText', 'Environment') + element.label + localize('src.extension.environmentSelectedText', ' selection was successful.'));
	}

	public getAllEnvironments(element: Dependency) {
		let serverManagement = new ServerManagement(false);
		let ini = new IniManagement();

		if (element.context !== Context.ServiceConnected) {
			vscode.window.showErrorMessage("Esta opção só pode ser utilizada para um item de Serviço.");
			return;
		}

		vscode.window.withProgress({
			location: vscode.ProgressLocation.Window,
			title: "Carregando ambientes...",
			cancellable: false
		}, (progress, token) => {
			token.onCancellationRequested(() => {
				console.log("User canceled the long running operation");
			});

			return new Promise(resolve => {
				// Busca o conteúdo do INI
				ini.GetIniContent().then(() => {

					// Busca todos os ambientes
					ini.GetEnvironments();

					ini.Environments.map(
						env => {
							let service = <ServiceView>element.subject;

							// Verifica se o ambiente já está configurado
							if (!service.environments.find(_env => _env.environment === env.Environment)) {

								// Adiciona nas configurações os ambientes do INI
								serverManagement.AddEnvironment(
									{
										environment: env.Environment,
										name: env.Environment,
										server: service.parent.serverIP,
										port: service.servicePort,
										serverVersion: service.serverVersion,
										passwordCipher: service.passwordCipher,
										includeList: service.includeList,
										user: service.user,
										smartClientPath: service.smartClientPath,
										enable: true
									}
								);
							}
						}
					);

					resolve();
				});
			});

		});

	}

	rename(element: Dependency): any {
		let config = vscode.workspace.getConfiguration("advpl");
		let dictionary = config.get<Array<IDictionary>>("dictionary");
		let environments = config.get<Array<IEnvironment>>("environments");
		let oldLabel = element.label;

		let options: vscode.InputBoxOptions = {
			prompt: "Renomear",
			placeHolder: oldLabel,
			validateInput: function (newLabel: string) {

				// Não permite label vazio
				if (!newLabel) {
					return "Informe o Label para alterar."
				}

				// Verifica se o Label já foi utilizado no dicionário de Servidores/Serviços
				if (dictionary.find(dic => dic.label.toUpperCase().trim() === newLabel.toUpperCase().trim())) {
					return "Este Label já está sendo utilizado.";
				}

				// Valida se o nome para o ambiente já foi utilizado
				if (environments.find(env => retEnv(env).toUpperCase().trim() === newLabel.toUpperCase().trim())) {
					return "Este Label já está sendo utilizado em um ambiente.";
				}

				/**
				 * Verifica se no ambiente está informado o atributo nome,
				 * trata desta forma para evitar erros caso essa propriedade
				 * seja null.
				 */
				function retEnv(env: IEnvironment) {
					if (env.name)
						return env.name;
					else
						return env.environment;
				}

				return "";
			}
		}

		// Mostra um input para o usuário informar o novo label
		vscode.window.showInputBox(options).then(newLabel => {
			// Altera somente quando o Label for prenchido
			if (newLabel) {

				// Caso seja um elemento do nível servidor
				if (element.subject instanceof ServerView) {
					let obj = <ServerView>element.subject;
					let dictionaryPos = dictionary.findIndex(dic => dic.name === obj.serverIP);

					if (dictionaryPos > -1) {
						dictionary[dictionaryPos].label = newLabel;
					} else {
						dictionary.push({
							"label": newLabel,
							"name": obj.serverIP
						});
					}

					// Atualiza o dicionário de elementos
					config.update('dictionary', dictionary);

				} else if (element.subject instanceof ServiceView) {
					let obj = <ServiceView>element.subject;
					let dictionaryPos = dictionary.findIndex(dic => validParent(dic) && dic.name === obj.servicePort.toString());

					/**
                 	 * Valida o atributo parent dessa forma para evitar erros
                 	 * caso essa propriedade seja null.
                 	 */
					function validParent(dic: IDictionary) {
						if (dic.parent)
							return dic.parent.trim() === obj.parent.serverIP.trim();
						else
							return true;
					}

					if (dictionaryPos > -1) {
						dictionary[dictionaryPos].label = newLabel;
					} else {
						dictionary.push({
							"label": newLabel,
							"name": obj.servicePort.toString(),
							"parent": obj.parent.serverIP
						});
					}

					// Atualiza o dicionário de elementos
					config.update('dictionary', dictionary);

				} else if (element.subject instanceof EnvironmentView) {
					let obj = <EnvironmentView>element.subject;

					// Busca o ambiente relacionado ao serviço + servidor
					environments.find(
						env => env.environment === obj.environment &&
							env.port === obj.parent.servicePort &&
							env.server === obj.parent.parent.serverIP
					).name = newLabel;

					// Atualiza o dicionário de elementos
					config.update('environments', environments);

					// Caso o sujeito já esteja conectado, conecta novamente.
					if (obj.isConnected) {
						// Cria um novo elemento, para utilizá-lo para conectar no ambiente
						let newElement = new Dependency(newLabel,
							element.description,
							element.tooltip,
							element.collapsibleState,
							element.context,
							element.isConnected,
							element.owner,
							element.subject);
						this.connect(newElement);
					}
				}
			}
		});

	}

}

export class ServerProvider implements vscode.TreeDataProvider<Dependency> {

	private _onDidChangeTreeData: vscode.EventEmitter<Dependency | undefined> = new vscode.EventEmitter<Dependency | undefined>();
	readonly onDidChangeTreeData: vscode.Event<Dependency | undefined> = this._onDidChangeTreeData.event;

	refresh(): void {
		this._onDidChangeTreeData.fire();
	}

	getTreeItem(element: Dependency): Dependency {
		return element;
	}

	getChildren(element?: Dependency): Thenable<Dependency[]> {

		if (element) {
			return Promise.resolve(this.getEnvironments(element, element.context));
		} else {
			return Promise.resolve(this.getEnvironments());
		}

	}

	private getEnvironments(childElement?: Dependency, context?: Context): Dependency[] {
		let environments = Array<Dependency>();
		let servers = new ServerManagement(true).servers;
		let objectParent;

		const toDep = (label, description, tooltip, isConnected, context: Context, owner: string, subject: Object): Dependency => {

			if (context === Context.Environment || context === Context.EnvironmentConnected) {
				return new Dependency(label, description, tooltip, vscode.TreeItemCollapsibleState.None, context, isConnected, owner, subject);
			} else {
				return new Dependency(label, description, tooltip, vscode.TreeItemCollapsibleState.Expanded, context, isConnected, owner, subject);
			}

		};

		// Caso não tenha sido repassado nenhum elemento, o item é o primeiro Pai
		if (childElement) {
			if (childElement.context == Context.Server || childElement.context == Context.ServerConnected) {
				objectParent = <ServerView>servers.find(server => server.serverName === childElement.label);

				objectParent.services.map(
					service => environments.push(
						toDep(
							service.serviceName,
							service.servicePort,
							service.serviceName,
							service.isConnected,
							service.isConnected ? Context.ServiceConnected : Context.Service,
							childElement.label,
							service
						)
					)
				);
			}
			else if (childElement.context == Context.Service || childElement.context == Context.ServiceConnected) {
				objectParent = <ServiceView>servers.find(
					server => server.serverName === childElement.owner
				).services.find(
					service => service.serviceName === childElement.label
				);

				objectParent.environments.map(
					environment => environments.push(
						toDep(
							environment.environmentLabel,
							environment.environment,
							environment.environmentLabel,
							environment.isConnected,
							environment.isConnected ? Context.EnvironmentConnected : Context.Environment,
							childElement.label,
							environment
						)
					)
				);
			}

		} else {
			servers.map(
				server => environments.push(
					toDep(server.serverName,
						server.serverIP,
						server.serverName,
						server.isConnected,
						server.isConnected ? Context.ServerConnected : Context.Server,
						"",
						server
					)
				)
			);
		}

		return environments;
	}
}

export class Dependency extends vscode.TreeItem {

	constructor(
		public readonly label: string,
		public readonly description: string,
		public readonly tooltip: string,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState,
		public readonly context?: Context,
		public readonly isConnected?: boolean,
		public readonly owner?: string,
		public readonly subject?: Object
	) {
		super(label, collapsibleState);
	}

	get contextValue(): string {
		return Context[this.context];
	}

	iconPath = {
		light: path.join(__filename, '..', '..', '..', 'images', 'light', this.getIcon()),
		dark: path.join(__filename, '..', '..', '..', 'images', 'dark', this.getIcon())
	};

	private getIcon(): string {
		if (this.context === Context.Environment || this.context === Context.EnvironmentConnected) {
			return this.isConnected ? "server_green.svg" : "server.svg";
		} else {
			return this.isConnected ? "dependency_green.svg" : "dependency.svg";
		}
	}
}
