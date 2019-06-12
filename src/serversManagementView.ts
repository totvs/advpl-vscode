import * as nls from 'vscode-nls';
const localize = nls.config(process.env.VSCODE_NLS_CONFIG)();

import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import IEnvironment from './utils/IEnvironment';

export default interface IDictionary {
	name: string;
	label: string;
}

export class ServerManagement {

	private _provider: ServerProvider;

	constructor() {
		// Registra os o TreeView
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

	getTreeItem(element: Dependency): vscode.TreeItem {
		return element;
	}

	getChildren(element?: Dependency): Thenable<Dependency[]> {

		if (element) {
			return Promise.resolve(this.getServersInConfiguration(element.server));
		} else {
			return Promise.resolve(this.getServersInConfiguration());
		}

	}

	private getServersInConfiguration(serverChild?: string): Dependency[] {
		const config = vscode.workspace.getConfiguration("advpl");
		const environments = config.get<Array<IEnvironment>>("environments").filter(env => env.enable !== false);
		const dictionary = config.get<Array<IDictionary>>("environmentsDictionary");
		const selectedEnvironment = config.get<string>("selectedEnvironment");

		let servers = Array<Dependency>();

		const toDep = (server: string, isChild?: boolean): Dependency => {
			let serverLabel = dictionary.find(dic => dic.name.trim() === server.trim());

			if (isChild) {
				return new Dependency(server, server, vscode.TreeItemCollapsibleState.None, 'environment', server.trim() === selectedEnvironment.trim());
			} else {
				return new Dependency(server, serverLabel ? serverLabel.label : server, vscode.TreeItemCollapsibleState.Expanded);
			}

		};

		if (serverChild) {
			environments.filter(env => env.server === serverChild).forEach(dep => {
				if (!servers.find(srv => srv.server === dep.server)) {
					servers.push(toDep(dep.name ? dep.name : dep.environment, true));
				}
			});
		} else {
			environments.forEach(dep => {
				if (!servers.find(srv => srv.server === dep.server)) {
					servers.push(toDep(dep.server));
				}
			});
		}

		return servers;
	}

}

export class Dependency extends vscode.TreeItem {

	constructor(
		public readonly server: string,
		public readonly label: string,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState,
		public readonly contextValue?: string,
		public readonly isConnected?: boolean
	) {
		super(label, collapsibleState);
	}

	get tooltip(): string {
		return this.label;
	}

	get description(): string {
		return this.contextValue === "environment" ? "" : this.server;
	}

	iconPath = {
		light: path.join(__filename, '..', '..', '..', 'images', 'light', this.getIcon()),
		dark: path.join(__filename, '..', '..', '..', 'images', 'dark', this.getIcon())
	};

	private getIcon(): string {
		if (this.contextValue === "environment") {
			return this.isConnected ? "server.connected.svg" : "server.svg";
		} else {
			return "dependency.svg";
		}
	}
}
