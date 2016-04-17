import Teal from './Teal';

var TealChanges = {

	// These are what types of changes we track and approve/reject/apply throughout the system
	// They operate on the basic basic building blocks of the organizational model
	Types: {
		// Role operations
		NewRole:'new_role',
		NewRoleAccountability:'new_accountability',
		RemoveRoleAccountability:'remove_accountability',
		RemoveRole:'remove_role',
		AssignRoleContributor:'assign_role_contributor',
		RemoveRoleContributor:'remove_role_contributor',
		UpdateRole:'update_role',
		AddRoleContributingOrg:'add_role_contributing_org',
		RemoveRoleContributingOrg:'remove_role_contributing_org',

		// Role label operations
		NewRoleLabel:'add_role_label',
		RenameRoleLabel:'rename_role_label',
		RemoveRoleLabel:'remove_role_label',

		// Organization operations
		NewOrganization:'new_organization',
		RemoveOrganization:'remove_organization',
		MoveOrganization:'move_organization', // the concept of promoting or demoting is implied here
		UpdateOrganization:'update_organization',

		// Goal operations
		NewGoal:'new_goal',
		AssignRoleGoal:'assign_role_goal',
		RemoveGoal:'remove_goal',
		RemoveRoleGoal:'remove_role_goal',
		UpdateGoal:'update_goal',
		KeyObjectiveCompleted:'completed_key_objective',
		DoneCriteriaCompleted:'done_criteria_objective',
		GoalStateChanged:'goal_state_change', // things like checking off done criteria and key objectives
	},

	// Each business rule can assume the following context
	// user = Acting user
	// operation = Activity to perform

	// Business rules
	businessRules: [],

	// Initialize the business rules around object changes
	// A business rule can either resolve or not
	// If unresolved, continue the search

	Errors: {
		InvalidBusinessRuleCall: 'invalid-business-rule-call',
	},

	// Is this a valid change type?
	isAllowedChangeType(changeType) {
		return _.indexOf(_.values(TealChanges.Types), changeType) >= 0;
	},

	diffGoals(oldGoal, newGoal) {
		let changes = [];

		// GOAL NAME
		if (oldGoal.name !== newGoal.name) {
			changes.push(`Renamed from '${oldGoal.name}' to '${newGoal.name}'`);
		}

		// GOAL KEY OBJECTIVES
		let koDiffs = this.diffCheckableItemsList(oldGoal.keyObjectives, newGoal.keyObjectives);
		koDiffs.added.forEach(ko => {
			changes.push(`Added new key objective '${ko.name}'`);
		});
		koDiffs.removed.forEach(ko => {
			changes.push(`Removed key objective '${ko.name}'`);
		});
		koDiffs.updated.forEach(ko => {
			changes.push(`Changed key objective '${ko.name}' to '${ko.newName}'`);
		});
		koDiffs.checked.forEach(ko => {
			changes.push(`Changed key objective '${ko.name}' state from '${Teal.getCheckableItemState(ko.completed)}' to '${Teal.getCheckableItemState(ko.newCompleted)}'`);
		});

		// GOAL DONE CRITERIA
		let dcDiffs = TealChanges.diffCheckableItemsList(oldGoal.doneCriteria, newGoal.doneCriteria);
		dcDiffs.added.forEach(dc => {
			changes.push(`Added new done criteria '${dc.name}'`);
		});
		dcDiffs.removed.forEach(dc => {
			changes.push(`Removed done criteria '${dc.name}'`);
		});
		dcDiffs.updated.forEach(dc => {
			changes.push(`Changed done criteria '${dc.name}' to '${dc.newName}'`);
		});
		koDiffs.checked.forEach(dc => {
			changes.push(`Changed key objective '${dc.name}' state from '${Teal.getCheckableItemState(dc.completed)}' to '${Teal.getCheckableItemState(dc.newCompleted)}'`);
		});

		// GOAL OWNERS
		let ownerDiffs = TealChanges.diffRoleList(oldGoal.ownerRoles, newGoal.ownerRoles);
		ownerDiffs.added.forEach(o => {
			changes.push(`Assigned '${o.accountabilityLabel}' ('${ o.contributor ? o.contributor : "unfilled" }') to goal owners.`);
		});
		ownerDiffs.removed.forEach(o => {
			changes.push(`Unassigned '${o.accountabilityLabel}' ('${ o.contributor ? o.contributor : "unfilled" }') from goal owners.`);
		});

		// GOAL CONTRIBUTORS
		let contributorDiffs = TealChanges.diffRoleList(oldGoal.contributorRoles, newGoal.contributorRoles);
		contributorDiffs.added.forEach(o => {
			changes.push(`Assigned '${o.accountabilityLabel}' ('${ o.contributor ? o.contributor : "unfilled" }') to goal contributors.`);
		});
		contributorDiffs.removed.forEach(o => {
			changes.push(`Unassigned '${o.accountabilityLabel}' ('${ o.contributor ? o.contributor : "unfilled" }') from goal contributors.`);
		});

		// GOAL STATE
		if (oldGoal.state !== newGoal.state) {
			changes.push(`Changed state from '${Teal.getGoalReadableState(oldGoal.state)}' to '${Teal.getGoalReadableState(newGoal.state)}'`);
		}

		// GOAL DUE DATE
		if (oldGoal.dueDate !== newGoal.dueDate) {
			changes.push(`Changed due date from '${oldGoal.dueDate}' to '${newGoal.dueDate}'`);
		}
		return changes;
	},
	diffCheckableItemsList(oldList, newList) {
		let removedItems = _.filter(oldList, o => {
			let exists = _.where(newList, {_id: o._id}).length > 0;
			return !exists;
		});
		let addedItems = _.filter(newList, o => {
			let exists = _.where(oldList, {_id: o._id}).length > 0;
			return !exists;
		});
		let updatedItems = [];
		_.each(oldList, o => {
			let o2 = _.where(newList, {_id: o._id});
			let updated = (o2.length == 1 && o2 && (o.name !== o2[0].name));
			if (updated) {
				let o3 = _.clone(o);
				o3.newName = o2[0].name;
				updatedItems.push(o3);
			}
		});
		let checkItems = [];
		_.each(oldList, o => {
			let o2 = _.where(newList, {_id: o._id});
			let updated = (o2.length == 1 && o2 && (o.completed !== o2[0].completed));
			if (updated) {
				let o3 = _.clone(o);
				o3.newCompleted = o2[0].completed;
				checkItems.push(o3);
			}
		});
		return { added: addedItems, removed: removedItems, updated:updatedItems, checked:checkItems };
	},
	diffOrgLists(oldList, newList) {
		"use strict";
		let removedItems = _.filter(oldList, o => {
			let exists = _.where(newList, {_id: o._id}).length > 0;
			return !exists;
		});
		let addedItems = _.filter(newList, o => {
			let exists = _.where(oldList, {_id: o._id}).length > 0;
			return !exists;
		});
		return { added: addedItems, removed: removedItems };
	},
	diffRoleList(oldList, newList) {
		let removedItems = _.filter(oldList, o => {
			let exists = _.where(newList, {_id: o._id}).length > 0;
			return !exists;
		});
		let addedItems = _.filter(newList, o => {
			let exists = _.where(oldList, {_id: o._id}).length > 0;
			return !exists;
		});
		return { added: addedItems, removed: removedItems };
	},
	diffRoles(oldRole, newRole) {
		let changes = [];

		// ROLE LABEL
		if (oldRole.label !== newRole.label) {
			changes.push(`Renamed from '${oldRole.label}' to '${newRole.label}'`);
		}

		// ROLE ACCOUNTABILITY LEVEL
		if (oldRole.accountabilityLevel !== newRole.accountabilityLevel) {
			changes.push(`Renamed from '${oldRole.accountabilityLevel}' to '${newRole.accountabilityLevel}'`);
		}

		// ROLE CONTRIBUTOR
		if (oldRole.contributor !== newRole.contributor) {
			changes.push(`Changed from '${Teal.getRoleContributorAsString(oldRole.contributor)}' to '${Teal.getRoleContributorAsString(newRole.contributor)}'`);
		}

		// ROLE CONTRIBUTOR
		if (oldRole.organization !== newRole.organization) {
			changes.push(`Moved from '${oldRole.organization}' to '${newRole.organization}'`);
		}

		// ROLE ACCOUNTABILITIES
		let accDiffs = TealChanges.diffCheckableItemsList(oldRole.accountabilities, newRole.accountabilities);
		accDiffs.added.forEach(a => {
			changes.push(`Added accountability '${a.name}'`);
		});
		accDiffs.removed.forEach(a => {
			changes.push(`Removed accountability '${a.name}'`);
		});
		accDiffs.updated.forEach(a => {
			changes.push(`Changed accountability '${a.name}' to '${a.newName}'`);
		});

		// CONTRIBUTING ORGS
		let orgDiffs = TealChanges.diffOrgLists(oldRole.orgList, newRole.orgList);
		orgDiffs.added.forEach(o => {
			changes.push(`Added as a contributing role to '${o.name}'`);
		});
		orgDiffs.removed.forEach(o => {
			changes.push(`Removed as a contributing role from '${o.name}'`);
		});

		// START/END DATES
		if (oldRole.startDate !== newRole.startDate) {
			changes.push(`Changed start date from '${oldRole.startDate}' to '${newRole.startDate}'`);
		}
		if (oldRole.endDate !== newRole.endDate) {
			changes.push(`Changed end date from '${oldRole.endDate}' to '${newRole.endDate}'`);
		}

		// OTHER FLAGS
		if (oldRole.isExternal !== newRole.isExternal) {
			let y = function(x) { return x ? 'external' : 'internal'; };
			changes.push(`Changed from '${y(oldRole.isExternal)}' to '${y(newRole.isExternal)}' role.`);
		}
		if (oldRole.isLeadNode !== newRole.isLeadNode) {
			let y = function(x) { return x ? 'lead node' : 'regular node'; };
			changes.push(`Changed role '${y(oldRole.isLeadNode)}' to '${y(newRole.isLeadNode)}'.`);
		}
		if (oldRole.isPrimaryAccountability !== newRole.isPrimaryAccountability) {
			let y = function(x) { return x ? 'primary accountability' : 'auxiliary accountability'; };
			changes.push(`Changed from '${y(oldRole.isPrimaryAccountability)}' to '${y(newRole.isPrimaryAccountability)}' role.`);
		}

		return changes;
	},
	diffOrganizations(oldOrg, newOrg) {
		let changes = [];

		// PARENTS
		if (oldOrg.parent !== newOrg.parent) {
			changes.push(`Changed parent from '${oldOrg.parent}' to '${newOrg.parent}'`);
		}

		// START/END DATES
		if (oldOrg.startDate !== newOrg.startDate) {
			changes.push(`Changed start date from '${oldOrg.startDate}' to '${newOrg.startDate}'`);
		}
		if (oldOrg.endDate !== newOrg.endDate) {
			changes.push(`Changed end date from '${oldOrg.endDate}' to '${newOrg.endDate}'`);
		}

		return changes;
	},

	getChangeSummaryHtml(c) {
		let t = c.type;
		let r = "";
		let changeObj = c.changeParams[0];
		if (t === TealChanges.Types.NewGoal) {
			return TealChanges.getGoalSummaryHtml(changeObj);
		}  else if (t === TealChanges.Types.RemoveGoal) {
			return TealChanges.getGoalSummaryHtml(c.oldValue);
		} else if (t === TealChanges.Types.NewOrganization) {
			return TealChanges.getOrgSummaryHtml(changeObj);
		}	else if (t === TealChanges.Types.RemoveOrganization) {
			return TealChanges.getOrgSummaryHtml(c.oldValue);
		}  else if (t === TealChanges.Types.NewRole) {
			return TealChanges.getRoleSummaryHtml(changeObj);
		} else if (t === TealChanges.Types.RemoveRole) {
			return TealChanges.getRoleSummaryHtml(c.oldValue);
		} else if (t === TealChanges.Types.UpdateGoal) {
			r = "<p><strong>Goal changes:</strong></p>";
			r += "<ul>";
			// this assumes change params have a 1 length item with the new goal in it.
			let diffs = TealChanges.diffGoals(c.oldValue,changeObj);
			diffs.forEach(d => { r += `<li style='list-style-type: circle; margin-left:20px'>${_.escape(d)}</li>`; });
			r += "</ul>";
		} else if (t === TealChanges.Types.UpdateRole) {
			r = "<p><strong>Role changes:</strong></p>";
			r += "<ul>";
			// this assumes change params have a 1 length item with the new goal in it.
			let diffs = TealChanges.diffRoles(c.oldValue,changeObj);
			diffs.forEach(d => { r += `<li style='list-style-type: circle; margin-left:20px'>${_.escape(d)}</li>`; });
			r += "</ul>";
		} else if (t === TealChanges.Types.UpdateOrganization) {
			r = "<p><strong>Organization changes:</strong></p>";
			r += "<ul>";
			// this assumes change params have a 1 length item with the new goal in it.
			let diffs = TealChanges.diffOrganizations(c.oldValue,changeObj);
			diffs.forEach(d => { r += `<li style='list-style-type: circle; margin-left:20px'>${_.escape(d)}</li>`; });
			r += "</ul>";
		} else if (t === TealChanges.Types.KeyObjectiveCompleted) {
			return `Set key objective '${changeObj.name}' to '${Teal.getCheckableItemState(changeObj.completed)}'`;
		} else if (t === TealChanges.Types.DoneCriteriaCompleted) {
			return `Set done criteria '${changeObj.name}' to '${Teal.getCheckableItemState(changeObj.completed)}'`;
		} else if (t === TealChanges.Types.GoalStateChanged) {
			// here change params 1 is the state... don't love the inconsistency, but it's a tradeoff against sending the entire goal
			return `Changed goal state to '${Teal.getGoalReadableState(c.changeParams[1])}'`;
		}
		return r;
	},

	//TODO: attach this to a goal class
	getGoalSummaryHtml(goal) {
		let r = "<p><strong>Goal:</strong></p>";
		r += `<ul>
				<li syle='list-style-type: circle; margin-left:20px'>Name: ${goal.name}</li>
				<li syle='list-style-type: circle; margin-left:20px'>State: ${Teal.getGoalReadableState(goal)}</li>
				<li syle='list-style-type: circle; margin-left:20px'>Due date: ${goal.dueDate}</li>`;
		if (goal.keyObjectives.length > 0) {
			r += `<li syle='list-style-type: circle; margin-left:20px'><strong>Key Objectives</strong></li>`;
			r += "<ul>";
			goal.doneCriteria.forEach(o => {
				r += `<li syle='list-style-type: circle; margin-left:40px'>${o.name}</li>`;
			});
			r += "</ul>";
		}
		if (goal.doneCriteria.length > 0) {
			r += `<li syle='list-style-type: circle; margin-left:20px'><strong>Done Criteria</strong></li>`;
			r += "<ul>";
			goal.doneCriteria.forEach(o => {
				r += `<li syle='list-style-type: circle; margin-left:40px'>${o.name}</li>`;
			});
			r += "</ul>";
		}
		if (goal.ownerRoles.length > 0) {
			r += `<li syle='list-style-type: circle; margin-left:20px'><strong>Owners</strong></li>`;
			r += "<ul>";
			goal.ownerRoles.forEach(o => {
				r += `<li syle='list-style-type: circle; margin-left:40px'>${o.label} (${Teal.getRoleContributorAsString(o.contributor)})</li>`;
			});
			r += "</ul>";
		}
		if (goal.contributorRoles.length > 0) {
			r += `<li syle='list-style-type: circle; margin-left:20px'><strong>Contributors</strong></li>`;
			r += "<ul>";
			goal.contributorRoles.forEach(o => {
				r += `<li syle='list-style-type: circle; margin-left:40px'>${o.label} (${Teal.getRoleContributorAsString(o.contributor)})</li>`;
			});
			r += "</ul>";
		}
		r += "</ul>";
		return r;
	},
	//TODO: attach this to an org class
	getOrgSummaryHtml(org) {
		let r = "<p><strong>Organization:</strong></p>";
		r += `<ul>
				<li syle='list-style-type: circle; margin-left:20px'>Name: ${org.name}</li>
				<li syle='list-style-type: circle; margin-left:20px'>Start date: ${org.startDate}</li>
				<li syle='list-style-type: circle; margin-left:20px'>End date: ${org.endDate}</li>`;
		r += "</ul>";
		return r;
	},
	//TODO: attach this to a role class
	getRoleSummaryHtml(role) {
		let r = "<p><strong>Role:</strong></p>";
		r += `<ul>
				<li syle='list-style-type: circle; margin-left:20px'>Label: ${role.label}</li>
				<li syle='list-style-type: circle; margin-left:20px'>Accountability Level: ${role.accountabilityLevel}</li>
				<li syle='list-style-type: circle; margin-left:20px'>Contributor: ${Teal.getRoleContributorAsString(role.contributor)}</li>
				<li syle='list-style-type: circle; margin-left:20px'>Start date: ${role.startDate}</li>
				<li syle='list-style-type: circle; margin-left:20px'>Start date: ${role.endDate}</li>`;
		if (role.accountabilities.length > 0) {
			r += `<li syle='list-style-type: circle; margin-left:20px'><strong>Accountabilities</strong></li>`;
			r += "<ul>";
			role.accountabilities.forEach(o => {
				r += `<li syle='list-style-type: circle; margin-left:40px'>${o.name}</li>`;
			});
			r += "</ul>";
		}
		r += "</ul>";
		return r;
	},
	// factory for change objects - allows the caller to inspect the type of change expected
	// TODO: consider transitioning all methods to this type of factory/method pattern
	createChangeObject(type, targetObjectType, changeMethod, changeParams, oldValue) {

		if (!TealChanges.isAllowedChangeType(type)) {
			throw new Meteor.Error("not-allowed");
		}

		// TODO: consider making this method the gateway for business rule -> method conversion
		let apply = Teal.ApplyTypes.Immediate;

		let changeObject = {
			type: type,
			apply: apply,
			targetObjectType: targetObjectType,
			changeMethod: changeMethod,
			changeParams: changeParams,
			oldValue: oldValue
		};

		return changeObject;
	},

	changeObjectToString(changeObject) {
		let c = changeObject;
		if (c.type === TealChanges.Types.AssignRoleContributor) {
			if (c.apply === Teal.ApplyTypes.Immediate) {
				return "assigned a new role contributor";
			} else if (c.apply === Teal.ApplyTypes.Request) {
				return "requested a new role contributor to be assigned";
			}
		} else if (c.type === TealChanges.Types.AssignRoleGoal) {
			if (c.apply === Teal.ApplyTypes.Immediate) {
				return "assigned a new role goal";
			} else if (c.apply === Teal.ApplyTypes.Request) {
				return "requested a new role goal to be assigned";
			}
		} else if (c.type === TealChanges.Types.MoveOrganization) {
			if (c.apply === Teal.ApplyTypes.Immediate) {
				return "moved an organization";
			} else if (c.apply === Teal.ApplyTypes.Request) {
				return "requested an organization to be moved";
			}
		} else if (c.type === TealChanges.Types.NewGoal) {
			if (c.apply === Teal.ApplyTypes.Immediate) {
				return "created a new goal";
			} else if (c.apply === Teal.ApplyTypes.Request) {
				return "requested a new goal to be created";
			}
		} else if (c.type === TealChanges.Types.NewOrganization) {
			if (c.apply === Teal.ApplyTypes.Immediate) {
				return "created a new organization";
			} else if (c.apply === Teal.ApplyTypes.Request) {
				return "requested a new organization to be created";
			}
		} else if (c.type === TealChanges.Types.NewRole) {
			if (c.apply === Teal.ApplyTypes.Immediate) {
				return "created a new role";
			} else if (c.apply === Teal.ApplyTypes.Request) {
				return "requested a new role to be created";
			}
		} else if (c.type === TealChanges.Types.NewRoleAccountability) {
			if (c.type === Teal.ApplyTypes.Immediate) {
				return "assigned a new role accountability";
			} else if (c.type === Teal.ApplyTypes.Request) {
				return "requested a new role accountability to be assigned";
			}
		} else if (c.type === TealChanges.Types.NewRoleLabel) {
			if (c.apply === Teal.ApplyTypes.Immediate) {
				return "created a new role label";
			} else if (c.apply === Teal.ApplyTypes.Request) {
				return "requested a new role label to be created";
			}
		} else if (c.type === TealChanges.Types.RemoveOrganization) {
			if (c.apply === Teal.ApplyTypes.Immediate) {
				return "removed an organization";
			} else if (c.apply === Teal.ApplyTypes.Request) {
				return "requested a new organization to be created";
			}
		} else if (c.type === TealChanges.Types.RemoveRole) {
			if (c.apply === Teal.ApplyTypes.Immediate) {
				return "removed a role";
			} else if (c.apply === Teal.ApplyTypes.Request) {
				return "requested a new role to be created";
			}
		} else if (c.type === TealChanges.Types.RemoveRoleAccountability) {
			if (c.apply === Teal.ApplyTypes.Immediate) {
				return "removed a role accountability";
			} else if (c.apply === Teal.ApplyTypes.Request) {
				return "requested a role accountability to be removed";
			}
		} else if (c.type === TealChanges.Types.RemoveRoleContributor) {
			if (c.apply === Teal.ApplyTypes.Immediate) {
				return "unassigned a role contributor";
			} else if (c.apply === Teal.ApplyTypes.Request) {
				return "requested a role contributor to be unassigned";
			}
		} else if (c.type === TealChanges.Types.RemoveGoal) {
			if (c.apply === Teal.ApplyTypes.Immediate) {
				return "removed a goal";
			} else if (c.apply === Teal.ApplyTypes.Request) {
				return "requested a goal to be removed";
			}
		} else if (c.type === TealChanges.Types.RemoveRoleGoal) {
			if (c.apply === Teal.ApplyTypes.Immediate) {
				return "assigned a role goal";
			} else if (c.apply === Teal.ApplyTypes.Request) {
				return "requested a new role goal to be assigned";
			}
		} else if (c.type === TealChanges.Types.RemoveRoleLabel) {
			if (c.apply === Teal.ApplyTypes.Immediate) {
				return "removed a role label";
			} else if (c.apply === Teal.ApplyTypes.Request) {
				return "requested a role label to be removed";
			}
		} else if (c.type === TealChanges.Types.RemoveOrganization) {
			if (c.apply === Teal.ApplyTypes.Immediate) {
				return "removed an organization";
			} else if (c.apply === Teal.ApplyTypes.Request) {
				return "requested an organization to be removed";
			}
		} else if (c.type === TealChanges.Types.RemoveRole) {
			if (c.apply === Teal.ApplyTypes.Immediate) {
				return "removed a role";
			} else if (c.apply === Teal.ApplyTypes.Request) {
				return "requested a role to be removed";
			}
		} else if (c.type === TealChanges.Types.RemoveRoleAccountability) {
			if (c.apply === Teal.ApplyTypes.Immediate) {
				return "removed a role accountability";
			} else if (c.apply === Teal.ApplyTypes.Request) {
				return "requested a role accountability to be removed";
			}
		} else if (c.type === TealChanges.Types.RemoveRoleContributor) {
			if (c.apply === Teal.ApplyTypes.Immediate) {
				return "unassigned a role contributor";
			} else if (c.apply === Teal.ApplyTypes.Request) {
				return "requested a role contributor to be unassigned";
			}
		} else if (c.type === TealChanges.Types.RemoveRoleGoal) {
			if (c.apply === Teal.ApplyTypes.Immediate) {
				return "unassigned a role goal";
			} else if (c.apply === Teal.ApplyTypes.Request) {
				return "requested a role goal to be unassigned";
			}
		} else if (c.type === TealChanges.Types.RemoveRoleLabel) {
			if (c.apply === Teal.ApplyTypes.Immediate) {
				return "removed a role label";
			} else if (c.apply === Teal.ApplyTypes.Request) {
				return "requested a role label to be removed";
			}
		} else if (c.type === TealChanges.Types.UpdateGoal) {
			if (c.apply === Teal.ApplyTypes.Immediate) {
				return "updated a goal";
			} else if (c.apply === Teal.ApplyTypes.Request) {
				return "requested a goal to be updated";
			}
		} else if (c.type === TealChanges.Types.UpdateOrganization) {
			if (c.apply === Teal.ApplyTypes.Immediate) {
				return "updated an organization";
			} else if (c.apply === Teal.ApplyTypes.Request) {
				return "requested an organization to be updated";
			}
		} else if (c.type === TealChanges.Types.UpdateRole) {
			if (c.apply === Teal.ApplyTypes.Immediate) {
				return "updated a role";
			} else if (c.apply === Teal.ApplyTypes.Request) {
				return "requested a role to be updated";
			}
		} else if (c.type === TealChanges.Types.KeyObjectiveCompleted) {
			if (c.apply === Teal.ApplyTypes.Immediate) {
				return "updated a goal's key objective";
			} else if (c.apply === Teal.ApplyTypes.Request) {
				return "requested a goal's key objective to be updated";
			}
		} else if (c.type === TealChanges.Types.DoneCriteriaCompleted) {
			if (c.apply === Teal.ApplyTypes.Immediate) {
				return "updated a goal's done criteria";
			} else if (c.apply === Teal.ApplyTypes.Request) {
				return "requested a goal's done criteria to be updated";
			}
		} else if (c.type === TealChanges.Types.GoalStateChanged) {
			if (c.apply === Teal.ApplyTypes.Immediate) {
				return "updated a goal's state";
			} else if (c.apply === Teal.ApplyTypes.Request) {
				return "requested a goal's state to be updated";
			}
		}
		return '';
	},

	changeObjectToDescriptorString(o) {
		let d = '';
		// org changes
		if (o.oldValue && o.oldValue.name) {
			d = o.oldValue.name;
		} else if (o.changeParams.length == 1 && o.changeParams[0].name) {
			d = o.changeParams[0].name;
		} // role changes
		else if (o.oldValue && o.oldValue.accountabilityLabel) {
			d = o.oldValue.accountabilityLabel;
		} else if (o.changeParams.length == 1 && o.changeParams[0].label && o.changeParams[0].organization ) {
			d = o.changeParams[0].label + ", " + o.changeParams[0].organization;
		}
		return d;
	},

	//TODO: implement this
	changeObjectToLink(changeObject) {
		let c = changeObject;
		if (c.type === TealChanges.Types.AssignRoleContributor) {

		} else if (c.type === TealChanges.Types.AssignRoleGoal) {

		} else if (c.type === TealChanges.Types.MoveOrganization) {

		} else if (c.type === TealChanges.Types.NewGoal) {

		} else if (c.type === TealChanges.Types.NewOrganization) {

		} else if (c.type === TealChanges.Types.NewRole) {

		} else if (c.type === TealChanges.Types.NewRoleAccountability) {

		} else if (c.type === TealChanges.Types.NewRoleLabel) {

		} else if (c.type === TealChanges.Types.RemoveOrganization) {

		} else if (c.type === TealChanges.Types.RemoveRole) {

		} else if (c.type === TealChanges.Types.RemoveRoleAccountability) {

		} else if (c.type === TealChanges.Types.RemoveRoleContributor) {

		} else if (c.type === TealChanges.Types.RemoveGoal) {

		} else if (c.type === TealChanges.Types.RemoveRoleGoal) {

		} else if (c.type === TealChanges.Types.RemoveRoleLabel) {

		} else if (c.type === TealChanges.Types.RemoveOrganization) {

		} else if (c.type === TealChanges.Types.RemoveRole) {

		} else if (c.type === TealChanges.Types.RemoveRoleAccountability) {

		} else if (c.type === TealChanges.Types.RemoveRoleContributor) {

		} else if (c.type === TealChanges.Types.RemoveRoleGoal) {

		} else if (c.type === TealChanges.Types.RemoveRoleLabel) {

		} else if (c.type === TealChanges.Types.UpdateGoal) {

		} else if (c.type === TealChanges.Types.UpdateOrganization) {

		} else if (c.type === TealChanges.Types.UpdateRole) {

		}
		return "Unknown change type!";
	},

	// show change request outcomes to the user
	notifyChangeResult(err, change) {
		if (err) {
			Materialize.toast(err, 3000);
			console.error(err);
			console.error(change);
		} else {
			let s = TealChanges.changeObjectToString(change);
			s = s.charAt(0).toUpperCase() + s.slice(1); // capitalize first letter
			s += ".";
			Materialize.toast(s, 3000);
		}
	},

	_initializeBusinessRules() {

		//TODO: implement this
		// Business rules for goals
		// If the user is an owner, the goal can be added immediately, else it's a request
		this._businessRules.push({
			type: this.Types.NewGoal,
			func: function(user, parameters) {
				if (!!parameters.parentGoal) {
					// user is an owner
					if (_.where(g.ownerRoles, {email:user.email})) {
						return Teal.ActionType.Immediate;
					} else {
						return Teal.ActionType.Request;
					}
				} else {
					throw new Meteor.error(Teal.Errors.InvalidBusinessRuleCall);
				}
			}
		});

		// If the user is an owner, the goal can be added immediately
		this._businessRules.push({
			type: this.Types.AssignRoleContributor,
			func: function(user, parameters) {
				if (!!parameters.parentGoal) {
					if (g.ownerRoles) {

					}
				} else {
					throw new Meteor.error(Teal.Errors.InvalidBusinessRuleCall);
				}
			}
		});
	},

	// Resolve action type - immediate application or request
	// Returns a target ActionType object
	determineActionType(user, operation, parameters) {
		//TODO: implement this
	},

	//==================================================================================================================
	// TESTS / TODO: use Jasmine + Velocity for this stuff
	//==================================================================================================================

	__test_diffCheckableItemsList() {
		let items1 = [
			{
				"name" : "1,000 Requesting Accounts on Central",
				"_id" : "f77b0065fa694066ab0577fe",
				"completed" : false
			},
			{
				"name" : "Central Launched in NA, UK, DE, FR",
				"_id" : "814bbc8492a42c8030f17bbf",
				"completed" : false
			},
			{
				"name" : "MioUploader, TDO EOL Started",
				"_id" : "06d550877198a6260b1d71bd",
				"completed" : false
			},
			{
				"name" : "Front-end SW localized in 3 languages",
				"_id" : "455054aeaf71908c5bb8abd3",
				"completed" : false
			},
			{
				"name" : "ALPR program defined & kicked off",
				"_id" : "c66cd7ae35750bb8432832d7",
				"completed" : false
			},
			{
				"name" : "Logistics in EMEA on par with NA",
				"_id" : "f4972f440916f6e0a9b6130b",
				"completed" : false
			}
		];
		let items2 = [
			{
				"name" : "1,000 Requesting Accounts on Central",
				"_id" : "f77b0065fa694066ab0577fe",
				"completed" : false
			},
			{
				"name" : "Central Launched in NA, UK, DE, FR",
				"_id" : "814bbc8492a42c8030f17bbf",
				"completed" : false
			},
			{
				"name" : "MioUploader, TDO EOL Started",
				"_id" : "06d550877198a6260b1d71bd",
				"completed" : false
			},
			{
				"name" : "Front-end SW localized in 3 languages",
				"_id" : "455054aeaf71908c5bb8abd3",
				"completed" : false
			}
		];

		let items3 = [
			{
				"name" : "MioUploader, TDO EOL Started",
				"_id" : "06d550877198a6260b1d71bd",
				"completed" : false
			},
			{
				"name" : "Front-end SW localized in 3 languages",
				"_id" : "455054aeaf71908c5bb8abd3",
				"completed" : false
			},
			{
				"name" : "ALPR program defined & kicked off",
				"_id" : "c66cd7ae35750bb8432832d7",
				"completed" : false
			},
			{
				"name" : "Logistics in EMEA on par with NA",
				"_id" : "f4972f440916f6e0a9b6130b",
				"completed" : false
			}
		];

		let items4 = [
			{
				"name" : "MioUploader, TDO EOL Started",
				"_id" : "06d550877198a6260b1d71bd",
				"completed" : false
			},
			{
				"name" : "Front-end SW localized in 10 languages",
				"_id" : "455054aeaf71908c5bb8abd3",
				"completed" : false
			},
			{
				"name" : "ALPR program killed",
				"_id" : "c66cd7ae35750bb8432832d7",
				"completed" : false
			},
			{
				"name" : "Logistics in EMEA on par with NA",
				"_id" : "f4972f440916f6e0a9b6130b",
				"completed" : false
			}
		];

		console.log("================================================");
		console.log(TealChanges.diffCheckableItemsList(items1, items2));
		console.log("================================================");
		console.log(TealChanges.diffCheckableItemsList(items2, items1));
		console.log("================================================");
		console.log(TealChanges.diffCheckableItemsList(items2, items3));
		console.log("================================================");
		console.log(TealChanges.diffCheckableItemsList(items3, items4));
		console.log("================================================");
		console.log(TealChanges.diffCheckableItemsList(items1, items4));
		console.log("================================================");
	}
};

export default TealChanges;
