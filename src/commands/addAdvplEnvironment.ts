'use strict';
import CodeAdapter from '../adapter';
import * as vscode from 'vscode';
import IEnvironment from '../utils/IEnvironment';
import { advplCompile } from '../advplCompile'
import * as nls from 'vscode-nls';
import * as path from 'path';

const localize = nls.loadMessageBundle();

export default function cmdAddAdvplEnvironment(context): any {
    const config = vscode.workspace.getConfiguration("advpl");
    const environments = config.get<Array<IEnvironment>>("environments");
    let adapter = new CodeAdapter();

    const questions = [{
        message: localize('src.commands.addAdvplEnvironment.envAppserverText', 'Environment AppServer'),
        validate: (env) => {
            // Comentado pois podem existir cenários onde o usuário possui o mesmo nome de Environment em diferentes serviços.
            // if (environments.find(environment => environment.environment == env))
            //     return localize('src.commands.addAdvplEnvironment.envExistsErrorText', 'The inputted environment already exists!');
            if (env.length <= 0)
                return localize('src.commands.addAdvplEnvironment.mandatoryText', 'Mandatory!');
            return true;
        },
        name: "environment"
    }, {
        message: localize('src.commands.addAdvplEnvironment.nameText', 'Name'),
        name: "name",
        when: function (answers) {
            this.default = answers.environment;
            return true;
        },
        default: '',
        validate: (name, answers) => {

            /**
             * Tratamento para evitar duplicidade de environment e erros quando não se é utilizado o atributo name
             */
            function trataEnv(environment) {
                if (environment)
                    return environment.toUpperCase().trim();
                else
                    return environment;
            }

            // Não permite ambientes com o mesmo Nome (Label)
            if (environments.find(environment => trataEnv(environment.name) == name.toUpperCase().trim() )){
                return `${name}` + localize('src.commands.addAdvplEnvironment.existsText', ' already exists!');
            }

            if (name.length <= 0)
                return localize('src.commands.addAdvplEnvironment.mandatoryText', 'Mandatory!');

            return true;
        }
    }, {
        message: localize('src.commands.addAdvplEnvironment.smartclientPathText', 'Selecione a pasta do SmartClient'),
        name: "smartClientPath",
        type: 'folder'
    }, {
        message: localize('src.commands.addAdvplEnvironment.appserverVersionText', 'AppServer Version'),
        name: "appserverVersion",
        type: "list",
        default: '191205P',
        choices: ['131227A', '170117A','191205P','210324P']
    }, {
        message: localize('src.commands.addAdvplEnvironment.serverIpText', 'Server IP'),
        name: "server",
        default: "localhost"
    }, {
        message: localize('src.commands.addAdvplEnvironment.appserverPortText', 'AppServer Port'),
        name: "port",
        validate: (port, answers) => {
            // Não permite utilizar um Environment já configurado para o mesmo servidor + serviço (IP + Porta)
            if (environments.find(env =>
                env.environment.toUpperCase().trim() == answers.environment.toUpperCase().trim() &&
                env.server.toUpperCase().trim() == answers.server.toUpperCase().trim() &&
                env.port.toString() == port.toUpperCase().trim()
            )) {
                return answers.environment + localize('src.commands.addAdvplEnvironment.envExistsErrorText', ' already configured for this AppServer');;
            }

            return true;
        }
    },
    {
        message: localize('src.commands.addAdvplEnvironment.userText', 'User'),
        name: "user",
        default: "Admin"
    },
    {
        message: localize('src.commands.addAdvplEnvironment.passwordText', 'Password'),
        name: "password",
        type: "password"
    },
    {
        message: localize('src.commands.addAdvplEnvironment.enable', 'Environment Enabled'),
        name: "enable",
        type: "list",
        default: localize('src.extension.yesText', 'Yes'),
        choices: [localize('src.extension.yesText', 'Yes'), localize('src.extension.noText', 'No')]
    },
    {
        message: localize('src.commands.addAdvplEnvironment.includeListText', 'Selecione as pastas de Include'),
        name: "includeList",
        type: 'folder',
        canSelectMany: true
    },
    {
        message: localize('src.commands.addAdvplEnvironment.SSL', 'SSL?'),
        name: "ssl",
        when: function (answers) {
            return answers.appserverVersion == '191205P';
        },
        type: "list",
        default: false,
        choices: [false, true]
    }];

    adapter.prompt(questions, answers => {
        const compile = new advplCompile();
        compile.runCipherPassword(answers.password, cipher => {
            cipher = cipher.replace(/\r?\n?/g, '');
            environments.push({
                environment: answers.environment,
                name: answers.name,
                server: answers.server,
                port: answers.port,
                serverVersion: answers.appserverVersion,
                passwordCipher: cipher,
                includeList: answers.includeList,
                user: answers.user,
                smartClientPath: answers.smartClientPath + (advplCompile.getIsAlpha() ? path.sep  : ""),
                enable: answers.enable == localize('src.extension.yesText', 'Yes') ? true : false,
                ssl: answers.ssl
            });
            config.update("environments", environments);
        })

    });
}
