import * as nls from 'vscode-nls';
const localize = nls.config(process.env.VSCODE_NLS_CONFIG)();

import * as vscode from 'vscode';
import * as path from 'path';
import IEnvironment from './utils/IEnvironment';

export default interface IDictionary {
	name: string;
	label: string;
	parent: string;
}

export enum Context {
	Server = "Server",
	Service = 'Service',
	Environment = "Environment"
}

export class Server {

	constructor(
		public readonly serverName?: string,
		public readonly serverIP?: string,
		public readonly services?: Service[],
		public isConnected?: boolean) {
	}

	public AddService(service: Service): number {
		return this.services.push(service);
	}
}

export class Service {

	constructor(
		public readonly serviceName?: string,
		public readonly servicePort?: string,
		public readonly environments?: Environment[],
		public isConnected?: boolean) {
	}

	public AddEnvironment(environment: Environment): number {
		return this.environments.push(environment);
	}
}

export class Environment {

	constructor(
		public readonly environmentLabel?: string,
		public readonly environmentName?: string,
		public readonly environment?: string,
		public isConnected?: boolean) {
	}
}

export function getServers(): Server[] {
	const config = vscode.workspace.getConfiguration("advpl");
	const environments = config.get<Array<IEnvironment>>("environments").filter(env => env.enable !== false);
	const dictionary = config.get<Array<IDictionary>>("environmentsDictionary");
	const selectedEnvironment = config.get<string>("selectedEnvironment");

	let servers = Array<Server>();

	// Percorre as configurações de ambiente
	environments.forEach(environment => {

		// Verifica se o Servidor (IP) já foi inserido
		let positionServer = servers.findIndex(server => server.serverIP === environment.server);

		// Se o servidor não existe, adiciona o mesmo no array
		if (positionServer < 0) {
			// Busca o Alias configurado para o Servidor
			let serverLabel = dictionary.find(dic => dic.name.trim() === environment.server.trim());

			positionServer = servers.push(
				new Server(
					serverLabel ? serverLabel.label : environment.server,
					environment.server,
					[]
				)
			) - 1;

		}

		// ---------------------------------------------------------------------------------------------------------------------------------------

		// Verifica se o Serviço (porta) já foi inserido
		let positionService = servers[positionServer].services.findIndex(service => service.servicePort === environment.port.toString());

		if (positionService < 0) {
			// Busca o Alias configurado para o Serviço
			let serviceLabel = dictionary.find(dic => /*dic.parent.trim() === environment.server.trim() &&*/ dic.name.trim() === environment.port.toString());

			positionService = servers[positionServer].AddService(
				new Service(
					serviceLabel ? serviceLabel.label : environment.port.toString(),
					environment.port.toString(),
					[]
				)
			) - 1;

		}

		// ---------------------------------------------------------------------------------------------------------------------------------------

		// Verifica se o Ambiente (RPO) já foi inserido
		let positionEnvironment = servers[positionServer].services[positionService].environments.findIndex(env => env.environment === environment.environment);

		if (positionEnvironment < 0) {
			// Guarda o alias do ambiente ou nome (Prevalece sempre o alias == environment.name)
			let environmentLabel = environment.name ? environment.name : environment.environment;

			positionEnvironment = servers[positionServer].services[positionService].AddEnvironment(
				new Environment(
					environmentLabel,
					environment.name,
					environment.environment,
					environmentLabel === selectedEnvironment.trim()
				)
			) - 1;

		}

		// Verifica se foi adicionado um ambiente
		if (positionEnvironment >= 0) {

			// Verifica se o ambiente está conectado, e "conecta" os pais
			if (servers[positionServer].services[positionService].environments[positionEnvironment].isConnected) {
				servers[positionServer].isConnected = true;
				servers[positionServer].services[positionService].isConnected = true;
			}

		}

	});

	return servers;
}

export class ServerManagement {

	private _provider: ServerProvider;

	constructor() {
		// Grava a instancia do Server Provider para registrar
		this._provider = new ServerProvider();

		// Registra o comando de conexão ao ambiente
		vscode.commands.registerCommand("advpl.serversManagement.connect", (element) => this.connect(element));
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
		let servers = getServers();

		const toDep = (label, description, tooltip, isConnected, context: Context, owner: string): Dependency => {

			if (context === Context.Environment) {
				return new Dependency(label, description, tooltip, vscode.TreeItemCollapsibleState.None, context, isConnected, owner);
			} else {
				return new Dependency(label, description, tooltip, vscode.TreeItemCollapsibleState.Expanded, context, isConnected, owner);
			}

		};

		// Caso não tenha sido repassado nenhum elemento, o item é o primeiro Pai
		if (childElement) {
			switch (childElement.context) {
				case Context.Server:
					servers.find(server => server.serverName === childElement.label).services.map(
						service => environments.push(
							toDep(
								service.serviceName,
								service.servicePort,
								service.serviceName,
								service.isConnected,
								Context.Service,
								childElement.label
							)
						)
					);

					break;

				case Context.Service:
					servers.find(server => server.serverName === childElement.owner).services.find(
						service => service.serviceName === childElement.label
					).environments.map(
						environment => environments.push(
							toDep(
								environment.environmentLabel,
								environment.environment,
								environment.environmentLabel,
								environment.isConnected,
								Context.Environment,
								childElement.label
							)
						)
					);

					break;
			}

		} else {
			servers.map(
				server => environments.push(
					toDep(server.serverName,
						server.serverIP,
						server.serverName,
						server.isConnected,
						Context.Server,
						""
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
		public readonly owner?: string
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
		if (this.context === Context.Environment) {
			return this.isConnected ? "server_green.svg" : "server.svg";
		} else {
			return this.isConnected ? "dependency_green.svg" : "dependency.svg";
		}
	}
}
