app.service('InfoWindowService', function(){
	var infoWindow;
	this.createInfoWindow = function (id) {
		infoWindow = new google.maps.InfoWindow({
		  content: document.getElementById(id)
		});
	};
	
	this.getInfoWindow = function () {
		return infoWindow;
	};
});