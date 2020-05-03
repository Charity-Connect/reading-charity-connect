/**
 * @license
 * Copyright (c) 2014, 2019, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 * @ignore
 */
/*
 * Your application specific code will go here
 */
define(['knockout', 'ojs/ojmodule-element-utils', 'ojs/ojresponsiveutils', 'ojs/ojresponsiveknockoututils', 'ojs/ojrouter', 'ojs/ojarraydataprovider', 'ojs/ojknockouttemplateutils', 'ojs/ojmodule-element', 'ojs/ojknockout'],
        function (ko, moduleUtils, ResponsiveUtils, ResponsiveKnockoutUtils, Router, ArrayDataProvider, KnockoutTemplateUtils) {
            function ControllerViewModel() {
                var self = this;

                self.KnockoutTemplateUtils = KnockoutTemplateUtils;

                // Handle announcements sent when pages change, for Accessibility.
                self.manner = ko.observable('polite');
                self.message = ko.observable();
                document.getElementById('globalBody').addEventListener('announce', announcementHandler, false);

                function announcementHandler(event) {
                    setTimeout(function () {
                        self.message(event.detail.message);
                        self.manner(event.detail.manner);
                    }, 200);
                }
                ;

                // Media queries for repsonsive layouts
                var smQuery = ResponsiveUtils.getFrameworkQuery(ResponsiveUtils.FRAMEWORK_QUERY_KEY.SM_ONLY);
                self.smScreen = ResponsiveKnockoutUtils.createMediaQueryObservable(smQuery);

                // User role
                const userRole = "system-admin";
                
                // Header
                // Application Name used in Branding Area
                self.appName = ko.observable();
                // User Info used in Global Navigation area
                self.userLogin = ko.observable("oli.harris@oracle.com");                

                // Router setup
                self.router = Router.rootInstance;
                
                // Navigation setup
                var navData;                
                
                if (userRole === "system-admin") {
                    self.appName("Charity Connect - System Admin");
                    self.router.configure({
                        'organizations': {label: 'Organizations', isDefault: true},
                        'clientNeeds': {label: 'Client Needs'}
                    });
                    navData = [
                        {name: 'Organizations', id: 'organizations',
                            iconClass: 'oj-navigationlist-item-icon demo-icon-font-24 demo-home-icon-24'},
                        {name: 'Client Needs', id: 'clientNeeds',
                            iconClass: 'oj-navigationlist-item-icon demo-icon-font-24 demo-people-icon-24'}
                    ];
                } else if (userRole === "organization-admin") {
                    self.appName("Charity Connect - Organization Admin");
                    self.router.configure({
                        'organization': {label: 'Organization', isDefault: true}
                    });
                    navData = [
                        {name: 'Organization', id: 'organization',
                            iconClass: 'oj-navigationlist-item-icon demo-icon-font-24 demo-home-icon-24'}
                    ];                     
                } else if (userRole === "user") {
                    self.appName("Charity Connect  - User Account");
                    self.router.configure({
                        'offers': {label: 'Offers', isDefault: true},
                        'clients': {label: 'Clients'}
                    });
                    navData = [
                        {name: 'Offers', id: 'offers',
                            iconClass: 'oj-navigationlist-item-icon demo-icon-font-24 demo-info-icon-24'},
                        {name: 'Clients', id: 'clients',
                            iconClass: 'oj-navigationlist-item-icon demo-icon-font-24 demo-people-icon-24'}
                    ];                     
                };
                Router.defaults['urlAdapter'] = new Router.urlParamAdapter();

                self.loadModule = function () {
                    self.moduleConfig = ko.pureComputed(function () {
                        var name = self.router.moduleConfig.name();
                        var viewPath = 'views/' + name + '.html';
                        var modelPath = 'viewModels/' + name;
                        return moduleUtils.createConfig({viewPath: viewPath,
                            viewModelPath: modelPath, params: {parentRouter: self.router}});
                    });
                };

                self.navDataProvider = new ArrayDataProvider(navData, {keyAttributes: 'id'});

                // Footer
                function footerLink(name, id, linkTarget) {
                    this.name = name;
                    this.linkId = id;
                    this.linkTarget = linkTarget;
                }
                self.footerLinks = ko.observableArray([
                    new footerLink('About Oracle', 'aboutOracle', 'http://www.oracle.com/us/corporate/index.html#menu-about'),
                    new footerLink('Contact Us', 'contactUs', 'http://www.oracle.com/us/corporate/contact/index.html'),
                    new footerLink('Legal Notices', 'legalNotices', 'http://www.oracle.com/us/legal/index.html'),
                    new footerLink('Terms Of Use', 'termsOfUse', 'http://www.oracle.com/us/legal/terms/index.html'),
                    new footerLink('Your Privacy Rights', 'yourPrivacyRights', 'http://www.oracle.com/us/legal/privacy/index.html')
                ]);
            }

            return new ControllerViewModel();
        }
        );
