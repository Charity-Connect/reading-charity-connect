/**
 * @license
 * Copyright (c) 2014, 2019, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 * @ignore
 */
/*
 * Your admin ViewModel code goes here
 */
define(['utils','ojs/ojcore', 'knockout', 'jquery', 'accUtils', 'restClient','ojs/ojknockouttemplateutils', 'ojs/ojarraydataprovider',
    'ojs/ojprogress', 'ojs/ojbutton', 'ojs/ojlabel', 'ojs/ojinputtext',
    'ojs/ojarraytabledatasource', 'ojs/ojtable', 'ojs/ojpagingtabledatasource', 'ojs/ojpagingcontrol', 'ojs/ojselectsingle', 'ojs/ojcheckboxset','ojs/ojformlayout'],
        function (utils,oj, ko, $, accUtils, restClient,KnockoutTemplateUtils,ArrayDataProvider) {

            function AdminViewModel() {
                var self = this;
                utils.getSetLanguage();
                
                self.postTextColor = ko.observable();
                self.postText = ko.observable();
                self.fileContentPosted = ko.observable(true);

                self.connected = function () {
                    accUtils.announce('Admin page loaded.');
                    document.title = "Admin";

                    self.needTypesValues = ko.observableArray();
                    self.needDetailType = ko.observable();
                    self.needDetailName = ko.observable();
                    self.needDetailCategory = ko.observable();
                    self.needDetailDefaultText = ko.observable();
                    self.needDetailActive = ko.observableArray(["active"]);
                    self.needTypesDataProvider = ko.observable();

                    self.needTypesTableColumns = [
                        {headerText: 'Name', field: "name"},
                        {headerText: 'Category', field: "category"}
                    ];

                    self.addneedTypeButtonSelected = ko.observableArray([]);
                    self.needTypeRowSelected = ko.observableArray();
                    self.needTypeSelected = ko.observable("");


                    self.offerTypesCategoriesValues = ko.observableArray();
                    self.offerTypesCategoriesArray = ko.observableArray([]);
                    self.offerTypesCategoriesDataProvider = ko.observable();

                    self.showPanel = ko.computed(function () {
                        if (self.addneedTypeButtonSelected().length) {
                            // big reset!
                            self.needTypeRowSelected([]);
                            self.needTypeSelected("");
                            populateNewNeedData();
                            return true;
                        }
                        if (self.needTypeRowSelected().length) {
                            return true;
                        }
                    }, this);

                    function populateNeedData(params)
                    {
                        self.needDetailType(params.type);
                        self.needDetailName(params.name);
                        self.needDetailCategory(params.category);
                        self.needDetailDefaultText(params.default_text);
                        self.needDetailActive([]);
                        if (params.active === "Y"||!params.hasOwnProperty("active")) {
                            self.needDetailActive(["active"]);
                        }

                    }
                    function populateNewNeedData()
                    {
                        self.needDetailType("");
                        self.needDetailName("");
                        self.needDetailCategory("");
                        self.needDetailDefaultText("");
                        self.needDetailActive([]);
                            self.needDetailActive(["active"]);

                    }
                    var primaryHandlerLogic = function () {
                        self.handleneedTypeRowChanged = function (event) {
                            if (event.detail.value[0] !== undefined) {
                                self.addneedTypeButtonSelected([]);

                                //find whether node exists based on selection
                                function searchNodes(nameKey, myArray) {
                                    for (var i = 0; i < myArray.length; i++) {
                                        if (myArray[i].type === nameKey) {
                                            return myArray[i];
                                        }
                                    }
                                };
                                self.needTypeSelected(searchNodes(event.target.currentRow.rowKey, self.needTypesValues()));
                                populateNeedData(self.needTypeSelected());
                            }
                        };

                        self.handleUserRowChanged = function (event) {
                            if (event.detail.value[0] !== undefined) {
                                self.addneedTypeButtonSelected([]);

                                //find whether node exists based on selection
                                function searchNodes(nameKey, myArray) {
                                    for (var i = 0; i < myArray.length; i++) {
                                        if (myArray[i].type === nameKey) {
                                            return myArray[i];
                                        }
                                    }
                                };
                                self.needTypeSelected(searchNodes(event.target.currentRow.rowKey, self.needTypesValues()));

                            }
                        };
                    }();


                    self.saveButton = function () {

                        var needData =
                            {
                                "name": self.needDetailName(),
                                "type": self.needDetailType(),
                                "category": self.needDetailCategory(),
                                "default_text": self.needDetailDefaultText().length>0?self.needDetailDefaultText():"",
                                "active": (self.needDetailActive().length > 0) ? "Y" : "N"
                            };
                        return $.when(restClient.doPost('/rest/offer_types', needData)
                            .then(
                                success = function (response) {
                                    self.postText("You have succesfully saved the Need Type.");
                                    self.postTextColor("green");
                                    self.getneedTypesAjax();
                                    console.log("need type data posted");
                                },
                                error = function (response) {
                                    self.postText("Error: Need Type changes not saved.");
                                    self.postTextColor("red");
                                    console.log("need type data not posted");
                                }).then(function () {
                                self.fileContentPosted(true);
                                $("#postMessage").css('display', 'inline-block').fadeOut(2000, function () {
                                    //self.disableSaveButton(false);
                                });
                            }).then(function () {
                                //console.log(orgData);
                            })
                        );
                    };



                    var getData = function () {
                        self.needTypesLoaded = ko.observable();
                        self.needTypesValid = ko.observable();

                        self.getOfferTypesCategoriesAjax = function() {
                            // GET /rest/offer_type_categories/active - REST
                            return $.when(restClient.doGet('/rest/offer_type_categories/active')
                                .then(
                                    success = function (response) {

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

                        self.getneedTypesAjax = function() {
                            //GET /rest/needTypes - REST
                            self.needTypesLoaded(false);
                            return $.when(restClient.doGet('/rest/offer_types')
                                .then(
                                    success = function (response) {
                                        self.needTypesValues(response.offer_types);
                                        self.needTypesValid(true);
                                    },
                                    error = function (response) {
                                        console.log("Need Types not loaded");
                                        self.needTypesValid(false);
                                    }).then(function () {
                                    var sortCriteria = {key: 'name', direction: 'ascending'};
                                    var arrayDataSource = new oj.ArrayTableDataSource(self.needTypesValues(), {idAttribute: 'type'});
                                    arrayDataSource.sort(sortCriteria);
                                    self.needTypesDataProvider(new oj.PagingTableDataSource(arrayDataSource));
                                }).then(function () {
                                    self.needTypesLoaded(true);
                                })
                            );
                        };

                        Promise.all([self.getneedTypesAjax()])
                            .then(function () {
                                Promise.all([self.getOfferTypesCategoriesAjax()])
                            })
                            .catch(function () {
                                //even if error remove loading bar
                                self.needTypesLoaded(true);
                            });
                    }();


                }




                self.disconnected = function () {
                    // Implement if needed
                };

                self.transitionCompleted = function () {
                    // Implement if needed
                };
            }

            return AdminViewModel;
        }
);
