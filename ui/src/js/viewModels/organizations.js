/**
 * @license
 * Copyright (c) 2014, 2019, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 * @ignore
 */
/*
 * Your organizations ViewModel code goes here
 */
define(['ojs/ojcore', 'knockout', 'jquery', 'accUtils', 'restClient',
    'ojs/ojprogress', 'ojs/ojbutton', 'ojs/ojarraytabledatasource', 'ojs/ojtable', 'ojs/ojpagingtabledatasource', 'ojs/ojpagingcontrol'],
    function (oj, ko, $, accUtils, restClient) {

        function OrganizationsViewModel() {
            var self = this;
            
            self.connected = function () {
                accUtils.announce('Organizations page loaded.');
                document.title = "Organizations";

            if (oj.KnockoutTemplateUtils) {
                self.renderer1 = oj.KnockoutTemplateUtils.getRenderer("organizationNavButton_tmpl", true);
            }

            self.organizationsValues = ko.observableArray();
            self.organizationsDataProvider = ko.observable();

            self.organizationsTableColumns = [
                {headerText: 'ORGANIZATION', field: "name"},
                {headerText: 'ADDRESS', field: "address"},
                {headerText: 'APPROVER EMAIL', field: "approver_email"}                
            ];

//                function postLoginDetails() {
//                    //POST /rest/login - REST
//                    const loginParams = {
//                        email: "oli.harris@oracle.com",
//                        password: "Drag0nA1r!"
//                    }; 
//                    return $.when(restClient.doPost('http://www.rdg-connect.org/rest/login', loginParams)
//                        .then(
//                            success = function(response) {
//                                console.log(response);                        
//                            },
//                            error = function(response) {
//                            }                    
//                        ).then(function() {                                                        
//                        })       
//                    );
//                };

                var getData = function() {
                    self.organizationsLoaded = ko.observable();
                    self.organizationsValid = ko.observable();
                    
                    self.organizationRowSelected = ko.observableArray();                    
                    function getOrganizationsAjax() {
                        //GET /rest/organizations - REST
                        self.organizationsLoaded(false);
                        return $.when(restClient.doGet('http://www.rdg-connect.org/rest/organizations')
                            .then(
                                success = function(response) {
                                    console.log(response.organizations);
                                    self.organizationsValues(response.organizations);
                                    self.organizationsValid(true);                        
                                },
                                error = function(response) {
                                    console.log("Organizations not loaded");
                                    self.organizationsValid(false);
                                }                    
                            ).then(function() {
                                var sortCriteria = {key: 'name', direction: 'ascending'};
                                var arrayDataSource = new oj.ArrayTableDataSource(self.organizationsValues(), {keyAttributes: 'id'});
                                arrayDataSource.sort(sortCriteria);
                                self.organizationsDataProvider(new oj.PagingTableDataSource(arrayDataSource));                                                        
                            }).then(function() {
                                self.organizationsLoaded(true);
                            })       
                        );
                    };
                    
                    self.addOrganizationButton = function() {

                    };

                    self.organizationSelected = ko.observableArray();                    
                    self.handleOrganizationRowChanged = function(event) {
                        if (event.detail.value[0] !== undefined) { 
                            self.organizationSelected(event.target.currentRow.rowKey);
                        } else {
                            self.organizationSelected([]);                            
                        }
                    };                   
                
                    Promise.all([getOrganizationsAjax()])
                    .then(function() {
                    })
                    .catch(function() {
                        //even if error remove loading bar
                        self.organizationsLoaded(true);                                                                
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

        return OrganizationsViewModel;
    }
);
