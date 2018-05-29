'use strict'
import * as fs from 'fs'
import * as vscode from 'vscode';
import * as nls from 'vscode-nls';

const localize = nls.loadMessageBundle();

const generateConfig = (dataObj: AuthorizationData) => {
    let config = vscode.workspace.getConfiguration("advpl");
    config.update("authorization_generation", dataObj.genarateData);
    config.update("authorization_validation", dataObj.validData);
    config.update("authorization_permission", dataObj.permission.toString());
    config.update("authorization_code", dataObj.code);
}

const validFilePath = (text: string): string => {
    return null;
}

export default async function generateConfigFromAuthorizationFile(context): Promise<any> {
    let filePath = await vscode.window.showOpenDialog({
        filters: {
            'AuthorizationFile': ['aut']
        }
    });
    if (!filePath) return;

    var aut = new AuthorizationFile();
    var dataObj: AuthorizationData = aut.GetAuthorizationDataFromFile(filePath[0].fsPath);
    generateConfig(dataObj);
}

class AuthorizationFile {
    public GetAuthorizationDataFromFile(filePath: string): AuthorizationData {
        let myData = new AuthorizationData();
        let aRawData = fs.readFileSync(filePath, 'utf-8').split('\r\n');

        if (aRawData[0] !== "[AUTHORIZATION]")
            throw new Error(localize('src.authorizationFile.invalidAuthorizationFileText', 'Invalid authorization file!'));
        aRawData.forEach(element => {
            let keyValue = element.split("=");
            myData.setKeyValue(keyValue);
        });

        return myData;
    }
}

export class AuthorizationData {
    code: string;
    genarateData: string;
    validData: string;
    permission: number;

    public setKeyValue(keyValue: Array<string>) {
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

    public getDateFromValue(value: string): string {
        return value.split('/').reverse().join('');
    }
}