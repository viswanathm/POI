app.controller("rootController", function($scope, $http, $filter, $timeout, GeoLocationService, GoogleMapService){	
	$scope.restaurants	= [];
	$scope.currentLocation = {'latitude': 15, 'longitude': 0};
	$scope.place = {};
	$scope.showInfoWindow = false;
	
	GeoLocationService.getCurrentGeoLocation().then(
		function(res) {
			$scope.currentLocation = res;
			initialize(true);
		},
		function(res) {
			$scope.errorDesc = res;
			initialize(false);
		}
	);
		
	$scope.changed = function(prop) {
		var orderBy = $filter('orderBy');
		clearMarkers();
		$scope.restaurants = orderBy($scope.restaurants, prop);
		addMarkers();
	};
		
	$scope.clicked = function(restaurant) {		
		google.maps.event.trigger(restaurant.marker, 'click');
	};

	// Search for hotels in the selected city, within the viewport of the map.
	$scope.search = function() {
		GoogleMapService.search().then(
			function(res) {
				clearMarkers();
				$scope.restaurants = res;
				addMarkers();
			},
			function(res) {
				$scope.restaurants = res;
			}
		);	
	};
	
    function initialize(userLocationDetected) {
		GoogleMapService.createMap('map-canvas', $scope.currentLocation, userLocationDetected);
		GoogleMapService.createInfoWindow('info-content');
	};

	function addMarkers() {
		angular.forEach($scope.restaurants, function(restaurant, i){			
			var markerLetter = String.fromCharCode('A'.charCodeAt(0) + i),
				MARKER_PATH = 'https://maps.gstatic.com/intl/en_us/mapfiles/marker_green',
				markerIcon = MARKER_PATH + markerLetter + '.png';
			// Use marker animation to drop the icons incrementally on the map.
			
			restaurant.marker = new google.maps.Marker({
			  position: restaurant.geometry.location,
			  animation: google.maps.Animation.DROP,
			  icon: markerIcon
			});
			// If the user clicks a hotel marker, show the details of that hotel in an info window.
			restaurant.markerLetter = markerLetter;
			google.maps.event.addListener(restaurant.marker, 'click', function(){
				$scope.place = restaurant;
				GoogleMapService.showInfoWindow(this, restaurant.geometry.location);
				$scope.showInfoWindow = true;
			});
			$timeout(GoogleMapService.dropMarker(restaurant.marker), i * 100);
		});
	};
	
	function clearMarkers() {
	  for (var i = 0; i < $scope.restaurants.length; i++) {
		if ($scope.restaurants[i].marker) {
		  $scope.restaurants[i].marker.setMap(null);
		}
	  }
	}
});