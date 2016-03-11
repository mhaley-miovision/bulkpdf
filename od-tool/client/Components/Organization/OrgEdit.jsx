OrgEdit = React.createClass({
	propTypes: {
		org : React.PropTypes.object,
		parentOrg : React.PropTypes.string,
		parentOrgId : React.PropTypes.string,
	},
	getInitialState() {
		return this.loadStateFromProps(this.props);
	},

	loadStateFromProps(props) {
		console.log("loadStateFromProps: ");
		console.log(props);
		return {
			_id: props.org ? props.org._id : null,
			name: props.org ? props.org.name : '',
			parentOrg: props.org ? props.org.parent : this.props.parentOrg ? this.props.parentOrg : '',
			parentOrgId: props.org ? props.org.parentId : this.props.parentOrgId ? this.props.parentOrgId : null,
			startDatePickerId: 'picker' + Teal.newId(),
			endDatePickerId: 'picker' + Teal.newId(),
			startDate : props.role ? props.role.startDate : moment().format(Teal.DateFormat),
			endDate : props.role ? props.role.endDate : null,
		};
	},

	getInputs() {
		// TODO: this is kind of nasty and a leaky abstraction - there must be a better way to do this (flux/redux?)
		this.state.startDate = $('#' + this.state.startDatePickerId)[0].value;
		this.state.endDate = $('#' + this.state.endDatePickerId)[0].value;
		return this.state;
	},
	clearInputs() {
		this.setState(this.getInitialState());
	},

	handleNameChange(event) {
		this.setState({name:event.target.value});
	},
	onOrganizationSelected(org,type,id) {
		this.setState({parentOrg:org,parentOrgId:id});
	},

	componentDidMount() {
		$('#'+this.state.startDatePickerId).pickadate({format: Teal.DateFormat.toLowerCase()});
		$('#'+this.state.endDatePickerId).pickadate({format: Teal.DateFormat.toLowerCase()});
	},
	componentWillReceiveProps(nextProps, nextState) {
		this.setState(this.loadStateFromProps(nextProps));
		this.forceUpdate();
	},

	render() {
		return (
			<div className="card-content GoalContainer">
				<div className="row">
					<div className="GoalTitle center" style={{marginTop:this.props.goal? "0px":"15px"}}>
						{this.props.org ? "Edit Organization" : "New Organization"}
					</div>
					<div className="divider"></div>
				</div>
				<div className="row">
					<div className="col m6 s12 GoalContainer">
						<label className="text-main1 GoalSubtitle">Organization Name</label>
						<input type="text" className="text-main5"
							   initialValue={this.state.name} placeholder={this.state.name ? '' : 'Enter the name of the organization...'}
						       onChange={this.handleNameChange}/>
					</div>
					<div className="col m6 s12 GoalContainer">
						<label className="text-main1 GoalSubtitle">Parent Organization</label>
						<ObjectSearch
							onClick={this.onOrganizationSelected} findOrganizations={true}
							initialValue={this.state.parentOrg}
							notFoundLabel="Please type the name of an existing organization."/>
					</div>
				</div>
				<div className="row">
					<div className="col m6 s6 GoalContainer">
						<label className="text-main1 GoalSubtitle" htmlFor={this.state.startDatePickerId}>Start Date</label>
						<input id={this.state.startDatePickerId} type="date" className="datepicker text-main5"
							   data-value={this.state.startDate}
							   readOnly/>
					</div>
					<div className="col m6 s6 GoalContainer">
						<label className="text-main1 GoalSubtitle" htmlFor={this.state.endDatePickerId}>End Date</label>
						<input id={this.state.endDatePickerId} type="date" className="datepicker text-main5"
							   data-value={this.state.endDate}
							   readOnly/>
					</div>
				</div>
			</div>
		);
	},
});