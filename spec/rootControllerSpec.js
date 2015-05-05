describe('Root Controller', function() {
	beforeEach(module('EatrApp'));

	var rootController, scope;

	beforeEach(inject(function ($rootScope, $controller) {
		scope = $rootScope.$new();
		rootController = $controller('rootController', {
			$scope: scope
		});
	}));
	
	describe('Existance', function() {
		it('rootController is not null', function () {
			//expect(scope.restaurants.length).toEqual(0);
			expect(rootController).not.toBe(null);
		});
	});
	
	describe('Initial setup', function() {
		it('resturants array is empty', function () {
			expect(scope.restaurants.length).toEqual(0);		
		});
		it('currentLocation is set to default lat: 15, lon: 0', function () {
			expect(scope.currentLocation.latitude).toEqual(15);
			expect(scope.currentLocation.longitude).toEqual(0);
		});
		it('place object is empty', function () {
			expect(Object.keys(scope.place).length).toEqual(0);
		});
	});	
});