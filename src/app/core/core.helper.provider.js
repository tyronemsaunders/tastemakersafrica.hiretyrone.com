/**
 * @author Tyrone Saunders
 */

angular
	.module('hiretyrone.core')
	.provider('helper', helper);

helper.$inject = [];

function helper() {
	
	this.isMobile = {
		"Android" : navigator.userAgent.match(/Android/i),
		"BlackBerry" : navigator.userAgent.match(/BlackBerry/i),
		"iOS" : navigator.userAgent.match(/iPhone|iPad|iPod/i),
		"Opera" : navigator.userAgent.match(/Opera Mini/i),
		"Windows" : navigator.userAgent.match(/IEMobile/i)
	}
	
	if ((this.isMobile.Android !== null) || (this.isMobile.BlackBerry !== null) || (this.isMobile.iOS !== null) || (this.isMobile.Opera !== null) || (this.isMobile.Windows !== null)) {
		this.isMobile.any = true;
	} else {
		this.isMobile.any = false;
	}
	
	this.$get = function() {
		return {
			isMobile : this.isMobile
		}
	}
}