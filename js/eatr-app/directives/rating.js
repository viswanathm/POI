app.directive('eatrRating', function() {
    function link(scope, element, attrs) {
		element.children()[0].children[0].children[0].style.width = scope.place && (scope.place.ratingPercentage + "%");
    }
	return {
    restrict: 'A',
	link: link,
    template: '<div ng-show="place.rating">' +
					'<div class="rating-bar">'+
						'<div  class="rating">'+
						'</div>'+
					'</div>'+
				'</div>'
	}
});
