app.directive('ngRating', function() {
  return {
    restrict: 'A',
    template: '<span ng-show="place.rating">' +
					'<div class="rating_bar">'+
						'<div  class="rating" style="width:{{place.ratingPercentage}}%;">'+
						'</div>'+
					'</div>'+
				'</span>'
  }
});