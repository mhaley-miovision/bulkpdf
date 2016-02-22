/*
FlowRouter.route( '/', {
	name: 'home',
	action() {
		ReactLayout.render(App, {yield: <Welcome />});
	}
});*/

FlowRouter.route( '/goals', {
	name: 'goals',
	action() {
		ReactLayout.render( App, { yield: Permissions.isEnabledUser() ? <MyGoals /> : <Unauthorized /> } );
	}
});

FlowRouter.route( '/tasks', {
	name: 'tasks',
	action() {
		ReactLayout.render( App, { yield: Permissions.isEnabledUser() ? <TaskList /> : <Unauthorized /> } );
	}
});

FlowRouter.route( '/login', {
	name: 'login',
	action() {
		ReactLayout.render( App, { yield: <Login /> } );
	}
});

FlowRouter.route( '/', {
	name: 'myProfile',
	action() {
		ReactLayout.render( App, { yield: Permissions.isEnabledUser() ? <MyProfile /> : <Unauthorized /> } );
	}
});

FlowRouter.route( '/profile', {
	name: 'profile',
	action(params, queryParams) {
		// TODO: validate params
		var objectId = queryParams.objectId;
		ReactLayout.render(App, {yield: Permissions.isEnabledUser() ? <Profile objectId={objectId}/> : <Unauthorized />});
	}
});

FlowRouter.route( '/team', {
	name: 'team',
	action() {
		ReactLayout.render( App, { yield: Permissions.isEnabledUser() ? <MyTeam /> : <Unauthorized /> } );
	}
});

FlowRouter.route( '/organization', {
	name: 'organization',
	action(params, queryParams) {
		// TODO: validate params
		var objectId = queryParams.objectId;
		var objectType = queryParams.objectType;
		var zoomTo = queryParams.zoomTo;
		var mode = queryParams.mode;
		var roleMode = queryParams.roleMode && queryParams.roleMode.toLowerCase() == "true";
		ReactLayout.render( App, { yield: Permissions.isEnabledUser() ? <MyOrganization
			objectId={objectId}
			objectType={objectType}
			zoomTo={zoomTo}
			mode={mode}
			roleMode={roleMode}
		/> : <Unauthorized /> } );
	}
});

FlowRouter.route( '/goals/tree', {
	name: 'goalsTree',
	action(params, queryParams) {
		// TODO: validate params
		var objectId = queryParams.objectId;
		var zoomTo = queryParams.zoomTo;
		var mode = queryParams.mode;
		var roleMode = queryParams.roleMode && queryParams.roleMode.toLowerCase() == "true";
		ReactLayout.render( App, { yield: Permissions.isEnabledUser() ? <Tree
			objectId={objectId}
			objectType='contributor'
			zoomTo={zoomTo}
			mode={mode}
			roleMode={roleMode}
		/> : <Unauthorized />} );
	}
});

FlowRouter.route( '/goals/list/contributor', {
	name: 'goalsList',
	action(params, queryParams) {
		// TODO: validate params
		var objectId = queryParams.objectId;
		var zoomTo = queryParams.zoomTo;
		var mode = queryParams.mode;
		var roleMode = queryParams.roleMode && queryParams.roleMode.toLowerCase() == "true";
		ReactLayout.render( App, { yield: Permissions.isEnabledUser() ? <GoalList
			objectId={objectId}
			objectType='contributor'
			zoomTo={zoomTo}
			mode={mode}
			roleMode={roleMode}
		/> : <Unauthorized /> } );
	}
});

FlowRouter.route( '/organization/view', {
	name: 'organizationView',
	action(params, queryParams) {
		// TODO: validate params
		var objectId = queryParams.objectId;
		var zoomTo = queryParams.zoomTo;
		var mode = queryParams.mode;
		var roleMode = queryParams.roleMode && queryParams.roleMode.toLowerCase() == "true";
		ReactLayout.render( App, { yield: Permissions.isEnabledUser() ? <Organization
			objectId={objectId}
			objectType='contributor'
			zoomTo={zoomTo}
			mode={mode}
			roleMode={roleMode}
		/> : <Unauthorized />} );
	}
});

FlowRouter.route( '/admin', {
	name: 'admin',
	action() {
		ReactLayout.render( App, { yield: Permissions.isEnabledUser() && Permissions.isAdminUser() ? <Admin /> : <Unauthorized /> } );
	}
});

FlowRouter.route( '/enps', {
	name: 'enps',
	action() {
		ReactLayout.render( App, { yield: Permissions.isEnabledUser() ? <ENPS /> : <Unauthorized /> } );
	}
});
