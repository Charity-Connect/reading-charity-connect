/**
 * @license
 * Copyright (c) 2014, 2019, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 * @ignore
 */
/*
 * Your admin ViewModel code goes here
 */
define(['appController', 'ojs/ojrouter', 'utils', 'ojs/ojcore', 'knockout', 'jquery', 'accUtils', 'restClient', 'ojs/ojknockouttemplateutils', 'ojs/ojarraydataprovider',
    'ojs/ojprogress', 'ojs/ojbutton', 'ojs/ojlabel', 'ojs/ojselectcombobox', 'ojs/ojinputtext',
    'ojs/ojarraytabledatasource', 'ojs/ojtable', 'ojs/ojpagingtabledatasource', 'ojs/ojpagingcontrol', 'ojs/ojselectsingle', 'ojs/ojcheckboxset', 'ojs/ojdialog', 'ojs/ojformlayout'],
    function (app, Router, utils, oj, ko, $, accUtils, restClient, KnockoutTemplateUtils, ArrayDataProvider) {

        function AdminViewModel() {
            var self = this;

            var router = Router.rootInstance;
            var stateParams = router.observableModuleConfig().params.ojRouter.parameters;
            var userId = stateParams.userId();
            var orgId = stateParams.orgId();
            var pageFrom = stateParams.pageFrom();

            if (app.userDetails.admin != "Y") {
                return;
            }

            self.postTextColor = ko.observable();
            self.postText = ko.observable();
            self.fileContentPosted = ko.observable(true);
            self.disableSaveButton = ko.observable(false);

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
                self.userDbsCheck = ko.observable();
                self.userManageOffers = ko.observableArray([]);

                self.cameFromSysAdmin = ko.observable();
                
                function populateUserOrgData(params) {
                    console.log(params);
                    
                    self.id(params.id);
                    self.userId(params.user_id);
                    self.userName(params.name);
                    self.userEmail(params.email);
                    self.userPhone(params.phone);
                    self.userOrgId(params.organization_id);
                    self.userDbsCheck(params.dbs_check);
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

                self.emailChanged = function (event, data, bindingContext) {
                    $.when(restClient.doPostJson('/rest/users/exists', { "email": self.userEmail(), "organization_id": self.userOrgId() })
                        .then(
                            success = function (response) {
                                console.log(response);
                                if (response.exists) {
                                    //user found with same email address
                                    if (response.existsInOrg) {
                                        //duplcate user found to be in same organization
                                        console.log("duplicate user in same org");
                                        self.closeAddUserToOrganizationButton();
                                        document.getElementById('duplicateUserInSameOrgDialog').open();
                                    } else {
                                        //duplicate user found to be in a different organization
                                        console.log("duplicate user in different org");
                                        duplicateUserId = response.id;
                                        document.getElementById('duplicateUserInDifferentOrgDialog').open();
                                    }                                    
                                } else {
                                    self.disableSaveButton(false);
                                };
                            },
                            error = function (response) {
                                console.log("could not check email");
                            }
                        )
                    );
                }
                
                self.closeAddUserToOrganizationButton = function () {
                    document.getElementById('duplicateUserInDifferentOrgDialog').close();
                    self.disableSaveButton(true);
                }
                self.closeDuplicateUserInSameOrg = function () {
                    document.getElementById('duplicateUserInSameOrgDialog').close();
                    self.disableSaveButton(true);
                }

                // Could be coming in from org admin or sys admin
                self.cancelButton = function (event) {
                    router.go(pageFrom);
                }

                self.deleteUserButton = function () {
                    return $.when(restClient.doDeleteJson('/rest/user_organizations/' + self.id())
                        .then(
                            success = function (response) {
                                router.go(pageFrom);
                            },
                            error = function (response) {
                                self.postText("Error: User changes not deleted.");
                                self.postTextColor("red");
                                console.log("user data not deleted");
                            }).then(function () {
                                self.fileContentPosted(true);
                                $("#postMessage").css('display', 'inline-block').fadeOut(app.messageFadeTimeout, function () {
                                    //self.disableSaveButton(false);
                                });
                            })
                    );
                }

                self.saveUserButton = function () {

                    var userData =
                    {
                        "id": self.userId(),
                        "organization_id": utils.appConstants.users.organizationId,
                        "display_name": self.userName(),
                        "email": self.userEmail(),
                        "phone": self.userPhone()
                    };

                    var userOrgData =
                    {
                        "id": self.id(),
                        "user_id": self.userId(),
                        "organization_id": utils.appConstants.users.organizationId,
                        "admin": (self.userAdmin().length > 0) ? "Y" : "N",
                        "need_approver": (self.userNeedApprover().length > 0) ? "Y" : "N",
                        "user_approver": (self.userApprover().length > 0) ? "Y" : "N",
                        "manage_clients": (self.userManageClients().length > 0) ? "Y" : "N",
                        "manage_offers": (self.userManageOffers().length > 0) ? "Y" : "N",
                        "client_share_approver": (self.userClientShareApprover().length > 0) ? "Y" : "N",
                        "dbs_check": (self.userDbsCheck().length > 0) ? self.userDbsCheck() : "U",
                        "confirmed": (self.userConfirmed().length > 0) ? "Y" : "N"
					};
                    return $.when(restClient.doPostJson('/rest/users', userData)
                        .then(
                            success = function (response) {
								if(response.hasOwnProperty('error')){
									self.postText(response.error);
									self.postTextColor("red");
								} else {
									self.postText("You have successfully saved user details.");
									self.postTextColor("green");
									userOrgData.user_id = response.id;
									if (userOrgData.id === undefined) {
										userOrgData.id = response.user_organizations[0].id;
									}
									return $.when(restClient.doPost('/rest/user_organizations/', userOrgData)
										.then(
											success = function (response) {
												console.log("user data posted");
											})
									);
								}
                            },
                            error = function (response) {
                                self.postText("Error: User changes not saved.");
                                self.postTextColor("red");
                                console.log("user data not posted");
                            }).then(function () {
                                self.fileContentPosted(true);
                                $("#postMessage").css('display', 'inline-block').fadeOut(app.messageFadeTimeout, function () {
                                    //self.disableSaveButton(false);
                                });
                            })
                    );
                };



                var getData = function () {
                    self.userOrgLoaded = ko.observable();
                    self.userOrgValid = ko.observable();
                    self.userOrgId = ko.observable(utils.appConstants.users.organizationId);

                    // console.log(utils.appConstants.users.organizationId);

                    self.getUserOrgData = function (userId) {
                        //GET /rest/organizations - REST
                        return $.when(restClient.doGet('/rest/users/' + userId + '/user_organizations')
                            .then(
                                success = function (response) {
                                    for (var i = 0; i < response['count']; i++) {
                                        console.log(response.user_organizations[i].organization_id);
                                        if (response.user_organizations[i].organization_id == orgId) {
                                            console.log(i);
                                            self.userOrgValues(response.user_organizations[i]);
                                            break;
                                        }
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
                                    self.userOrgLoaded(false);
                                    self.userOrgValid(false);

                                }).then(function () {
                                    var dbsCheckStates = [
                                        { value: 'Y', label: 'Yes' },
                                        { value: 'N', label: 'No' },
                                        { value: 'U', label: 'Unknown' }
                                    ];
                                    this.dbsCheckDP = new ArrayDataProvider(dbsCheckStates, { keyAttributes: 'value' });
                                })

                        );
                    }

                    self.getUsersData = function (userId) {
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
                                    self.userOrgLoaded(false);
                                    self.userOrgValid(false);

                                }).then(function () {

                                })
                        );
                    }


                    Promise.all([self.getUserOrgData(userId)])

                        .catch(function () {
                            //even if error remove loading bar
                            self.userOrgLoaded(true);
                            self.userOrgValid(true);
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
