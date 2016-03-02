GoalEdit = React.createClass({
	propTypes: {
		goal : React.PropTypes.object,
	},
	getInitialState() {
		let d = this.props.goal ? this.props.goal.dueDate : null;
		return {
			datePickerId: "picker" + Math.floor(1 + Math.random()*100000),
			keyObjectives: this.props.goal ? _.clone(this.props.goal.keyObjectives) : [],
			doneCriteria: this.props.goal ? _.clone(this.props.goal.doneCriteria) : [],
			name: this.props.goal ? _.clone(this.props.goal.name) : "",
			_id: this.props.goal ? this.props.goal._id : null,
			newKeyObjective: "",
			newDoneCriteria: "",
			ownerRoles: this.props.goal ? _.clone(this.props.goal.ownerRoles)  : [],
			contributorRoles: this.props.goal ?  _.clone(this.props.goal.contributorRoles) : [],
			dueDate : this.props.goal ? this.props.goal.dueDate : moment().format(Teal.DateFormat)
		}
	},

	getInputs() {
		// TODO: this is kind of nasty and a leaky abstraction - there must be a better way to do this (flux/redux?)
		this.state.ownerRoles = this.refs.ownersList.state.roles;
		this.state.contributorRoles = this.refs.contributorsList.state.roles;
		this.state.state = this.refs.goalState.state.state;
		this.state.dueDate = $('#'+this.state.datePickerId)[0].value;
		return this.state;
	},

	clearInputs() {
		this.setState(this.getInitialState());
	},

	addKeyObjective(event) {
		if (!!this.state.newKeyObjective && this.state.newKeyObjective.trim() !== '') {
			if (event.type === 'submit') {
				event.preventDefault();
			}
			let ko = this.state.keyObjectives;
			ko.push({_id: new Mongo.Collection.ObjectID()._str, completed: 0, name: this.state.newKeyObjective});
			this.setState({keyObjectives: ko, newKeyObjective: ""});
		}
	},

	addDoneCriteria(event) {
		if (!!this.state.newDoneCriteria && this.state.newDoneCriteria.trim() !== '') {
			if (event.type === 'submit') {
				event.preventDefault();
			}
			let dc = this.state.doneCriteria;
			dc.push({_id: new Mongo.Collection.ObjectID()._str, completed: 0, name: this.state.newDoneCriteria});
			this.setState({doneCriteria: dc, newDoneCriteria: ""});
		}
	},

	handleNameChange(event) {
		this.setState({name:event.target.value});
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
		if (ko) {
			ko.name = v;
			this.setState({keyObjectives: this.state.keyObjectives});
		} else {
			console.error("Done criteria with key " + k + " not found!");
		}
	},

	handleNewDoneCriteriaChange(event) {
		this.setState({newDoneCriteria:event.target.value});
	},

	handleNewKeyObjectiveChange(event) {
		this.setState({newKeyObjective:event.target.value});
	},

	handleRemoveDoneCriteria(event) {
		let k = event.target.id.replace("r_","");
		this.state.doneCriteria = _.without(this.state.doneCriteria, _.findWhere(this.state.doneCriteria, {_id: k}));
		this.setState({doneCriteria: this.state.doneCriteria});
	},

	handleRemoveKeyObjective(event) {
		let k = event.target.id.replace("r_","");
		this.state.keyObjectives = _.without(this.state.keyObjectives, _.findWhere(this.state.keyObjectives, {_id: k}));
		this.setState({keyObjectives: this.state.keyObjectives});
	},

	renderDoneCriteriaItems() {
		var _this = this;
		if (this.state.doneCriteria.length > 0) {
			return this.state.doneCriteria.map(function(o,i) {
				return (
					<div className="GoalEditItemInput" key={o._id}>
						<input onChange={_this.handleDoneCriteriaChange}
							   type="text"
							   key={o._id}
							   id={o._id}
							   placeholder={o.name ? '' : "Enter key objective..."}
							   value={o.name}>
						</input>
						<i key={"r_" + o._id} className="material-icons GreyButton" id={"r_" + o._id}
						   style={{fontSize:"13px"}}
						   onClick={_this.handleRemoveDoneCriteria}>close</i>
					</div>
				);
			});
		} else {
			return '';
		}
	},

	renderKeyObjectiveItems() {
		var _this = this;
		if (this.state.keyObjectives.length > 0) {
			return this.state.keyObjectives.map(function(o,i) {
				return (
					<div className="GoalEditItemInput" key={o._id}>
						<input onChange={_this.handleKeyObjectiveChange}
							   type="text"
							   key={o._id}
							   id={o._id}
							   placeholder={o.name ? '' : "Enter key objective..."}
							   value={o.name}>
						</input>
						<i key={"r_" + o._id} className="material-icons GreyButton" id={"r_" + o._id}
						   style={{fontSize:"13px"}}
						   onClick={_this.handleRemoveKeyObjective}>close</i>
					</div>
				);
			});
		} else {
			return '';
		}
	},

	componentDidMount() {
		$input = $('#'+this.state.datePickerId).pickadate({
			format: 'yyyy-mm-dd',
			onSet: function(contex) {
				console.log(this.$node[0].value);
			}
		});
	},

	render() {
		return (
			<div className="card-content">
				<div className="row">
					<div className="ProjectGoalTitle center" style={{marginTop:this.props.goal? "0px":"15px"}}>
						{this.props.goal ? "Edit Goal" : "New Goal"}
					</div>
				</div>
				<div className="row">
					<div className="col m9 s12 GoalContainer">
						<div className="">
							<label className="text-main1 ProjectGoalSubtitle" htmlFor="dueDateInput">Goal Title</label>
							<span className="text-main5">
								<input key="new_ko" type="text"
									   placeholder="Enter new goal name..."
									   onChange={this.handleNameChange}
									   value={this.state.name}
									   id="goalNameInput">
								</input>
							</span>
						</div>
						<div className="">
							<label className="text-main1 ProjectGoalSubtitle" htmlFor="dueDateInput">Estimated Completion</label>
							<input id={this.state.datePickerId} type="date" className="datepicker"
								   data-value={this.state.dueDate}
								   readOnly/>
						</div>
						<section>
							<div className="ProjectGoalSubtitle">What Done Looks Like</div>
							<ul className="ProjectGoalDoneCriteria">
								{this.renderDoneCriteriaItems()}
								<form onSubmit={this.addDoneCriteria}>
									<input type="text"
										   key="new_dc"
										   placeholder="Enter new done criteria (and press Enter)"
										   onChange={this.handleNewDoneCriteriaChange}
										   value={this.state.newDoneCriteria}
										   onBlur={this.addDoneCriteria}>
									</input>
								</form>
							</ul>
						</section>
						<section>
							<div className="ProjectGoalSubtitle">Key Objectives</div>
							<ul className="ProjectGoalDoneCriteria">
								{this.renderKeyObjectiveItems()}
								<form onSubmit={this.addKeyObjective}>
									<input key="new_ko"
										   type="text"
										   placeholder="Enter new key objective (and press Enter)"
										   onChange={this.handleNewKeyObjectiveChange}
										   value={this.state.newKeyObjective}
										   onBlur={this.addKeyObjective}>
									</input>
								</form>
							</ul>
						</section>
					</div>
					<div className="col m3 s12 GoalContainer">
						<RoleListEdit ref="ownersList" roleList={this.state.ownerRoles} heading="Owner" isEditing={true}/>
						<RoleListEdit ref="contributorsList" roleList={this.state.contributorRoles} heading="Contributor" isEditing={true}/>
					</div>
				</div>
				<div className="row center">
					<GoalStateControls ref="goalState" goal={this.props.goal}/>
				</div>
			</div>
		);
	},
});