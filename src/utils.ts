import fs = require('fs');
import os = require('os');
import path = require('path');
import * as vscode from 'vscode';

export let PowerShellLanguageId = 'advpl';

export function ensurePathExists(targetPath: string) {
    // Ensure that the path exists
    try {
        fs.mkdirSync(targetPath);
    }
    catch (e) {
        // If the exception isn't to indicate that the folder
        // exists already, rethrow it.
        if (e.code != 'EEXIST') {
            throw e;
        }
    }
}

export interface EditorServicesSessionDetails {
    channel: string;
    languageServicePort: number;
    debugServicePort: number;
}

export function checkIfFileExists(filePath: string): boolean {
    try {
        fs.accessSync(filePath, fs.constants.R_OK)
        return true;
    }
    catch (e) {
        return false;
    }
}

export function getConfigurationAsString(): string{
    return JSON.stringify(vscode.workspace.getConfiguration("advpl"));
}

export function advplDebugBridgePath(): string {
    let retPath: string;
    retPath = vscode.extensions.getExtension("KillerAll.advpl-vscode").extensionPath;
    retPath += formatPath('/bin/');
    switch (process.platform)
    {
        case "darwin":
            retPath += "AdvplDebugBridgeMac";
            break;
        case "linux":
            retPath += "NOT_IMPLEMENTED";
            break;
        default:
            retPath += "AdvplDebugBridge.exe";
    }
    return retPath;
}

export function formatPath(rawUnixPath: string): string {
    let retPath: string;
    switch (process.platform)
    {
        case "darwin":
        case "linux":
            retPath = rawUnixPath;
            break;
        default:
            retPath = rawUnixPath.replace(/\//g, '\\');
    }
    return retPath;
}