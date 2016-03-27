CommentsInput = React.createClass({
	mixins: [ReactMeteorData],

	propTypes: {
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
			newComment:'',
			atMentions:[],
		};
	},
	initialize() {
		console.log("initialize triggered!");
		//$('#' + this.getEditableInputId()).text('');
		this.focusOnInput();
	},
	focusOnInput() {
		let _this = this;
		setTimeout(function() { $('#' + _this.getEditableInputId()).focus(); },50);
	},

	_atModeTerminatorKeys: [
		13, // enter
		27, // esc
		9, // tab
	],

	getMeteorData() {
		var handle = Meteor.subscribe('teal.contributors');
		if (handle.ready()) {
			if (this.state.query && this.state.query !== '') {
				var caseInsensitiveMatch = {$regex: new RegExp('.*' + this.state.query + '.*', "i")};
				let contributors = ContributorsCollection.find(
					{rootOrgId:Teal.rootOrgIg(), name: caseInsensitiveMatch},
					{fields: {name:1,email:1,_id:1}}
				).fetch();
				return { doneLoading: true, contributors: contributors };
			}
		}
		return { doneLoading: false, contributors: [] };
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
		if (this.state.value && this.state.value !== '') {
			Meteor.call("teal.comments.addComment",
				this.props.objectId, this.props.objectType, this.state.value, this.state.atMentions);
			this.initialize();
		}
	},
	handleAtModeInitiated(position) {
		this.state.atMode = true;
		this.state.atPosition = position;
	},
	handleAtModeTerminated() {
		this.state.atMode = false;
	},

	handleKeyDown(evt) {
		if (evt.keyCode === 13){ // enter key
			this.handleCommentSave();
		}
	},

	handleChange: function(e) {
		let v = e.target.value;
		this.state.value = v;

		if (v && v.length > 0 && v.charAt(v.length - 1) === '@') {

		}
	},
	handleKeyDown(e) {
		if (e.keyCode === 13) {
			e.preventDefault();
			e.stopPropagation();
			this.handleCommentSave();
		}
	},
	handleSubmit: function(e) {
		if (e) {
			e.preventDefault();
			e.stopPropagation();
		}
		this.handleCommentSave();
	},

	renderContributorListItems() {
		if (this.data.doneLoading) {
			return this.data.contributors.map(c => {
				return <div className="collection-item" key={c._id} id={c.email} object={c}
						  onClick={ this.handleContributorClick }>{c.name}</div>
			})
		}
	},
	renderContributorList() {
		return (
			//display:this.state.atMode ? "block" : "none"
			<div className="CommentsAtMentionList">
				{this.renderContributorListItems()}
			</div>
		);
	},

	getEditableInputId() {
		return "ci" + this.props.objectId;
	},

	componentDidUpdate() {
	},

	render: function() {
		return (
			<div className="CommentRow">
				<div key={Teal.newId()} className="valign-wrapper">
					<input autofocus placeholder="Enter new comment and press enter..."  id={this.getEditableInputId()}
						   type="text" className="CommentInput me valign" onChange={this.handleChange}
							onKeyDown={this.handleKeyDown}/>
				</div>
			</div>
		);
	},
});
