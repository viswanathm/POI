app.service('MarkerService', function(){
	
	this.createMarker = function (location, icon) {
		var config = {
			  position: new google.maps.LatLng(location.latitude, location.longitude),
			  animation: google.maps.Animation.DROP
		};
		if(icon) {
			config.icon = icon;
		}
		return new google.maps.Marker(config);
	};
});