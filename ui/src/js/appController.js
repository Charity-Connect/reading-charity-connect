/**
 * @license
 * Copyright (c) 2014, 2020, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 * @ignore
 */
/*
 * Your application specific code will go here
 */
define(['knockout', 'ojs/ojmodule-element-utils', 'ojs/ojresponsiveutils', 'ojs/ojresponsiveknockoututils', 'ojs/ojrouter', 'ojs/ojarraydataprovider', 'ojs/ojknockouttemplateutils','restClient', 'restUtils','utils',
'ojs/ojmodule-element', 'ojs/ojknockout'],
  function(ko, moduleUtils, ResponsiveUtils, ResponsiveKnockoutUtils, Router, ArrayDataProvider, KnockoutTemplateUtils, restClient, restUtils,utils) {
     function ControllerViewModel() {
        var self = this;

        self.KnockoutTemplateUtils = KnockoutTemplateUtils;
        self.navData;
		self.currentOrg={"manage_offers":"N"};
        // Handle announcements sent when pages change, for Accessibility.
        self.manner = ko.observable('polite');
        self.message = ko.observable();
        self.navDataProvider=ko.observableArray([]);
        self.organizationList=ko.observableArray([]);
        document.getElementById('globalBody').addEventListener('announce', announcementHandler, false);

        function announcementHandler(event) {
          setTimeout(function() {
            self.message(event.detail.message);
            self.manner(event.detail.manner);
          }, 200);
        };

      // Media queries for repsonsive layouts
      var smQuery = ResponsiveUtils.getFrameworkQuery(ResponsiveUtils.FRAMEWORK_QUERY_KEY.SM_ONLY);
      self.smScreen = ResponsiveKnockoutUtils.createMediaQueryObservable(smQuery);

                // Header
                // Application Name used in Branding Area
                self.appName = ko.observable("Reading Charity Connect");
                // User Info used in Global Navigation area
                self.userLogin = ko.observable();
                self.currentOrganization = ko.observable();


                self.setMenuEntries= function(organization_id){
					self.currentOrg=self.userDetails.user_organizations.find(element=> element.organization_id==organization_id);
					// Navigation setup
					self.navData = [
						{name: 'Home', id: 'home',
						iconClass: 'oj-navigationlist-item-icon demo-icon-font-24 demo-home-icon-24'},
						{name: 'Requests', id: 'requests',
							  iconClass: 'oj-navigationlist-item-icon demo-icon-font-24 demo-chat-icon-24'}
					  ];

					if(self.currentOrg.manage_offers=='Y'){
						self.navData.push(
						  {name: 'Offers', id: 'offers',
							  iconClass: 'oj-navigationlist-item-icon demo-icon-font-24 demo-info-icon-24'}
						);
					}

					if(self.currentOrg.manage_clients=='Y'){
						self.navData.push(
						  {name: 'Clients', id: 'clients',
							  iconClass: 'oj-navigationlist-item-icon demo-icon-font-24 demo-people-icon-24'}
						);
					}
					if(self.currentOrg.organization_admin=='Y'){
						self.appName("Charity Connect - Admin");
						self.navData.push(
							{name: 'Org Admin', id: 'orgAdmin',
								iconClass: 'oj-navigationlist-item-icon demo-icon-font-24 demo-library-icon-24'}
						);
					}
					if(self.userDetails.admin=='Y'){
						self.appName("Charity Connect - System Admin");
						self.navData.push(
						{name: 'Admin', id: 'admin',
						iconClass: 'oj-navigationlist-item-icon demo-icon-font-24 demo-library-icon-24'}
						);
					}
					self.navDataProvider(new ArrayDataProvider(self.navData, {keyAttributes: 'id'}));

				}

                //log-in logic
                getUser = function() {
                    //GET /rest/users/current - REST
                    return $.when(restClient.doGetJson(`${restUtils.constructUrl(restUtils.EntityUrl.USERS)}/current`)
                        .then(
                            success = function(response) {
								self.userDetails=response;
                                self.userLogin(response.email);
                                utils.appConstants.users.organizationId = response.organization_id;
                                self.currentOrganization(response.organization_name);
                                if(response.confirmed!="Y"){
									alert("Your account is not confirmed yet. Please check your email for a message."); // please add a proper way to display the message.
								}
								const user_confirmed_organizations=response.user_organizations.filter(user_organization => user_organization.confirmed=='Y');
								if(user_confirmed_organizations.length==0){
									alert("You are not a confirmed member of any organization yet."); // please add a proper way to display the message.
								}

								if(response.admin=="Y"){
									utils.appConstants.sysModuleConfig = {viewPath: 'views/systemAdminOrganizations.html'
									, viewModelPath: 'viewModels/systemAdminOrganizations'
									, params: {parentRouter: self.router}} ;
										self.organizationList.push({"id":-99,"name":"View All"});
								}

								if(user_confirmed_organizations.length>1){
									user_confirmed_organizations.forEach(function(org) {
										self.organizationList.push({"id":org.organization_id,"name":org.organization_name});
									});
								}

								self.setMenuEntries(response.organization_id);

                            },
                            error = function() {
                                window.location.href = "/rest/logout?redirect=/index.html?redirect=" + encodeURI(window.location.pathname+ window.location.search);
                            }
                        )
                    )
                }();


                //switch org logic
                self.orgMenuItemAction = function(event) {
					console.log(event);

					$.when(restClient.doGet('/rest/set_organization?id='+event.target.value)
                        .then(
                            success = function(response) {
                                location.reload();
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
                    } else if (event.target.value === "help") {
                        window.location.href = "/docs/index.php/documentation/";
                    }else if (event.target.value === "about") {
                        window.location.href = "/docs/index.php/contact-us/";
                    }
               };

       // Router setup
		self.router = Router.rootInstance;
		self.routerConfig = {
			'home': {label: 'Home', isDefault: true}, 
			'requests/{requestId}': {label: 'Requests'},
      		'offers/{offerId}': {label: 'Offers'},
      		'offer/{offerId}': {label: 'Offer'},
			'clients': {label: 'Clients'},
			'client/{clientId}': {label: 'Client'},
            'user/{userId}': {label: 'User'},
			'orgAdmin': {label: 'Org Admin'},
			'admin': {label: 'Admin'}
		};
		Router.defaults['urlAdapter'] = new Router.urlParamAdapter();
        self.router.configure(self.routerConfig);

	// Navigation setup
	   self.navData = [
		  {name: 'Home', id: 'home', //name: 'Requests', id: 'requests',
			  iconClass: 'oj-navigationlist-item-icon demo-icon-font-24 demo-chat-icon-24'}
    ];
    
		self.navDataProvider(new ArrayDataProvider(self.navData, {keyAttributes: 'id'}));


      self.loadModule = function () {
        self.moduleConfig = ko.pureComputed(function () {
          var name = self.router.moduleConfig.name();
          var viewPath = 'views/' + name + '.html';
          var modelPath = 'viewModels/' + name;
          return moduleUtils.createConfig({ viewPath: viewPath,
            viewModelPath: modelPath, params: { parentRouter: self.router } });
        });
      };



      // Footer
      function footerLink(name, id, linkTarget) {
        this.name = name;
        this.linkId = id;
        this.linkTarget = linkTarget;
      }
                self.footerLinks = ko.observableArray([
                    new footerLink('About Reading Connect', 'aboutReadingConnect', '/docs/index.php'),
                    new footerLink('Contact Us', 'contactUs', '/docs/index.php/contact-us/'),
                ]);
     }

     return new ControllerViewModel();
  }
);