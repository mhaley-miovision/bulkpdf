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
		ReactLayout.render( App, { yield: <MyGoals /> } );
	}
});

FlowRouter.route( '/tasks', {
	name: 'tasks',
	action() {
		ReactLayout.render( App, { yield: <TaskList /> } );
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
		ReactLayout.render( App, { yield: <MyProfile /> } );
	}
});

FlowRouter.route( '/profile', {
	name: 'profile',
	action(params, queryParams) {
		// TODO: validate params
		var objectId = queryParams.objectId;
		ReactLayout.render(App, {yield: <Profile objectId={objectId}/>});
	}
});

FlowRouter.route( '/team', {
	name: 'team',
	action() {
		ReactLayout.render( App, { yield: <MyTeam /> } );
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
		ReactLayout.render( App, { yield: <MyOrganization
			objectId={objectId}
			objectType={objectType}
			zoomTo={zoomTo}
			mode={mode}
			roleMode={roleMode}
		/> } );
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
		ReactLayout.render( App, { yield: <Tree
			objectId={objectId}
			objectType='contributor'
			zoomTo={zoomTo}
			mode={mode}
			roleMode={roleMode}
		/> } );
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
		ReactLayout.render( App, { yield: <GoalList
			objectId={objectId}
			objectType='contributor'
			zoomTo={zoomTo}
			mode={mode}
			roleMode={roleMode}
		/> } );
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
		ReactLayout.render( App, { yield: <Organization
			objectId={objectId}
			objectType='contributor'
			zoomTo={zoomTo}
			mode={mode}
			roleMode={roleMode}
		/> } );
	}
});

FlowRouter.route( '/admin', {
	name: 'admin',
	action() {
		ReactLayout.render( App, { yield: <Admin /> } );
	}
});

FlowRouter.route( '/enps', {
	name: 'enps',
	action() {
		ReactLayout.render( App, { yield: <ENPS /> } );
	}
});
