import fs = require('fs');
import os = require('os');
import path = require('path');

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