OrganizationSelector = React.createClass({
	mixins: [ReactMeteorData],

	getMeteorData() {
		Meteor.subscribe('organizations');
		return { };
	},

	getInitialState() {
		return {
			showList: false,
			inputText: "",
			searchResults: []
		};
	},

	getDropdownClasses() {
		var classes = "collection searchDropdown small";
		if (!this.state.showList) classes += " hide";
		return classes;
	},

	toggleDropdown(show) {
		this.setState( { showList: show } );
	},

	selectOrg(evt) {
		evt.preventDefault();
		console.log(evt);
		if (evt.target && evt.target.id) {
			Materialize.toast(evt.target.id, 1000);
		}
		this.toggleDropdown(false);
	},

	onBlur() {
		var _this = this;
		setTimeout(function() { _this.toggleDropdown(false); }, 150); // TODO HACK: to facilitate clicking first
	},

	onSelected() {
		this.toggleDropdown(true);
	},

	renderDropdownItems() {
		var _this = this;
		if (this.state.searchResults && this.state.searchResults.length > 0) {
			var collection = [];
			this.state.searchResults.map(function(o, i) {
				collection.push(<a href="#!" className="collection-item" onFocus={_this.selectOrg} key={i} id={i} object={o}>{o.name}</a>);
			});
			return collection;
		} else {
			return <a href="#!" className="collection-item" onClick={_this.onBlur}>No matching organizations found.</a>
		}
	},

	onInputChange() {
		_this = this;
		_this.state.inputText = this.refs.textInput.value;

		Meteor.call("orgSearch", this.state.inputText, function(err, data) {
			if (err) {
				Materialize.toast(err, 3000);
			} else {
				_this.setState({ searchResults: data, showList: true});
			}
		});
	},

	render: function() {
		return (
			<div className="container">
				<div className="row">
					<div className="col s12">
						<input className="button" type="text" id="orgSelection" ref="textInput"
							   onChange={this.onInputChange} placeholder="Click here to search for an organization"
								onBlur={this.onBlur} onSelect={this.onSelected}/>
						<label htmlFor="orgSelection"/>

						<div id='dropdown1' className={this.getDropdownClasses()}>
							{this.renderDropdownItems()}
						</div>
					</div>
				</div>
			</div>
		);
	},
});
