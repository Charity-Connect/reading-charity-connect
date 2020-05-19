/**
 * Copyright (c) 2014, 2016, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 */
define(['ojs/ojcore', 'knockout'],
    function (oj, ko) {
        var self = this;
        var appConstants = {
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

        
        //function for reverse search of Category based on Type loaded in
        calculateCategory = function (type, offerTypesValues, offerTypesCategoriesValues) {
            //find whether node exists based on selection
            function searchNodes(nameKey, myArray){
                for (var i=0; i < myArray.length; i++) {
                    if (myArray[i].type === nameKey) {
                        return myArray[i];                                    
                    }
                }
            };
            var searchTypes = searchNodes(type, offerTypesValues);                            

            //find whether node exists based on selection
            function searchNodes(nameKey, myArray){
                for (var i=0; i < myArray.length; i++) {
                    if (myArray[i].category === nameKey) {
                        return myArray[i];                                    
                    }
                }
            };
            var searchCategories = searchNodes(searchTypes, offerTypesCategoriesValues).code;
            return searchCategories;
        };

        return {
            appConstants:appConstants,
            sortAlphabetically: sortAlphabetically,
            showErrorMessage: showErrorMessage,
            calculateCategory: calculateCategory
        };

    });