/**
 * @license
 * Copyright (c) 2014, 2019, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 * @ignore
 */
/*
 * Your offers ViewModel code goes here
 */
define(['ojs/ojcore', 'knockout', 'jquery', 'accUtils', 'utils', 'restClient', 'ojs/ojarraydataprovider',
    'ojs/ojprogress', 'ojs/ojbutton', 'ojs/ojlabel', 'ojs/ojinputtext', 'ojs/ojselectsingle', 'ojs/ojdatetimepicker',
    'ojs/ojarraytabledatasource', 'ojs/ojtable', 'ojs/ojpagingtabledatasource', 'ojs/ojpagingcontrol'],
        function (oj, ko, $, accUtils, utils, restClient, ArrayDataProvider) {

            function OffersViewModel() {
                var self = this;

                self.connected = function () {
                    accUtils.announce('Offers page loaded.');
                    document.title = "Offers";

                    self.offersValues = ko.observableArray();
                    self.offersDataProvider = ko.observable();
                    self.offersTableColumns = [
                        {headerText: 'OFFER NAME', field: "name"},
                        {headerText: 'TYPE', field: "type_name"},
                        {headerText: 'QUANTITY', field: "quantity"},
                        {headerText: 'DATE AVAILABLE', field: 'offerDateAvailable', sortProperty: "offerDateAvailableRaw"},
                        {headerText: 'DATE END', field: 'offerDateEnd', sortProperty: "offerDateEndRaw"}                        
                    ];                    
                    
                    self.offerTypesCategoriesValues = ko.observableArray();
                    self.offerTypesCategoriesArray = ko.observableArray([]);
                    self.offerTypesCategoriesDataProvider = ko.observable();

                    self.offerTypesValues = ko.observableArray();
                    self.offerTypesArray = ko.observableArray([]);
                    self.offerTypesDataProvider = ko.observable();

                    self.disableSelectEditType = ko.observable(true);

                    self.addOfferButtonSelected = ko.observableArray([]);
                    self.offerRowSelected = ko.observableArray();
                    self.offerSelected = ko.observable("");
                    self.offerTypeSelected = ko.observable("");                        
                    self.offerTypesCategorySelected = ko.observable("");
                    self.dateAvailableConvertor = ko.observable();
                    self.dateEndConvertor = ko.observable();
                    self.showPanel = ko.computed(function () {
                        if (self.addOfferButtonSelected().length) {
                            //inital disable
                            self.disableSelectEditType(true);                             
                            // big reset!
                            self.offerRowSelected([]);
                            self.offerSelected("");
                            self.offerTypeSelected("");                        
                            self.offerTypesCategorySelected("");
                            self.dateAvailableConvertor("");
                            self.dateEndConvertor("");
                            return true;                                                            
                        }
                        if (self.offerRowSelected().length) {
                            return true;                            
                        }
                    }, this);

                    var primaryHandlerLogic = function () {
                        self.handleOfferRowChanged = function (event) {
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

                                var calculateCategory = utils.calculateCategory(self.offerSelected().type_name, self.offerTypesValues(), self.offerTypesCategoriesValues());                                
                                self.offerTypesCategorySelected(calculateCategory);
                                if (self.offerSelected().offerDateAvailableRaw) {
                                    self.dateAvailableConvertor(new Date(self.offerSelected().offerDateAvailableRaw).toISOString());
                                } else {
                                    self.dateAvailableConvertor("");
                                }
                                if (self.offerSelected().offerDateEndRaw) {
                                    self.dateEndConvertor(new Date(self.offerSelected().offerDateEndRaw).toISOString());
                                } else {
                                    self.dateEndConvertor("");
                                }
                            }
                        };

                        self.handleOfferTypesCategoryChanged = function(event) {
                            if (event.target.value !== "") {
                                _getOfferTypesFromCategoryAjax(event.target.value);
                                self.disableSelectEditType(false);
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
                                        $.each(response.offers, function(index, item) {
                                            if (this.date_available) {
                                                //no need to split as UTC anyway
                                                var dateAvailableCleansed = new Date(this.date_available);
                                                var dateAvailableCleansedLocale = dateAvailableCleansed.toLocaleDateString();
                                            }
                                            if (this.date_end) {
                                                //no need to split as UTC anyway
                                                var dateEndCleansed = new Date(this.date_end);
                                                var dateEndCleansedLocale = dateEndCleansed.toLocaleDateString();
                                            }
                                            self.offersValues().push({
                                                offerDateAvailableRaw: dateAvailableCleansed,  
                                                offerDateAvailable: dateAvailableCleansedLocale,  
                                                offerDateEndRaw: dateEndCleansed,
                                                offerDateEnd: dateEndCleansedLocale,
                                                details: this.details,
                                                distance: this.distance,
                                                id: this.id,
                                                name: this.name,
                                                organization_id: this.organization_id,
                                                organization_name: this.organization_name,
                                                postcode: this.postcode,                                                
                                                quantity: this.quantity,                                                
                                                type: this.type,
                                                type_name: this.type_name
                                            });
                                        });
                                                                                
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
