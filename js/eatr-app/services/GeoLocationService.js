app.service('GeoLocationService', function($q, $timeout){
    this.getCurrentGeoLocation = function() {
		var deferred = $q.defer();
		this.deferredTimer();
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(function(position){
				deferred.resolve(position.coords);
			}, function(error){
				var errorDesc = "";
				switch (error.code) {
					case error.PERMISSION_DENIED:
						errorDesc = "User denied the request for Geolocation."
						break;
					case error.POSITION_UNAVAILABLE:
						errorDesc = "Location information is unavailable."
						break;
					case error.TIMEOUT:
						errorDesc = "The request to get user location timed out."
						break;
					case error.UNKNOWN_ERROR:
						errorDesc = "An unknown error occurred."
						break;
				}
				deferred.reject(errorDesc);
			});
		} else {
			deferred.reject("Browser doesnt support geo location feature");
		}
		return deferred.promise;
	};
	
	this.deferredTimer = function () {
	  $timeout(function() {
		//timer
	  }, 1000);
	};
});