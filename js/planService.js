app.service('PlanService', [ '$http', '$q', function($http, $q){

	return {
		getStops: function () {
			var deferred = $q.defer();
            $http.get('stops.json').success(function(response) {
				deferred.resolve(response);
		    });
		    return deferred.promise;
		},
		getPlan: function (hst, cb, limit) {
			if (!limit)
				limit = 10;
			$http({
				url: 'http://widgets.vvo-online.de/abfahrtsmonitor/Abfahrten.do?ort=Dresden&hst='+hst+'&vz=1&lim='+limit
			}).then(function successCallback(response) {
				cb(response);
			}, function errorCallback(response) {
				console.log(response);
				// called asynchronously if an error occurs
				// or server returns response with an error status.
			});
		}

  }

}]);