angular
	.module('hiretyrone.home')
	.config(homeConfig);

homeConfig.$inject = ['helperProvider', '$stateProvider'];

/**
 * Each section or module of the site can also have its own routes. AngularJS
 * will handle ensuring they are all available at run-time, but splitting it
 * this way makes each module more "self-contained".
 */
function homeConfig(helperProvider, $stateProvider) {
	$stateProvider
	
		//app.home dot syntax creates a parent/child state
		.state('app.home', {
		    url : '/home',
		    views : {
		      //target the view ui-view='main' in the unnamed root template (index.tpl.html)
		      //the other views in the unnamed root template are inherited.
		      "main@" : {
		    	  controller : 'HomeController',
		    	  templateUrl : 'home/home.tpl.html'
		      },
		      "hero@app.home" : {
		    	  templateUrl : function($stateParams) {
		    		  var isMobile = helperProvider.isMobile;
		    		  if (isMobile.any) {
		    			  return 'home/hero/mobile.tpl.html'
		    		  } else {
		    			  return 'home/hero/web.tpl.html'
		    		  }
		    	  }
		      },
		      "collaboration@app.home" : {
		    	  templateUrl : 'home/collaboration/collaboration.tpl.html'
		      },
		      "vision@app.home" : {
		    	  templateUrl : 'home/vision/vision.tpl.html'
		      },
		      "passion@app.home" : {
		    	  templateUrl : 'home/passion/passion.tpl.html'
		      },
		    },
		    data : { 
		    	//pageTitle will be handled by parent state 'app' in appCtrl
		    	pageTitle : 'Home' 
		    }
		});
}