import * as nls from 'vscode-nls';

const localize = nls.loadMessageBundle();

/**
 * Classe para representar um ambiente preenchido no Preferences
 */

export default class Environment {
    user: String;
    server: String;
    cipher : string; 
    language : string;  

    deserialize(input) {
        this.user = input.user;
        this.server = input.server;
        this.cipher = input.passwordCipher;
        this.language =  input.totvs_language;
     

        return this;
    }

    getErrors(): Array<String> {
        let errors = [];
        if(this.language == undefined || this.language == 'advpl')
        {
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

        }
        else //4GL
        {
            if (!this.server) {
                errors.push(localize('src.Environment.serverNotFilledText', 'Server not filled!'));
            }
        }       
        
        return errors;
        
    }
}