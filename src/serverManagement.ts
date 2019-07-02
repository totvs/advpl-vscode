import * as vscode from 'vscode';
import IEnvironment from './utils/IEnvironment';
import IDictionary from './utils/IDictionary';

export enum Context {
    Server = "Server",
    Service = "Service",
    Environment = "Environment",
    ServerConnected = "ServerConnected",
    ServiceConnected = "ServiceConnected",
    EnvironmentConnected = "EnvironmentConnected"
}

export class ServerView {

    constructor(
        public readonly serverName?: string,
        public readonly serverIP?: string,
        public readonly services?: ServiceView[],
        public isConnected?: boolean) {
    }

    public AddService(service: ServiceView): number {
        return this.services.push(service);
    }
}

export class ServiceView {

    constructor(
        public readonly serviceName?: string,
        public readonly servicePort?: number,
        public readonly environments?: EnvironmentView[],
        public readonly serverVersion?: string,
        public readonly passwordCipher?: string,
        public readonly includeList?: string,
        public readonly user?: string,
        public readonly smartClientPath?: string,
        public isConnected?: boolean,
        public parent?: ServerView) {
    }

    public AddEnvironment(environment: EnvironmentView): number {
        return this.environments.push(environment);
    }
}

export class EnvironmentView {

    constructor(
        public readonly environmentLabel?: string,
        public readonly environmentName?: string,
        public readonly environment?: string,
        public isConnected?: boolean,
        public parent?: ServiceView) {
    }
}

export class ServerManagement {
    private _config: vscode.WorkspaceConfiguration;
    private _environments: Array<IEnvironment>;
    private _dictionary: Array<IDictionary>;
    private _selectedEnvironment: string;

    private _servers: ServerView[];
    public get servers(): ServerView[] {
        return this._servers;
    }

    constructor(onlyEnabled: boolean) {
        this._config = vscode.workspace.getConfiguration("advpl");
        this._environments = this._config.get<Array<IEnvironment>>("environments");
        this._dictionary = this._config.get<Array<IDictionary>>("dictionary");
        this._selectedEnvironment = this._config.get<string>("selectedEnvironment");
        this._servers = this.GetServers(onlyEnabled);
    }

    private GetServers(onlyEnabled: Boolean): ServerView[] {

        let servers = Array<ServerView>();

        // Carrega somente os ambientes habilitados
        if (onlyEnabled) {
            this._environments = this._environments.filter(env => env.enable !== false);
        }

        // Percorre as configurações de ambiente
        this._environments.forEach(environment => {

            // Verifica se o Servidor (IP) já foi inserido
            let positionServer = servers.findIndex(server => server.serverIP === environment.server);

            // Se o servidor não existe, adiciona o mesmo no array
            if (positionServer < 0) {
                // Busca o Alias configurado para o Servidor
                let serverLabel = this._dictionary.find(dic => dic.name.trim() === environment.server.trim());

                positionServer = servers.push(
                    new ServerView(
                        serverLabel ? serverLabel.label : environment.server,
                        environment.server,
                        []
                    )
                ) - 1;

            }

            // ---------------------------------------------------------------------------------------------------------------------------------------

            // Verifica se o Serviço (porta) já foi inserido
            let positionService = servers[positionServer].services.findIndex(service => service.servicePort === environment.port);

            if (positionService < 0) {
                // Busca o Alias configurado para o Serviço
                let serviceLabel = this._dictionary.find(dic => /*dic.parent.trim() === environment.server.trim() &&*/ dic.name.trim() === environment.port.toString());

                positionService = servers[positionServer].AddService(
                    new ServiceView(
                        serviceLabel ? serviceLabel.label : environment.port.toString(),
                        environment.port,
                        [],
                        environment.serverVersion,
                        environment.passwordCipher,
                        environment.includeList,
                        environment.user,
                        environment.smartClientPath,
                        false,
                        servers[positionServer]
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
                    new EnvironmentView(
                        environmentLabel,
                        environment.name,
                        environment.environment,
                        environmentLabel === this._selectedEnvironment.trim(),
                        servers[positionServer].services[positionService]
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
    };

    public AddEnvironment(environment: IEnvironment) {
        this._environments.push(environment);

        // Atualiza o arquivo de configurações adicionado o ambiente novo
        this._config.update("environments", this._environments);
    }

}