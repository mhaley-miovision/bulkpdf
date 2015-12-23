FlowRouter.route( '/', {
	name: 'home',
	action() {
		ReactLayout.render(App, {yield: <WelcomeComponent />});
	}
});

FlowRouter.route( '/tasks', {
	name: 'tasks',
	action() {
		ReactLayout.render( App, { yield: <TaskListComponent /> } );
	}
});

FlowRouter.route( '/login', {
	name: 'login',
	action() {
		ReactLayout.render( App, { yield: <LoginComponent /> } );
	}
});

FlowRouter.route( '/profile', {
	name: 'profile',
	action() {
		ReactLayout.render( App, { yield: <ProfileComponent /> } );
	}
});

FlowRouter.route( '/team', {
	name: 'team',
	action() {
		ReactLayout.render( App, { yield: <TeamComponent /> } );
	}
});

FlowRouter.route( '/organization', {
	name: 'organization',
	action() {
		ReactLayout.render( App, { yield: <OrganizationComponent /> } );
	}
});

FlowRouter.route( '/admin', {
	name: 'admin',
	action() {
		ReactLayout.render( App, { yield: <AdminComponent /> } );
	}
});

FlowRouter.route( '/enps', {
	name: 'enps',
	action() {
		ReactLayout.render( App, { yield: <ENPSComponent /> } );
	}
});

Accounts.onLogin( () => {

});