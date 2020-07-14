/**
 * @license
 * Copyright (c) 2014, 2019, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 * @ignore
 */
/*
 * Your clients ViewModel code goes here
 */
define(['appController', 'ojs/ojknockout-keyset','ojs/ojrouter','ojs/ojcore', 'knockout', 'jquery', 'accUtils', 'utils', 'restClient', 'restUtils', 'ojs/ojarraydataprovider','ojs/ojvalidator-async',
    'ojs/ojprogress', 'ojs/ojbutton', 'ojs/ojlabel', 'ojs/ojinputtext', 'ojs/ojselectsingle', 'ojs/ojdatetimepicker', 'ojs/ojdialog',
    'ojs/ojarraytabledatasource', 'ojs/ojtable', 'ojs/ojcheckboxset', 'ojs/ojpagingtabledatasource', 'ojs/ojpagingcontrol','ojs/ojvalidation-datetime'],
        function (app,keySet,Router,oj, ko, $, accUtils, utils, restClient, restUtils, ArrayDataProvider) {

            function ClientViewModel() {
                var self = this;
                utils.getSetLanguage();

                if(app.currentOrg.manage_clients!="Y"){
					return;
				}
			    var router = Router.rootInstance;
			    var stateParams = router.observableModuleConfig().params.ojRouter.parameters;
				var clientIdIn=stateParams.clientId();
				self.clientNeedRowSelected = ko.observableArray();
				self.dateNeededConvertor = ko.observable("");
				self.needNotesUpdateVal = ko.observable("");
				self.clientNeedMatchesDataProvider = ko.observable();



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
						{headerText: 'Notes', field: "notes",sortable:"disabled"},
						{headerText:'Action',
						headerStyle: "text-align: center;",
						style:"text-align: center; padding-top: 0px; padding-bottom: 0px;",
						template: "actionTemplate",
						sortable:"disabled"}
					];
					
					
					self.dateConverter = ko.observable(oj.Validation.converterFactory(oj.ConverterFactory.CONVERTER_TYPE_DATETIME).
					createConverter(
					{
					  pattern : "dd/MM/yyyy"
					}));


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
					self.disableNeedMatchesSaveButton = ko.observable(false);
					self.clientName=ko.observable("");
					self.clientEmail=ko.observable("");
					self.clientAddress=ko.observable("");
					self.clientPhone=ko.observable("");
					self.clientPostcode=ko.observable("");
					self.clientNotes=ko.observable("");
					self.clientUpdateDate=ko.observable("");
					self.clientUpdatedBy=ko.observable("");
					self.clientId=ko.observable(clientIdIn);
					self.addNeedButtonDisabled=ko.observable(true);
					self.cancelButtonName=ko.observable("Cancel");
					self.currentType="";
					self.currentNeedId="";
					self.loadingNeed=false;
					self.matchingOffersFound=ko.observable(false);

					
					self.needMatchesHeaderCheckStatus=ko.observableArray(['checked']);


					self.populateResponse=function(response){
						self.clientName(response.name);
						self.clientEmail(response.email);
						self.clientAddress(response.address);
						self.clientPhone(response.phone);
						self.clientPostcode(response.postcode);
						self.clientNotes(response.notes);
						if(response.update_date){
							updateDt=new Date(response.update_date.replace(/-/g, '/'));
							self.clientUpdateDate(updateDt.toLocaleTimeString("en-GB",{hour: '2-digit', minute:'2-digit'})+" "+updateDt.toLocaleDateString("en-GB"));
						} else {
							self.clientUpdateDate("unknown");
						}
						self.clientUpdatedBy(response.updated_by);
						self.clientId(response.id);
						self.addNeedButtonDisabled(false);
						this.cancelButtonName("Close");
					}
	
					self.clearResponse=function(){
					
						self.clientName("");
						self.clientEmail("");
						self.clientAddress("");
						self.clientPhone("");
						self.clientPostcode("");
						self.clientNotes("");
						self.clientUpdateDate("");
						self.clientUpdatedBy("");
						self.clientId(null);
						self.addNeedButtonDisabled(true);
						this.cancelButtonName("Cancel");
					}

					this.duplicatesColumns = ko.observableArray([{ headerText: '',field: 'field' }]);
					this.duplicatesDataProvider = ko.observable(new ArrayDataProvider([{field:"Organization"},{field:"Name"}],{ keyAttributes: 'field' }));

                    self.selectedRowDisplay = ko.observable("clientNeeds");
					self.addClientButtonSelected = ko.observableArray([]);

					this.actionListener = function (event) {
						event.detail.originalEvent.stopPropagation();
					  };
				
					self.menuListener = function (event, context) {
						var rowIndex = self.clientNeedsValues.indexOf(context.row);
						if (event.target.value === 'delete') {
							return $.when(restClient.doDeleteJson('/rest/client_needs/'+context.row.id)
							.then(
								success = function (response) {
									self.getClientNeedsAjax(self.clientId());
								},
								error = function (response) {
									self.postText("Error: Client need not deleted.");
									self.postTextColor("red");
									console.log("client need not deleted");
								}).then(function () {
								self.fileContentPosted(true);
								$("#postMessage").css('display', 'inline-block').fadeOut(2000, function () {
								});
							})
						);
						} else if (event.target.value === 'edit') {
						  console.log(context.row);
						  self.loadingNeed=true;
						  self.currentType=context.row.type_id;
						  self.currentNeedId=context.row.id;
						  self.offerTypesCategorySelected(context.row.category_id);
						  self.dateNeededConvertor(context.row.clientDateNeededRaw.toISOString());
						  self.needNotesUpdateVal(context.row.notes);
						  document.getElementById('addNeedDialog').open();

						}
					  }.bind(this);
				

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
                                                type_id: this.type_id,
                                                type_name: this.type_name,
                                                category_id: this.category_id,
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

						self.getClientNeedsAjax(self.clientId());

				  
						this.asyncPostcodeValidator = {
							// 'validate' is a required method
							// that is a function that returns a Promise
							validate: function (value) {
							  // used to format the value in the validation error message.
							  return new Promise(function (resolve, reject) {
								setTimeout(function () {


									$.ajax({ type: "GET",
									url: "//api.getthedata.com/postcode/"+encodeURIComponent(value),
									dataType: "json",
									success: function (response) {
										if(response.status=="match"){
											resolve();
										} else {
											reject({
												detail:' Invalid postcode ' +
												  value+ '.'
											  });
	
										}
									},
									error: function(event) {
										console.error("Error occured in REST client, when sending GET to url: " + url);
									  //  utils.showErrorMessage("REST get failed", url);
									  reject({
										detail:' Could not validate postcode ' +
										  value+ '.'
									  });
									}
									});
								}, 1000);
							});
						  }
						};
								  


                        self.handleOfferTypesCategoryChanged = function(event) {
                            if (event.target.value !== "") {
								_getOfferTypesFromCategoryAjax(event.target.value);
                                self.disableSelectEditType(false);
                            }
                        };
                        _getOfferTypesFromCategoryAjax = function(id) {
                            self.offerTypesArray([]);
                            //GET /rest/offer_type_categories/{id}/offer_types - REST
                            return $.when(restClient.doGet(`${restUtils.constructUrl(restUtils.EntityUrl.OFFER_TYPE_CATEGORIES)}/${id}/offer_types`)
                                .then(
                                    success = function (response) {
                                        self.offerTypesValues(response.offer_types);
                                    },
                                    error = function (response) {
                                        console.log(`Offer Types from Category "${id}" not loaded`);
                                }).then(function () {
                                    //find all names
                                    for (var i = 0; i < self.offerTypesValues().length; i++) {
                                        self.offerTypesArray().push({
                                            "value": self.offerTypesValues()[i].id,
                                            "label": self.offerTypesValues()[i].name
                                        });
                                    };
									//sort nameValue alphabetically
                                    utils.sortAlphabetically(self.offerTypesArray(), "label");
									self.offerTypesDataProvider(new ArrayDataProvider(self.offerTypesArray(), { keyAttributes: 'value' }));

                                }).then(function () {
									if(self.currentType!=""){
										self.offerTypeSelected(self.currentType);
									} else {
										self.offerTypeSelected(self.offerTypesArray()[0].value);
									}
                                })
                            );
                        };
                    }();

                    var addNeedDialogLogic = function() {

                        self.addNeedButton = function () {
							self.currentType="";
							self.currentNeedId="";
							self.loadingNeed=false;
                            document.getElementById('addNeedDialog').open();
                        };

                        self.handleOfferTypeChanged = function (event) {
                            if (event.target.value !== "") {
								if(!self.loadingNeed){
								_getOfferNotesFromTypeAjax(event.target.value);
								}
							   self.disableNeedSaveButton(false);
							   // we set the end of loading needs here, as this is the last event on the load
							   self.loadingNeed=false;
                            }
                        };
                        _getOfferNotesFromTypeAjax = function (id) {
                                return $.when(restClient.doGet(`${restUtils.constructUrl(restUtils.EntityUrl.OFFER_TYPES)}/${id}`)
                                .then(
                                    success = function (response) {
										self.needNotesUpdateVal(response.default_text);
										
                                    },
                                    error = function (response) {
                                        console.log(`Offer Notes from Type "${id}" not loaded`);
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
						
						self.needMatchesHeaderCheckboxListener= function (event) {
							if (event.detail != null) {
							  var value = event.detail.value;
							  if (value.length > 0) {
								self.organization_list.forEach(function (part,index, theArray) {
									self.organization_list[index].selected=['checked'];
								});
								self.clientNeedMatchesDataProvider(new ArrayDataProvider(self.organization_list, { keyAttributes: 'organization_id', implicitSort: [{ attribute: 'organization_name', direction: 'ascending' }] }));
							  } else if (value.length === 0 && event.detail.updatedFrom == 'internal') {
								  self.organization_list.forEach(function (part,index, theArray) {
									self.organization_list[index].selected=[];
								});
								self.clientNeedMatchesDataProvider(new ArrayDataProvider(self.organization_list, { keyAttributes: 'organization_id', implicitSort: [{ attribute: 'organization_name', direction: 'ascending' }] }));
							}
							}
						  }.bind(self);																	

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
							var element1 = document.getElementById('inputEditName');

							if(self.clientName().length<1){
								console.log(element1.showMessages());
								self.postTextColor("red");
								self.postText("Error: Client not saved.");
								console.log("form errors");
								self.fileContentPosted(true);
								$(".postMessage").css('display', 'inline-block').fadeOut(2000, function(){
									self.disableSaveButton(false);
								});

								return;
							}
							postAddress = restUtils.constructUrl(restUtils.EntityUrl.CLIENTS);
							responseJson = {
								id: self.clientId(),
								name: self.clientName(),
								address: self.clientAddress(),
								postcode: self.clientPostcode().toUpperCase(),
								phone: self.clientPhone(),
								email: self.clientEmail(),
								notes: self.clientNotes()
							};

							return $.when(restClient.doPostJson(postAddress, responseJson)
							.then(
								success = function (response) {
									self.postTextColor("green");
										self.postText("You have succesfully saved the client.");
										console.log("client data posted");
										self.populateResponse(response)
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
									name: self.clientName(),
									address: self.clientAddress(),
									postcode: self.clientPostcode(),
									phone: self.clientPhone(),
									email: self.clientEmail(),
									notes: self.clientNotes()
									};
								$.ajax({type: 'POST'
									,url:`/rest/clients/duplicate_request`
									,data:JSON.stringify(responseJson)
									,contentType: 'application/json'
									,dataType: 'json'
									,success:function(data){
                                        document.getElementById('duplicatesDialog').close();
                                      //  self.disableSaveButton(true);
									}
								});

						}
						self.viewClientButton = function (event) {
							        self.clientId(event.target.id.split(":")[1]);
							        self.getClient();
						}
						self.cancelButton = function (event) {
							        router.go('clients');
						}

                        self.deleteButton = function () {
                            return $.when(restClient.doDeleteJson('/rest/clients/'+self.clientId())
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
							console.log("getting client "+self.clientId());
							self.clientsLoaded(false);
								if(self.clientId()=="new"){
									self.clearResponse();
								} else {
									$.when(restClient.doGet('/rest/clients/'+self.clientId()))
										.then(
											success = function (response) {
												self.populateResponse(response)
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

						self.organization_list=[];


						self.submitNeed = function(event){
							if($('#datepickerEditNeedDateNeeded')[0].value.length<1){
								var element1 = document.getElementById('datepickerEditNeedDateNeeded');
								element1.showMessages();
								self.postText("Error: Need not saved.");
								return;
							}
							document.getElementById('addNeedMatchesDialog').open();
								responseJson = {
								type_id: $('#selectEditNeedType')[0].valueItem.data.value,
								date_needed: utils.formatDate($('#datepickerEditNeedDateNeeded')[0].value)
							};
							

							//POST /rest/need_requests - REST
							return $.when(restClient.doPostJson(`/rest/clients/${self.clientId()}/client_needs/matches`, responseJson)
								.then(
									success = function (response) {
										console.log(response);
										// get just the unique organizations
										self.organization_list=response.map(function(obj){ return {organization_id:obj.organization_id,organization_name:obj.organization_name,selected:['checked']}});
										self.organization_list=[...new Map(self.organization_list.map(item =>[item['organization_id'], item])).values()];
										self.matchingOffersFound(self.organization_list.length>0);
										self.clientNeedMatchesDataProvider(new ArrayDataProvider(self.organization_list, { keyAttributes: 'organization_id', implicitSort: [{ attribute: 'organization_name', direction: 'ascending' }] }));
									},
									error = function (response) {
										self.postTextColor("red");
											self.postText("Error: Could not find matches.");
											console.log("could not find matches");

								})
							);

						}

						self.closeAddNeedMatchesModalButton = function(event){
							document.getElementById('addNeedMatchesDialog').close();
						}

						self.saveMatchesButton = function(event){
							postAddress = `${restUtils.constructUrl(restUtils.EntityUrl.CLIENTS)}/${self.clientId()}/client_needs`;
							var org_list_out=[];
							self.organization_list.forEach(function(organization){if(organization.selected.length>0) org_list_out.push(organization.organization_id)});
							if(self.currentNeedId===""){
								responseJson = {
								type_id: $('#selectEditNeedType')[0].valueItem.data.value,
								date_needed: utils.formatDate($('#datepickerEditNeedDateNeeded')[0].value),
								notes: $('#textareaEditNeedNotes')[0].value,
								organization_list:org_list_out
							};
							} else {
								responseJson = {
									id:self.currentNeedId,
									type_id: $('#selectEditNeedType')[0].valueItem.data.value,
									date_needed: utils.formatDate($('#datepickerEditNeedDateNeeded')[0].value),
									notes: $('#textareaEditNeedNotes')[0].value,
									organization_list:org_list_out
								};

							}	
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
											self.getClientNeedsAjax(self.clientId());
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
									document.getElementById('addNeedMatchesDialog').close();
									console.log(responseJson);
								})
							);
							document.getElementById('addNeedMatchesDialog').close();
						}


                        self.saveButton = function (event) {
							//locale "en-GB" - change UTC to YYYY-MM-DD

                            var postAddress;
                            var responseJson;
                            if (event.target.id === "saveButton") {
								responseJson = {
                                    id: self.clientId(),
                                    name: self.clientName(),
                                    address: self.clientAddress(),
                                    postcode: self.clientPostcode(),
                                    phone: self.clientPhone(),
                                    email: self.clientEmail(),
                                    notes: self.clientNotes()
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

                            };

                        };
                    }();

                    var getData = function () {
                        self.getClientsAjax = function() {
							console.log("getting data");
                            self.clientsLoaded = ko.observable();
                            self.clientsValid = ko.observable();

							if(self.clientId()=="new"){
								self.clearResponse();
								self.clientsValid(true);
								self.clientsLoaded(true);
							} else {


								//GET /rest/clients - REST
								self.clientsLoaded(false);
								return $.when(restClient.doGetJson("/rest/clients/"+self.clientId())
									.then(
										success = function (response) {
											if(response.update_date){
                                                updateDt=new Date(response.update_date.replace(/-/g, '/'));
												response.updateDateDisplay=updateDt.toLocaleTimeString("en-GB",{hour: '2-digit', minute:'2-digit'})+" "+updateDt.toLocaleDateString("en-GB");
                                            } else {
												response.updateDateDisplay="unknown";
											}

											self.populateResponse(response);
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
                                            "value": self.offerTypesCategoriesValues()[i].id,
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
