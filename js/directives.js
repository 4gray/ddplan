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

app.directive('planList', function() {
	return {
		restricted: 'A',
		scope: {
			stop: '=',
			plan: '=',
			getPlan: '&',
			morePlan: '&'
		},
		templateUrl: 'view/plan-list.html',
		link: function (scope, element, attrs) {

			scope.addMinutes = function(minutes) {
				var curr = new Date;
				var date = new Date(curr.getTime() + minutes*60000);
				return pad(date.getHours()) + ":" + pad(date.getMinutes())
			}

			function pad(value) {
				if(value < 10) {
					return '0' + value;
				} else {
					return value;
				}
			}
		}
	}
});