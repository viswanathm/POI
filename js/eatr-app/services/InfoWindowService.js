app.service('InfoWindowService', function(){
	var infoWindow;
	this.createInfoWindow = function (id) {
		var infoContent = document.getElementById(id);
		infoContent.className = "show-window";
		infoWindow = new google.maps.InfoWindow({
		  content: infoContent
		});
	};
	
	this.getInfoWindow = function () {
		return infoWindow;
	};
});