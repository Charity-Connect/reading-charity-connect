/**
 * @license
 * Copyright (c) 2014, 2019, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 * @ignore
 */
/*
 * Your admin ViewModel code goes here
 */
define(['appController', 'utils', 'ojs/ojrouter', 'ojs/ojcore', 'knockout', 'jquery', 'accUtils', 'restClient', 'restUtils', 'ojs/ojknockouttemplateutils',
    'ojs/ojprogress', 'ojs/ojbutton', 'ojs/ojlabel', 'ojs/ojinputtext',
    'ojs/ojarraytabledatasource', 'ojs/ojtable', 'ojs/ojpagingtabledatasource', 'ojs/ojpagingcontrol', 'ojs/ojformlayout', 'ojs/ojdialog', 'ojs/ojcheckboxset'],
    function (app, utils, Router, oj, ko, $, accUtils, restClient, restUtils, KnockoutTemplateUtils) {

        function AdminViewModel() {
            var self = this;
            utils.getSetLanguage();

            var router = Router.rootInstance;
            if (app.userDetails.admin != "Y") {
                return;
            }

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
                self.orgUpdateDate = ko.observable("");
                self.orgUpdatedBy = ko.observable("");

                self.organizationsTableColumns = [
                    { headerText: 'Name', field: "name" },
                    { headerText: 'Address', field: "address" },
                    { headerText: 'Phone', field: "phone" }
                ];

                self.userOrgValues = ko.observableArray();
                self.userValues = ko.observableArray();
                self.userOrgDataProvider = ko.observable();
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
                self.userOrgLoaded = ko.observable();
                self.userOrgValid = ko.observable();
                self.duplicateUserId = 0;



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
                function populateOrgData(params) {
                    self.orgDetailid(params.id);
                    self.orgDetailname(params.name);
                    self.orgDetailaddress(params.address);
                    self.orgDetailphone(params.phone);
                    if (params.update_date) {
                        updateDt = new Date(params.update_date.replace(/-/g, '/'));
                        self.orgUpdateDate(updateDt.toLocaleTimeString("en-GB", { hour: '2-digit', minute: '2-digit' }) + " " + updateDt.toLocaleDateString("en-GB"));
                    } else {
                        self.orgUpdateDate("unknown");
                    }
                    self.orgUpdatedBy(params.updated_by);
                    if (params.id) {
                        Promise.all([self.getUserOrgData(params.id)])
                            .catch(function () {
                                //even if error remove loading bar
                                self.organizationsLoaded(true);
                            });
                    }


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
                            //GET /rest/user_organizations/{user organization id} - REST
                            return $.when(restClient.doGetJson('/rest/user_organizations/' + event.detail.value[0].startKey.row)
                                .then(
                                    success = function (response) {
                                        router.go('user/' + response.user_id);
                                    },
                                    error = function (response) {
                                        console.log("User organizations not loaded");
                                        self.userOrgValid(false);
                                    })
                            );
                        }
                    };
                }();

                self.getUserOrgData = function (orgId) {
                    //GET /rest/organizations - REST
                    return $.when(restClient.doGetJson('/rest/organizations/' + orgId + '/user_organizations')
                        .then(
                            success = function (response) {
                                self.userOrgValues(response.user_organizations);
                                var userOrgs = self.userOrgValues().filter(function (user) {
                                    user.adminTable = [];
                                    if (user.admin === "Y") {
                                        user.adminTable = ['checked'];
                                    }

                                });

                                var sortCriteria = { key: 'name', direction: 'ascending' };
                                var arrayDataSource = new oj.ArrayTableDataSource(self.userOrgValues(), { idAttribute: 'id' });
                                arrayDataSource.sort(sortCriteria);
                                self.userOrgDataProvider(new oj.PagingTableDataSource(arrayDataSource));
                                self.userOrgLoaded(true);
                                self.userOrgValid(true);

                            },
                            error = function (response) {
                                console.log("User organizations not loaded");
                                self.userOrgValid(false);

                            })

                    );
                }
                self.saveButton = function (event, context) {
                    var orgData =
                    {
                        "name": self.orgDetailname(),
                        "address": self.orgDetailaddress(),
                        "phone": self.orgDetailphone()
                    };
                    if (self.orgDetailid() !== undefined) {
                        orgData.id = self.orgDetailid();
                    }

                    return $.when(restClient.doPostJson('/rest/organizations', orgData)
                        .then(
                            success = function (response) {
                                self.orgDetailid(response.id);
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
                    return $.when(restClient.doDeleteJson('/rest/organizations/' + self.orgDetailid())
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

                self.addUserButton = function () {
                    document.getElementById('addUserDialog').open();
                }
                self.saveUserButton = function () {
                    document.getElementById('addUserDialog').open();
                }
                self.closeAddUserButton = function () {
                    document.getElementById('addUserDialog').close();
                }

                self.emailChanged = function (event, data, bindingContext) {
                    $.when(restClient.doPostJson('/rest/users/exists', { "email": self.userEmail() })
                        .then(
                            success = function (response) {
                                if (response.exists) {
                                    duplicateUserId = response.id;
                                    document.getElementById('duplicateUserDialog').open();
                                };
                            },
                            error = function (response) {
                                console.log("could not check email");
                            }
                        )
                    );
                }

                self.closeAddUserToOrganizationButton = function () {
                    document.getElementById('duplicateUserDialog').close();
                    document.getElementById('addUserDialog').close();
                }
                self.addUserToOrganizationButton = function () {
                    var userData =
                    {
                        "organization_id": self.orgDetailid(),
                        "user_id": duplicateUserId,
                        "admin": self.userAdmin().length > 0 ? "Y" : "N",
                        "user_approver": self.userAdmin().length > 0 ? "Y" : "N",
                        "need_approver": self.userAdmin().length > 0 ? "Y" : "N",
                        "manage_offers": "Y",
                        "manage_clients": "Y",
                        "client_share_approver": self.userAdmin().length > 0 ? "Y" : "N",
                        "dbs_check": "U",
                        "confirmed": "Y"

                    };

                    return $.when(restClient.doPostJson('/rest/user_organizations', userData)
                        .then(
                            success = function (response) {
                                self.postText("You have succesfully saved added the user to the organization.");
                                self.postTextColor("green");
                                document.getElementById('duplicateUserDialog').close();
                                document.getElementById('addUserDialog').close();
                                self.getUserOrgData(self.orgDetailid());

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
                }

                self.saveUserButton = function () {

                    var userData =
                    {
                        "organization_id": self.orgDetailid(),
                        "display_name": self.userName(),
                        "email": self.userEmail(),
                        "phone": null,
                        "admin": self.userAdmin().length > 0 ? "Y" : "N"
                    };

                    return $.when(restClient.doPostJson('/rest/users', userData)
                        .then(
                            success = function (response) {
                                self.postText("You have succesfully saved user details.");
                                self.postTextColor("green");
                                document.getElementById('addUserDialog').close();
                                self.getUserOrgData(self.orgDetailid());

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

                self.userDeleteClicked = function (event) {
                    event.detail.originalEvent.stopPropagation();

                    return $.when(restClient.doDeleteJson('/rest/user_organizations/' + event.target.id)
                        .then(
                            success = function (response) {
                                self.getUserOrgData(self.orgDetailid());
                            },
                            error = function (response) {
                                self.postText("Error: User not deleted.");
                                self.postTextColor("red");
                                console.log("user_organizations data not deleted");
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

                    self.getOrganizationsAjax = function () {
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
                                    var sortCriteria = { key: 'name', direction: 'ascending' };
                                    var arrayDataSource = new oj.ArrayTableDataSource(self.organizationsValues(), { idAttribute: 'id' });
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
