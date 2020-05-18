/**
 * @license
 * Copyright (c) 2014, 2019, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 * @ignore
 */
/*
 * Your application specific code will go here
 */
define(['knockout', 'ojs/ojmodule-element-utils', 'ojs/ojresponsiveutils', 'ojs/ojresponsiveknockoututils', 'ojs/ojrouter', 'ojs/ojconfig', 'ojs/ojarraydataprovider', 'ojs/ojknockouttemplateutils', 'restClient', 'restUtils','utils',
    'ojs/ojmodule-element', 'ojs/ojknockout'],
        function (ko, moduleUtils, ResponsiveUtils, ResponsiveKnockoutUtils, Router, Config, ArrayDataProvider, KnockoutTemplateUtils, restClient, restUtils,utils) {
            function ControllerViewModel() {
                var self = this;

                self.KnockoutTemplateUtils = KnockoutTemplateUtils;

                // Handle announcements sent when pages change, for Accessibility.
                self.manner = ko.observable('polite');
                self.message = ko.observable();
                // User role
                self.userRole = ko.observable("user");
                document.getElementById('globalBody').addEventListener('announce', announcementHandler, false);

                function announcementHandler(event) {
                    setTimeout(function () {
                        self.message(event.detail.message);
                        self.manner(event.detail.manner);
                    }, 200);
                };

                // Media queries for responsive layouts
                var smQuery = ResponsiveUtils.getFrameworkQuery(ResponsiveUtils.FRAMEWORK_QUERY_KEY.SM_ONLY);
                self.smScreen = ResponsiveKnockoutUtils.createMediaQueryObservable(smQuery);


                // Header
                // Application Name used in Branding Area
                self.appName = ko.observable();
                // User Info used in Global Navigation area
                self.userLogin = ko.observable();
                self.currentOrganization = ko.observable();

                //log-in logic
                getUser = function() {
                    //GET /rest/users/current - REST
                    return $.when(restClient.doGet(`${restUtils.constructUrl(restUtils.EntityUrl.USERS)}/current`)
                        .then(
                            success = function(response) {
                                self.userLogin(response.email);
                                utils.appConstants.users.displayName = response.display_name;
                                utils.appConstants.users.email = response.email;
                                utils.appConstants.users.organizationId = response.organization_id;
                                utils.appConstants.users.confirmed = response.confirmed;
                                self.currentOrganization(response.organization_name);
                                if(response.confirmed!="Y"){
									alert("Your account is not confirmed yet. Please check your e-mail for a message."); // please add a proper way to display the message.
								}
								const user_confirmed_organizations=response.user_organizations.filter(user_organization => user_organization.confirmed=='Y');
								if(user_confirmed_organizations.length==0){
									alert("You are not a confirmed member of any organization yet."); // please add a proper way to display the message.
								}

								if(user_confirmed_organizations.length>1){
									user_confirmed_organizations.forEach(function(org) {
										$("#orgMenu").append("<oj-option id=\"org_"+org.organization_id+"\" value=\""+org.organization_id+"\">"+org.organization_name+"</oj-option>");
									});

								}
                            },
                            error = function() {
                                window.location.href = "/rest/logout?redirect=/index.html?redirect=" + window.location.pathname;
                            }
                        )
                    )
                }();
                //switch org logic
                self.orgMenuItemAction = function(event) {

					$.when(restClient.doGet('/rest/set_organization?id='+event.target.value)
                        .then(
                            success = function(response) {
                                self.currentOrganization(response.organization_name);
                            },
                            error = function() {
                                alert("err");
                            }
                        )
                    );
                };
                //log-out logic
                self.menuItemAction = function(event) {
                    if (event.target.value === "out") {
                        window.location.href = "/rest/logout?redirect=/index.html";
                    }
                };

                // Router setup
                self.router = Router.rootInstance;
                Router.defaults['urlAdapter'] = new Router.urlParamAdapter();

                // Navigation setup
                var navData;

                $.each([
                        {type: "system-admin",url: '/rest/admin_check'},
                        {type: "organization-admin",url: '/rest/org_admin_check'}],
                    function (k, v) {
                        $.ajax({
                            'url': v.url,
                            'success': function (data) {
                                if (v.type === "system-admin" && data == "true")
                                {
                                    self.userRole("system-admin");
                                }
                                else if (v.type === "organization-admin" && data == "true")
                                {
                                    self.userRole("organization-admin");
                                }
                                if (self.userRole() === "system-admin") {
                                    self.appName("Charity Connect - System Admin");
                                    self.router.configure({
                                        'systemAdminOrganizations': {label: 'systemAdminOrganizations', isDefault: true},
                                        'systemAdminNeedTypes': {label: 'systemAdminNeedTypes'}
                                    });
                                    navData = [
                                        {name: 'Organizations', id: 'systemAdminOrganizations',
                                            iconClass: 'oj-navigationlist-item-icon demo-icon-font-24 demo-person-icon-24'},
                                        {name: 'Need Types', id: 'systemAdminNeedTypes',
                                            iconClass: 'oj-navigationlist-item-icon demo-icon-font-24 demo-person-icon-24'}
                                    ];
                                } else if (self.userRole() === "organization-admin") {
                                    self.appName("Charity Connect - Organization Admin");
                                    self.router.configure({
                                        'organizations': {label: 'Organizations', isDefault: true}
                                    });
                                    navData = [
                                        {name: 'Organizations', id: 'organizations',
                                            iconClass: 'oj-navigationlist-item-icon demo-icon-font-24 demo-home-icon-24'}
                                    ];
                                } else if (self.userRole() === "user") {
                                    self.appName("Reading Charity Connect");
                                    self.router.configure({
                                        'requests': {label: 'Requests', isDefault: true},
                                        'offers': {label: 'Offers'},
                                        'clients': {label: 'Clients'}
                                    });
                                    navData = [
                                        {name: 'Requests', id: 'requests',
                                            iconClass: 'oj-navigationlist-item-icon demo-icon-font-24 demo-chat-icon-24'},
                                        {name: 'Offers', id: 'offers',
                                            iconClass: 'oj-navigationlist-item-icon demo-icon-font-24 demo-info-icon-24'},
                                        {name: 'Clients', id: 'clients',
                                            iconClass: 'oj-navigationlist-item-icon demo-icon-font-24 demo-people-icon-24'}
                                    ];
                                };

                                self.navDataProvider = new ArrayDataProvider(navData, {keyAttributes: 'id'});
                                return true;
                            },
                            'error': function (jqxhr, errorText, error) {
                                self.userRole("user");
                            }
                        });
                    });


                self.loadModule = function () {
                    self.moduleConfig = ko.pureComputed(function () {
                        var name = self.router.moduleConfig.name();
                        var viewPath = 'views/' + name + '.html';
                        var modelPath = 'viewModels/' + name;
                        return moduleUtils.createConfig({viewPath: viewPath,
                            viewModelPath: modelPath, params: {parentRouter: self.router}});
                    });

                    //addition to set locale
                    var newLang = "en-GB";
                    self.setLang = function (event) {
                        Config.setLocale(newLang,
                            function () {
                                document.getElementsByTagName('html')[0].setAttribute('lang', newLang);
                            }
                        );
                    }();
                };



                // Footer
                function footerLink(name, id, linkTarget) {
                    this.name = name;
                    this.linkId = id;
                    this.linkTarget = linkTarget;
                }
                self.footerLinks = ko.observableArray([
                    new footerLink('About Reading Connect', 'aboutOracle', '/about'),
                    new footerLink('Contact Us', 'contactUs', 'http://www.oracle.com/us/corporate/contact/index.html'),
                ]);
            }

            return new ControllerViewModel();
        }
        );
