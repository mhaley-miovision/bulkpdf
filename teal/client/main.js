import '../imports/startup/client/routes.js';
import '../imports/startup/client/initialize.js';

import '../imports/shared/Teal.js';
import '../imports/shared/TealChanges.js';
import '../imports/shared/TealFactory.js';

if (Meteor.isClient) {
	$(document).ready(function() {

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

	Meteor.startup(function(){
		Hooks.init();
	});
}
