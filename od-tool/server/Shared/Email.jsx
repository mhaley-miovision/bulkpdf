// In your server code: define a method that the client can call
Meteor.methods({
	"teal.email.sendEmail": function (mailFields) {
		console.log("About to send email...");
		check([mailFields.to, mailFields.from, mailFields.subject, mailFields.text, mailFields.html], [String]);

		// Let other method calls from the same client start running,
		// without waiting for the email sending to complete.
		this.unblock();

		Meteor.Mailgun.send({
			to: mailFields.to,
			from: mailFields.from,
			subject: mailFields.subject,
			text: mailFields.text,
			html: mailFields.html
		});
		console.log("email sent!");
	}
});

Meteor.startup(function(){
	Meteor.Mailgun.config({
		username: 'postmaster@sandbox67d7656aec854960a8f6151fd06d60d2.mailgun.org',
		password: '4deda8662c75dc643fcb5b37a42c1958'
	});
});