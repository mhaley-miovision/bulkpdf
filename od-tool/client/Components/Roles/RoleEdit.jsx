RoleEdit = React.createClass({
	propTypes: {
		role : React.PropTypes.object,
	},
	getInitialState() {
		let d = this.props.goal ? this.props.goal.dueDate : null;
		return {
			_id: this.props.goal ? this.props.goal._id : null,
			accountabilities: this.props.role ? _.clone(this.props.role.accountabilities) : [],
			label: this.props.label ? _.clone(this.props.goal.label) : "",
			organization: this.props.role ? this.props.role.organization : "",
			organizationId: this.props.role ? this.props.role.organizationId : null,
			contributor: this.props.role ? this.props.role.contributor : "",
			contributorId: this.props.role ? this.props.role.contributorId : null,
			startDatePickerId: "picker" + Teal.newId(),
			endDatePickerId: "picker" + Teal.newId(),
			newAccountability: "",
			startDate : this.props.role ? this.props.role.startDate : moment().format(Teal.DateFormat),
			endDate : this.props.role ? this.props.role.endDate : null,
			isExternal : this.props.role ? this.props.role.isExternal : false,
			isLeadNode : this.props.role ? this.props.role.isLeadNode : false,
			//TODO: add other fields
		}
	},

	getInputs() {
		// TODO: this is kind of nasty and a leaky abstraction - there must be a better way to do this (flux/redux?)
		/*
		this.state.ownerRoles = this.refs.ownersList.state.roles;
		this.state.contributorRoles = this.refs.contributorsList.state.roles;
		this.state.state = this.refs.goalState.state.state;
		this.state.dueDate = $('#'+this.state.datePickerId)[0].value;
		*/
		return this.state;
	},

	clearInputs() {
		this.setState(this.getInitialState());
	},

	addAccountability(event) {
		if (!!this.state.newAccountability && this.state.newAccountability.trim() !== '') {
			if (event.type === 'submit') {
				event.preventDefault();
			}
			let acc = this.state.accountabilities;
			acc.push({_id: Teal.newId(), name: this.state.newAccountability});
			this.setState({accountabilities: acc, newAccountability: ""});
		}
	},
	handleRemoveAccountability(event) {
		/*
		let k = event.target.id.replace("r_","");
		this.state.doneCriteria = _.without(this.state.doneCriteria, _.findWhere(this.state.doneCriteria, {_id: k}));
		this.setState({doneCriteria: this.state.doneCriteria});
		*/
	},

	handleLabelChange(event) {
		this.setState({label:event.target.value});
	},

	renderAccountabilities() {
		/*
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
		}*/
	},

	componentDidMount() {
		$('#'+this.state.startDatePickerId).pickadate({format: Teal.DateFormat});
		$('#'+this.state.endDatePickerId).pickadate({format: Teal.DateFormat});
	},

	render() {
		return (
			<div className="card-content GoalContainer">
				<div className="row">
					<div className="GoalTitle center" style={{marginTop:this.props.goal? "0px":"15px"}}>
						{this.props.goal ? "Edit Role" : "New Role"}
					</div>
				</div>
				<div className="row">
					<div className="col m6 s12 GoalContaine input-field">

						<label className="text-main1 validate" htmlFor="label_input">Role Label</label>
						<input className="text-main5 validate"
							   key="new_label" type="text"
							   onChange={this.handleNameChange}
							   value={this.state.name}
							   id="label_input">
						</input>
					</div>
					<div className="col m6 s12 GoalContainer input-field">
						<label className="text-main1 validate" htmlFor="seniority_input">Seniority Level</label>
						<input className="text-main5 validate"
							   key="new_label" type="text"
							   onChange={this.handleNameChange}
							   value={this.state.name}
							   id="seniority_input">
						</input>
					</div>
					<div className="col m6 s12 GoalContainer input-field">
						<label className="text-main1" htmlFor="dueDateInput">Contributor</label>
						<input className="text-main5 validate"
							   key="new_label" type="text"
							   onChange={this.handleNameChange}
							   value={this.state.name}
							   id="contributor_input">
						</input>
					</div>
					<div className="col m6 s12 GoalContainer input-field">
						<label className="text-main1">Organization</label>
						<input key="new_label" type="text"
							   className="text-main5 validate"
							   onChange={this.handleNameChange}
							   value={this.state.name}
							   id="roleLabelInput">
						</input>
					</div>
				</div>
				<div className="row">
					<div className="col m4 s6 GoalContainer">
						<label className="text-main1 GoalSubtitle" htmlFor="dueDateInput">Start Date</label>
						<input id={this.state.startDatePickerId} type="date" className="datepicker"
							   data-value={this.state.startDate}
							   readOnly/>
					</div>
					<div className="col m4 s6 GoalContainer">
						<label className="text-main1 GoalSubtitle" htmlFor="dueDateInput">End Date</label>
						<input id={this.state.endDatePickerId} type="date" className="datepicker"
							   data-value={this.state.endDate}
							   readOnly/>
					</div>
					<div className="col m4 s6 GoalContainer center">
						<label className="text-main1 GoalSubtitle" htmlFor="dueDateInput">Is Lead Node?</label>
						<div className="switch">
							<br/>
							<label>
								No
								<input type="checkbox"/>
								<span className="lever"></span>
								Yes
							</label>
						</div>
					</div>
				</div>
			</div>
		);
	},
});