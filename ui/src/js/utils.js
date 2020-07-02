/**
 * Copyright (c) 2014, 2016, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 */
define(['ojs/ojcore', 'knockout', 'ojs/ojconfig', 'ojs/ojmessaging'],
    function (oj, ko, Config) {
        var self = this;
        var appConstants = {
            sysModuleConfig: {},
            users: {
                organizationId: ""
            }
        }
        self.applicationMessages = ko.observableArray([]);
        
        // OLI NOTE: addition to get browser locale; set OJET locale
        getSetLanguage = function () {
            function getLang() {
              return (navigator.languages && navigator.languages.length) ? navigator.languages[0] : navigator.language;
            }
            const newLang = getLang();
            self.setLang = (function() {
              Config.setLocale(newLang,
                () => {
                  document.getElementsByTagName('html')[0].setAttribute('lang', newLang);
                }
              );
            }());             
        };

        sortAlphabetically = function (valueArray, property) {
            valueArray.sort(function(a, b){
                var textA = a[property].toLowerCase();
                var textB = b[property].toLowerCase();
                return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
            });
        };

        showErrorMessage = function (summary, detail) {
            self.applicationMessages.push({
                severity: "error",
                summary: summary,
                detail: detail,
                autoTimeout: 10000
            });
        };

        return {
            appConstants: appConstants,
            getSetLanguage: getSetLanguage,
            sortAlphabetically: sortAlphabetically,
            showErrorMessage: showErrorMessage
        };

    });