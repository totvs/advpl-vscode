'use strict';
import CodeAdapter from '../adapter';
import * as vscode from 'vscode';
import IEnvironment from '../utils/IEnvironment';
import { advplCompile } from '../advplCompile'
import * as nls from 'vscode-nls';

const localize = nls.loadMessageBundle();

export default function cmdAddAdvplEnvironment(context): any {
    const config = vscode.workspace.getConfiguration("advpl");
    const environments = config.get<Array<IEnvironment>>("environments");
    let adapter = new CodeAdapter()
    const questions = [{
        message: localize('src.commands.addAdvplEnvironment.envAppserverText', 'Environment AppServer'),
        validate: (env) => {
            if (environments.find(environment => environment.environment == env))
                return localize('src.commands.addAdvplEnvironment.envExistsErrorText', 'The inputted environment already exists!');
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
        validate: (name) => {
            if (environments.find(environment => environment.name == name))
                return `${name}` + localize('src.commands.addAdvplEnvironment.existsText', ' already exists!');
            if (name.length <= 0)
                return localize('src.commands.addAdvplEnvironment.mandatoryText', 'Mandatory!');
            return true;
        }
    }, {
        message: localize('src.commands.addAdvplEnvironment.smartclientPathText', 'Smartclient Path'),
        name: "smartClientPath",
        validate: env => env.length > 0
    }, {
        message: localize('src.commands.addAdvplEnvironment.appserverVersionText', 'AppServer Version'),
        name: "appserverVersion",
        type: "list",
        default: '131227A',
        choices: ['131227A', '170117A']
    }, {
        message: localize('src.commands.addAdvplEnvironment.serverIpText', 'Server IP'),
        name: "server",
        default: "localhost"
    }, {
        message: localize('src.commands.addAdvplEnvironment.appserverPortText', 'AppServer Port'),
        name: "port"
    }, {
        message: localize('src.commands.addAdvplEnvironment.userText', 'User'),
        name: "user",
        default: "Admin"
    }, {
        message: localize('src.commands.addAdvplEnvironment.passwordText', 'Password'),
        name: "password",
        type: "password"
    }, {
        message: localize('src.commands.addAdvplEnvironment.includeListText', 'Include list'),
        name: "includeList"
    }]
    adapter.prompt(questions, answers => {
        const compile = new advplCompile();
        compile.runCipherPassword(answers.password, cipher => {
            cipher = cipher.replace(/\r?\n?/g, '')
            environments.push({
                environment: answers.environment,
                name: answers.name,
                server: answers.server,
                port: answers.port,
                serverVersion: answers.appserverVersion,
                passwordCipher: cipher,
                includeList: answers.includeList,
                user: answers.user,
                smartClientPath: answers.smartClientPath
            });
            config.update("environments", environments)
        })

    })
}