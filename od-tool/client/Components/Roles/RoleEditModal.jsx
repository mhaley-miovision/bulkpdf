RoleEditModal = React.createClass({

	getInitialState() {
		return {
			role: null,
		}
	},

	handleClose() {
		$('#' + this.props.id).closeModal();
	},

	show(roleId) {
		if (roleId) {
			let r = RolesCollection.findOne({_id:roleId});
			this.setState({role:r});
		} else {
			this.setState({role:null});
		}
		$('#' + this.props.id).openModal();
	},

	componentDidMount() {

	},

	render() {
		return (
			<div id={this.props.id} className="modal modal-fixed-footer">
				<div className="modal-content" style={{padding:0}}>
					<RoleEdit role={this.state.role} ref="roleEdit"/>
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