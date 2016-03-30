if (Meteor.isServer) {
	// first, remove configuration entry in case service is already configured
	ServiceConfiguration.configurations.remove({
		service: "google"
	});

	ServiceConfiguration.configurations.insert({
		service: "google",
		clientId: "88230792771-sfqdsio0m68c010sak58qhapee9aqstv.apps.googleusercontent.com",
		loginStyle: "popup",
		secret: "RJ1pvqY7uwH1h7YRQUNokg0x",
	});
}
