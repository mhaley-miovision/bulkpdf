GoalsForOrganization = React.createClass({
	mixins: [ReactMeteorData],

	propTypes: {
		objectId: React.PropTypes.string.isRequired
	},

	getMeteorData() {
		let handle = Meteor.subscribe("teal.goals");
		if (handle.ready()) {
			// find all nodes with this contributor as owner, sorted by depth
			let roleIds = RolesCollection.find(
				{ organizationId: this.props.objectId}, {sort: {depth:1}, fields: { _id:1 }}).map(r => {return r._id});

			// find all goals with these role as owners or contributors, sorted by depth
			let goals = GoalsCollection.find({$or: [
				{ ownerRoles: { $elemMatch : { _id: {$in: roleIds} }}},
				{ contributorRoles: { $elemMatch : { _id: {$in: roleIds} }}}
			]}, {sort: {depth:1}}).fetch();

			let i = 0;
			while (i < goals.length) {
				let g = goals[i];
				if (g.depth === 0) {
					goals.splice(j, 1);
					continue;
				}

				// remove all sub children, i.e. that contain this id in their path
				let j = i+1;
				while (j < goals.length) {
					if (goals[j].path.indexOf(g._id) >= 0) {
						goals.splice(j, 1);
					} else {
						j++; // only increment if we didn't remove the element
					}
				}
				// next top level node
				i++;
			}

			return { goals: goals, doneLoading: true };
		} else {
			return { doneLoading : false };
		}
	},

	shouldComponentUpdate(nextProps, nextState) {
		if (nextProps.objectId !== this.props.objectId) {
			return true;
		}
		return false;
	},

	renderGoals() {
		if (this.data.doneLoading) {
			return <GoalList goalList={this.data.goals}/>
		} else {
			return <div><Loading /><br/><br/></div>
		}
	},
	render() {
		return (
			<div>
				<br/>
				{this.renderGoals()}
				<br/>
				<br/>
			</div>
		);
	}
});