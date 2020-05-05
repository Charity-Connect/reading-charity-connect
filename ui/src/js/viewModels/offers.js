/**
 * @license
 * Copyright (c) 2014, 2019, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 * @ignore
 */
/*
 * Your offers ViewModel code goes here
 */
define(['ojs/ojcore', 'knockout', 'jquery', 'accUtils', 'utils', 'restClient', 'ojs/ojconfig', 'ojs/ojarraydataprovider',
    'ojs/ojprogress', 'ojs/ojbutton', 'ojs/ojlabel', 'ojs/ojinputtext', 'ojs/ojselectsingle', 'ojs/ojdatetimepicker',
    'ojs/ojarraytabledatasource', 'ojs/ojtable', 'ojs/ojpagingtabledatasource', 'ojs/ojpagingcontrol'],
        function (oj, ko, $, accUtils, utils, restClient, Config, ArrayDataProvider) {

            function OffersViewModel() {
                var self = this;

                self.connected = function () {
                    accUtils.announce('Offers page loaded.');
                    document.title = "Offers";

                    self.offersValues = ko.observableArray();
                    self.offersDataProvider = ko.observable();
                    
                    self.offerTypesCategoriesValues = ko.observableArray();
                    self.offerTypesCategoriesArray = ko.observableArray([]);
                    self.offerTypesCategoriesDataProvider = ko.observable();

                    self.offerTypesValues = ko.observableArray();
                    self.offerTypesArray = ko.observableArray([]);
                    self.offerTypesDataProvider = ko.observable();

                    self.offersTableColumns = [
                        {headerText: 'NAME', field: "name"},
                        {headerText: 'TYPE', field: "type_name"},
                        {headerText: 'QUANTITY', field: "quantity"},
                        {headerText: 'DISTANCE', field: "distance"},
                        {headerText: 'DATE AVAILABLE', field: "date_available"},
                        {headerText: 'DATE END', field: "date_end"}                        
                    ];

                    var newLang = "en-GB";
                    self.setLang = function (event) {
                        Config.setLocale(newLang,
                            function () {
                                document.getElementsByTagName('html')[0].setAttribute('lang', newLang);                      
                            }
                        );
                    }();

                    self.addOfferButtonSelected = ko.observableArray([]);
                    self.offerRowSelected = ko.observableArray();
                    self.offerSelected = ko.observable("");
                    self.offerTypeSelected = ko.observable("");                        
                    self.offerTypesCategorySelected = ko.observable("");
                    self.dateAvailableConvertor = ko.observable();
                    self.dateEndConvertor = ko.observable();
                    self.showPanel = ko.computed(function () {
                        if (self.addOfferButtonSelected().length) {
                            // big reset!
                            self.offerRowSelected([]);
                            self.offerSelected("");
                            self.offerTypeSelected("");                        
                            self.offerTypesCategorySelected("");
                            self.dateAvailableConvertor(new Date().toISOString());
                            self.dateEndConvertor(new Date().toISOString());
                            return true;                                                            
                        }
                        if (self.offerRowSelected().length) {
                            return true;                            
                        }
                    }, this);

                    var handlers = function () {
                        self.handleOfferRowChanged = function (event) {
                            console.log("handleOfferRowChanged");
                            if (event.detail.value[0] !== undefined) {
                                self.addOfferButtonSelected([]);                                                                
                                //find whether node exists based on selection
                                function searchNodes(nameKey, myArray){
                                    for (var i=0; i < myArray.length; i++) {
                                        if (myArray[i].id === nameKey) {
                                            return myArray[i];                                    
                                        }
                                    }
                                };                        
                                self.offerSelected(searchNodes(event.target.currentRow.rowKey, self.offersValues()));                         
                                console.log(self.offerSelected());
                                _calculateCategory(self.offerSelected().type);
                                self.dateAvailableConvertor(new Date(self.offerSelected().date_available).toISOString());
                                self.dateEndConvertor(new Date(self.offerSelected().date_end).toISOString());
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
                                getOfferTypesFromCategoryAjax(event.target.value);
                            }
                        };
                        function getOfferTypesFromCategoryAjax(code) {
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
                    
                    self.saveAdditionButton = function () {
                    };
                    self.saveEditButton = function () {
                    };                    

                    var getData = function () {
                        self.offersLoaded = ko.observable();
                        self.offersValid = ko.observable();

                        function getOffersAjax() {
                            //GET /rest/offers - REST
                            self.offersLoaded(false);
                            return $.when(restClient.doGet('http://www.rdg-connect.org/rest/offers')
                                .then(
                                    success = function (response) {
                                        console.log(response.offers);
                                        self.offersValues(response.offers);
                                        self.offersValid(true);
                                    },
                                    error = function (response) {
                                        console.log("Offers not loaded");
                                        self.offersValid(false);
                                }).then(function () {
                                    var sortCriteria = {key: 'name', direction: 'ascending'};
                                    var arrayDataSource = new oj.ArrayTableDataSource(self.offersValues(), {idAttribute: 'id'});
                                    arrayDataSource.sort(sortCriteria);
                                    self.offersDataProvider(new oj.PagingTableDataSource(arrayDataSource));
                                }).then(function () {
                                    self.offersLoaded(true);
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
                        
                        Promise.all([getOffersAjax()])
                        .then(function () {
                            Promise.all([getOfferTypesCategoriesAjax()])
                        })
                        .catch(function () {
                            //even if error remove loading bar
                            self.offersLoaded(true);
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

            return OffersViewModel;
        }
);
