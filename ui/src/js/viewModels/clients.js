/**
 * @license
 * Copyright (c) 2014, 2019, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 * @ignore
 */
/*
 * Your clients ViewModel code goes here
 */
define(['ojs/ojcore', 'knockout', 'jquery', 'accUtils', 'utils', 'restClient', 'restUtils', 'ojs/ojarraydataprovider',
    'ojs/ojprogress', 'ojs/ojbutton', 'ojs/ojlabel', 'ojs/ojinputtext', 'ojs/ojselectsingle', 'ojs/ojdatetimepicker', 'ojs/ojdialog',
    'ojs/ojarraytabledatasource', 'ojs/ojtable', 'ojs/ojpagingtabledatasource', 'ojs/ojpagingcontrol'],
        function (oj, ko, $, accUtils, utils, restClient, restUtils, ArrayDataProvider) {

            function ClientsViewModel() {
                var self = this;

                self.connected = function () {
                    accUtils.announce('Clients page loaded.');
                    document.title = "Clients";

                    self.clientsValues = ko.observableArray();
                    self.clientsDataProvider = ko.observable();
                    self.renderer1 = oj.KnockoutTemplateUtils.getRenderer("combineAddressPostcode_tmpl", true);
                    self.clientsTableColumns = [
                        {headerText: 'NAME', field: "name"},
                        {headerText: 'ADDRESS', renderer: self.renderer1, sortProperty: "address"},
                        {headerText: 'EMAIL', field: "email"},
                        {headerText: 'PHONE', field: "phone"}
                    ];

                    self.clientNeedsValues = ko.observableArray();
                    self.clientNeedsDataProvider = ko.observable();
                    self.clientNeedsTableColumns = [
                        {headerText: 'TYPE', field: "type_name"},
                        {headerText: 'NEED MET?', field: "need_met"},
                        {headerText: 'DATE NEEDED', field: 'clientDateNeeded', sortProperty: "clientDateNeededRaw"},
                        {headerText: 'NOTES', field: "notes"}
                    ];

                    self.offerTypesCategoriesValues = ko.observableArray();
                    self.offerTypesCategoriesArray = ko.observableArray([]);
                    self.offerTypesCategoriesDataProvider = ko.observable();

                    self.offerTypesValues = ko.observableArray();
                    self.offerTypesArray = ko.observableArray([]);
                    self.offerTypesDataProvider = ko.observable();

                    self.disableSelectEditType = ko.observable(true);
                    self.offerTypeSelected = ko.observable("");
                    self.offerTypesCategorySelected = ko.observable("");
                    self.disableNeedSaveButton = ko.observable(true);

                    self.selectedRowDisplay = ko.observable("clientNeeds");
                    self.addClientButtonSelected = ko.observableArray([]);
                    self.clientRowSelected = ko.observableArray();
                    self.clientSelected = ko.observable("");
                    self.showPanel = ko.computed(function () {
                        if (self.addClientButtonSelected().length) {
                            self.selectedRowDisplay("clientFormFields");
                            // big reset!
                            self.clientRowSelected([]);
                            self.clientSelected("");
                            return true;
                        }
                        if (self.clientRowSelected().length) {
                            self.selectedRowDisplay("clientNeeds");
                            return true;
                        }
                    }, this);

                    var primaryHandlerLogic = function() {
                        self.handleClientRowChanged = function (event) {
                            if (event.detail.value[0] !== undefined) {
                                self.addClientButtonSelected([]);
                                //find whether node exists based on selection
                                function searchNodes(nameKey, myArray){
                                    for (var i=0; i < myArray.length; i++) {
                                        if (myArray[i].id === nameKey) {
                                            return myArray[i];
                                        }
                                    }
                                };
                                self.clientSelected(searchNodes(event.target.currentRow.rowKey, self.clientsValues()));
                                console.log(self.clientSelected());
                                self.getClientNeedsAjax(self.clientSelected().id);
                            }
                        };
                        self.getClientNeedsAjax = function(clientId) {
                            self.clientNeedsValues([]);
                            //GET /rest/clients/{client id}/client_needs - REST
                            return $.when(restClient.doGet(`${restUtils.constructUrl(restUtils.EntityUrl.CLIENTS)}/${clientId}/client_needs`)
                                .then(
                                    success = function (response) {
                                        console.log(response.client_needs);
                                        $.each(response.client_needs, function(index, item) {
                                            var dateNeededCleansed;
                                            var dateNeededCleansedLocale;
                                            if (this.date_needed) {
                                                //no need to split as UTC anyway
                                                dateNeededCleansed = new Date(this.date_needed);
                                                dateNeededCleansedLocale = dateNeededCleansed.toLocaleDateString();
                                            } else {
                                                //if new entry and nothing selected
                                                dateNeededCleansed = "";
                                                dateNeededCleansedLocale = "";
                                            }
                                            self.clientNeedsValues().push({
                                                clientDateNeededRaw: dateNeededCleansed,
                                                clientDateNeeded: dateNeededCleansedLocale,
                                                details: this.details,
                                                client_id: this.client_id,
                                                id: this.id,
                                                need_met: this.need_met,
                                                notes: this.notes,
                                                requesting_organization_id: this.requesting_organization_id,
                                                type: this.type,
                                                type_name: this.type_name
                                            });
                                        });
                                    },
                                    error = function (response) {
                                        console.log(`Client Needs from Client "${clientId}" not loaded`);
                                }).then(function () {
                                    var sortCriteria = {key: 'type_name', direction: 'ascending'};
                                    var arrayDataSource = new oj.ArrayTableDataSource(self.clientNeedsValues(), {idAttribute: 'id'});
                                    arrayDataSource.sort(sortCriteria);
                                    self.clientNeedsDataProvider(new oj.PagingTableDataSource(arrayDataSource));
                                }).then(function () {
                                })
                            );
                        };

                        self.handleOfferTypesCategoryChanged = function(event) {
                            if (event.target.value !== "") {
                                _getOfferTypesFromCategoryAjax(event.target.value);
                                self.disableSelectEditType(false);
                                self.disableNeedSaveButton(false);
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
                                    self.offerTypeSelected(self.offerTypesArray()[0].value);
                                })
                            );
                        };
                    }();

                        self.handleOfferTypesChanged = function(event) {
                            if (event.target.value !== "") {
                                _getOfferNotesFromTypeAjax(event.target.value);
                            }
                        };

					_getOfferNotesFromTypeAjax = function(code) {
						return $.when(restClient.doGet(`/rest/offer_types/${code}`))
							.then(
								success = function (response) {
									console.log(response.offer_types);
									self.needNotesUpdateVal(response.default_text);
								},
								error = function (response) {
									console.log(`Offer Types  "${code}" not loaded`);
							}
						);
					};


                    var addNeedDialogLogic = function() {
                        self.addNeedButton = function () {
                            document.getElementById('addNeedDialog').open();
                        };

                        self.dateNeededConvertor = ko.observable();
                        self.needNotesUpdateVal = ko.observable("");
                        self.closeAddNeedModalButton = function (event) {
                            //inital disable
                            self.disableSelectEditType(true);
                            self.offerTypeSelected("");
                            self.offerTypesCategorySelected("");
                            self.dateNeededConvertor("");
                            self.needNotesUpdateVal("");
                            self.disableNeedSaveButton(true);
                            document.getElementById('addNeedDialog').close();
                        };
                    }();

                    var postData = function() {
                        self.fileContentPosted = ko.observable(true);
                        self.postText = ko.observable();
                        self.postTextColor = ko.observable();
                        self.disableSaveButton = ko.observable(false);
                        self.saveButton = function (event) {
                            //locale "en-GB" - change UTC to YYYY-MM-DD
                            _formatDate = function(inputDate) {
                                if (inputDate !== null) {
                                    return inputDate.split('T')[0];
                                } else {
                                    return null;
                                }
                            };

                            var postAddress;
                            var responseJson;
                            if (event.target.id === "saveButton") {
                                postAddress = restUtils.constructUrl(restUtils.EntityUrl.CLIENTS);
                                responseJson = {
                                    id: self.clientRowSelected().length ? self.clientSelected().id : null,
                                    name: $('#inputEditName')[0].value,
                                    address: $('#textareaEditAddress')[0].value,
                                    postcode: $('#inputEditPostcode')[0].value,
                                    phone: $('#inputEditPhone')[0].value,
                                    email: $('#inputEditEmail')[0].value,
                                    notes: $('#textareaEditClientNotes')[0].value
                                };
                            } else if (event.target.id === "editNeedSaveButton")  {
                                postAddress = `${restUtils.constructUrl(restUtils.EntityUrl.CLIENT_NEEDS)}/${self.clientSelected().id}/client_needs`;
                                responseJson = {
                                    type: $('#selectEditNeedType')[0].valueItem.data.value,
                                    date_needed: _formatDate($('#datepickerEditNeedDateNeeded')[0].value),
                                    notes: $('#textareaEditNeedNotes')[0].value
                                };
                            };

                            self.fileContentPosted(false);
                            self.disableSaveButton(true);
                            //POST /rest/clients - REST, or
                            //POST /rest/need_requests - REST
                            return $.when(restClient.doPost(postAddress, responseJson)
                                .then(
                                    success = function (response) {
                                        self.postTextColor("green");
                                        if (event.target.id === "saveButton") {
                                            self.postText("You have succesfully saved the client.");
                                            console.log("client data posted");
                                            //update clientsTable
                                            self.getClientsAjax();
                                        } else if (event.target.id === "editNeedSaveButton")  {
                                            self.postText("You have succesfully saved the need.");
                                            console.log("need data posted");
                                            //update clientNeedsTable
                                            self.getClientNeedsAjax(self.clientSelected().id);
                                        };
                                    },
                                    error = function (response) {
                                        self.postTextColor("red");
                                        if (event.target.id === "saveButton") {
                                            self.postText("Error: Client not saved.");
                                            console.log("client data not posted");
                                        } else if (event.target.id === "editNeedSaveButton")  {
                                            self.postText("Error: Need not saved.");
                                            console.log("need data not posted");
                                        };
                                }).then(function () {
                                    self.fileContentPosted(true);
                                    $(".postMessage").css('display', 'inline-block').fadeOut(2000, function(){
                                        self.disableSaveButton(false);
                                    });
                                }).then(function () {
                                    if (event.target.id === "editNeedSaveButton")  {
                                        self.closeAddNeedModalButton();
                                    };
                                    console.log(responseJson);
                                })
                            );
                        };
                    }();

                    var getData = function () {
                        self.getClientsAjax = function() {
                            self.clientsLoaded = ko.observable();
                            self.clientsValid = ko.observable();

                            self.clientsValues([]);
                            //GET /rest/clients - REST
                            self.clientsLoaded(false);
                            return $.when(restClient.doGet(restUtils.constructUrl(restUtils.EntityUrl.CLIENTS))
                                .then(
                                    success = function (response) {
                                        console.log(response.clients);
                                        self.clientsValues(response.clients);
                                        self.clientsValid(true);
                                    },
                                    error = function (response) {
                                        console.log("Clients not loaded");
                                        self.clientsValid(false);
                                }).then(function () {
                                    var sortCriteria = {key: 'name', direction: 'ascending'};
                                    var arrayDataSource = new oj.ArrayTableDataSource(self.clientsValues(), {idAttribute: 'id'});
                                    arrayDataSource.sort(sortCriteria);
                                    self.clientsDataProvider(new oj.PagingTableDataSource(arrayDataSource));
                                }).then(function () {
                                    self.clientsLoaded(true);
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

                        Promise.all([self.getClientsAjax()])
                        .then(function () {
                            Promise.all([getOfferTypesCategoriesAjax()])
                        })
                        .catch(function () {
                            //even if error remove loading bar
                            self.clientsLoaded(true);
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

            return ClientsViewModel;
        }
);
