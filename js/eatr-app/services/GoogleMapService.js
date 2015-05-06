app.service('GoogleMapService', function($q, $timeout, MarkerService, InfoWindowService){
	var map, places;
		
    this.createMap = function(id, currentLocation, userLocationDetected) {
		map = new google.maps.Map(document.getElementById(id), {
			zoom: userLocationDetected ? 13 : 2,
			center: new google.maps.LatLng(currentLocation.latitude, currentLocation.longitude),
			mapTypeControl: false,
			panControl: false,
			zoomControl: true,
			streetViewControl: false
		});
		
		if(userLocationDetected) {
			MarkerService.createMarker(currentLocation).setMap(map);
		}
		
		places = new google.maps.places.PlacesService(map);
	};
	
	this.createMarker = function (location, icon, delay) {
		var marker = MarkerService.createMarker(location, icon);
		setTimeout(function() {
			marker.setMap(map);
		}, delay ? (delay * 100) : 0);		
		return marker;
	};
	
	this.dropMarker = function (marker) {
		return function() {
			marker.setMap(map);
		};
	}
	
	this.createInfoWindow = function (id) {
		InfoWindowService.createInfoWindow(id);
	};
	
	
	this.getInfoWindow = function () {
		return InfoWindowService.getInfoWindow();
	};
	
	this.panZoom = function (location, zoom) {	
		map.panTo(location);
		map.setZoom(zoom);
	};
	
	this.search = function() {
		var me = this,
			deferred = $q.defer(),
			search = {
				bounds: map.getBounds(),
				types: ['restaurant']
			};		
		this.deferredTimer();
		places.nearbySearch(search, function(results, status) {
			if (status == google.maps.places.PlacesServiceStatus.OK) {
			  // Create a marker for each hotel found, and
			  // assign a letter of the alphabetic to each marker icon.		  
			  for (var i = 0; i < results.length; i++) {			
				results[i].distance = me.getDistance(map.getCenter(), results[i].geometry.location);
				
				results[i].imageSRC = results[i].photos && results[i].photos[0] && results[i].photos[0].getUrl({maxHeight: 100, maxWidth: 100});
							
				results[i].varities  = results[i].types && (results[i].types.length > 0) && results[i].types.join(" | ");
				
				results[i].ratingPercentage = results[i].rating && (Math.round((results[i].rating/5)*100));
				
				results[i].markerLetter = String.fromCharCode('A'.charCodeAt(0) + i);
			  }
			  deferred.resolve(results);
			} else {
			  deferred.reject([]);
			}
		});
		return deferred.promise;
	};
	
	this.getPlaceDetails = function(place_id, marker) {
		var deferred = $q.defer();
		this.deferredTimer(10);
		places.getDetails({placeId: place_id},
		  function(place, status) {
			if (status != google.maps.places.PlacesServiceStatus.OK) {
				deferred.reject(null);
			}
			InfoWindowService.getInfoWindow().open(map, marker);
			map.setCenter(marker.placeResult.geometry.location);
			place.ratingPercentage = place.rating && (Math.round((place.rating/5)*100));
			deferred.resolve(place);
		  });
		return deferred.promise;
	};
	
	this.showInfoWindow = function(marker, location){	
		InfoWindowService.getInfoWindow().open(map, marker);
		map.setCenter(location);
	};
		
	this.deferredTimer = function (time) {
	  $timeout(function() {
		//timer
	  }, time||1000);
	};
	
	this.rad = function(x) {
	  return x * Math.PI / 180;
	};

	this.getDistance = function (p1, p2) {
	  var R = 6378137; // Earth’s mean radius in meter
	  var dLat = this.rad(p2.lat() - p1.lat());
	  var dLong = this.rad(p2.lng() - p1.lng());
	  var quotient = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos(this.rad(p1.lat())) * Math.cos(this.rad(p2.lat())) *
		Math.sin(dLong / 2) * Math.sin(dLong / 2);
	  var arcTangent = 2 * Math.atan2(Math.sqrt(quotient), Math.sqrt(1 - quotient));
	  var distance = (R * arcTangent)/1000;
	  var roundedDisatnce = Math.round(distance * 100) / 100
	  return roundedDisatnce; // returns the distance in miles
	};	
});