RoleEdit = React.createClass({
	propTypes: {
		role : React.PropTypes.object,
	},
	getInitialState() {
		return this.loadStateFromProps(this.props);
	},
	
	loadStateFromProps(props) {
		return {
			_id: props.role ? props.role._id : null,
			accountabilities: props.role ? _.clone(props.role.accountabilities) : [],
			accountabilityLevel: props.role ? props.role.accountabilityLevel : '', // intermediate
			label: props.role ? _.clone(props.role.label) : "",
			organization: props.role ? props.role.organization : "",
			organizationId: props.role ? props.role.organizationId : null,
			contributor: props.role ? props.role.contributor : "",
			contributorId: props.role ? props.role.contributorId : null,
			startDatePickerId: "picker" + Teal.newId(),
			endDatePickerId: "picker" + Teal.newId(),
			newAccountability: "",
			startDate : props.role ? props.role.startDate : moment().format(Teal.DateFormat),
			endDate : props.role ? props.role.endDate : null,
			isExternal : props.role ? props.role.isExternal : false,
			isLeadNode : props.role ? props.role.isLeadNode : false,
			//TODO: add other fields
		};
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
		$('#'+this.state.startDatePickerId).pickadate({format: Teal.DateFormat.toLowerCase()});
		$('#'+this.state.endDatePickerId).pickadate({format: Teal.DateFormat.toLowerCase()});
	},

	componentWillReceiveProps(nextProps, nextState) {
		this.setState(this.loadStateFromProps(nextProps));
	},

	onOrganizationSelected(org) {
		this.setState({organization:org});
	},

	onContributorSelected(contributor) {
		this.setState({contributor:contributor});
	},

	onRoleLabelSelected(label) {
		this.setState({label:label});
	},

	onAccountabilityLevelSelected(level) {
		console.log(level);
		this.setState({accountabilityLevel:level});
	},

	render() {
		return (
			<div className="card-content GoalContainer">
				<div className="row">
					<div className="GoalTitle center" style={{marginTop:this.props.goal? "0px":"15px"}}>
						{this.props.role ? "Edit Role" : "New Role"}
					</div>
				</div>
				<div className="row">
					<div className="col m6 s12 GoalContainer">
						<label className="text-main1 GoalSubtitle">Role Label</label>
						<ObjectSearch
							onClick={this.onRoleLabelSelected} findRoleLabels={true}
							initialValue={this.state.label}
							notFoundLabel="Please type the name of an existing role label."/>
					</div>
					<div className="col m6 s12 GoalContainer">
						<label className="text-main1 GoalSubtitle">Accountability Level</label>
						<ObjectSearch
							onClick={this.onAccountabilityLevelSelected} findAccountabilityLevels={true}
							initialValue={this.state.accountabilityLevel}
							notFoundLabel="Please type the name of an existing accountability level."/>
					</div>
					<div className="col m6 s12 GoalContainer">
						<label className="text-main1 GoalSubtitle">Contributor</label>
						<ObjectSearch
							onClick={this.onContributorSelected} findContributors={true}
							initialValue={this.state.contributor}
							notFoundLabel="Please type the name of an existing contributor."/>
					</div>
					<div className="col m6 s12 GoalContainer">
						<label className="text-main1 GoalSubtitle">Organization</label>
						<ObjectSearch
							onClick={this.onOrganizationSelected} findOrganizations={true}
							initialValue={this.state.organization}
							notFoundLabel="Please type the name of an existing organization."/>
					</div>
				</div>
				<div className="row">
					<div className="col m4 s6 GoalContainer">
						<label className="text-main1 GoalSubtitle" htmlFor={this.state.startDatePickerId}>Start Date</label>
						<input key={Teal.newId()}
							   id={this.state.startDatePickerId} type="date" className="datepicker text-main5"
							   data-value={this.state.startDate}
							   readOnly/>
					</div>
					<div className="col m4 s6 GoalContainer">
						<label className="text-main1 GoalSubtitle" htmlFor={this.state.endDatePickerId}>End Date</label>
						<input key={Teal.newId()}
							   id={this.state.endDatePickerId} type="date" className="datepicker text-main5"
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