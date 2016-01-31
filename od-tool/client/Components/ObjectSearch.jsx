ObjectSearch = React.createClass({
	mixins: [ReactMeteorData],

	getMeteorData() {
		var handle1 = Meteor.subscribe('organizations');
		var handle2 = Meteor.subscribe('contributors');

		if (handle1.ready() && handle2.ready()) {
			if (this.state.query && this.state.query !== '') {

				var q = {name: {$regex: new RegExp('.*' + this.state.query + '.*', "i")}};

				// TODO: nosql injection risk here!?

				var organizationMatches = OrganizationsCollection.find(
					q,
					{fields: {name: 1, _id: 1, id: 1}}).fetch();
				var contributorMatches = ContributorsCollection.find(
					q,
					{fields: {name: 1, _id: 1, id: 1}}).fetch();

				return {contributors: contributorMatches, organizations: organizationMatches};
			}
		}
		return { contributors: [], organizations: []};
	},

	getInitialState() {
		return {
			showList: false,
			searchResults: [],
			query: "",
			contributors: [],
			organization: [],
		};
	},

	getDefaultProperties() {
		return {
			width: screen.width < 700 ? 330 : "100%"
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

	handleOrganizationClick: function(o) {
		o.preventDefault();
		if (this.props.onClick) {
			this.props.onClick(o.target.text, 'organization');
		}
	},

	handleContributorClick: function(o) {
		o.preventDefault();
		if (this.props.onClick) {
			this.props.onClick(o.target.text, 'contributor');
		}
	},

	renderDropdownItems() {
		if (this.data.contributors.length > 0 || this.data.organizations.length > 0) {
			var collection = [];
			var i = 0;
			if (this.data.contributors.length > 0) {
				for (var c in this.data.contributors) {
					var o = this.data.contributors[c];
					collection.push(
						<a href="#!" className="collection-item" key={i} id={i} object={o}
						   onClick={  this.handleContributorClick }>{o.name}</a>);
					i++;
				}
			}
			if (this.data.organizations.length > 0) {
				for (var c in this.data.organizations) {
					var o = this.data.organizations[c];
					collection.push(
						<a href="#!" className="collection-item" key={i} id={i} object={o}
						   onClick={  this.handleOrganizationClick }>{o.name}</a>);
					i++;
				}
			}
			return collection;
		} else {
			return <a href="#!" className="collection-item" onClick={this.onBlur}>No matching people or organizations found.</a>
		}
	},

	onInputChange() {
		this.setState({ query: this.refs.textInput.value });
	},

	render: function() {
		return (
			<div style={{width:this.props.width}}>
				<input className="button" type="text" id="orgSelection" ref="textInput"
					   onChange={this.onInputChange} placeholder="Click here to search for a person or organization"
						onBlur={this.onBlur} onSelect={this.onSelected}/>
				<label htmlFor="orgSelection"/>

				<div id='dropdown1' className={this.getDropdownClasses()}>
					{this.renderDropdownItems()}
				</div>
			</div>
		);
	},
});
