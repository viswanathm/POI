app.directive('eatrRating', function() {
  return {
    restrict: 'A',
    template: '<div ng-show="place.rating">' +
					'<div class="rating-bar">'+
						'<div  class="rating" ng-style="{ \'width\' : place.ratingPercentage}">'+
						'</div>'+
					'</div>'+
				'</div>'
  }
});