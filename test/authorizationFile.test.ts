//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module 'assert' provides assertion methods from node
import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import {AuthorizationData} from '../src/authorizationFile';

// Defines a Mocha test suite to group tests of similar kind together
suite("Authorization Data test", () => {

    // Defines a Mocha unit test
    test("should set code from KEY", () => {
        let data = new AuthorizationData();
        data.setKeyValue(["KEY","123"]);
        assert.equal(data.code, "123");
    });
    test("should set generation date", () => {
        let data = new AuthorizationData();
        data.setKeyValue(["GENERATION","04/05/1990"]);
        assert.equal(data.genarateData, "19900504");
    });
    test("should set validation date", () => {
        let data = new AuthorizationData();
        data.setKeyValue(["VALIDATION","28/07/1990"]);
        assert.equal(data.validData, "19900728");
    });
    test("should set permission", () => {
        let data = new AuthorizationData();
        data.setKeyValue(["PERMISSION","1"]);
        assert.equal(data.permission, "1");
        data.setKeyValue(["PERMISSION","0"]);
        assert.equal(data.permission, "0");
    });

    test("should convert date correctly", () => {
        let data = new AuthorizationData();
        let convertDate = data.getDateFromValue("31/12/2017");
        assert.equal(convertDate, "20171231");
    });

});