'use strict';
import {window, OutputChannel, ViewColumn} from 'vscode';
import * as util from 'util';
import PromptFactory from './prompts/factory';
import EscapeException from './utils/EscapeException';

export default class CodeAdapter {
    public prompt(questions, callback) {
        let answers = {};

        var promise = questions.reduce((promise, question) => {

            return promise.then(() => {
                return PromptFactory.createPrompt(question);
            }).then(prompt => {
                if (!question.when || question.when(answers) === true) {
                    return prompt.render().then(result => answers[question.name] = question.filter ? question.filter(result) : result);
                }
            });
        }, Promise.resolve());

        promise
            .then(() => {
                callback(answers);
            })
            .catch(err => {
                if (err instanceof EscapeException) {
                    return;
                }
                window.showErrorMessage(err.message);
            });
    }
}