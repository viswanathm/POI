app.service('InfoWindowService', function(){
	var infoWindow;
	this.createInfoWindow = function (id) {
		var infoContent = document.getElementById(id);
		infoContent.style.display = "block";
		infoWindow = new google.maps.InfoWindow({
		  content: infoContent
		});
	};
	
	this.getInfoWindow = function () {
		return infoWindow;
	};
});