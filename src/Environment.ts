import * as nls from 'vscode-nls';

const localize = nls.loadMessageBundle();

/**
 * Classe para representar um ambiente preenchido no Preferences
 */

export default class Environment {
    user: String;
    server: String;

    deserialize(input) {
        this.user = input.user;
        this.server = input.server;
        return this;
    }

    getErrors(): Array<String> {
        let errors = [];
        if (!this.user) {
            errors.push(localize('src.Environment.userNotFilledText', 'User not filled!'));
        }
        if (!this.server) {
            errors.push(localize('src.Environment.serverNotFilledText', 'Server not filled!'));
        }
        return errors;
    }
}