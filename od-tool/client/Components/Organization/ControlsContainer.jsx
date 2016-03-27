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
				<div className="row">
					<div className="col s12 m12">
						<RoleControls role={this.state.object}/>
					</div>
					<div className="col s12 m6 offset-m3">
						<CommentsList comments={this.state.object.comments ? this.state.object.comments : []}
									  objectId={this.state.id} objectType={this.state.type} showAddInput={true}/>
					</div>
				</div>
			);
		} else if (this.state.type === 'organization') {
			return (
				<div className="row">
					<div className="col s12 m12">
						<OrgControls org={this.state.object}/>
					</div>
					<div className="col s12 m6 offset-m3">
						<CommentsList comments={this.state.object.comments ? this.state.object.comments : []}
									  objectId={this.state.id} objectType={this.state.type} showAddInput={true}/>
					</div>
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