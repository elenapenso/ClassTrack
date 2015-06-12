(function() {
	var app = angular.module('ClassTrack',[]);
	
	app.value('today', function ($scope){                 
		}); 

		app.controller('MainController', function(){

		});

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
	app.directive('pageTitle', function(){
		return{
			restrict: 'E',
			templateUrl: 'directives/page-title.html'
		};	
	});
	

})();