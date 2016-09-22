angular
	.module('hiretyrone')
	.controller('AppController', AppController);

AppController.$inject = ['$scope', '$location', '$anchorScroll'];

function AppController($scope, $location, $anchorScroll) {
	$scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
		if (angular.isDefined(toState.data.pageTitle)) {
			$scope.pageTitle = toState.data.pageTitle + ' | tastemakersafrica.hiretyrone.com' ;
		}
	});
	
	$scope.scrollTo = function(id) {
		$location.hash(id);
		$anchorScroll();
	}
}