import { Meteor } from 'meteor/meteor';

import { RolesCollection } from './roles';
import { GoalsCollection } from './goals';
import { ContributorsCollection } from './contributors';
import { GoogleUserCacheCollection } from './googleUsersCache';

if (Meteor.isServer) {

	Meteor.publish("users", function () {
		return Meteor.users.find({},
			{ 'fields': {
				'user': 1,
				'services.google.email': 1,
				'services.google.name': 1,
				'services.google.given_name': 1,
				'services.google.family_name': 1,
				'services.google.picture': 1,
				'services.google.gender': 1,
				'rootOrgId': 1,
				'email': 1,
			}});
	});

	Meteor.publish("teal.user_data", function () {
		return Meteor.users.find({_id: this.userId},
		{ 'fields': {
			'user': 1,
			'services.google.email': 1,
			'services.google.name': 1,
			'services.google.given_name': 1,
			'services.google.family_name': 1,
			'services.google.picture': 1,
			'services.google.gender': 1,
			'rootOrgId': 1,
			'email': 1,
		}});
	});

	Meteor.methods({
		"teal.users.getMyOrganization": function () {
			// Make sure the user is logged in before inserting a task
			if (!Meteor.userId()) {
				throw new Meteor.Error("not-authorized");
			}

			var myUserName = Meteor.user().profile.name;
			var contributor = ContributorsCollection.findOne({name: myUserName});

			if (contributor) {

			} else {
				throw new Meteor.error(404, 'Could not find username: ' + myUserName);
			}

			return contributor.physicalTeam;
		},

		// TODO: this needs to be publication
		"teal.users.getMyEmail": function () {
			// Make sure the user is logged in before inserting a task
			if (!Meteor.userId()) {
				throw new Meteor.Error("not-authorized");
			}

			console.log(Meteor.user().services.google.email);

			return Meteor.user().services.google.email;
		},

		"teal.import.importUserPhotoInfo": function () {
			if (!Meteor.userId()) {
				throw new Meteor.Error("not-authorized");
			}

			Meteor.call("teal.users.updateGoogleAdminCache");

			// now we have populated a user cache we can pull data from
			var notFoundString = "";
			var noPhotoString = "";
			var updatedString = "";
			var updatedCount = 0;
			var notFoundCount = 0;

			console.log("About to update the OD model with photo info...");

			Meteor.call("teal.users.updateGoogleAdminCache");

			GoogleUserCacheCollection.find({}).forEach(o => {

				// update the corresponding contributor
				let c = ContributorsCollection.findOne({email: o.primaryEmail});
				if (!c) {
					notFoundString += o.primaryEmail + "\n";
					notFoundCount++;
				} else if (o.thumbnailPhotoUrl) {
					// attach to this contributor
					ContributorsCollection.update(c._id, {$set: {photo: o.thumbnailPhotoUrl}});

					// also attach photo to all roles tied to this user
					RolesCollection.update({email: c.email}, {$set: {photo: o.thumbnailPhotoUrl}}, {multi: true});

					// also attach photo to all roles cached to goals
					GoalsCollection.find(
						{
							$or: [{ownerRoles: {$elemMatch: {email: c.email}}},
								{contributorRoles: {$elemMatch: {email: c.email}}}
							]
						}).forEach(g => {

						g.ownerRoles.forEach(r => {
							if (r.email === c.email) {
								r.photo = o.thumbnailPhotoUrl;
							}
						});
						g.contributorRoles.forEach(r => {
							if (r.email === c.email) {
								r.photo = o.thumbnailPhotoUrl;
							}
						});
						GoalsCollection.update(g._id, g);
					});

					updatedString += o.primaryEmail + "\n";
					updatedCount++;
				} else {
					noPhotoString += o.primaryEmail + "\n";
				}
			});

			var email = "Updated " + updatedCount + " photo urls.\n\n\nUpdated:" + updatedString
				+ "\n\n\nUnknown contributors:\n\n" + notFoundString
				+ "\n\nContributors without a photo:\n\n" + noPhotoString;
			console.log("Updated " + updatedCount + " photo urls.");

			Email.send({
				from: "teal@miovision.com",
				to: "vleipnik@miovision.com",
				subject: "User photos imported, " + notFoundCount + " unknown",
				text: email
			});

			return true;
		},

		// TODO: this needs to be publication
		"teal.users.getPhotoUrlByUserName": function (userName) {
			// Make sure the user is logged in before inserting a task
			if (!Meteor.userId()) {
				throw new Meteor.Error("not-authorized");
			}
			var c = ContributorsCollection.findOne({name: userName});
			return Teal.userPhotoUrl(c.photo);
		},
	});

	// Validate username, sending a specific error message on failure.
	Accounts.validateNewUser(function (user) {
		console.log("--==( Accounts.validateNewUser )==--");
		if (user) {
			// for now just Google sign in is permitted
			let u = user;
			if (u && !u.email && u.services && u.services.google.email) {
				let email = u.services.google.email;

				// if there is a contributor associated, allow it
				let c = ContributorsCollection.findOne({email: email});
				if (c) {
					console.log(`Accounts.validateNewUser('${u._id}') - found contributor - '${c.name}'`);
					return true;
				}

				// custom enabled users
				var enabledUsers = ['ryan.burgio@gmail.com', 'leipnik@gmail.com', 'darlenescott78@gmail.com'];
				if (enabledUsers.indexOf(email) >= 0) {
					console.log(`Accounts.validateNewUser('${u._id}') - used part of custom enabled users - '${email}'`);
					return true;
				}

				// enable all miovision users by default
				if (email.indexOf("@miovision.com") >= 0) {
					console.log(`Accounts.validateNewUser('${u._id}') - user is Miovision employee - '${email}'`);
					return true;
				}
			}
		}
		console.error("Accounts.validateNewUser FAILED");
		console.error(JSON.stringify(user, null, '\t'));

		/*
		 Meteor.call("teal.email.sendEmail",
		 {
		 to:"vleipnik@miovision.com",
		 from:"teal@miovision.com",
		 subject: "Unauthorized user attempted login!",
		 text:"User: " + JSON.stringify(user),
		 html:""
		 });*/

		throw new Meteor.Error(403, "This user is not enabled.");
	});



	Hooks.onLoggedIn = function (userId)
	{
		let u = Meteor.users.findOne({_id:userId});
		if (!!u.initialized) {
			let o = {
				userId: userId,
				userName: u.profile.name,
			};
			Meteor.call("teal.notifications.createNotification", { type: 'user.logged_in', payload: o});
			console.log(userId + " logged in.")
		} else {
			initializeUser(userId);
		}
	}

	initializeUser = function (userId) {
		let u = Meteor.users.findOne({_id:userId});

		console.log("*** Initializing user: " + userId + " ****");
		console.log(u);

		if (!u.services.google) {
			console.warn("User has no services attached yet. Cannot initialize.");
			return;
		}

		let email = u.services.google.email;
		Roles.addUsersToRoles(userId, 'enabled'); //TODO:fix groups to work properly , rootOrgId);

		// admins
		var adminUsers = ['vleipnik@miovision.com', 'jreeve@miovision.com',
			'jwincey@miovision.com', 'jbhavnani@miovision.com', 'lgreig@miovision.com', 'kmcbride@miovision.com',
			'tbrijpaul@miovision.com', 'ndumond@miovision.com', 'dbullock@miovision.com', 'bward@miovision.com',
			'bpeters@miovision.com'];
		if (adminUsers.indexOf(email) >= 0) {
			Roles.addUsersToRoles(userId, 'admin'); //TODO:fix groups to work properly , rootOrgId);
		}

		// is user's contributor initialized?
		if (!u.contributorId) {
			let c = ContributorsCollection.findOne({email:email});
			if (!c) {
				console.warn("Warning: user " + userId + " has no contributor.");
				return;
			}

			// link back to the user
			ContributorsCollection.update(c._id, {$set: {userId: userId}});

			// update the user object
			Meteor.users.update(userId, {$set: { rootOrgId: c.rootOrgId, email: email, contributorId: c._id, initialized: true }});

			if (c.isLeadNode || email === 'vleipnik@miovision.com') { // personal backdoor hack
				Roles.addUsersToRoles(userId, 'designer');
			}
		}
	}

	Hooks.onLoggedOut = function (userId)
	{
		let c = ContributorsCollection.findOne({userId:userId});
		if (!c) {
			console.error("Hooks.onLoggedOut -- " + userId + " has no contributor attached.");
			return;
		}
		let o = {
			userId: userId,
			userName: c.name
		};
		Meteor.call("teal.notifications.createNotification", { type: 'user.logged_out', payload: o});
		console.log(userId + " logged out.")
	}
}

