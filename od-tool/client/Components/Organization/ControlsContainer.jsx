ControlsContainer = React.createClass({
	getInitialState() {
		return {
			id: null,
			object: null,
			type: null
		};
	},

	update(id, type, object) {
		this.setState({id:id,type:type,object:object});
	},

	renderBody() {
		if (this.state.type === 'role') {
			return (
				<div>
					<RoleControls role={this.state.object}/>
				</div>
			);
		} else if (this.state.type === 'organization') {
			return (
				<div>
					<OrgControls org={this.state.object}/>
				</div>
			);
		}
	},

	render() {
		return (
			<div style={{marginBottom:"10px",marginTop:"10px"}}>
				{this.renderBody()}
			</div>
		);
	}
});