import { Meteor } from 'meteor/meteor';

if (Meteor.isClient) {
	Meteor.startup(function() {
		Hooks.init();
	});

	/*
	$(document).ready(function(){
		// TODO: hack to get the mobile nav to show
		setTimeout(function() {
			$('.button-collapse').sideNav({
					menuWidth: 300, // Default is 240
					edge: 'left', // Choose the horizontal origin
					closeOnClick: true // Closes side-nav on <a> clicks, useful for Angular/Meteor
				}
			);
		}, 1000);
	});
	*/
}
