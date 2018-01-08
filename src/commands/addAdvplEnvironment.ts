'use strict';
import CodeAdapter from '../adapter';
import * as vscode from 'vscode';
import IEnvironment from '../utils/IEnvironment';
import {advplCompile} from '../advplCompile'
export default function cmdAddAdvplEnvironment(context): any{
    const config = vscode.workspace.getConfiguration("advpl");
    const environments = config.get<Array<IEnvironment>>("environments");
    let adapter = new CodeAdapter()
    const questions = [{
        message: "Environment Appserver",
        validate: (env) => {
            if (environments.find(environment => environment.environment == env))
                return "Environment já cadastrado!";
            if (env.length <= 0 )
                return "Obrigatório!";
            return true;
        },
        name: "environment"
    },{
        message: "Nome",
        name: "name",
        when: function(answers){
            this.default = answers.environment;
            return true;
        },
        default: '',
        validate: (name) => {
            if (environments.find(environment => environment.name == name))
                return `${name} já cadastrado`;
            if (name.length <= 0 )
                return "Obrigatório!";
            return true;
        }
    },{
        message: "Smartclient Path",
        name: "smartClientPath",
        validate: env => env.length > 0
    },{
        message: "AppServer Version",
        name: "appserverVersion",
        type: "list",
        default: '131227A',
        choices: ['131227A','170117A']
    },{
        message: "Server IP",
        name: "server",
        default: "localhost"
    },{
        message: "Porta do appserver",
        name: "port"
    },{
        message: "Usuário Protheus",
        name: "user",
        default: "Admin"
    },{
        message: "Senha",
        name: "password",
        type: "password"
    },{
        message: "Include list",
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
            config.update("environments",environments)
        })

    })
}