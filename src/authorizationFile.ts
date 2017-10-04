'use strict'
import * as fs from 'fs'
import * as vscode from 'vscode';

const generateConfig = (dataObj: AuthorizationData) => {
    let config = vscode.workspace.getConfiguration("advpl");
    config.update("authorization_generation",dataObj.genarateData);
    config.update("authorization_validation",dataObj.validData);
    config.update("authorization_permission",dataObj.permission.toString());
    config.update("authorization_code",      dataObj.code);
}

const validFilePath = (text:string):string => {
    return null;
}

export default async function generateConfigFromAuthorizationFile(context): Promise<any>{
    let filePath = await vscode.window.showInputBox({
        prompt: "Digite o caminho (path) do arquivo de autorização (*.aut)",
        ignoreFocusOut: true,
        validateInput: validFilePath
    });
    if(!filePath) return;

    var aut = new AuthorizationFile();
    var dataObj:AuthorizationData = aut.ReadFromFile(filePath);
    generateConfig(dataObj);
}


class AuthorizationFile {
    public ReadFromFile(filePath: string):AuthorizationData{
        let myData = new AuthorizationData();
        let firstLine = true;
        let that = this;
        let aRawData = fs.readFileSync(filePath,'utf-8').split('\r\n');
        
        if( aRawData[0] !== "[AUTHORIZATION]" ) throw new Error("Arquivo de autorização inválido")
        aRawData.forEach(element => {
            let keyValue = element.split("=");
            myData.setKeyValue(keyValue);
        });

        return myData;


    }
    private setKeyValue(keyValue: Array<string>, obj: AuthorizationData){

    }
}

class AuthorizationData{
    code :string;
    genarateData: string;
    validData: string;
    permission: number;

    public setKeyValue(keyValue: Array<string>){
        switch (keyValue[0]) {
            case 'KEY':
                this.code = keyValue[1];
                break;
            case 'GENERATION':
                this.genarateData = this.getDateFromValue(keyValue[1]);
                break;
            case 'VALIDATION':
                this.validData = this.getDateFromValue(keyValue[1]);
                break;        
            case 'PERMISSION':
                this.permission = parseInt(keyValue[1]);
                break; 
            default:
                break;
        }
    }

    private getDateFromValue(value: string): string{
        return value.split('/').reverse().join('');
    }
}