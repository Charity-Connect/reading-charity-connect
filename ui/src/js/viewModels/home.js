/**
 * @license
 * Copyright (c) 2014, 2019, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 * @ignore
 */
/*
 * Your requests ViewModel code goes here
 */
define(['appController','ojs/ojrouter','ojs/ojcore', 'knockout', 'jquery', 'accUtils', 'utils', 'restClient', 'restUtils', 'ojs/ojarraydataprovider', 'ojs/ojlistdataproviderview','ojs/ojresponsiveutils', 'ojs/ojresponsiveknockoututils',
    'ojs/ojprogress', 'ojs/ojbutton', 'ojs/ojselectcombobox', 'ojs/ojlistview', 'ojs/ojlabel', 'ojs/ojinputtext', 'ojs/ojselectsingle', 'ojs/ojdatetimepicker', 'ojs/ojdialog',
    'ojs/ojarraytabledatasource', 'ojs/ojtable', 'ojs/ojpagingtabledatasource', 'ojs/ojpagingcontrol'],
        function (app,Router,oj, ko, $, accUtils, utils, restClient, restUtils, ArrayDataProvider, ListDataProviderView,ResponsiveUtils, ResponsiveKnockoutUtils) {

            function RequestsViewModel() {
                var self = this;
			    var router = Router.rootInstance;
				var requestId;
                utils.getSetLanguage();

                self.connected = function () {
                    accUtils.announce('Requests page loaded.');
                    document.title = "Home";

                    // observable for medium screens (above 768px)
                    var mdQuery = ResponsiveUtils.getFrameworkQuery(ResponsiveUtils.FRAMEWORK_QUERY_KEY.MD_UP);
                    self.mediumDisplay = ResponsiveKnockoutUtils.createMediaQueryObservable(mdQuery);

                    self.requestsDataProvider = ko.observable();
                    self.updateRequestsDataProvider = function(requestsValues) {
						this.dataprovider = new ArrayDataProvider(requestsValues, { keyAttributes: 'id'});
						self.requestsDataProvider( new ListDataProviderView(this.dataprovider, {sortCriteria: [{ attribute: 'requestDateNeededRaw', direction: 'ascending' }]}));
					};
					


                    self.requestsValues = ko.observableArray();
                    self.renderer1 = oj.KnockoutTemplateUtils.getRenderer("decisionMade_tmpl", true);
                    self.requestsTableColumns = [
                        {headerText: 'Request type', field: "type_name"},
                        {headerText: 'Name', field: "client_name"},
                        {headerText: 'Committed Date', field: "requestTargetDate", sortProperty: "requestTargetDateRaw"},
                        {headerText: 'Date needed', field: "requestDateNeeded", sortProperty: "requestDateNeededRaw"},
                        {headerText: 'Organisation', field: "source_organization_name"},
                        {headerText: 'Status', renderer: self.renderer1, sortProperty: "requestSelectedDecision"}
                    ];

                    self.offerTypesCategoriesValues = ko.observableArray();
                    self.offerTypesCategoriesArray = ko.observableArray([]);
                    self.offerTypesCategoriesDataProvider = ko.observable();

                    self.offerTypesValues = ko.observableArray();
                    self.offerTypesArray = ko.observableArray([]);
                    self.offerTypesDataProvider = ko.observable();

                    self.agreedStatus = ko.observable(null);
                    self.completeStatus = ko.observable(null);
                    self.requestNotesUpdateVal = ko.observable("");

                    self.selectedDecisionDisplay = ko.observableArray([]);
                    self.requestRowSelected = ko.observableArray();
                    self.requestSelected = ko.observable("");
                    self.offerTypesCategorySelected = ko.observable("");
                    self.offerTypeSelected = ko.observable("");
                    self.targetDateConvertor = ko.observable("");
                    self.dateNeededConvertor = ko.observable("");

                    
                    var primaryHandlerLogic = function() {
                        self.handleSelectedDecisionFilterChanged = function () {
                            self.requestRowSelected([]);


                            var requestArray = self.requestsValues();
                            console.log(requestArray);

                            //update requestsDataProvider
                            self.updateRequestsDataProvider(requestArray);
                        };

                        self.handleRequestRowChanged = function (event) {

                            if (event.detail.value[0] !== undefined) {
                                //find whether node exists based on selection
                                function searchNodes(nameKey, myArray){
                                    for (var i=0; i < myArray.length; i++) {
                                        if (myArray[i].id === nameKey) {
                                            return myArray[i];
                                        }
                                    }
                                };
                                if (event.target.id === "requestsListview") {
                                    self.requestSelected(searchNodes(event.target.currentItem, self.requestsValues()));
                                } else if (event.target.id === "requestsTable") {
                                    self.requestSelected(searchNodes(event.target.currentRow.rowKey, self.requestsValues()));
                                }
								
								router.go('requests/'+self.requestSelected().id);

                            }
                        };

                        
                        
					}();
					
					self.addOfferButton = function (event) {
						router.go('addOffersFloating');
						
					};

					self.addRequestButton = function (event) {
						router.go('clients');
					};
                    

                    var getData = function () {
                        self.getRequestsAjax = function(context) {
                            self.requestsLoaded = ko.observable();
                            self.requestsValid = ko.observable();

                            self.requestsValues([]);
                            //GET /rest/requests - REST
                            self.requestsLoaded(false);
                            return $.when(restClient.doGet('/rest/need_requests?filter=active')
                                .then(
                                    success = function (response) {
                                        $.each(response.need_request, function(index, item) {
                                            var targetDateCleansed;
                                            var targetDateCleansedLocale;
                                            if (this.target_date) {
                                                //no need to split as UTC anyway
                                                targetDateCleansed = new Date(this.target_date);
                                                targetDateCleansedLocale = targetDateCleansed.toLocaleDateString();
                                            }
                                            var dateNeededCleansed;
                                            var dateNeededCleansedLocale;
                                            if (this.date_needed) {
                                                //no need to split as UTC anyway
                                                dateNeededCleansed = new Date(this.date_needed);
                                                dateNeededCleansedLocale = dateNeededCleansed.toLocaleDateString();
                                            }

                                            var decisionString = "";
											var styleState = "";
											var faicon="";
											if(this.overdue==='Y'){
                                                decisionString = "Overdue";
												styleState = "#E96D76"; //red
												faicon="fa fa-exclamation-triangle";
											}
											else if (this.complete === "Y") {
                                                decisionString = "Completed";
                                                styleState = "#18BE94"; //green
                                            } else if (this.agreed === "Y") {
                                                decisionString = "Accepted";
                                                styleState = "#309fdb"; //blue
                                            } else if (this.agreed === "N") {
                                                decisionString = "Rejected";
                                                styleState = "#E96D76"; //red
                                            } else {
                                                decisionString = "Unaccepted";
                                            };
                                            if(this.update_date){                                                
                                                updateDt=new Date(this.update_date.replace(/-/g, '/'));
												updateDateDisplay=updateDt.toLocaleTimeString("en-GB",{hour: '2-digit', minute:'2-digit'})+" "+updateDt.toLocaleDateString("en-GB");
											} else {
												updateDateDisplay="unknown";
											}
                                            self.requestsValues().push({
                                                requestTargetDateRaw: targetDateCleansed,
                                                requestTargetDate: targetDateCleansedLocale,
                                                requestDateNeededRaw: dateNeededCleansed,
                                                requestDateNeeded: dateNeededCleansedLocale,
                                                requestSelectedDecision: decisionString,
                                                styleState: styleState,
                                                faicon: faicon,
                                                agreed: this.agreed,
                                                complete: this.complete,
                                                client_name: this.client_name,
                                                client_need_id: this.client_need_id,
                                                client_postcode: this.client_postcode,
                                                client_phone: this.client_phone,
                                                client_email: this.client_email,
                                                client_address: this.client_address,
                                                id: this.id,
                                                need_notes: this.need_notes,
                                                request_organization_id: this.request_organization_id,
                                                request_response_notes: this.request_response_notes,
                                                source_organization_name: this.source_organization_name,
                                                type: this.type,
                                                type_name: this.type_name,
                                                creation_date: this.creation_date,
                                                created_by: this.created_by,
                                                update_date: updateDateDisplay,
                                                updated_by: this.updated_by
                                            });
                                        });


                                    },
                                    error = function (response) {
                                        console.log("Requests not loaded");
                                        self.requestsValid(false);
                                }).then(function(){
 									$.when(restClient.doGet("/rest/client_share_requests?filter=unresponded")
										    .then(
												success = function (response) {
													if(response.count>0){
													$.each(response.client_share_request, function(index, item) {
														var decisionString = "";
														var styleState = "";
														if (this.approved === "Y") {
															decisionString = "Approved";
															styleState = "#18BE94"; //green
														} else if (this.approved === "N") {
															decisionString = "Rejected";
															styleState = "#E96D76"; //red
														} else {
															decisionString = "Open";
														};
														self.requestsValues().push({
														requestTargetDateRaw: null,
														requestTargetDate: null,
														requestDateNeededRaw: new Date(),
														requestDateNeeded: (new Date()).toLocaleDateString(),
														requestSelectedDecision: decisionString,
														styleState: styleState,
														agreed: this.agreed,
														complete: this.complete,
														client_name: this.client_name,
														client_need_id: null,
														client_postcode: this.client_postcode,
														client_address: this.client_address,
														id: "S"+this.id,
														need_notes: this.notes,
														request_organization_id: this.organization_id,
														request_response_notes: null,
														source_organization_name: this.requesting_organization_name,
														type: "share",
														type_name: "Share Client Details"
												});

											});
										}
										self.requestsValid(true);
										}
											,error = function (response) {console.log("Requests not loaded"); self.requestsValid(false);}
											)
										).then(function () {
                                    self.updateRequestsDataProvider(self.requestsValues());
                                    //sort panel refresh on #saveButton only
                                    if (context === "updatePanel") {
                                        self.requestRowSelected([{
                                            "startKey": {
                                              "row": self.requestSelected().id
                                            },
                                            "endKey": {
                                              "row": self.requestSelected().id
                                            }
                                        }]);
                                    };
                                }).then(function () {
                                    self.requestsLoaded(true);
                                });

								})
                            );
                        };

                       

                        Promise.all([self.getRequestsAjax()])
                        .catch(function () {
                            //even if error remove loading bar
                            self.requestsLoaded(true);
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

            return RequestsViewModel;
        }
);