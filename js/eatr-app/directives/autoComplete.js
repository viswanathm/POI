app.directive('eatrAutocomplete', ['$window', 'GoogleMapService', function($window, GoogleMapService) {
    function link(scope, element, attrs) {
		var autocomplete = new $window.google.maps.places.Autocomplete(
			(element.children()[0]),
			{
				types: ['(cities)'],
				componentRestrictions: []
			});
		
		
		$window.google.maps.event.addListener(autocomplete, 'place_changed', function(){
			var place = autocomplete.getPlace();
			if (place.geometry) {
				GoogleMapService.panZoom(place.geometry.location, 15);
				scope.search();
			}			
		});		
		
    }
    return {
		restrict: 'A',
		template: '<input id="auto-complete" placeholder="Enter a city" type="text" />',
		link: link
    };
}]);