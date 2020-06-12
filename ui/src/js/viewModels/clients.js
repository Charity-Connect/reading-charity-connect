/**
 * @license
 * Copyright (c) 2014, 2019, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 * @ignore
 */
/*
 * Your clients ViewModel code goes here
 */
define(['appController','ojs/ojrouter','ojs/ojcore', 'knockout', 'jquery', 'accUtils', 'utils', 'restClient', 'restUtils', 'ojs/ojarraydataprovider',
    'ojs/ojprogress', 'ojs/ojbutton', 'ojs/ojlabel', 'ojs/ojinputtext', 'ojs/ojselectsingle', 'ojs/ojdatetimepicker', 'ojs/ojdialog',
    'ojs/ojarraytabledatasource', 'ojs/ojtable', 'ojs/ojpagingtabledatasource', 'ojs/ojpagingcontrol'],
        function (app,Router,oj, ko, $, accUtils, utils, restClient, restUtils, ArrayDataProvider) {

            function ClientsViewModel() {
                var self = this;
                if(app.currentOrg.manage_clients!="Y"){
					return;
				}
			    var router = Router.rootInstance;

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

                    self.selectedRowDisplay = ko.observable("clientNeeds");
                    self.addClientButtonSelected = ko.observableArray([]);
                    self.clientRowSelected = ko.observableArray();
                    self.clientSelected = ko.observable("");
                    self.addClient=function(event){
						router.go('client/new');

					}

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
                                var client=searchNodes(event.target.currentRow.rowKey, self.clientsValues());

                                router.go('client/' + client.id);
                            }
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


                        Promise.all([self.getClientsAjax()])
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
