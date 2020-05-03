/**
 * @license
 * Copyright (c) 2014, 2019, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 * @ignore
 */
/*
 * Your offers ViewModel code goes here
 */
define(['ojs/ojcore', 'knockout', 'jquery', 'accUtils', 'restClient',
    'ojs/ojprogress', 'ojs/ojbutton', 'ojs/ojlabel', 'ojs/ojinputtext',
    'ojs/ojarraytabledatasource', 'ojs/ojtable', 'ojs/ojpagingtabledatasource', 'ojs/ojpagingcontrol'],
        function (oj, ko, $, accUtils, restClient) {

            function OffersViewModel() {
                var self = this;

                self.connected = function () {
                    accUtils.announce('Offers page loaded.');
                    document.title = "Offers";

                    self.offersValues = ko.observableArray();
                    self.offersDataProvider = ko.observable();

                    self.offersTableColumns = [
                        {headerText: 'QUANTITY', field: "quantity"},
                        {headerText: 'TYPE NAME', field: "type_name"},
                        {headerText: 'NAME', field: "name"},
                        {headerText: 'DETAILS', field: "details"},
                        {headerText: 'ORGANIZATION', field: "organization_id"},
                        {headerText: 'POSTCODE', field: "postcode"},
                        {headerText: 'DATE AVAILABLE', field: "date_available"},
                        {headerText: 'DATE END', field: "date_end"}                        
                    ];

                    var getData = function () {
                        self.offersLoaded = ko.observable();
                        self.offersValid = ko.observable();

                        self.offerRowSelected = ko.observableArray();
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

                        self.addOfferButton = function () {
                        };

                        self.offerSelected = ko.observable("");
                        self.handleOfferRowChanged = function (event) {
                            if (event.detail.value[0] !== undefined) {
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
                            } else {
                                self.offerSelected("");
                            }
                        };

                        self.submitEditButton = function () {
                        };

                        Promise.all([getOffersAjax()])
                        .then(function () {
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
