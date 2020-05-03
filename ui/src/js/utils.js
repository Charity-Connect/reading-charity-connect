/**
 * Copyright (c) 2014, 2016, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 */
define(['knockout', 'ojs/ojcore'],
    function (ko, oj) {
        var self = this;

        showErrorMessage = function (summary, detail) {
            self.applicationMessages([{
                severity: "error",
                summary: summary,
                detail: detail,
                autoTimeout: 10000
            }]);
        };    

        return {
            showErrorMessage: showErrorMessage
        };

    });