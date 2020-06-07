  define([
    'ojs/ojrouter','ojs/ojcore', 'knockout', 'jquery', 'accUtils', 'utils', 'restClient', 'restUtils', 'ojs/ojarraydataprovider',
	    'ojs/ojprogress', 'ojs/ojbutton', 'ojs/ojlabel', 'ojs/ojinputtext', 'ojs/ojselectsingle', 'ojs/ojdatetimepicker', 'ojs/ojdialog',
    'ojs/ojarraytabledatasource', 'ojs/ojtable', 'ojs/ojpagingtabledatasource', 'ojs/ojpagingcontrol'
  ], function(Router,oj, ko, $, accUtils, utils, restClient, restUtils, ArrayDataProvider) {
    var data;
    var unwrap = ko.utils.unwrapObservable;

	$.when(restClient.doGetJson(restUtils.constructUrl(restUtils.EntityUrl.CLIENTS))
		.then(
			success = function (response) {
				console.log(response.clients);
				data=response.clients;
			},
			error = function (response) {
				console.log("Clients not loaded");
				self.clientsValid(false);
	})
	);

    function getRecordById(id) {
      var record;
      var idNum = Number(id);
      if (!isNaN(idNum)) {
        data.forEach(function(client) {
          if (client.id === idNum) {
			  console.log(client);
            record = client;
            return false;
          }
        });
      }
      return record;
    }

    /**
     * Get a sibling record Id from the given current Id.
     * @param  {Number} currentId The current Id from which to search for a sibling.
     * @param  {Number} dir     The direction within the records array to search.
     * +1 searches ahead, -1 searches backwards.  If the extents of the array are
     * reached, then the search wraps to the beginning/end of the array.
     * @return {Number}       The sibling Id
     */
    function getSiblingId(currentId, dir) {
      var currRec = getRecordById(currentId);
      var currIndex = data.indexOf(currRec);
      var nextIndex = currIndex + dir;
      if (nextIndex < 0) {
        nextIndex = data.length - 1;
      } else if (nextIndex >= data.length) {
        nextIndex = 0;
      }
      var nextRec = data[nextIndex];
      return unwrap(nextRec.id);
    }

    function ViewModel(viewParams) {
      var router = viewParams.parentRouter;
        console.log(router);
      var stateId = router.stateId();

      function go(id) {
        router.go(stateId + '/' + id);
      }
      /*
       * Retrieve the state parameters from the router parameters.
       */
      var stateParams = router.observableModuleConfig().params.ojRouter
        .parameters;

      this.record = ko.pureComputed(function() {
        var clientId = stateParams.clientId();
        console.log("getting record ");
        console.log(stateParams);
        return getRecordById(clientId);
      });
      this.isEdit = ko.pureComputed(function() {
        return stateParams.edit() === 'edit';
      });
      this.handleBack = function() {
        router.go('/clients');
      };
      this.handlePrevious = function() {
        var prevId = getSiblingId(stateParams.clientId(), -1);
        go(prevId);
      };
      this.handleNext = function() {
        var nextId = getSiblingId(stateParams.clientId(), 1);
        go(nextId);
      };
      this.handleEdit = function() {
        go(stateParams.clientId() + '/edit');
      };
      this.handleSave = function() {
        go(stateParams.clientId());
      };
    }

    return ViewModel;
  });