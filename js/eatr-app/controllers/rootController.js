app.controller("rootController", function($scope, $http, $filter, $window, GeoLocationService, GoogleMapService){	
	$scope.restaurants	= [];
	$scope.currentLocation = {'latitude': 15, 'longitude': 0};
	$scope.place = {};
	
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
	
    function initialize(userLocationDetected) {
		GoogleMapService.createMap('map-canvas', $scope.currentLocation, userLocationDetected);
		GoogleMapService.createInfoWindow('info-content');

		// Create the autocomplete object and associate it with the UI input control.
		// Restrict the search to the default country, and to place type "cities".
		var autocomplete = new google.maps.places.Autocomplete(
			 /** @type {HTMLInputElement} */(document.getElementById('autocomplete')),
			{
				types: ['(cities)'],
				componentRestrictions: []
			});
		
		google.maps.event.addListener(autocomplete, 'place_changed', function(){
			var place = autocomplete.getPlace();
			if (place.geometry) {
				GoogleMapService.panZoom(place.geometry.location, 15);
				search();
			} else {
				document.getElementById('autocomplete').placeholder = 'Enter a city';
			}			
		});	
	};

	// Search for hotels in the selected city, within the viewport of the map.
	function search() {
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
				document.getElementById('info-content').className = "show-window";
			});
			setTimeout(GoogleMapService.dropMarker(restaurant.marker), i * 100);
		});
	};
	
	function clearMarkers() {
	  for (var i = 0; i < $scope.restaurants.length; i++) {
		if ($scope.restaurants[i].marker) {
		  $scope.restaurants[i].marker.setMap(null);
		}
	  }
	}

	// Get the place details for a hotel. Show the information in an info window,
	// anchored on the marker for the hotel that the user selected.
	// This is for future implementation to get additional details of any place.
	function showInfoWindow() {
		var marker = this; 	 
		GoogleMapService.getPlaceDetails(marker.placeResult.place_id, marker).then(
			function(res) {
				$scope.place = res;
			},
			function(res) {
				//nothing to build
			}
		);
	}
});