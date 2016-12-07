/**
 * Classe para representar um ambiente preenchido no Preferences
 */

export default class Environment{
    user: String;
    server: String;

    deserialize(input) {
        this.user = input.user;
        this.server = input.server;
        return this;
    }

    getErrors(): Array<String>{
        let errors = [];
        if(!this.user){
            errors.push("User não preenchido");
        }
        if(!this.server){
            errors.push("Endereço do Server não preenchido (server)");
        }
        return errors;
    }
}