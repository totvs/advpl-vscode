import * as nls from 'vscode-nls';

const localize = nls.loadMessageBundle();

/**
 * Classe para representar um ambiente preenchido no Preferences
 */

export default class Environment {
    user: String;
    server: String;
    cipher : string;    

    deserialize(input) {
        this.user = input.user;
        this.server = input.server;
        this.cipher = input.passwordCipher;
     

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
        if(!this.cipher)
        {
            errors.push(localize('src.Environment.cipherNotFilledText', 'Cipher not filled!'));
        }
        
        return errors;
    }
}