/**
 * @license
 * Copyright (c) 2014, 2019, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 * @ignore
 */
/*
 * Your clients ViewModel code goes here
 */
define(['appController','ojs/ojrouter','ojs/ojcore', 'knockout', 'jquery', 'accUtils', 'utils', 'restClient', 'restUtils', 'ojs/ojarraydataprovider',
    'ojs/ojprogress', 'ojs/ojbutton', 'ojs/ojlabel', 'ojs/ojinputtext', 'ojs/ojselectsingle', 'ojs/ojdatetimepicker', 'ojs/ojdialog',
    'ojs/ojarraytabledatasource', 'ojs/ojtable', 'ojs/ojpagingtabledatasource', 'ojs/ojpagingcontrol'],
        function (app,Router,oj, ko, $, accUtils, utils, restClient, restUtils, ArrayDataProvider) {

            function ClientViewModel() {
                var self = this;
                utils.getSetLanguage();

                if(app.currentOrg.manage_clients!="Y"){
					return;
				}
			    var router = Router.rootInstance;
			    var stateParams = router.observableModuleConfig().params.ojRouter.parameters;
                var clientId=stateParams.clientId();

                self.connected = function () {
                    accUtils.announce('Client page loaded.');
                    document.title = "Client";
                    self.clientsDataProvider = ko.observable();

                    self.clientNeedsValues = ko.observableArray();
                    self.clientNeedsDataProvider = ko.observable();
                    self.clientNeedsTableColumns = [
                        {headerText: 'Need type', field: "type_name"},
                        {headerText: 'Need met?', field: "need_met"},
                        {headerText: 'Date Needed', field: 'clientDateNeeded', sortProperty: "clientDateNeededRaw"},
                        {headerText: 'Notes', field: "notes"}
                    ];

                    self.offerTypesCategoriesValues = ko.observableArray();
                    self.offerTypesCategoriesArray = ko.observableArray([]);
                    self.offerTypesCategoriesDataProvider = ko.observable();

                    self.offerTypesValues = ko.observableArray();
                    self.offerTypesArray = ko.observableArray([]);
                    self.offerTypesDataProvider = ko.observable();

                    self.disableSelectEditType = ko.observable(true);
                    self.offerTypeSelected = ko.observable("");
                    self.offerTypesCategorySelected = ko.observable("");
                    self.disableNeedSaveButton = ko.observable(true);

					this.duplicatesColumns = ko.observableArray([{ headerText: '',field: 'field' }]);
					this.duplicatesDataProvider = ko.observable(new ArrayDataProvider([{field:"Organization"},{field:"Name"}],{ keyAttributes: 'field' }));

                    self.selectedRowDisplay = ko.observable("clientNeeds");
                    self.addClientButtonSelected = ko.observableArray([]);
                    self.clientSelected = ko.observable("");

                    var primaryHandlerLogic = function() {

                        self.getClientNeedsAjax = function(clientId) {
                            self.clientNeedsValues([]);
                            if(clientId=="new"){
								return;
							}
                            //GET /rest/clients/{client id}/client_needs - REST
                            return $.when(restClient.doGet(`${restUtils.constructUrl(restUtils.EntityUrl.CLIENTS)}/${clientId}/client_needs`)
                                .then(
                                    success = function (response) {
                                        $.each(response.client_needs, function(index, item) {
                                            var dateNeededCleansed;
                                            var dateNeededCleansedLocale;
                                            if (this.date_needed) {
                                                //no need to split as UTC anyway
                                                dateNeededCleansed = new Date(this.date_needed);
                                                dateNeededCleansedLocale = dateNeededCleansed.toLocaleDateString();
                                            } else {
                                                //if new entry and nothing selected
                                                dateNeededCleansed = "";
                                                dateNeededCleansedLocale = "";
                                            }
                                            self.clientNeedsValues().push({
                                                clientDateNeededRaw: dateNeededCleansed,
                                                clientDateNeeded: dateNeededCleansedLocale,
                                                details: this.details,
                                                client_id: this.client_id,
                                                id: this.id,
                                                need_met: this.need_met,
                                                notes: this.notes,
                                                requesting_organization_id: this.requesting_organization_id,
                                                type: this.type,
                                                type_name: this.type_name,
                                                creation_date: this.creation_date,
                                                created_by: this.created_by,
                                                update_date: this.update_date,
                                                updated_by: this.updated_by
                                            });
                                        });
                                    },
                                    error = function (response) {
                                        console.log(`Client Needs from Client "${clientId}" not loaded`);
                                }).then(function () {
                                    var sortCriteria = {key: 'type_name', direction: 'ascending'};
                                    var arrayDataSource = new oj.ArrayTableDataSource(self.clientNeedsValues(), {idAttribute: 'id'});
                                    arrayDataSource.sort(sortCriteria);
                                    self.clientNeedsDataProvider(new oj.PagingTableDataSource(arrayDataSource));
                                }).then(function () {
                                })
                            );
                        };

						self.getClientNeedsAjax(clientId);


                        self.handleOfferTypesCategoryChanged = function(event) {
                            if (event.target.value !== "") {
                                _getOfferTypesFromCategoryAjax(event.target.value);
                                self.disableSelectEditType(false);
                            }
                        };
                        _getOfferTypesFromCategoryAjax = function(code) {
                            self.offerTypesArray([]);
                            //GET /rest/offer_type_categories/{code}/offer_types - REST
                            return $.when(restClient.doGet(`${restUtils.constructUrl(restUtils.EntityUrl.OFFER_TYPE_CATEGORIES)}/${code}/offer_types`)
                                .then(
                                    success = function (response) {
                                        self.offerTypesValues(response.offer_types);
                                    },
                                    error = function (response) {
                                        console.log(`Offer Types from Category "${code}" not loaded`);
                                }).then(function () {
                                    //find all names
                                    for (var i = 0; i < self.offerTypesValues().length; i++) {
                                        self.offerTypesArray().push({
                                            "value": self.offerTypesValues()[i].type,
                                            "label": self.offerTypesValues()[i].name
                                        });
                                    };
                                    //sort nameValue alphabetically
                                    utils.sortAlphabetically(self.offerTypesArray(), "value");
                                    self.offerTypesDataProvider(new ArrayDataProvider(self.offerTypesArray(), { keyAttributes: 'value' }));
                                }).then(function () {
                                    self.offerTypeSelected(self.offerTypesArray()[0].value);
                                })
                            );
                        };
                    }();

                    var addNeedDialogLogic = function() {
                        self.dateNeededConvertor = ko.observable("");
                        self.needNotesUpdateVal = ko.observable("");

                        self.addNeedButton = function () {
                            document.getElementById('addNeedDialog').open();
                        };

                        self.handleOfferTypeChanged = function (event) {
                            if (event.target.value !== "") {
                                _getOfferNotesFromTypeAjax(event.target.value);
                               self.disableNeedSaveButton(false);
                            }
                        };
                        _getOfferNotesFromTypeAjax = function (code) {
                                return $.when(restClient.doGet(`${restUtils.constructUrl(restUtils.EntityUrl.OFFER_TYPES)}/${code}`)
                                .then(
                                    success = function (response) {
                                        console.log(response.default_text);
                                        self.needNotesUpdateVal(response.default_text);
                                    },
                                    error = function (response) {
                                        console.log(`Offer Notes from Type "${code}" not loaded`);
                                    }
                                )
                            );
                        };

                        self.closeAddNeedModalButton = function (event) {
                            //inital disable
                            self.disableSelectEditType(true);
                            self.offerTypeSelected("");
                            self.offerTypesCategorySelected("");
                            self.dateNeededConvertor("");
                            self.needNotesUpdateVal("");
                            self.disableNeedSaveButton(true);
                            document.getElementById('addNeedDialog').close();
                        };
                    }();

					var duplicateCheckDialogLogic = function() {

					}();



                    var postData = function() {
                        self.fileContentPosted = ko.observable(true);
                        self.postText = ko.observable();
                        self.postTextColor = ko.observable();
                        self.disableSaveButton = ko.observable(false);

						self.closeDuplicateCheckModalButton = function (event) {
							//inital disable
							self.disableNeedSaveButton(true);
							document.getElementById('duplicatesDialog').close();
						};
						self.forceSaveDuplicateCheckModalButton = function (event) {
							console.log("saving");
							saveClient();
							self.disableNeedSaveButton(true);
							document.getElementById('duplicatesDialog').close();
						};

						var saveClient = function () {

							postAddress = restUtils.constructUrl(restUtils.EntityUrl.CLIENTS);
							responseJson = {
								id: $('#clientId')[0].value,
								name: $('#inputEditName')[0].value,
								address: $('#textareaEditAddress')[0].value,
								postcode: $('#inputEditPostcode')[0].value,
								phone: $('#inputEditPhone')[0].value,
								email: $('#inputEditEmail')[0].value,
								notes: $('#textareaEditClientNotes')[0].value
							};

							return $.when(restClient.doPostJson(postAddress, responseJson)
							.then(
								success = function (response) {
									self.postTextColor("green");
										self.postText("You have succesfully saved the client.");
										console.log("client data posted");
										self.clientSelected(response);
										clientId=response.id;
										console.log(clientId);
										//update clientsTable
										//self.getClientsAjax();
								},
								error = function (response) {
									self.postTextColor("red");
										self.postText("Error: Client not saved.");
										console.log("client data not posted");
							}).then(function () {
								self.fileContentPosted(true);
								$(".postMessage").css('display', 'inline-block').fadeOut(2000, function(){
									self.disableSaveButton(false);
								});
							})
							);
						}

						self.requestAccessButton = function (event) {
							var id=event.target.id.split(":")[1];
							var organization_id=event.target.id.split(":")[2];
							console.log(organization_id);
								responseJson = {
									id: id,
									organization_id: organization_id,
									name: $('#inputEditName')[0].value,
									address: $('#textareaEditAddress')[0].value,
									postcode: $('#inputEditPostcode')[0].value,
									phone: $('#inputEditPhone')[0].value,
									email: $('#inputEditEmail')[0].value,
									notes: $('#textareaEditClientNotes')[0].value
								};
								$.ajax({type: 'POST'
									,url:`/rest/clients/duplicate_request`
									,data:JSON.stringify(responseJson)
									,contentType: 'application/json'
									,dataType: 'json'
									,success:function(data){
										document.getElementById('duplicatesDialog').close();
									}
								});

						}
						self.viewClientButton = function (event) {
							        clientId= event.target.id.split(":")[1];
							        self.getClient();
						}
						self.cancelButton = function (event) {
							        router.go('clients');
						}

                        self.deleteButton = function () {
                            return $.when(restClient.doDeleteJson('/rest/clients/'+clientId)
                                .then(
                                    success = function (response) {
                                        router.go('clients');
                                    },
                                    error = function (response) {
                                        self.postText("Error: Client changes not deleted.");
                                        self.postTextColor("red");
                                        console.log("client data not deleted");
                                    }).then(function () {
                                    self.fileContentPosted(true);
                                    $("#postMessage").css('display', 'inline-block').fadeOut(2000, function () {
                                        //self.disableSaveButton(false);
                                    });
                                })
                            );
                        }

						self.getClient= function (){
							console.log("getting client "+clientId);
							self.clientsLoaded(false);
								if(clientId=="new"){
									self.clientSelected("");
								} else {
									$.when(restClient.doGet('/rest/clients/'+clientId))
										.then(
											success = function (response) {
												if(response.update_date){
                                                    updateDt=new Date(response.update_date.replace(/-/g, '/'));
													response.updateDateDisplay=updateDt.toLocaleTimeString("en-GB",{hour: '2-digit', minute:'2-digit'})+" "+updateDt.toLocaleDateString("en-GB");
												} else {
													response.updateDateDisplay="unknown";
												}
												self.clientSelected(response);
												self.clientsValid(true);
											},
											error = function (response) {
												console.log("Clients not loaded");
												self.clientsValid(false);
											}
										).then(function () {
											self.clientsLoaded(true);
										});

								}
						}


                        self.saveButton = function (event) {
                            //locale "en-GB" - change UTC to YYYY-MM-DD
                            _formatDate = function(inputDate) {
                                if (inputDate !== null) {
                                    return inputDate.split('T')[0];
                                } else {
                                    return null;
                                }
                            };

                            var postAddress;
                            var responseJson;
                            if (event.target.id === "saveButton") {
                                responseJson = {
                                    id: $('#clientId')[0].value,
                                    name: $('#inputEditName')[0].value,
                                    address: $('#textareaEditAddress')[0].value,
                                    postcode: $('#inputEditPostcode')[0].value,
                                    phone: $('#inputEditPhone')[0].value,
                                    email: $('#inputEditEmail')[0].value,
                                    notes: $('#textareaEditClientNotes')[0].value
                                };
								self.fileContentPosted(false);
								self.disableSaveButton(true);
								//POST /rest/clients - REST


								if(responseJson.id==null){

									// new client, so do a duplicate check
									return $.when(restClient.doPostJson("/rest/clients/duplicate_check", responseJson)
									.then(
										success = function (data, status, xhr) {
											if(data.count==0){
												saveClient();
											} else {
												self.postTextColor("red");
												self.postText("duplicates.");
												console.log("client data not posted - duplicates found");
												document.getElementById('duplicatesDialog').open();
												var header=[{ headerText: 'Organization',field: 'field' }];
												var nameRow= new Object();
												nameRow.field="Name: "+$('#inputEditName')[0].value;
												var addressRow= new Object();
												if($('#textareaEditAddress')[0].value!=null){
													addressRow.field="Address: "+($('#textareaEditAddress')[0].value).split('\n')[0];
												} else {
													addressRow.field="Address: ";
												}
												var postcodeRow= new Object();
												postcodeRow.field="Postcode: "+(($('#inputEditPostcode')[0].value==null)?"":$('#inputEditPostcode')[0].value);
												var emailRow= new Object();
												emailRow.field="Email: "+(($('#inputEditEmail')[0].value==null)?"":$('#inputEditEmail')[0].value);
												var phoneRow= new Object();
												phoneRow.field="Phone: "+(($('#inputEditPhone')[0].value==null)?"":$('#inputEditPhone')[0].value);
												var buttonRow= new Object();
												buttonRow.field="Action";
												data.duplicates.forEach(function(duplicate){
													header.push({ headerText: duplicate.organization_name,field: duplicate.organization_id+":"+duplicate.id, footerTemplate:'requestFooterTemplate' });
													nameRow[duplicate.organization_id+":"+duplicate.id]= duplicate.name;
													addressRow[duplicate.organization_id+":"+duplicate.id]= duplicate.address;
													postcodeRow[duplicate.organization_id+":"+duplicate.id]= duplicate.postcode;
													emailRow[duplicate.organization_id+":"+duplicate.id]= duplicate.email;
													phoneRow[duplicate.organization_id+":"+duplicate.id]= duplicate.phone;
													if(duplicate.current_organization=="Y"){
														buttonRow[duplicate.organization_id+":"+duplicate.id]= "BUTTON2:"+duplicate.id+":"+duplicate.organization_id;
													} else {
														buttonRow[duplicate.organization_id+":"+duplicate.id]= "BUTTON:"+duplicate.id+":"+duplicate.organization_id;
													}
												});

												self.duplicatesColumns (header);
												self.duplicatesDataProvider(new ArrayDataProvider([nameRow,addressRow,postcodeRow,emailRow,phoneRow,buttonRow]));


												self.disableSaveButton(false);
												self.fileContentPosted(true);

											}
										},
										error = function (response) {
											self.postTextColor("red");
												self.postText("Error: Client not saved.");
												console.log("client data not posted");
										}
									)
									);
								} else {
									saveClient();
								}

                            } else if (event.target.id === "editNeedSaveButton")  {
                                postAddress = `${restUtils.constructUrl(restUtils.EntityUrl.CLIENTS)}/${self.clientSelected().id}/client_needs`;
                                responseJson = {
                                    type: $('#selectEditNeedType')[0].valueItem.data.value,
                                    date_needed: _formatDate($('#datepickerEditNeedDateNeeded')[0].value),
                                    notes: $('#textareaEditNeedNotes')[0].value
                                };
								self.fileContentPosted(false);
								self.disableSaveButton(true);
								//POST /rest/need_requests - REST
								return $.when(restClient.doPost(postAddress, responseJson)
									.then(
										success = function (response) {
											self.postTextColor("green");
												self.postText("You have succesfully saved the need.");
												console.log("need data posted");
												//update clientNeedsTable
												self.getClientNeedsAjax(self.clientSelected().id);
										},
										error = function (response) {
											self.postTextColor("red");
												self.postText("Error: Need not saved.");
												console.log("need data not posted");

									}).then(function () {
										self.fileContentPosted(true);
										$(".postMessage").css('display', 'inline-block').fadeOut(2000, function(){
											self.disableSaveButton(false);
										});
									}).then(function () {
										self.closeAddNeedModalButton();
										console.log(responseJson);
									})
								);
                            };

                        };
                    }();

                    var getData = function () {
                        self.getClientsAjax = function() {
                            self.clientsLoaded = ko.observable();
                            self.clientsValid = ko.observable();

							if(clientId=="new"){
								self.clientSelected("");
								self.clientsValid(true);
								self.clientsLoaded(true);
							} else {


								//GET /rest/clients - REST
								self.clientsLoaded(false);
								return $.when(restClient.doGetJson("/rest/clients/"+clientId)
									.then(
										success = function (response) {
											console.log(response);
											if(response.update_date){
                                                updateDt=new Date(response.update_date.replace(/-/g, '/'));
												response.updateDateDisplay=updateDt.toLocaleTimeString("en-GB",{hour: '2-digit', minute:'2-digit'})+" "+updateDt.toLocaleDateString("en-GB");
                                            } else {
												response.updateDateDisplay="unknown";
											}

											self.clientSelected(response);
											self.clientsValid(true);
											self.clientsLoaded(true);
										},
										error = function (response) {
											console.log("Client not loaded");
											self.clientsValid(false);
									})
								);

							}
                        };

                        function getOfferTypesCategoriesAjax() {
                            // GET /rest/offer_type_categories/active - REST
                            return $.when(restClient.doGet(`${restUtils.constructUrl(restUtils.EntityUrl.OFFER_TYPE_CATEGORIES)}/active`)
                                .then(
                                    success = function (response) {
                                        console.log(response.offer_type_categorys);
                                        self.offerTypesCategoriesValues(response.offer_type_categorys);
                                    },
                                    error = function (response) {
                                        console.log("Offer Types Categories not loaded");
                                }).then(function () {
                                    //find all names
                                    for (var i = 0; i < self.offerTypesCategoriesValues().length; i++) {
                                        self.offerTypesCategoriesArray().push({
                                            "value": self.offerTypesCategoriesValues()[i].code,
                                            "label": self.offerTypesCategoriesValues()[i].name
                                        });
                                    };
                                    //sort nameValue alphabetically
                                    utils.sortAlphabetically(self.offerTypesCategoriesArray(), "value");
                                    self.offerTypesCategoriesDataProvider(new ArrayDataProvider(self.offerTypesCategoriesArray(), { keyAttributes: 'value' }));
                                }).then(function () {
                                })
                            );
                        };

                        Promise.all([self.getClientsAjax()])
                        .then(function () {
                            Promise.all([getOfferTypesCategoriesAjax()])
                        })
                        .catch(function () {
                            //even if error remove loading bar
                            self.clientsLoaded(true);
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

            return ClientViewModel;
        }
);
