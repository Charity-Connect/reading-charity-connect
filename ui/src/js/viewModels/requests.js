/**
 * @license
 * Copyright (c) 2014, 2019, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 * @ignore
 */
/*
 * Your requests ViewModel code goes here
 */
define(['appController', 'ojs/ojrouter', 'ojs/ojcore', 'knockout', 'jquery', 'accUtils', 'utils', 'restClient', 'restUtils', 'ojs/ojarraydataprovider', 'ojs/ojresponsiveutils', 'ojs/ojresponsiveknockoututils',
    'ojs/ojprogress', 'ojs/ojbutton', 'ojs/ojselectcombobox', 'ojs/ojlistview', 'ojs/ojlabel', 'ojs/ojinputtext', 'ojs/ojselectsingle', 'ojs/ojdatetimepicker', 'ojs/ojdialog',
    'ojs/ojarraytabledatasource', 'ojs/ojtable', 'ojs/ojpagingtabledatasource', 'ojs/ojpagingcontrol', 'ojs/ojvalidation-datetime'],
    function (app, Router, oj, ko, $, accUtils, utils, restClient, restUtils, ArrayDataProvider, ResponsiveUtils, ResponsiveKnockoutUtils) {

        function RequestsViewModel() {
            var self = this;
            var router = Router.rootInstance;
            var stateParams = router.observableModuleConfig().params.ojRouter.parameters;
            var requestId = stateParams.requestId();
            utils.getSetLanguage();

            self.connected = function () {
                accUtils.announce('Requests page loaded.');
                document.title = "Requests";

                // observable for medium screens (above 768px)
                var mdQuery = ResponsiveUtils.getFrameworkQuery(ResponsiveUtils.FRAMEWORK_QUERY_KEY.MD_UP);
                self.mediumDisplay = ResponsiveKnockoutUtils.createMediaQueryObservable(mdQuery);

                self.selectedDecisionFilterDisplay = ko.observable('decisionFilterAll');
                self.requestsDataProvider = ko.observable();
                self.updateRequestsDataProvider = function (requestsValues) {
                    var sortCriteria = { key: 'type_name', direction: 'ascending' };
                    var arrayDataSource = new oj.ArrayTableDataSource(requestsValues, { idAttribute: 'id' });
                    arrayDataSource.sort(sortCriteria);
                    self.requestsDataProvider(new oj.PagingTableDataSource(arrayDataSource));
                };

                self.dateConverter = ko.observable(oj.Validation.converterFactory(oj.ConverterFactory.CONVERTER_TYPE_DATETIME).
                    createConverter(
                        {
                            pattern: "dd/MM/yyyy"
                        }));


                self.requestsValues = ko.observableArray();
                self.renderer1 = oj.KnockoutTemplateUtils.getRenderer("decisionMade_tmpl", true);
                self.requestsTableColumns = [
                    { headerText: 'Request Type', field: "type_name" },
                    { headerText: 'Client Name', field: "client_name" },
                    { headerText: 'Committed Date', field: "requestTargetDate", sortProperty: "requestTargetDateRaw" },
                    { headerText: 'Date Needed', field: "requestDateNeeded", sortProperty: "requestDateNeededRaw" },
                    { headerText: 'Organisation', field: "source_organization_name" },
                    { headerText: 'Status', renderer: self.renderer1, sortProperty: "requestSelectedDecision" }
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
                self.showNeedPanel = ko.computed(function () {
                    if (self.requestRowSelected().length) {
                        if (self.requestSelected().type != "share") {
                            self.selectedDecisionDisplay([]);
                            return true;
                        }
                    }
                }, this);

                self.showSharePanel = ko.computed(function () {
                    if (self.requestRowSelected().length) {
                        if (self.requestSelected().type == "share") {
                            self.selectedDecisionDisplay([]);
                            return true;
                        }
                    }
                }, this);

                var primaryHandlerLogic = function () {
                    self.handleSelectedDecisionFilterChanged = function () {
                        self.requestRowSelected([]);

                        var activeFilters = {};
                        //filter decisionFilters search
                        activeFilters.decisionFilter = self.selectedDecisionFilterDisplay();

                        var requestArray = self.requestsValues().filter(function (item) {
                            if (activeFilters["decisionFilter"] === "decisionFilterAll") {
                                return true;
                            } else if (activeFilters["decisionFilter"] === "decisionFilterUnreviewed") {
                                if (item["agreed"] === undefined || item["agreed"] == null) {
                                    return true;
                                }
                            } else if (activeFilters["decisionFilter"] === "decisionFilterAccepted") {
                                if (item["agreed"] === 'Y' && item["complete"] != "Y") {
                                    return true;
                                }
                            } else if (activeFilters["decisionFilter"] === "decisionFilterCompleted") {
                                if (item["complete"] === "Y") {
                                    return true;
                                }
                            } else {
                                var cleanRequestSelectedDecisionItem = "decisionFilter" + item["requestSelectedDecision"];
                                //pick up detected active filters - 1x array toString (decisionFilters)
                                if (cleanRequestSelectedDecisionItem.indexOf(activeFilters["decisionFilter"]) >= 0) {
                                    return true;
                                }
                            }
                        });

                        //update requestsDataProvider
                        self.updateRequestsDataProvider(requestArray);
                    };

                    self.handleRequestRowChanged = function (event) {
                        if (event.detail.value[0] !== undefined) {

                            if (event.target.id === "requestsListview") {
                                self.requestId = event.target.currentItem;

                            } else if (event.target.id === "requestsTable") {
                                self.requestId = event.target.currentRow.rowKey;
                            }
                            router.go("/requests/" + self.requestId);
                            self.showRequest(self.requestId);
                        }
                    }

                    self.showRequest = function (requestId) {
                        if (requestId === undefined) {
                            return;
                        }
                        self.requestSelected(self.requestsValues().find(request => request.id == requestId));
                        if (self.requestSelected().requestTargetDateRaw) {
                            self.targetDateConvertor(oj.IntlConverterUtils.dateToLocalIso(new Date(self.requestSelected().requestTargetDateRaw)));
                        } else {
                            self.targetDateConvertor("");
                        }
                        if (self.requestSelected().requestDateNeededRaw) {
                            self.dateNeededConvertor(oj.IntlConverterUtils.dateToLocalIso(new Date(self.requestSelected().requestDateNeededRaw)));
                        } else {
                            self.dateNeededConvertor("");
                        }

                        if (self.requestSelected().request_response_notes) {
                            self.requestNotesUpdateVal(self.requestSelected().request_response_notes);
                        } else {
                            self.requestNotesUpdateVal("");
                        }

                    };

                    self.handleOfferTypesCategoryChanged = function (event) {
                        if (event.target.value !== "") {
                            _getOfferTypesFromCategoryAjax(event.target.value);
                        }
                    };
                    _getOfferTypesFromCategoryAjax = function (code) {
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
                                    if (self.requestRowSelected().length) {
                                        self.offerTypeSelected(self.requestSelected().type);
                                    } else {
                                        self.offerTypeSelected(self.offerTypesArray()[0].value);
                                    }
                                })
                        );
                    };
                }();

                var agreeDialogLogic = function () {
                    self.handleSelectedDecisionChanged = function (event) {
                        if (event.detail.updatedFrom === "internal") {
                            //button toggle
                            if (event.detail.value.length === 2) {
                                var decisionArray = event.detail.value;
                                decisionArray = decisionArray.filter(function (value) {
                                    return value !== event.detail.previousValue[0];
                                });
                                self.selectedDecisionDisplay(decisionArray);
                            };

                            //set status and #saveButton behaviour
                            if (self.selectedDecisionDisplay()[0]) {
                                if (self.selectedDecisionDisplay()[0] === 'decisionIncomplete') {
                                    self.completeStatus("N");
                                    self.saveButton();
                                } else if (self.selectedDecisionDisplay()[0] === 'decisionDone') {
                                    self.completeStatus("Y");
                                    self.saveButton();
                                } else if (self.selectedDecisionDisplay()[0] === 'decisionCancel') {
                                    self.agreedStatus("N");
                                    self.saveButton();
                                } else if (self.selectedDecisionDisplay()[0] === 'decisionRevoke') {
                                    self.agreedStatus("N");
                                    self.saveShareButton();
                                } else if (self.selectedDecisionDisplay()[0] === 'decisionShare') {
                                    self.agreedStatus("Y");
                                    self.saveShareButton();
                                };
                            };

                            //special behaviour for 'decisionAgreed' button - #agreeDialog and targetDate
                            if ((self.requestSelected().requestSelectedDecision === 'Rejected') || (self.requestSelected().requestSelectedDecision === 'Unaccepted')) {
                                if (self.selectedDecisionDisplay()[0] === 'decisionAgreed') {
                                    document.getElementById('agreeDialog').open();
                                } else if (!self.selectedDecisionDisplay()[0]) {
                                    self.targetDateConvertor("");
                                    self.requestNotesUpdateVal(self.requestSelected().request_response_notes);
                                };
                            };
                        };
                    };

                    self.requestNotesUpdateRawVal = ko.observable("");
                    self.handleRequestNotesUpdateChanged = function (event) {
                        //protect initial load
                        if (event.detail.originalEvent) {
                            self.requestNotesUpdateVal(self.requestNotesUpdateRawVal());
                            self.disableSaveButtonInline(false);
                        }

                    };

                    self.disableSaveButton = ko.observable(true);
                    self.handleTargetDateChanged = function (event) {
                        if (event.target.value !== null) {
                            self.disableSaveButton(false);
                        } else {
                            self.disableSaveButton(true);
                        }
                    };
                    self.disableSaveButtonInline = ko.observable(true);
                    self.handleTargetDateChangedInline = function (event) {
                        // target date when loaded is in UTC, when different date selected it is in the form YYYY-MM-DD, so we check for length because UTC is longer and includes time
                        if (event.target.value == null || event.target.value.length > 10) {
                            self.disableSaveButtonInline(true);
                        } else {
                            self.disableSaveButtonInline(false);
                        }
                    };
                    self.closeAgreeModalButton = function (event) {
                        if (event.target.id === "cancelButton") {
                            self.selectedDecisionDisplay([]);
                            //same as self.handleSelectedDecisionChanged() (!self.selectedDecisionDisplay()[0]) above
                            self.targetDateConvertor("");
                            self.requestNotesUpdateVal(self.requestSelected().request_response_notes);
                        } else if (event.target.id === "saveButton") {
                            self.agreedStatus("Y");
                            self.saveButton();
                        }
                        document.getElementById('agreeDialog').close();
                    };
                    self.handleSaveButtonInline = function (event) {
                        self.agreedStatus("Y");
                        self.saveButton();
                    };
                }();

                var postData = function () {
                    self.fileContentPosted = ko.observable(true);
                    self.disableOptionButtons = ko.observable(false);
                    self.postText = ko.observable();
                    self.postTextColor = ko.observable();
                    self.saveButton = function () {
                        //locale "en-GB" - change UTC to YYYY-MM-DD
                        _formatDate = function (inputDate) {
                            if (inputDate !== null && inputDate !== "") {
                                return inputDate.split('T')[0];
                            } else {
                                return null;
                            }
                        };

                        var responseJson = {
                            agreed: self.agreedStatus() !== null ? self.agreedStatus() : self.requestSelected().agreed,
                            complete: self.completeStatus() !== null ? self.completeStatus() : self.requestSelected().complete,
                            id: self.requestSelected().id,
                            request_response_notes: $('#textareaEditRequestNotes')[0].value,
                            target_date: _formatDate($('#datepickerEditTargetDate')[0].value)
                        };

                        self.fileContentPosted(false);
                        self.disableOptionButtons(true);
                        //POST /rest/need_requests - REST
                        return $.when(restClient.doPost(restUtils.constructUrl(restUtils.EntityUrl.NEED_REQUESTS), responseJson)
                            .then(
                                success = function (response) {
                                    self.postText("You have successfully saved the request.");
                                    self.postTextColor("green");

                                    //update requestsTable
                                    self.selectedDecisionFilterDisplay('decisionFilterAll');
                                    self.getRequestsAjax("updatePanel");
                                },
                                error = function (response) {
                                    self.postText("Error: Request not saved.");
                                    self.postTextColor("red");
                                    console.log("data not posted");
                                }).then(function () {
                                    self.fileContentPosted(true);
                                    $("#postMessage").css('display', 'inline-block').fadeOut(app.messageFadeTimeout, function () {
                                        self.disableOptionButtons(false);
                                    });
                                })
                        );
                    };

                    self.saveShareButton = function () {

                        var responseJson = {
                            approved: self.agreedStatus() !== null ? self.agreedStatus() : self.requestSelected().agreed,
                            id: self.requestSelected().id.substring(1)
                        };

                        self.fileContentPosted(false);
                        self.disableOptionButtons(true);
                        //POST /rest/need_requests - REST
                        return $.when(restClient.doPost('/rest/client_share_requests', responseJson)
                            .then(
                                success = function (response) {
                                    self.postText("You have successfully saved the share request.");
                                    self.postTextColor("green");

                                    //update requestsTable
                                    self.selectedDecisionFilterDisplay('decisionFilterAll');
                                    self.getRequestsAjax("updatePanel");
                                },
                                error = function (response) {
                                    self.postText("Error: Request not saved.");
                                    self.postTextColor("red");
                                    console.log("data not posted");
                                }).then(function () {
                                    self.fileContentPosted(true);
                                    $("#postMessage").css('display', 'inline-block').fadeOut(app.messageFadeTimeout, function () {
                                        self.disableOptionButtons(false);
                                    });
                                })
                        );
                    };


                }();

                var getData = function () {
                    self.getRequestsAjax = function (context) {
                        self.requestsLoaded = ko.observable();
                        self.requestsValid = ko.observable();

                        self.requestsValues([]);
                        //GET /rest/requests - REST
                        self.requestsLoaded(false);
                        return $.when(restClient.doGet(restUtils.constructUrl(restUtils.EntityUrl.NEED_REQUESTS))
                            .then(
                                success = function (response) {
                                    $.each(response.need_request, function (index, item) {
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
                                        var faicon = "";
                                        if (this.overdue === 'Y') {
                                            decisionString = "Overdue";
                                            styleState = "#E96D76"; //red
                                            faicon = "fa fa-exclamation-triangle";
                                        }
                                        else if (this.complete === "Y") {
                                            decisionString = "Completed";
                                            styleState = "#18BE94"; //green
                                        } else if (this.agreed === "Y") {
                                            decisionString = "Accepted";
                                            styleState = "#309fdb"; //blue
                                        } else if (this.agreed === "N") {
                                            decisionString = "Rejected";
                                        } else {
                                            decisionString = "Unaccepted";
                                        };
                                        if (this.update_date) {
                                            updateDt = new Date(this.update_date.replace(/-/g, '/'));
                                            updateDateDisplay = updateDt.toLocaleTimeString("en-GB", { hour: '2-digit', minute: '2-digit' }) + " " + updateDt.toLocaleDateString("en-GB");
                                        } else {
                                            updateDateDisplay = "unknown";
                                        }
                                        this.client_address = this.client_address == null ? "" : this.client_address.trim();
                                        this.client_postcode = this.client_postcode == null ? "" : this.client_postcode.trim();
                                        this.client_phone = this.client_phone == null ? "" : this.client_phone.trim();
                                        formatted_address = this.client_address;
                                        if (formatted_address != "" && this.client_postcode != "") {
                                            formatted_address = formatted_address + ",\n" + this.client_postcode;
                                        } else {
                                            formatted_address = this.client_postcode;
                                        }
                                        search_address = encodeURIComponent(formatted_address.replace("\n", " ").trim());
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
                                            client_phone: this.client_phone,
                                            client_email: this.client_email,
                                            formatted_address: formatted_address,
                                            search_address: search_address,
                                            id: this.id,
                                            need_notes: this.need_notes,
                                            request_organization_id: this.request_organization_id,
                                            request_response_notes: this.request_response_notes,
                                            source_organization_name: this.source_organization_name,
                                            type: this.type,
                                            type_name: this.type_name,
                                            category_name: this.category_name,
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
                                }).then(function () {
                                    $.when(restClient.doGet("/rest/client_share_requests")
                                        .then(
                                            success = function (response) {
                                                if (response.count > 0) {
                                                    $.each(response.client_share_request, function (index, item) {
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
                                                            id: "S" + this.id,
                                                            need_notes: this.notes,
                                                            request_organization_id: this.organization_id,
                                                            request_response_notes: null,
                                                            source_organization_name: this.requesting_organization_name,
                                                            type: "share",
                                                            type_name: "Share Client Details",
                                                            creation_date: this.creation_date,
                                                            created_by: this.created_by,
                                                            update_date: updateDateDisplay,
                                                            updated_by: this.updated_by
                                                        });

                                                    });
                                                }
                                                self.requestsValid(true);
                                            }
                                            , error = function (response) { console.log("Requests not loaded"); self.requestsValid(false); }
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
                                        if (typeof (requestId) != "undefined") {
                                            self.requestRowSelected([{
                                                "startKey": {
                                                    "row": requestId
                                                },
                                                "endKey": {
                                                    "row": requestId
                                                }
                                            }]);
                                        }
                                        self.showRequest(requestId);

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