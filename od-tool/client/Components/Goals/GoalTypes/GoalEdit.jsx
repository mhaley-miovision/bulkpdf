GoalEdit = React.createClass({
	propTypes: {
		goal : React.PropTypes.object,
	},

	getInitialState() {
		return {
			keyObjectives: this.props.goal ? this.props.goal.keyObjectives : [],
			doneCriteria: this.props.goal ? this.props.goal.doneCriteria : [],
			name: this.props.goal ? this.props.goal.name : "",
			_id: this.props.goal ? this.props.goal._id : new Meteor.Collection.ObjectId()
		}
	},

	getInputs() {
		return this.state;
	},

	addKeyObjective() {
		let ko = this.state.keyObjectives;
		ko.push({ _id: new Mongo.Collection.ObjectID(), completed: 0 });
		this.setState({keyObjectives:ko});
	},

	addDoneCriteria() {
		let ko = this.state.doneCriteria;
		ko.push({ _id: new Mongo.Collection.ObjectID(), completed: 0 });
		this.setState({keyObjectives:ko});
	},

	handleNameChange(event) {
		let v = event.target.value;
		this.setState({name:event.target.value});
		console.log(v);
	},

	handleDoneCriteriaChange(event) {
		let v = event.target.value;
		let k = event.target.id;
		let dc = _.find(this.state.doneCriteria, o => { return o._id === k });
		if (dc) {
			dc.name = v;
			this.setState({doneCriteria: this.state.doneCriteria});
		} else {
			console.error("Done criteria with key " + k + " not found!");
		}
	},

	handleKeyObjectiveChange(event) {
		let v = event.target.value;
		let k = event.target.id;
		let ko = _.find(this.state.keyObjectives, o => { return o._id === k });
		if (dc) {
			ko.name = v;
			this.setState({keyObjectives: this.state.keyObjectives});
		} else {
			console.error("Done criteria with key " + k + " not found!");
		}
	},

	renderDoneCriteriaItems() {
		var _this = this;
		if (this.state.doneCriteria.length > 0) {
			return this.state.doneCriteria.map(function(o,i) {
				return (
					<input onChange={_this.handleDoneCriteriaChange}
						   type="text"
						   key={o._id}
						   id={o._id}
						   placeholder={o.name ? '' : "Enter key objective..."}
						   value={o.name}>
					</input>
				);
			});
		} else {
			return 'No done criteria defined yet.';
		}
	},

	renderKeyObjectiveItems() {
		var _this = this;
		if (this.state.keyObjectives.length > 0) {
			return this.state.keyObjectives.map(function(o,i) {
				return (
					<input onChange={_this.handleKeyObjectiveChange}
						   type="text"
						   key={o._id}
						   id={o._id}
						   placeholder={o.name ? '' : "Enter key objective..."}
						   value={o.name}>
					</input>
				);
			});
		} else {
			return 'No done criteria defined yet.';
		}
	},

	render() {
		return (
			<div className="card-content">
				<div className="row">
					<div className="col m9 s12 GoalContainer">
						<div className="">
							<span className="ProjectGoalTitle">
								<input type="text"
									   onChange={this.handleNameChange}
									   value={this.state.name}>
								</input>
							</span>
						</div>
						<section>
							<div className="ProjectGoalSubtitle">What Done Looks Like</div>
							<ul className="ProjectGoalDoneCriteria">
								{this.renderDoneCriteriaItems()}
							</ul>
						</section>
						<section>
							<div className="ProjectGoalSubtitle">KeyObjectives</div>
							<ul className="ProjectGoalDoneCriteria">
								{this.renderKeyObjectiveItems()}
							</ul>
						</section>
					</div>
					<div className="col m3 s12 GoalContainer">
						<div className="chip">
							<img src="img/user_avatar_blank.jpg" alt="Contact Person"/>
								Victor Leipnik
							<i className="material-icons">close</i>
						</div>
						<div className="chip">
							<img src="img/user_avatar_blank.jpg" alt="Contact Person"/>
								Kurtis McBride
							<i className="material-icons">close</i>
						</div>
						<div className="chip">
							<img src="img/user_avatar_blank.jpg" alt="Contact Person"/>
								Natalie Dumond
							<i className="material-icons">close</i>
						</div>
						<div className="chip">
							<img src="img/user_avatar_blank.jpg" alt="Contact Person"/>
								Jamie Reeve
							<i className="material-icons">close</i>
						</div>
					</div>
				</div>
			</div>
		);
	},
});