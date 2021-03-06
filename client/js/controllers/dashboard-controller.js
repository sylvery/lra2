dashboardApp.controller('dashboardController', ['$scope','$resource', function ($scope, $resource){
	$scope.pageTitle = "Populate"
	$scope.getURL = function(event) {
		var url = event.clipboardData.items[0];
		url.getAsString(function (data) {
			data = data.split("/");
			var uuid = $resource("/uuid/"+data[data.length-1]);
			uuid.get(function(result) {
				$scope.uuid = result;
			})
		})
	}
}])

dashboardApp.controller('searchFormController', ['$scope','$resource','$location', function($scope, $resource, $location) {
	$scope.pageTitle = "Search"
}])

