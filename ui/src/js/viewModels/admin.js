/**
 * @license
 * Copyright (c) 2014, 2019, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 * @ignore
 */
/*
 * Your organization ViewModel code goes here
 */
define(['appController','utils','ojs/ojcore', 'knockout', 'jquery','accUtils','ojs/ojmodule-element-utils','ojs/ojnavigationlist'],
 function(app,utils,oj, ko, $,accUtils,moduleUtils) {

    function OrganizationViewModel() {
      var self = this;
      utils.getSetLanguage();
        
        if(app.userDetails.admin!="Y"){
		return;
	}

      self.sysModuleConfig = ko.observable(moduleUtils.createConfig(utils.appConstants.sysModuleConfig));
      self.selectedItem = ko.observable('systemAdminOrganizations');

      self.connected = function() {
        accUtils.announce('Admin page loaded.');
        document.title = "Admin";
        // Implement further logic if needed
      };

      self.tabChanged = function (event) {
        var name = event.detail.value;
        var viewPath = 'views/' + name + '.html';
        var modelPath = 'viewModels/' + name;
        self.sysModuleConfig(moduleUtils.createConfig({viewPath: viewPath,
          viewModelPath: modelPath, params: {parentRouter: self.router}})
        );


      }
    }

    /*
     * Returns an instance of the ViewModel providing one instance of the ViewModel. If needed,
     * return a constructor for the ViewModel so that the ViewModel is constructed
     * each time the view is displayed.
     */
    return OrganizationViewModel;
  }
);
