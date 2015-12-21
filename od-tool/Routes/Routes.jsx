FlowRouter.route( '/', {
	name: 'welcome',
	action() {
		ReactLayout.render(App, {yield: <WelcomeComponent />});
	}
});

FlowRouter.route( '/tasks', {
	name: 'task',
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
	name: 'task',
	action() {
		ReactLayout.render( App, { yield: <ProfileComponent /> } );
	}
});

FlowRouter.route( '/team', {
	name: 'task',
	action() {
		ReactLayout.render( App, { yield: <TeamComponent /> } );
	}
});

FlowRouter.route( '/organization', {
	name: 'task',
	action() {
		ReactLayout.render( App, { yield: <OrganizationComponent /> } );
	}
});

FlowRouter.route( '/enps', {
	name: 'task',
	action() {
		ReactLayout.render( App, { yield: <ENPSComponent /> } );
	}
});

Accounts.onLogin( () => {
	
});