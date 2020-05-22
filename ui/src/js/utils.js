/**
 * Copyright (c) 2014, 2016, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 */
define(['ojs/ojcore', 'knockout'],
    function (oj, ko) {
        var self = this;
        var appConstants = {
            sysModuleConfig: {},
            users: {
                displayName: "",
                email: "",
                phone: "",
                confirmed: "",
                organizationId: ""
            }
        }

        sortAlphabetically = function (valueArray, property) {
            valueArray.sort(function(a, b){
                var textA = a[property].toLowerCase();
                var textB = b[property].toLowerCase();
                return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
            });
        };

        showErrorMessage = function (summary, detail) {
            self.applicationMessages([{
                severity: "error",
                summary: summary,
                detail: detail,
                autoTimeout: 10000
            }]);
        };

        return {
            appConstants: appConstants,
            sortAlphabetically: sortAlphabetically,
            showErrorMessage: showErrorMessage
        };

    });