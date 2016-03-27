const TOAST_DURATION = 1000;

// Role component - represents a single role
GoalById = React.createClass({
	mixins: [ReactMeteorData],

	propTypes: {
		goalId: React.PropTypes.string.isRequired,
		showBackButton : React.PropTypes.bool
	},

	getMeteorData() {
		let handle = Meteor.subscribe("teal.goals");
		if (handle.ready() && !!this.props.goalId) {
			// all immediate children of this goal
			let goal = GoalsCollection.findOne({_id: this.props.goalId});
			return { doneLoading : true, goal:goal };
		} else {
			return { doneLoading : false };
		}
	},

	goBack() {
		history.back();
	},

	render() {
		if (this.data.doneLoading) {
			return (
				<div>
					<div className="section center">
						{this.props.showBackButton ?
							<ControlIconButton onClicked={this.goBack}
											   icon="undo" tip="Up to parent goal"/>
							: ''}
					</div>
					<div className="divider"></div>
					<div className="section">
						{this.data.goal ? <Goal goal={this.data.goal}/> : <NotFound/>}
					</div>
					<ReactTooltip/>
				</div>
			)
		} else {
			return <Loading spinner={true}/>
		}
	}
});

