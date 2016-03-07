RoleEditModal = React.createClass({

	propTypes: {
		id: React.PropTypes.string.isRequired,
	},

	getInitialState() {
		return {
			role: null,
		}
	},

	handleClose() {
		$('#' + this.props.id).closeModal();
	},

	setRoleId(roleId) {
		// load the role
		let r = RolesCollection.findOne({_id:roleId});
		this.setState({role:r});
	},

	show() {

	},

	componentDidMount() {

	},

	render() {
		return (
			<div id={this.props.id} className="modal modal-fixed-footer">
				<div className="modal-content" style={{padding:0}}>
					<RoleEdit role={this.state.role}/>
				</div>
				<div className="modal-footer">
					<div className="center">
						<i className="material-icons GreyButton" onClick={this.handleClose}
						   style={{float:"none",marginTop:"7px"}}>check</i>
					</div>
				</div>
			</div>
		);
	}
});