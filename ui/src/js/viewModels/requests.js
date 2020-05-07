/**
 * @license
 * Copyright (c) 2014, 2019, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 * @ignore
 */
/*
 * Your requests ViewModel code goes here
 */
define(['ojs/ojcore', 'knockout', 'jquery', 'accUtils', 'utils', 'restClient', 'ojs/ojarraydataprovider',
    'ojs/ojprogress', 'ojs/ojbutton', 'ojs/ojlabel', 'ojs/ojinputtext', 'ojs/ojselectsingle', 'ojs/ojcheckboxset', 'ojs/ojdatetimepicker',
    'ojs/ojarraytabledatasource', 'ojs/ojtable', 'ojs/ojpagingtabledatasource', 'ojs/ojpagingcontrol'],
        function (oj, ko, $, accUtils, utils, restClient, ArrayDataProvider) {

            function RequestsViewModel() {
                var self = this;

                self.connected = function () {
                    accUtils.announce('Requests page loaded.');
                    document.title = "Requests";

                    self.requestsValues = ko.observableArray();
                    self.requestsDataProvider = ko.observable();
                    self.requestsTableColumns = [
                        {headerText: 'TYPE', field: "type_name"},
                        {headerText: 'NAME', field: "client_name"},                        
                        {headerText: 'TARGET DATE', field: "requestTargetDate", sortProperty: "requestTargetDateRaw"},
                        {headerText: 'DATE NEEDED', field: "requestDateNeeded", sortProperty: "requestDateNeededRaw"}                       
                    ];

                    self.offerTypesCategoriesValues = ko.observableArray();
                    self.offerTypesCategoriesArray = ko.observableArray([]);
                    self.offerTypesCategoriesDataProvider = ko.observable();

                    self.offerTypesValues = ko.observableArray();
                    self.offerTypesArray = ko.observableArray([]);
                    self.offerTypesDataProvider = ko.observable();

//                    self.addRequestButtonSelected = ko.observableArray([]);
                    self.requestRowSelected = ko.observableArray();
                    self.requestSelected = ko.observable("");
                    self.offerTypeSelected = ko.observable("");                        
                    self.offerTypesCategorySelected = ko.observable(""); 
                    self.checkboxFilterAgreed = ko.observableArray([]);
                    self.targetDateConvertor = ko.observable();
                    self.dateNeededConvertor = ko.observable();                    
                    self.showPanel = ko.computed(function () {
//                        if (self.addRequestButtonSelected().length) {
//                            // big reset!
//                            self.requestRowSelected([]);
//                            self.requestSelected("");
//                            self.offerTypeSelected("");                        
//                            self.offerTypesCategorySelected("");
//                            self.targetDateConvertor("");
//                            self.dateNeededConvertor("");                            
//                            return true;                                                            
//                        }
                        if (self.requestRowSelected().length) {
                            return true;                            
                        }
                    }, this);
                        
                    var handlerLogic = function() {                                                
                        self.handleRequestRowChanged = function (event) {
                            if (event.detail.value[0] !== undefined) {
//                                self.addRequestButtonSelected([]);                                                                
                                //find whether node exists based on selection
                                function searchNodes(nameKey, myArray){
                                    for (var i=0; i < myArray.length; i++) {
                                        if (myArray[i].id === nameKey) {
                                            return myArray[i];                                    
                                        }
                                    }
                                };                        
                                self.requestSelected(searchNodes(event.target.currentRow.rowKey, self.requestsValues()));                         
                                console.log(self.requestSelected());
                                _calculateCategory(self.requestSelected().type_name);
                                if (self.requestSelected().agreed) {
                                    self.checkboxFilterAgreed(self.requestSelected().agreed);
                                }
                                if (self.requestSelected().requestTargetDateRaw) {
                                    self.targetDateConvertor(new Date(self.requestSelected().requestTargetDateRaw).toISOString());
                                } else {
                                    self.targetDateConvertor("");
                                }
                                if (self.requestSelected().requestDateNeededRaw) {
                                    self.dateNeededConvertor(new Date(self.requestSelected().requestDateNeededRaw).toISOString());
                                } else {
                                    self.dateNeededConvertor("");
                                }                                
                            }
                        };
                        //function for reverse search of Category based on Type loaded in
                        _calculateCategory = function(type) {
                            //find whether node exists based on selection
                            function searchNodes(nameKey, myArray){
                                for (var i=0; i < myArray.length; i++) {
                                    if (myArray[i].type === nameKey) {
                                        return myArray[i];                                    
                                    }
                                }
                            };
                            var searchTypes = searchNodes(type, self.offerTypesValues());                            

                            //find whether node exists based on selection
                            function searchNodes(nameKey, myArray){
                                for (var i=0; i < myArray.length; i++) {
                                    if (myArray[i].category === nameKey) {
                                        return myArray[i];                                    
                                    }
                                }
                            };
                            var searchCategories = searchNodes(searchTypes, self.offerTypesCategoriesValues()).code;
                            self.offerTypesCategorySelected(searchCategories); 
                        };
                        
                        self.handleOfferTypesCategoryChanged = function(event) {
                            if (event.target.value !== "") {
                                _getOfferTypesFromCategoryAjax(event.target.value);
                            }
                        };
                        _getOfferTypesFromCategoryAjax = function(code) {
                            self.offerTypesArray([]);
                            //GET /rest/offer_type_categories/{code}/offer_types - REST
                            return $.when(restClient.doGet(`http://www.rdg-connect.org/rest/offer_type_categories/${code}/offer_types`)
                                .then(
                                    success = function (response) {
                                        console.log(response.offer_types);                                        
                                        self.offerTypesValues(response.offer_types);
                                    },
                                    error = function (response) {
                                        console.log(`Offer Types from Category "${code}" not loaded`);
                                }).then(function () {
                                    //find all names
                                    for (var i = 0; i < self.offerTypesValues().length; i++) {
                                        self.offerTypesArray().push({
                                            "value": self.offerTypesValues()[i].type,
                                            "label": self.offerTypesValues()[i].name                                            
                                        });
                                    };
                                    //sort nameValue alphabetically
                                    utils.sortAlphabetically(self.offerTypesArray(), "value");
                                    self.offerTypesDataProvider(new ArrayDataProvider(self.offerTypesArray(), { keyAttributes: 'value' }));
                                }).then(function () {
                                    self.offerTypeSelected(self.offerTypesArray()[0].value);
                                })
                            );
                        };                        
                    }();
                    
//                    self.saveAdditionButton = function () {
//                    };
                    self.handleAgreedInputChanged = function () {
                    };
                    self.saveEditButton = function () {
                    };                       

                    var getData = function () {
                        self.requestsLoaded = ko.observable();
                        self.requestsValid = ko.observable();

                        function getRequestsAjax() {
                            //GET /rest/requests - REST
                            self.requestsLoaded(false);
                            return $.when(restClient.doGet('http://www.rdg-connect.org/rest/need_requests')
                                .then(
                                    success = function (response) {
                                        console.log(response.need_request);
                                        $.each(response.need_request, function(index, item) {
                                            if (this.target_date) {
                                                //no need to split as UTC anyway
                                                var targetDateCleansed = new Date(this.target_date);
                                                var targetDateCleansedLocale = targetDateCleansed.toLocaleDateString();
                                            }
                                            if (this.date_needed) {
                                                //no need to split as UTC anyway
                                                var dateNeededCleansed = new Date(this.date_needed);
                                                var dateNeededCleansedLocale = dateNeededCleansed.toLocaleDateString();
                                            }
                                            self.requestsValues().push({
                                                requestTargetDateRaw: targetDateCleansed,  
                                                requestTargetDate: targetDateCleansedLocale,  
                                                requestDateNeededRaw: dateNeededCleansed,
                                                requestDateNeeded: dateNeededCleansedLocale,
                                                agreed: this.agreed,
                                                client_name: this.client_name,
                                                client_need_id: this.client_need_id,
                                                complete: this.complete,
                                                id: this.id,
                                                notes: this.notes,
                                                request_details: this.request_details,
                                                organization_id: this.organization_id,
                                                type_name: this.type_name                                               
                                            });
                                        });
                                        
                                        self.requestsValid(true);
                                    },
                                    error = function (response) {
                                        console.log("Requests not loaded");
                                        self.requestsValid(false);
                                }).then(function () {
                                    var sortCriteria = {key: 'type_name', direction: 'ascending'};
                                    var arrayDataSource = new oj.ArrayTableDataSource(self.requestsValues(), {idAttribute: 'id'});
                                    arrayDataSource.sort(sortCriteria);
                                    self.requestsDataProvider(new oj.PagingTableDataSource(arrayDataSource));
                                }).then(function () {
                                    self.requestsLoaded(true);
                                })
                            );
                        };

                        function getOfferTypesCategoriesAjax() {
                            //GET /rest/offer_type_categories - REST
                            return $.when(restClient.doGet('http://www.rdg-connect.org/rest/offer_type_categories')
                                .then(
                                    success = function (response) {
                                        console.log(response.offer_type_categorys);
                                        self.offerTypesCategoriesValues(response.offer_type_categorys);
                                    },
                                    error = function (response) {
                                        console.log("Offer Types Categories not loaded");
                                }).then(function () {
                                    //find all names
                                    for (var i = 0; i < self.offerTypesCategoriesValues().length; i++) {
                                        self.offerTypesCategoriesArray().push({
                                            "value": self.offerTypesCategoriesValues()[i].code,
                                            "label": self.offerTypesCategoriesValues()[i].name                                            
                                        });
                                    };
                                    //sort nameValue alphabetically
                                    utils.sortAlphabetically(self.offerTypesCategoriesArray(), "value");
                                    self.offerTypesCategoriesDataProvider(new ArrayDataProvider(self.offerTypesCategoriesArray(), { keyAttributes: 'value' }));
                                }).then(function () {
                                })
                            );
                        };

                        Promise.all([getRequestsAjax()])
                        .then(function () {
                            Promise.all([getOfferTypesCategoriesAjax()])
                        })
                        .catch(function () {
                            //even if error remove loading bar
                            self.requestsLoaded(true);
                        });
                    }();                                     
                };

                self.disconnected = function () {
                    // Implement if needed
                };

                self.transitionCompleted = function () {
                    // Implement if needed
                };
            }

            return RequestsViewModel;
        }
);
