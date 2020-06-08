/**
 * @license
 * Copyright (c) 2014, 2019, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 * @ignore
 */
/*
 * Your offers ViewModel code goes here
 */
define(['appController','ojs/ojcore', 'knockout', 'jquery', 'accUtils', 'utils', 'restClient', 'restUtils', 'ojs/ojarraydataprovider',
    'ojs/ojprogress', 'ojs/ojbutton', 'ojs/ojlabel', 'ojs/ojinputtext', 'ojs/ojselectsingle', 'ojs/ojdatetimepicker',
    'ojs/ojarraytabledatasource', 'ojs/ojtable', 'ojs/ojpagingtabledatasource', 'ojs/ojpagingcontrol'],
        function (app,oj, ko, $, accUtils, utils, restClient, restUtils, ArrayDataProvider) {

            function OffersViewModel() {
                var self = this;

                if(app.currentOrg.manage_offers!="Y"){
					return;
				}
                self.connected = function () {
                    accUtils.announce('Offers page loaded.');
                    document.title = "Offers";

                    self.offersValues = ko.observableArray();
                    self.offersDataProvider = ko.observable();
                    self.offersTableColumns = [
                        {headerText: 'NAME', field: "name"},
                        {headerText: 'TYPE', field: "type_name"},
                        {headerText: 'QUANTITY AVAILABLE', field: "quantityAvailable"},
                        {headerText: 'DATE FROM', field: 'offerDateAvailable', sortProperty: "offerDateAvailableRaw"},
                        {headerText: 'DATE TO', field: 'offerDateEnd', sortProperty: "offerDateEndRaw"}
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

                                _getOfferCategoryFromTypeAjax = function(code) {
                                    self.offerTypesCategorySelected("");
                                    //GET /rest/offer_types/{code} - REST
                                    return $.when(restClient.doGet(`${restUtils.constructUrl(restUtils.EntityUrl.OFFER_TYPES)}/${code}`)
                                        .then(
                                            success = function (response) {
                                                console.log(response.category);
                                                self.offerTypesCategorySelected(response.category);
                                            },
                                            error = function (response) {
                                                console.log(`Category from Offer Types "${code}" not loaded`);
                                        })
                                    );
                                };
                                _getOfferCategoryFromTypeAjax(self.offerSelected().type);

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
                            return $.when(restClient.doGet(`${restUtils.constructUrl(restUtils.EntityUrl.OFFER_TYPE_CATEGORIES)}/${code}/offer_types`)
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
                                    if (self.offerRowSelected().length) {
                                        self.offerTypeSelected(self.offerSelected().type);
                                    } else {
                                        self.offerTypeSelected(self.offerTypesArray()[0].value);
                                    }
                                })
                            );
                        };
                    }();

                    var postData = function() {
                        self.fileContentPosted = ko.observable(true);
                        self.postText = ko.observable();
                        self.postTextColor = ko.observable();
                        self.disableSaveButton = ko.observable(false);
                        self.saveButton = function () {
                            //locale "en-GB" - change UTC to YYYY-MM-DD
                            _formatDate = function(inputDate) {
                                if (inputDate !== null) {
                                    return inputDate.split('T')[0];
                                } else {
                                    return null;
                                }
                            };

                            var responseJson = {
                                id: self.offerRowSelected().length ? self.offerSelected().id : null,
                                date_available: _formatDate($('#datepickerEditDateAvailable')[0].value),
                                date_end: _formatDate($('#datepickerEditDateEnd')[0].value),
                                details: $('#textareaEditOfferNotes')[0].value,
                                distance: $('#inputEditDistance')[0].value,
                                name: $('#inputEditName')[0].value,
                                postcode: $('#inputEditPostcode')[0].value,
                                quantity: $('#inputEditQuantity')[0].value,
                                type: $('#selectEditType')[0].valueItem.data.value
                            };

                            self.fileContentPosted(false);
                            self.disableSaveButton(true);
                            //POST /rest/offers - REST
                            return $.when(restClient.doPost(restUtils.constructUrl(restUtils.EntityUrl.OFFERS), responseJson)
                                .then(
                                    success = function (response) {
                                        self.postText("You have succesfully saved the offer.");
                                        self.postTextColor("green");
                                        console.log("data posted");

                                        //update offersTable
                                        self.getOffersAjax();
                                    },
                                    error = function (response) {
                                        self.postText("Error: Offer not saved.");
                                        self.postTextColor("red");
                                        console.log("data not posted");
                                }).then(function () {
                                    self.fileContentPosted(true);
                                    $("#postMessage").css('display', 'inline-block').fadeOut(2000, function(){
                                        self.disableSaveButton(false);
                                    });
                                }).then(function () {
                                    console.log(responseJson);
                                })
                            );
                        };
                    }();

                    var getData = function () {
                        self.getOffersAjax = function() {
                            self.offersLoaded = ko.observable();
                            self.offersValid = ko.observable();

                            self.offersValues([]);
                            //GET /rest/offers - REST
                            self.offersLoaded(false);
                            return $.when(restClient.doGet(restUtils.constructUrl(restUtils.EntityUrl.OFFERS))
                                .then(
                                    success = function (response) {
                                        console.log(response.offers);
                                        $.each(response.offers, function(index, item) {
                                            var dateAvailableCleansed;
                                            var dateAvailableCleansedLocale;
                                            if (this.date_available) {
                                                //no need to split as UTC anyway
                                                dateAvailableCleansed = new Date(this.date_available);
                                                dateAvailableCleansedLocale = dateAvailableCleansed.toLocaleDateString();
                                            } else {
                                                //if new entry and nothing selected
                                                dateAvailableCleansed = "";
                                                dateAvailableCleansedLocale = "";
                                            }
                                            var dateEndCleansed;
                                            var dateEndCleansedLocale;
                                            if (this.date_end) {
                                                //no need to split as UTC anyway
                                                dateEndCleansed = new Date(this.date_end);
                                                dateEndCleansedLocale = dateEndCleansed.toLocaleDateString();
                                            } else {
                                                //if new entry and nothing selected
                                                dateEndCleansed = "";
                                                dateEndCleansedLocale = "";
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
                                                quantityAvailable: this.quantity_available+"/"+this.quantity,
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
                            return $.when(restClient.doGet(restUtils.constructUrl(restUtils.EntityUrl.OFFER_TYPE_CATEGORIES))
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

                        Promise.all([self.getOffersAjax()])
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
