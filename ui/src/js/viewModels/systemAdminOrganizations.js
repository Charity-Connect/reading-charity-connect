/**
 * @license
 * Copyright (c) 2014, 2019, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 * @ignore
 */
/*
 * Your admin ViewModel code goes here
 */
define(['utils','ojs/ojcore', 'knockout', 'jquery', 'accUtils', 'restClient','restUtils', 'ojs/ojknockouttemplateutils',
    'ojs/ojprogress', 'ojs/ojbutton', 'ojs/ojlabel', 'ojs/ojinputtext',
    'ojs/ojarraytabledatasource', 'ojs/ojtable', 'ojs/ojpagingtabledatasource', 'ojs/ojpagingcontrol','ojs/ojformlayout'],
        function (utils,oj, ko, $, accUtils, restClient, restUtils,KnockoutTemplateUtils) {

            function AdminViewModel() {
                var self = this;
                utils.getSetLanguage();
                
                self.postTextColor = ko.observable();
                self.postText = ko.observable();
                self.fileContentPosted = ko.observable(true);

                self.connected = function () {
                    accUtils.announce('Admin page loaded.');
                    document.title = "Admin";

                    self.organizationsValues = ko.observableArray();
                    self.orgDetailid = ko.observable();
                    self.orgDetailname = ko.observable();
                    self.orgDetailaddress = ko.observable();
                    self.orgDetailphone = ko.observable();
                    self.organizationsDataProvider = ko.observable();

                    self.organizationsTableColumns = [
                        {headerText: 'Name', field: "name"},
                        {headerText: 'Address', field: "address"},
                        {headerText: 'Phone', field: "phone"}
                    ];

                    self.addOrganizationButtonSelected = ko.observableArray([]);
                    self.organizationRowSelected = ko.observableArray();
                    self.organizationSelected = ko.observable("");

                    self.showPanel = ko.computed(function () {
                        if (self.addOrganizationButtonSelected().length) {
                            // big reset!
                            self.organizationRowSelected([]);
                            self.organizationSelected("");
                            populateOrgData({});
                            return true;
                        }
                        if (self.organizationRowSelected().length) {
                            return true;
                        }
                    }, this);
                     function populateOrgData(params)
                     {
                         self.orgDetailid(params.id);
                         self.orgDetailname(params.name);
                         self.orgDetailaddress(params.address);
                         self.orgDetailphone(params.phone);
                     }

                    var primaryHandlerLogic = function () {
                        self.handleOrganizationRowChanged = function (event) {
                            if (event.detail.value[0] !== undefined) {
                                self.addOrganizationButtonSelected([]);

                                //find whether node exists based on selection
                                function searchNodes(nameKey, myArray) {
                                    for (var i = 0; i < myArray.length; i++) {
                                        if (myArray[i].id === nameKey) {
                                            return myArray[i];
                                        }
                                    }
                                };
                                self.organizationSelected(searchNodes(event.target.currentRow.rowKey, self.organizationsValues()));
                                populateOrgData(self.organizationSelected());
                            }
                        };

                        self.handleUserRowChanged = function (event) {
                            if (event.detail.value[0] !== undefined) {
                                self.addOrganizationButtonSelected([]);

                                //find whether node exists based on selection
                                function searchNodes(nameKey, myArray) {
                                    for (var i = 0; i < myArray.length; i++) {
                                        if (myArray[i].id === nameKey) {
                                            return myArray[i];
                                        }
                                    }
                                };
                                self.organizationSelected(searchNodes(event.target.currentRow.rowKey, self.organizationsValues()));

                                console.log(self.organizationSelected());
                            }
                        };
                    }();


                    self.saveButton = function (event, context) {
                        var orgData =
                            {
                                "name": self.orgDetailname(),
                                "address": self.orgDetailaddress(),
                                "phone": self.orgDetailphone()
                            };
                        if (self.orgDetailid() !== undefined)
                        {
                            orgData.id = self.orgDetailid();
                        }

                        return $.when(restClient.doPost('/rest/organizations', orgData)
                            .then(
                                success = function (response) {
                                    self.postText("You have succesfully saved the organization.");
                                    self.postTextColor("green");
                                    self.getOrganizationsAjax();
                                    console.log("org data posted");
                                },
                                error = function (response) {
                                    self.postText("Error: Organization changesnot saved.");
                                    self.postTextColor("red");
                                    console.log("org data not posted");
                                }).then(function () {
                                self.fileContentPosted(true);
                                $("#postMessage").css('display', 'inline-block').fadeOut(2000, function () {
                                    self.disableSaveButton(false);
                                });
                            }).then(function () {
                                //console.log(orgData);
                            })
                        );
                    };
                    
                    self.deleteButton = function () {
                        return $.when(restClient.doDeleteJson('/rest/organizations/' + self.orgDetailid)
                            .then(
                                success = function (response) {
                                    router.go('organizations');
                                },
                                error = function (response) {
                                    self.postText("Error: Organization changes not deleted.");
                                    self.postTextColor("red");
                                    console.log("organization data not deleted");
                                }).then(function () {
                                self.fileContentPosted(true);
                                $("#postMessage").css('display', 'inline-block').fadeOut(2000, function () {
                                    //self.disableSaveButton(false);
                                });
                            })
                        );
                    }

                    var getData = function () {
                        self.organizationsLoaded = ko.observable();
                        self.organizationsValid = ko.observable();

                        self.getOrganizationsAjax = function() {
                            //GET /rest/organizations - REST
                            self.organizationsLoaded(false);
                            return $.when(restClient.doGet(restUtils.constructUrl(restUtils.EntityUrl.ORGANIZATIONS))
                                .then(
                                    success = function (response) {
                                        self.organizationsValues(response.organizations);
                                        self.organizationsValid(true);
                                    },
                                    error = function (response) {
                                        console.log("Organizations not loaded");
                                        self.organizationsValid(false);
                                    }).then(function () {
                                    var sortCriteria = {key: 'name', direction: 'ascending'};
                                    var arrayDataSource = new oj.ArrayTableDataSource(self.organizationsValues(), {idAttribute: 'id'});
                                    arrayDataSource.sort(sortCriteria);
                                    self.organizationsDataProvider(new oj.PagingTableDataSource(arrayDataSource));
                                }).then(function () {
                                    self.organizationsLoaded(true);
                                })
                            );
                        };

                        Promise.all([self.getOrganizationsAjax()])
                            .catch(function () {
                                //even if error remove loading bar
                                self.organizationsLoaded(true);
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
