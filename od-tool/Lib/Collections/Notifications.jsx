NotificationsCollection = new Mongo.Collection("notifications");

// TODO: when people want to subscribe to certain notifications, I will need to break this up into events and
// look up the list of subscribers to these events to be sent to

if (Meteor.isServer) {
	function processNotification(n) {
		// process the event
		if (n.payload && n.type) {
			console.log("received notification of type " + n.type);
			switch (n.type) {
				case 'enps.received':
					Meteor.call("sendEmail",
						{
							to:"vleipnik@miovision.com",
							from:"teal@miovision.com",
							subject: "ENPS score received!",
							text: `Person:  ${n.userName}\n\nRating: ${n.payload.rating}\n\nReason: ${n.payload.reason}`,
							html:""
						});
					break;
				case 'feedback.received':
					Meteor.call("sendEmail",
						{
							to:"vleipnik@miovision.com",
							from:"teal@miovision.com",
							subject: "Teal feedback received!",
							text: `Person: ${n.userName}\n\nFeedback: ${n.payload.feedback}`,
							html:""
						});
					break;
				case 'user.logged_in':
					if (n.userName === 'Victor Leipnik') {
						console.log("Vic logged in, skipping email notification.");
					} else {
						Meteor.call("sendEmail",
							{
								to:"vleipnik@miovision.com",
								from:"teal@miovision.com",
								subject: n.userName + " logged into Teal!",	// TODO: hack since depends on insertNotification
								text:`Time: ${n.createdAt}`,
								html:""
							});
					}
					break;
				case 'user.logged_out':
					// do nothing here
					break;
			}
			return true;
		}
		throw new Meteor.error("Malformed notification detected" + n);
	}

	function insertNotification(n) {
		// first, save the record along with pertinent metadata
		n.createdAt = new Date();
		n.userId = Meteor.user() ? Meteor.user()._id : null;
		n.userName = Meteor.user() ? Meteor.user().profile.name : null;
		NotificationsCollection.insert(n);
	}

	// In your server code: define a method that the client can call
	Meteor.methods({
		createNotification(n) {
			insertNotification(n);
			return processNotification(n);
		}
	});
}