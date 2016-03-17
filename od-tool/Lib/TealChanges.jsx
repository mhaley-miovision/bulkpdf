TealChanges = {
	diffGoals(oldGoal, newGoal) {
		let changes = [];

		/*
		// GOAL PARENT
		if (oldGoal.parent !== newGoal.parent) {
			let p1 = GoalsCollection.findOne({_id:oldGoal.parent});
			let p2 = GoalsCollection.findOne({_id:newGoal.parent});
			changes.push(`Changed parent from '${p1}' to '${p2}'`);
		}*/

		// GOAL NAME
		if (oldGoal.name !== newGoal.name) {
			changes.push(`Renamed from '${oldGoal.name}' to '${newGoal.name}'`);
		}

		// GOAL KEY OBJECTIVES
		let koDiffs = TealChanges.diffCheckableItemsList(oldGoal.keyObjectives, newGoal.keyObjectives);
		koDiffs.added.forEach(ko => {
			changes.push(`Added new key objective '${ko.name}'`);
		});
		koDiffs.removed.forEach(ko => {
			changes.push(`Added removed key objective '${ko.name}'`);
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
			changes.push(`Added removed done criteria '${dc.name}'`);
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

	diffOrganizations(oldOrg, newOrg) {
		let changes = [];

		if (oldOrg.parent !== newOrg.parent) {
			changes.push(`Changed parent from '${oldOrg.parent}' to '${newOrg.parent}'`);
		}

		if (oldOrg.startDate !== newOrg.startDate) {

		}

		if (oldOrg.endDate !== newOrg.endDate) {

		}
	},

	getChangeSummaryHtml(c) {
		let t = c.type;
		let r = "";
		let changeObj = c.changeParams[0];
		if (t === Teal.ChangeTypes.NewGoal) {
			return TealChanges.getGoalSummaryHtml(changeObj);
		} else if (t === Teal.ChangeTypes.UpdateGoal) {
			r = "<p><strong>Goal changes:</strong></p>";
			r += "<ul>";
			// this assumes change params have a 1 length item with the new goal in it.
			let diffs = TealChanges.diffGoals(c.oldValue,changeObj);
			diffs.forEach(d => { r += `<li style='list-style-type: circle; margin-left:20px'>${_.escape(d)}</li>`; });
			r += "</ul>";
		}
		return r;
	},

	//TODO: attach this to a goal class
	getGoalSummaryHtml(goal) {
		r = "<p><strong>Goal:</strong></p>";
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
				r += `<li syle='list-style-type: circle; margin-left:40px'>${o.label} (${o.contributor ? o.contributor : "unassigned"})</li>`;
			});
			r += "</ul>";
		}
		if (goal.contributorRoles.length > 0) {
			r += `<li syle='list-style-type: circle; margin-left:20px'><strong>Contributors</strong></li>`;
			r += "<ul>";
			goal.contributorRoles.forEach(o => {
				r += `<li syle='list-style-type: circle; margin-left:40px'>${o.label} (${o.contributor ? o.contributor : "unassigned"})</li>`;
			});
			r += "</ul>";
		}
		r += "</ul>";
		return r;
	},

	// factory for change objects - allows the caller to inspect the type of change expected
	// TODO: consider transitioning all methods to this type of factory/method pattern
	createChangeObject(type, targetObjectType, changeMethod, changeParams, oldValue) {

		if (!Teal.isAllowedChangeType(type)) {
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
		if (c.type === Teal.ChangeTypes.AssignRoleContributor) {
			if (c.apply === Teal.ApplyTypes.Immediate) {
				return "assigned a new role contributor";
			} else if (c.apply === Teal.ApplyTypes.Request) {
				return "requested a new role contributor to be assigned";
			}
		} else if (c.type === Teal.ChangeTypes.AssignRoleGoal) {
			if (c.apply === Teal.ApplyTypes.Immediate) {
				return "assigned a new role goal";
			} else if (c.apply === Teal.ApplyTypes.Request) {
				return "requested a new role goal to be assigned";
			}
		} else if (c.type === Teal.ChangeTypes.MoveOrganization) {
			if (c.apply === Teal.ApplyTypes.Immediate) {
				return "moved an organization";
			} else if (c.apply === Teal.ApplyTypes.Request) {
				return "requested an organization to be moved";
			}
		} else if (c.type === Teal.ChangeTypes.NewGoal) {
			if (c.apply === Teal.ApplyTypes.Immediate) {
				return "created a new goal";
			} else if (c.apply === Teal.ApplyTypes.Request) {
				return "requested a new goal to be created";
			}
		} else if (c.type === Teal.ChangeTypes.NewOrganization) {
			if (c.apply === Teal.ApplyTypes.Immediate) {
				return "created a new organization";
			} else if (c.apply === Teal.ApplyTypes.Request) {
				return "requested a new organization to be created";
			}
		} else if (c.type === Teal.ChangeTypes.NewRole) {
			if (c.apply === Teal.ApplyTypes.Immediate) {
				return "created a new role";
			} else if (c.apply === Teal.ApplyTypes.Request) {
				return "requested a new role to be created";
			}
		} else if (c.type === Teal.ChangeTypes.NewRoleAccountability) {
			if (c.type === Teal.ApplyTypes.Immediate) {
				return "assigned a new role accountability";
			} else if (c.type === Teal.ApplyTypes.Request) {
				return "requested a new role accountability to be assigned";
			}
		} else if (c.type === Teal.ChangeTypes.NewRoleLabel) {
			if (c.apply === Teal.ApplyTypes.Immediate) {
				return "created a new role label";
			} else if (c.apply === Teal.ApplyTypes.Request) {
				return "requested a new role label to be created";
			}
		} else if (c.type === Teal.ChangeTypes.RemoveOrganization) {
			if (c.apply === Teal.ApplyTypes.Immediate) {
				return "removed an organization";
			} else if (c.apply === Teal.ApplyTypes.Request) {
				return "requested a new organization to be created";
			}
		} else if (c.type === Teal.ChangeTypes.RemoveRole) {
			if (c.apply === Teal.ApplyTypes.Immediate) {
				return "removed a role";
			} else if (c.apply === Teal.ApplyTypes.Request) {
				return "requested a new role to be created";
			}
		} else if (c.type === Teal.ChangeTypes.RemoveRoleAccountability) {
			if (c.apply === Teal.ApplyTypes.Immediate) {
				return "removed a role accountability";
			} else if (c.apply === Teal.ApplyTypes.Request) {
				return "requested a role accountability to be removed";
			}
		} else if (c.type === Teal.ChangeTypes.RemoveRoleContributor) {
			if (c.apply === Teal.ApplyTypes.Immediate) {
				return "unassigned a role contributor";
			} else if (c.apply === Teal.ApplyTypes.Request) {
				return "requested a role contributor to be unassigned";
			}
		} else if (c.type === Teal.ChangeTypes.RemoveGoal) {
			if (c.apply === Teal.ApplyTypes.Immediate) {
				return "removed a goal";
			} else if (c.apply === Teal.ApplyTypes.Request) {
				return "requested a goal to be removed";
			}
		} else if (c.type === Teal.ChangeTypes.RemoveRoleGoal) {
			if (c.apply === Teal.ApplyTypes.Immediate) {
				return "assigned a role goal";
			} else if (c.apply === Teal.ApplyTypes.Request) {
				return "requested a new role goal to be assigned";
			}
		} else if (c.type === Teal.ChangeTypes.RemoveRoleLabel) {
			if (c.apply === Teal.ApplyTypes.Immediate) {
				return "removed a role label";
			} else if (c.apply === Teal.ApplyTypes.Request) {
				return "requested a role label to be removed";
			}
		} else if (c.type === Teal.ChangeTypes.RemoveOrganization) {
			if (c.apply === Teal.ApplyTypes.Immediate) {
				return "removed an organization";
			} else if (c.apply === Teal.ApplyTypes.Request) {
				return "requested an organization to be removed";
			}
		} else if (c.type === Teal.ChangeTypes.RemoveRole) {
			if (c.apply === Teal.ApplyTypes.Immediate) {
				return "removed a role";
			} else if (c.apply === Teal.ApplyTypes.Request) {
				return "requested a role to be removed";
			}
		} else if (c.type === Teal.ChangeTypes.RemoveRoleAccountability) {
			if (c.apply === Teal.ApplyTypes.Immediate) {
				return "removed a role accountability";
			} else if (c.apply === Teal.ApplyTypes.Request) {
				return "requested a role accountability to be removed";
			}
		} else if (c.type === Teal.ChangeTypes.RemoveRoleContributor) {
			if (c.apply === Teal.ApplyTypes.Immediate) {
				return "unassigned a role contributor";
			} else if (c.apply === Teal.ApplyTypes.Request) {
				return "requested a role contributor to be unassigned";
			}
		} else if (c.type === Teal.ChangeTypes.RemoveRoleGoal) {
			if (c.apply === Teal.ApplyTypes.Immediate) {
				return "unassigned a role goal";
			} else if (c.apply === Teal.ApplyTypes.Request) {
				return "requested a role goal to be unassigned";
			}
		} else if (c.type === Teal.ChangeTypes.RemoveRoleLabel) {
			if (c.apply === Teal.ApplyTypes.Immediate) {
				return "removed a role label";
			} else if (c.apply === Teal.ApplyTypes.Request) {
				return "requested a role label to be removed";
			}
		} else if (c.type === Teal.ChangeTypes.UpdateGoal) {
			if (c.apply === Teal.ApplyTypes.Immediate) {
				return "updated a goal";
			} else if (c.apply === Teal.ApplyTypes.Request) {
				return "requested a goal to be updated";
			}
		} else if (c.type === Teal.ChangeTypes.UpdateGoalProgress) {
			if (c.apply === Teal.ApplyTypes.Immediate) {
				return "updated a goal's progress";
			} else if (c.apply === Teal.ApplyTypes.Request) {
				return "requested a goal's progress to be updated";
			}
		} else if (c.type === Teal.ChangeTypes.UpdateOrganization) {
			if (c.apply === Teal.ApplyTypes.Immediate) {
				return "updated an organization";
			} else if (c.apply === Teal.ApplyTypes.Request) {
				return "requested an organization to be updated";
			}
		} else if (c.type === Teal.ChangeTypes.UpdateRole) {
			if (c.apply === Teal.ApplyTypes.Immediate) {
				return "updated a role";
			} else if (c.apply === Teal.ApplyTypes.Request) {
				return "requested a role to be updated";
			}
		}
		return "Unknown change type!";
	},

	//TODO: implement this
	changeObjectToLink(changeObject) {
		let c = changeObject;
		if (c.type === Teal.ChangeTypes.AssignRoleContributor) {

		} else if (c.type === Teal.ChangeTypes.AssignRoleGoal) {

		} else if (c.type === Teal.ChangeTypes.MoveOrganization) {

		} else if (c.type === Teal.ChangeTypes.NewGoal) {

		} else if (c.type === Teal.ChangeTypes.NewOrganization) {

		} else if (c.type === Teal.ChangeTypes.NewRole) {

		} else if (c.type === Teal.ChangeTypes.NewRoleAccountability) {

		} else if (c.type === Teal.ChangeTypes.NewRoleLabel) {

		} else if (c.type === Teal.ChangeTypes.RemoveOrganization) {

		} else if (c.type === Teal.ChangeTypes.RemoveRole) {

		} else if (c.type === Teal.ChangeTypes.RemoveRoleAccountability) {

		} else if (c.type === Teal.ChangeTypes.RemoveRoleContributor) {

		} else if (c.type === Teal.ChangeTypes.RemoveGoal) {

		} else if (c.type === Teal.ChangeTypes.RemoveRoleGoal) {

		} else if (c.type === Teal.ChangeTypes.RemoveRoleLabel) {

		} else if (c.type === Teal.ChangeTypes.RemoveOrganization) {

		} else if (c.type === Teal.ChangeTypes.RemoveRole) {

		} else if (c.type === Teal.ChangeTypes.RemoveRoleAccountability) {

		} else if (c.type === Teal.ChangeTypes.RemoveRoleContributor) {

		} else if (c.type === Teal.ChangeTypes.RemoveRoleGoal) {

		} else if (c.type === Teal.ChangeTypes.RemoveRoleLabel) {

		} else if (c.type === Teal.ChangeTypes.UpdateGoal) {

		} else if (c.type === Teal.ChangeTypes.UpdateGoalProgress) {

		} else if (c.type === Teal.ChangeTypes.UpdateOrganization) {

		} else if (c.type === Teal.ChangeTypes.UpdateRole) {

		}
		return "Unknown change type!";
	},

	// show change request outcomes to the user
	notifyChangeResult(err, change) {
		if (err) {
			Materialize.toast("Error: " + err, 3000);
			console.error(err);
			console.error(change);
		} else {
			let s = TealChanges.changeObjectToString(change);
			s = s.charAt(0).toUpperCase() + s.slice(1); // capitalize first letter
			s += ".";
			Materialize.toast(s, 3000);
		}
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
	},
};