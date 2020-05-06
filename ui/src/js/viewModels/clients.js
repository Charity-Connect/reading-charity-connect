/**
 * @license
 * Copyright (c) 2014, 2019, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 * @ignore
 */
/*
 * Your clients ViewModel code goes here
 */
define(['ojs/ojcore', 'knockout', 'jquery', 'accUtils', 'restClient',
    'ojs/ojprogress', 'ojs/ojbutton', 'ojs/ojlabel', 'ojs/ojinputtext',
    'ojs/ojarraytabledatasource', 'ojs/ojtable', 'ojs/ojpagingtabledatasource', 'ojs/ojpagingcontrol'],
        function (oj, ko, $, accUtils, restClient) {

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
                        {headerText: 'TYPE', field: "type"},
                        {headerText: 'NEED MET?', field: "need_met"},                        
                        {headerText: 'DATE NEEDED', field: "date_needed"},
                        {headerText: 'NOTES', field: "notes"}                        
                    ];

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
                        
                    var handlerLogic = function() {                                                
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
                                _getClientNeedsAjax(self.clientSelected().id);
                            }
                        };
                        _getClientNeedsAjax = function(clientId) {
                            //GET /rest/clients/{client id}/client_needs - REST
                            return $.when(restClient.doGet(`http://www.rdg-connect.org/rest/clients/${clientId}/client_needs`)
                                .then(
                                    success = function (response) {
                                        console.log(response.client_needs);
                                        self.clientNeedsValues(response.client_needs);
                                    },
                                    error = function (response) {
                                        console.log(`Client Needs from Client "${clientId}" not loaded`);
                                }).then(function () {
                                    var sortCriteria = {key: 'type', direction: 'ascending'};
                                    var arrayDataSource = new oj.ArrayTableDataSource(self.clientNeedsValues(), {idAttribute: 'id'});
                                    arrayDataSource.sort(sortCriteria);
                                    self.clientNeedsDataProvider(new oj.PagingTableDataSource(arrayDataSource));
                                }).then(function () {
                                })
                            );
                        };
                    }();
                    
                    self.saveAdditionButton = function () {
                    };
                    self.saveEditButton = function () {
                    };
                    self.addNeedButton = function () {
                    };

                    var getData = function () {
                        self.clientsLoaded = ko.observable();
                        self.clientsValid = ko.observable();

                        function getClientsAjax() {
                            //GET /rest/clients - REST
                            self.clientsLoaded(false);
                            return $.when(restClient.doGet('http://www.rdg-connect.org/rest/clients')
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

                        Promise.all([getClientsAjax()])
                        .then(function () {
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
