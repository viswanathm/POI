var map, places, infoWindow, currentLocationMarker;
var autocomplete;
var MARKER_PATH = 'https://maps.gstatic.com/intl/en_us/mapfiles/marker_green';
var hostnameRegexp = new RegExp('^https?://.+?/');

app.controller("mainController", function($scope, $http, $filter, $window){
	var orderBy = $filter('orderBy');
	$scope.restaurants	= [];	
	$scope.currentLocation = $window.currentLocation || {'latitude': 15, 'longitude': 0};
    $scope.init = function() {
		map = new google.maps.Map(document.getElementById('map-canvas'), {
			zoom: $window.currentLocation ? 12 : 2,
			center: new google.maps.LatLng($scope.currentLocation.latitude, $scope.currentLocation.longitude),
			mapTypeControl: false,
			panControl: false,
			zoomControl: true,
			streetViewControl: false
		});
		
		if($window.currentLocation) {
			var markerr = new google.maps.Marker({
				  position: new google.maps.LatLng($scope.currentLocation.latitude, $scope.currentLocation.longitude),
				  animation: google.maps.Animation.DROP
			});
			markerr.setMap(map);
		}
		else {
			$scope.errorDesc = $window.errorDesc;
		}
		
		var infoContent = document.getElementById('info-content').cloneNode(true);
		infoContent.style.display = "block";
		infoWindow = new google.maps.InfoWindow({
		  content: infoContent
		});

		// Create the autocomplete object and associate it with the UI input control.
		// Restrict the search to the default country, and to place type "cities".
		autocomplete = new google.maps.places.Autocomplete(
		 /** @type {HTMLInputElement} */(document.getElementById('autocomplete')),
		{
			types: ['(cities)'],
			componentRestrictions: []
		});
		
		places = new google.maps.places.PlacesService(map);

		google.maps.event.addListener(autocomplete, 'place_changed', function(){
			  var place = autocomplete.getPlace();
			  if (place.geometry) {
				map.panTo(place.geometry.location);
				map.setZoom(15);
				$scope.search();
			  } else {
				document.getElementById('autocomplete').placeholder = 'Enter a city';
			  }			
		});			
	};
		
	$scope.changed = function(prop) {
		clearMarkers();
		$scope.restaurants = orderBy($scope.restaurants, prop);
		$scope.addMarkers();
	};
		
	$scope.clicked = function(restaurant) {		
		google.maps.event.trigger(restaurant.marker, 'click');
	};

	// Search for hotels in the selected city, within the viewport of the map.
	$scope.search = function() {
	  var search = {
		bounds: map.getBounds(),
		types: ['restaurant']
	  };

	  places.nearbySearch(search, function(results, status) {
		if (status == google.maps.places.PlacesServiceStatus.OK) {
		  
		  clearMarkers();
		  // Create a marker for each hotel found, and
		  // assign a letter of the alphabetic to each marker icon.		  
		  for (var i = 0; i < results.length; i++) {			
			results[i].distance = getDistance(map.getCenter(), results[i].geometry.location);
			
			results[i].imageSRC = results[i].photos && results[i].photos[0] && results[i].photos[0].getUrl({maxHeight: 100, maxWidth: 100});
						
			results[i].varities  = results[i].types && (results[i].types.length > 0) && results[i].types.join(" | ");
			
			results[i].ratingPercentage = results[i].rating && (Math.round((results[i].rating/5)*100));
			
			results[i].markerLetter = String.fromCharCode('A'.charCodeAt(0) + i);
		  }		  
		  
		  $scope.$apply(function(){
			$scope.restaurants = results;
		  });		  
		  
		  $scope.addMarkers();
		}
	  });
	};

	$scope.addMarkers = function() {
		angular.forEach($scope.restaurants, function(restaurant, i){			
			var markerLetter = String.fromCharCode('A'.charCodeAt(0) + i);
			var markerIcon = MARKER_PATH + markerLetter + '.png';
			// Use marker animation to drop the icons incrementally on the map.
			restaurant.marker = new google.maps.Marker({
			  position: restaurant.geometry.location,
			  animation: google.maps.Animation.DROP,
			  icon: markerIcon
			});
			// If the user clicks a hotel marker, show the details of that hotel
			// in an info window.
			restaurant.marker.placeResult = restaurant;
			restaurant.markerLetter = markerLetter;
			google.maps.event.addListener(restaurant.marker, 'click', showInfoWindow);
			setTimeout(dropMarker(i), i * 100);
		});
	};
	
	function clearMarkers() {
	  for (var i = 0; i < $scope.restaurants.length; i++) {
		if ($scope.restaurants[i].marker) {
		  $scope.restaurants[i].marker.setMap(null);
		}
	  }
	}

	function dropMarker(i) {
	  return function() {
		$scope.restaurants[i].marker.setMap(map);
	  };
	}

	// Get the place details for a hotel. Show the information in an info window,
	// anchored on the marker for the hotel that the user selected.
	function showInfoWindow() {
	  var marker = this;
	  places.getDetails({placeId: marker.placeResult.place_id},
		  function(place, status) {
			if (status != google.maps.places.PlacesServiceStatus.OK) {
			  return;
			}
			//document.getElementById("info-content").style.top = "0px";
			infoWindow.open(map, marker);
			buildIWContent(place);
			//map.setCenter(marker.placeResult.geometry.location);
		  });
	}

	function rad(x) {
	  return x * Math.PI / 180;
	};

	function getDistance(p1, p2) {
	  var R = 6378137; // Earth’s mean radius in meter
	  var dLat = rad(p2.lat() - p1.lat());
	  var dLong = rad(p2.lng() - p1.lng());
	  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos(rad(p1.lat())) * Math.cos(rad(p2.lat())) *
		Math.sin(dLong / 2) * Math.sin(dLong / 2);
	  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	  var d = (R * c)/1000;
	  var roundedD = Math.round(d * 100) / 100
	  return roundedD; // returns the distance in miles
	};
	
	// Load the place information into the HTML elements used by the info window.
	function buildIWContent(place) {
	  document.getElementById('iw-icon').innerHTML = '<img class="hotelIcon" ' +
		  'src="' + place.icon + '"/>';
	  document.getElementById('iw-url').innerHTML = '<b><a href="' + place.url +
		  '">' + place.name + '</a></b>';
	  document.getElementById('iw-address').textContent = place.vicinity;

	  if (place.formatted_phone_number) {
		document.getElementById('iw-phone-row').style.display = '';
		document.getElementById('iw-phone').textContent =
			place.formatted_phone_number;
	  } else {
		document.getElementById('iw-phone-row').style.display = 'none';
	  }

	  // Assign a five-star rating to the hotel, using a black star ('&#10029;')
	  // to indicate the rating the hotel has earned, and a white star ('&#10025;')
	  // for the rating points not achieved.
	  if (place.rating) {
		var ratingHtml = '';
		for (var i = 0; i < 5; i++) {
		  if (place.rating < (i + 0.5)) {
			ratingHtml += '&#10025;';
		  } else {
			ratingHtml += '&#10029;';
		  }
		document.getElementById('iw-rating-row').style.display = '';
		document.getElementById('iw-rating').innerHTML = ratingHtml;
		}
	  } else {
		document.getElementById('iw-rating-row').style.display = 'none';
	  }

	  // The regexp isolates the first part of the URL (domain plus subdomain)
	  // to give a short URL for displaying in the info window.
	  if (place.website) {
		var fullUrl = place.website;
		var website = hostnameRegexp.exec(place.website);
		if (website == null) {
		  website = 'http://' + place.website + '/';
		  fullUrl = website;
		}
		document.getElementById('iw-website-row').style.display = '';
		document.getElementById('iw-website').textContent = website;
	  } else {
		document.getElementById('iw-website-row').style.display = 'none';
	  }
	  
	  document.getElementById('iw-distance').textContent = place.distance;
	}

});

