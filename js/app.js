(function() {
	var app = angular.module('ClassTrack',[]);

	app.directive('appHeader', function(){
		return{
			restrict: 'E',
			templateUrl: 'directives/app-header.html'
		};	
	});
	app.directive('appFooter', function(){
		return{
			restrict: 'E',
			templateUrl: 'directives/app-footer.html'
		};	
	});


})();