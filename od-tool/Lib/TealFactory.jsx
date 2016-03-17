TealFactory = {
	createGoal(_id, parent, name, keyObjectives, doneCriteria, ownerRoles, contributorRoles, state, dueDate) {
		// TODO: parameter validation, for now we only get the abstraction benefits
		return {
			type:Teal.ObjectTypes.Goal,
			_id:_id,
			parent:parent,
			name:name,
			keyObjectives:keyObjectives,
			doneCriteria:doneCriteria,
			ownerRoles:ownerRoles,
			contributorRoles:contributorRoles,
			state:state,
			dueDate:dueDate,
			path: [],
		}
	},

	createOrganization(_id, parent, parentId, startDate, endDate) {
		// TODO: parameter validation, for now we only get the abstraction benefits
		return {
			type:Teal.ObjectTypes.Organization,
			_id:_id,
			parent:parent,
			parentId:parentId,
			startDate:startDate,
			endDate:endDate,
			path: []
		}
	},

	//createRole(_id, label,)
};