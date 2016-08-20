app.controller('AppCtrl', ['$scope', '$http', 'PlanService', '$mdBottomSheet', '$mdSidenav', '$mdDialog', '$log', function($scope, $http, PlanService, $mdBottomSheet, $mdSidenav, $mdDialog, $log){

	localStorage.clear();

	if(!localStorage.getItem('defaultStop')) {
		$log.info("Please set default stop")
		// TODO: show other template and set default stop
	}
	else
		$log.info("Default stop is: "+ localStorage.getItem('defaultStop'))

	$scope.setDefaultStop = function (stop) {
		localStorage.setItem('defaultStop', stop);
		$scope.busStop = stop
		$scope.selectedStop = stop;
	}

	PlanService.getStops().then((response) => {
		$scope.stopsList = response;
	});

	$scope.isLoading = true;
	$scope.showSearchPanel = false;
	$scope.isDisabled = false;

	var planLimit = 10;

	PlanService.getPlan($scope.busStop, show);

	$scope.morePlan = function (hst) {
		planLimit += 10;
		PlanService.getPlan(hst, show, planLimit);
	}

	function show(plan) {
		$scope.isLoading = false;
		$scope.plan = plan.data;
    	$scope.busStop = '';
	}

	$scope.getPlan = function(hst) {
	    if(hst) {
			planLimit = 10;
			$scope.isLoading = true;
			$scope.plan = [];
			PlanService.getPlan(hst, show);
			$scope.selectedStop = hst;

			var autoChild = document.getElementById('Stop').firstElementChild;
			var el = angular.element(autoChild);
			el.scope().$mdAutocompleteCtrl.hidden = true;
		}
	};

	$scope.querySearch = function(searchText) {
		return $scope.stopsList.filter(function(stop) {
			return stop.indexOf(searchText) !== -1;
		});
	};

	$scope.closeApp = function() {
		var ipc = require('ipc');
		ipc.send('quit', 'ping');
	};


}]);