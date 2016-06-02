var app = angular.module('DDPlan', ['ngMaterial', 'md.data.table', 'ngMdIcons', 'ngMessages']);

app.service('planService', [ '$http', function($http){

	return {
		getPlan: function (hst, cb, limit) {
			if (!limit)
				limit = 10;
			// Simple GET request example
			$http({
				url: 'http://widgets.vvo-online.de/abfahrtsmonitor/Abfahrten.do?ort=Dresden&hst='+hst+'&vz=1&lim='+limit
			}).then(function successCallback(response) {
				// this callback will be called asynchronously
				// when the response is available
				console.log(response);
				cb(response);
			}, function errorCallback(response) {
				console.log(response);
				// called asynchronously if an error occurs
				// or server returns response with an error status.
			});
		}

  }

}]);

app.controller('AppCtrl', ['$scope', '$http', 'planService', '$mdBottomSheet', '$mdSidenav', '$mdDialog', function($scope, $http, planService, $mdBottomSheet, $mdSidenav, $mdDialog){

	localStorage.clear();

	if(!localStorage.getItem('defaultStop')) {
		console.log("Please set default stop")
		// TODO: show other template and set default stop
	}
	else
		console.log("Default stop is: "+ localStorage.getItem('defaultStop'))

	$scope.setDefaultStop = function (stop) {
		localStorage.setItem('defaultStop', stop);
		$scope.busStop = stop
		$scope.selectedStop = stop;
	}

	$scope.isLoading = true;
	$scope.showSearchPanel = false;
	$scope.isDisabled = false;
	$scope.stops = ["Karcherallee", "Helmholtzstrasse", "Pirnaischer Platz", "Postplatz", "Strassburger Platz", "Zwinglistrasse"];

	var planLimit = 10;

	planService.getPlan($scope.busStop, show);

	$scope.morePlan = function (hst) {
		planLimit += 10;
		planService.getPlan(hst, show, planLimit);
	}

	function show(plan) {
		$scope.isLoading = false;
		$scope.plan = plan.data;
    	$scope.busStop = '';
	}

	function pad(value) {
		if(value < 10) {
			return '0' + value;
		} else {
			return value;
		}
	}

	$scope.addMinutes = function(minutes) {
		var curr = new Date;
    	var date = new Date(curr.getTime() + minutes*60000);
    	return pad(date.getHours()) + ":" + pad(date.getMinutes())
	}

	$scope.getPlan = function(hst) {
	    if(hst) {
			planLimit = 10;
			$scope.isLoading = true;
			$scope.plan = [];
			planService.getPlan(hst, show);
			$scope.selectedStop = hst;

			var autoChild = document.getElementById('Stop').firstElementChild;
			var el = angular.element(autoChild);
			el.scope().$mdAutocompleteCtrl.hidden = true;
		}
	};

	$scope.querySearch = function(searchText) {
		return $scope.stops.filter(function(stop) {
			return stop.indexOf(searchText) !== -1;
		});
	};

}]);

app.directive('ngEnter', function () {
	return function (scope, element, attrs) {
		element.bind("keydown keypress", function (event) {
			if(event.which === 13) {
				scope.$apply(function (){
					scope.$eval(attrs.ngEnter);
				});

				event.preventDefault();
			}
		});
	};
});

app.config(function($mdThemingProvider) {
	var customBlueMap = $mdThemingProvider.extendPalette('light-blue', {
		'contrastDefaultColor': 'light',
		'contrastDarkColors': ['50'],
		'50': 'ffffff'
	});
	$mdThemingProvider.definePalette('customBlue', customBlueMap);
	$mdThemingProvider.theme('default')
		.primaryPalette('customBlue', {
		'default': '500',
		'hue-1': '50'
		})
		.accentPalette('pink');
	$mdThemingProvider.theme('input', 'default')
		.primaryPalette('grey')
});