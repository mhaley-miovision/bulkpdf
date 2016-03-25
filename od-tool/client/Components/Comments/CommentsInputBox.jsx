CommentsInputBox = React.createClass({
	mixins: [ReactMeteorData],

	propTypes: {
		displayTransform: React.PropTypes.func,
		onKeyDown: React.PropTypes.func,
		onSelect: React.PropTypes.func,
		onBlur: React.PropTypes.func,
		onChange: React.PropTypes.func,
		objectId: React.PropTypes.string.isRequired,
		objectType: React.PropTypes.string.isRequired,
	},
	getDefaultProps: function () {
		return {
			onKeyDown: () => null,
			onSelect: () => null,
			onBlur: () => null,
		};
	},
	getInitialState() {
		return {
			value:"",
			atMentions:[],
		};
	},
	initialize() {
		$('#' + this.getEditableInputId()).text('');
		let _this = this;
		setTimeout(function() { $('#' + _this.getEditableInputId()).focus(); },50);
	},

	getMeteorData() {
		var handle = Meteor.subscribe('teal.contributors');
		if (handle.ready()) {
			if (this.state.query && this.state.query !== '') {
				var caseInsensitiveMatch = {$regex: new RegExp('.*' + this.state.query + '.*', "i")};

				let contributors = ContributorsCollection.find(
					{rootOrgId:Teal.rootOrgIg(), name: caseInsensitiveMatch},
					{fields: {name:1,email:1,_id:1}}
				);
				return { doneLoading: true, contributors: contributors };
			}
		}
		return { doneLoading: false, contributors: [] };
	},

	handleKeyDown(evt) {
		console.log(evt.type + ", " + evt.which);
		if (evt.type === 'keydown' && evt.which === 13){ // enter key
			this.handleCommentSave();
		}
	},
	handleContributorClick(evt) {
		let n = evt.currentTarget.value;
		let id = evt.currentTarget.id;
		let val = this.state.value;
		// replace text with the name
		val = val.substring(0, this.state.atPosition);
		val += n;
		this.state.atMentions.push({name:n,email:id});
		this.handleAtModeTerminated();
	},
	handleCommentSave() {
		if (this.state.value != '') {
			Meteor.call("teal.comments.addComment",
				this.props.objectId, this.props.objectType, this.state.value, this.state.atMentions);
			this.initialize();
		}
	},
	handleAtModeInitiatied(position) {
		this.setState({atMode:true, atPosition:position});
	},
	handleAtModeTerminated() {
		this.setState({atMode:false});
	},
	handleChange: function(ev) {
		this.state.value = $('#'+this.getEditableInputId()).text();
		let s = this.state.value;
		if (s && s != '') {
			if (this.state.atMode) {
				if (s.indexOf("@") == this.state.atPosition) {
					// build the @ query
					let atQuery = s.substring(this.state.atPosition + 1);
					this.setState({query: atQuery})
				} else {
					this.handleAtModeTerminated();
				}
			} else {
				let lastChar = s.charAt(s.length - 1);
				if (lastChar === '@') {
					console.log("Initiating @ mode!");
					this.handleAtModeInitiatied(position);
				}
			}
		}
	},

	renderContributorListItems() {
		if (this.data.doneLoading) {
			return this.data.contributors.map(c => {
				return <a className="collection-item" key={c._id} id={c.email} object={c} style={{cursor:"pointer"}}
						  onClick={ this.handleContributorClick }>{c.name}</a>
			})
		}
	},
	renderContributorList() {
		return (
			<div style={{position:"absolute", display:this.state.atMode ? "block" : "none"}}>
				{this.renderContributorListItems()}
			</div>
		);
	},

	getEditableInputId() {
		return "ci" + this.props.objectId;
	},

	componentDidUpdate() {
		console.log("CommentsInputBox - componentDidUpdate");
	},

	render: function() {
		return (
			<div className="CommentRow">
				{this.renderContributorList()}
				<div key={Teal.newId()} className="valign-wrapper">
					<img className="CommentItemProfileImg left valign" src={ Teal.userPhotoUrl(Meteor.user().services.google.picture) }/>
					<p id={this.getEditableInputId()}
					   className="CommentInput me valign" contentEditable="true" style={{cursor:"pointer"}}
					   onKeyDown={this.handleKeyDown} onInput={this.handleChange}>
					</p>
				</div>
			</div>
		);
	},
});
