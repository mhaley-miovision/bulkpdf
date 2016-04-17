import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

export const NotificationsCollection = new Mongo.Collection("teal.notifications");

if (Meteor.isServer) {
	Meteor.publish('teal.notifications', function() {
		return NotificationsCollection.find({});
	});
}

// TODO: when people want to subscribe to certain notifications, I will need to break this up into events and
// look up the list of subscribers to these events to be sent to

if (Meteor.isServer) {
	function processNotification(n) {
		// process the event
		if (n.payload && n.type) {
			console.log("received notification of type " + n.type);
			switch (n.type) {
				case 'enps.received':
					Meteor.call("teal.email.sendEmail",
						{
							to:"vleipnik@miovision.com",
							from:"teal@miovision.com",
							subject: "ENPS score received!",
							text: `Person:  ${n.userName}\n\nRating: ${n.payload.rating}\n\nReason: ${n.payload.reason}`,
							html:""
						});
					break;
				case 'feedback.received':
					Meteor.call("teal.email.sendEmail",
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
						Meteor.call("teal.email.sendEmail",
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
				case 'comments.atMentioned':
					Meteor.call("teal.email.sendEmail",
						{
							to: n.payload.email,
							from:"teal@miovision.com",
							subject: n.payload.subject,
							text: '',
							html: n.payload.body
						});
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

	Meteor.methods({
		"teal.notifications.createNotification": function(n) {
			insertNotification(n);
			return processNotification(n);
		}
	});
}