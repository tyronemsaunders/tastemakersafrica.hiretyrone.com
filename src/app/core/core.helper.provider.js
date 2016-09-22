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
		"Windows" : navigator.userAgent.match(/IEMobile/i),
		"any" : (self.Android || self.BlackBerry || self.iOS || self.Opera || self.Windows) ? true : false
	}
	
	this.$get = function() {
		return {
			isMobile : this.isMobile
		}
	}
}