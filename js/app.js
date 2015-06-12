(function() {
	var app = angular.module('ClassTrack',[]);

	app.directive('appHeader', function(){
		return{
			restrict: 'E',
			templateUrl: 'directives/app-header.html'
		};	
	});


})();