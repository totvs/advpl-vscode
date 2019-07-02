import * as nls from 'vscode-nls';
const localize = nls.config(process.env.VSCODE_NLS_CONFIG)();

import * as vscode from 'vscode';
import * as path from 'path';
import { ServerManagement, Context, ServerView, ServiceView } from './serverManagement';
import { IniManagement } from './iniManagement';
import IDictionary from './utils/IDictionary';

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
		let oldLabel = element.label;

		let options: vscode.InputBoxOptions = {
			prompt: "Renomear",
			placeHolder: oldLabel,
			validateInput: function (newLabel: string) {

				let dictionary = config.get<Array<IDictionary>>("dictionary");

				if (dictionary.find(dic => dic.label.trim() === newLabel.trim())) {
					return "Este Label já está sendo utilizado.";
				}

				return "";
			}
		}

		vscode.window.showInputBox(options).then(newLabel => {
			//FIXME: Não permitir Labels iguais.

			// Caso seja um elemento do nível servidor
			if (element.subject instanceof ServerView) {
				let dictionary = config.get<Array<IDictionary>>("dictionary");
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
				// FIXME: Alterar para trocar no workspace
				config.update('dictionary', dictionary, true);

			} else if (element.subject instanceof ServiceView) {
				let dictionary = config.get<Array<IDictionary>>("dictionary");
				let obj = <ServiceView>element.subject;
				let dictionaryPos = dictionary.findIndex(dic => dic.name === obj.servicePort.toString());

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
				// FIXME: Alterar para trocar no workspace
				config.update('dictionary', dictionary, true);
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
			// return Promise.resolve(this.getServersInConfiguration(element.server, element.context));
		} else {
			return Promise.resolve(this.getEnvironments());
			// return Promise.resolve(this.getServersInConfiguration());
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
