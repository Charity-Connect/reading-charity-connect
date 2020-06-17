/**
 * @license
 * Copyright (c) 2014, 2019, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 * @ignore
 */
/*
 * Your admin ViewModel code goes here
 */
define(['appController','ojs/ojrouter','utils','ojs/ojcore', 'knockout', 'jquery', 'accUtils', 'restClient','ojs/ojknockouttemplateutils', 'ojs/ojarraydataprovider',
    'ojs/ojprogress', 'ojs/ojbutton', 'ojs/ojlabel', 'ojs/ojinputtext',
    'ojs/ojarraytabledatasource', 'ojs/ojtable', 'ojs/ojpagingtabledatasource', 'ojs/ojpagingcontrol', 'ojs/ojselectsingle', 'ojs/ojcheckboxset','ojs/ojformlayout'],
        function (app,Router,utils,oj, ko, $, accUtils, restClient,KnockoutTemplateUtils,ArrayDataProvider) {

            function AdminViewModel() {
                var self = this;

                var router = Router.rootInstance;
                var stateParams = router.observableModuleConfig().params.ojRouter.parameters;
                var userId=stateParams.userId();


				if(app.currentOrg.organization_admin!="Y"){
					return;
				}

                self.postTextColor = ko.observable();
                self.postText = ko.observable();
                self.fileContentPosted = ko.observable(true);

                self.connected = function () {
                    accUtils.announce('Organization Admin page loaded.');
                    document.title = "Organization Admin";

                    self.id = ko.observable();

                    self.userOrgValues = ko.observableArray();
                    self.userValues = ko.observableArray();

                    self.userRowSelected = ko.observableArray();
                    self.userSelected = ko.observable("");
                    self.userId = ko.observable();
                    self.userName = ko.observable();
                    self.userEmail = ko.observable();
                    self.userPhone = ko.observable();
                    self.userOrgId = ko.observable();
                    self.userAdmin = ko.observableArray([]);
                    self.userNeedApprover = ko.observableArray([]);
                    self.userApprover = ko.observableArray([]);
                    self.userConfirmed = ko.observableArray([]);
                    self.userManageClients = ko.observableArray([]);
                    self.userClientShareApprover = ko.observableArray([]);
                    self.userManageOffers = ko.observableArray([]);


                    function populateUserOrgData(params)
                    {
                        self.id(params.id);
                        self.userId(params.user_id);
                        self.userName(params.name);
                        self.userEmail(params.email);
                        self.userPhone(params.phone);
                        self.userOrgId(params.organization_id);
                        self.userAdmin([]);
                        if (params.admin === "Y") {
                            self.userAdmin(["admin"]);
                        }
                        self.userNeedApprover([]);
                        if (params.need_approver === "Y") {
                            self.userNeedApprover(["need_approver"]);
                        }
                        self.userApprover([]);
                        if (params.user_approver === "Y") {
                            self.userApprover(["user_approver"]);
                        }
                        self.userManageClients([]);
                        if (params.manage_clients === "Y") {
                            self.userManageClients(["manage_clients"]);
                        }
                        self.userManageOffers([]);
                        if (params.manage_offers === "Y") {
                            self.userManageOffers(["manage_offers"]);
                        }
                        self.userClientShareApprover([]);
                        if (params.client_share_approver === "Y") {
                            self.userClientShareApprover(["client_share_approver"]);
                        }
                        self.userConfirmed([]);
                        if (params.confirmed === "Y") {
                            self.userConfirmed(["confirmed"]);
                        }

                    }


                    self.cancelButton = function (event) {
                        router.go('orgAdmin');
                    }

                    self.deleteUserButton = function () {
                        return $.when(restClient.doDeleteJson('/rest/user_organizations/'+ self.userId())
                            .then(
                                success = function (response) {
                                    router.go('orgAdmin');
                                },
                                error = function (response) {
                                    self.postText("Error: User changes not deleted.");
                                    self.postTextColor("red");
                                    console.log("user data not deleted");
                                }).then(function () {
                                self.fileContentPosted(true);
                                $("#postMessage").css('display', 'inline-block').fadeOut(2000, function () {
                                    //self.disableSaveButton(false);
                                });
                            })
                        );
                    }

                    self.saveUserButton = function () {

                        var userData =
                            {
                                "id":self.userId(),
                                "display_name": self.userName(),
                                "email": self.userEmail(),
                                "phone": self.userPhone()
                            };

                        var userOrgData =
                            {
                                "id":self.id(),
                                "user_id":self.userId(),
                                "organization_id":self.userOrgId(),
                                "admin": (self.userAdmin().length > 0) ? "Y" : "N",
                                "need_approver": (self.userNeedApprover().length > 0) ? "Y" : "N",
                                "user_approver": (self.userApprover().length > 0) ? "Y" : "N",
                                "manage_clients": (self.userManageClients().length > 0) ? "Y" : "N",
                                "manage_offers": (self.userManageOffers().length > 0) ? "Y" : "N",
                                "client_share_approver": (self.userClientShareApprover().length > 0) ? "Y" : "N",
                                "confirmed": (self.userConfirmed().length > 0) ? "Y" : "N"
                            };
                        return $.when(restClient.doPost('/rest/users', userData)
                            .then(
                                success = function (response) {
                                    self.postText("You have succesfully saved user details.");
                                    self.postTextColor("green");
                                    return $.when(restClient.doPost('/rest/organizations/' + self.userOrgId() + '/user_organizations', userOrgData)
                                        .then(
                                            success = function (response) {
                                                console.log("user data posted");
                                            })
                                    );
                                },
                                error = function (response) {
                                    self.postText("Error: User changes not saved.");
                                    self.postTextColor("red");
                                    console.log("user data not posted");
                                }).then(function () {
                                self.fileContentPosted(true);
                                $("#postMessage").css('display', 'inline-block').fadeOut(2000, function () {
                                    //self.disableSaveButton(false);
                                });
                            })
                        );
                    };



                    var getData = function () {
                        self.userOrgLoaded = ko.observable();
                        self.userOrgValid = ko.observable();
                        self.userOrgId = ko.observable(utils.appConstants.users.organizationId);


                        self.getUserOrgData = function (userId) {
                                //GET /rest/organizations - REST
                                return $.when(restClient.doGet('/rest/users/' + userId + '/user_organizations')
                                    .then(
                                        success = function (response) {
                                            if (response.user_organizations.length > 0)
                                            {
                                                self.userOrgValues(response.user_organizations[0]);
                                            }

                                            var promises = [];
                                            $.each(response.user_organizations, function (key, value) {
                                                    promises.push($.when(self.getUsersData(value.user_id)));

                                            });
                                            Promise.all(promises).then(function () {
                                                self.userOrgLoaded(true);
                                                self.userOrgValid(true);
                                            });

                                        },
                                        error = function (response) {
                                            console.log("User organizations not loaded");
                                            self.userOrgValid(false);

                                        })

                                );
                        }

                        self.getUsersData = function ( userId) {
                            //GET /rest/organizations - REST
                            return $.when(restClient.doGet('/rest/users/' + userId)
                                .then(
                                    success = function (response) {
                                            self.userOrgValues().name = response.display_name;
                                            self.userOrgValues().email = response.email;
                                            self.userOrgValues().phone = response.phone;

                                        populateUserOrgData(self.userOrgValues());
                                    },
                                    error = function (response) {
                                        console.log("Users  not loaded");

                                    }).then(function () {

                                })
                            );
                        }


                        Promise.all([self.getUserOrgData(userId)])

                            .catch(function () {
                                //even if error remove loading bar
                                self.userOrgLoaded(true);
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
