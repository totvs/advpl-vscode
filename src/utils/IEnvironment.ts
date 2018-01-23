'use strict';
export default interface IEnvironment{
    server: string;
    port: number;
    environment: string;
    serverVersion: string;
    passwordCipher: string;
    includeList: string;
    user: string;
    smartClientPath: string;
    language?: string;
    rpoType?: string;
    name?: string;
}