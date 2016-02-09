ObjectSearch = React.createClass({
	mixins: [ReactMeteorData],

	getMeteorData() {
		var handle1 = Meteor.subscribe('organizations');
		var handle2 = Meteor.subscribe('contributors');

		if (handle1.ready() && handle2.ready()) {
			if (this.state.query && this.state.query !== '') {

				var q = {name: {$regex: new RegExp('.*' + this.state.query + '.*', "i")}};

				// TODO: nosql injection risk here!?

				var organizationMatches = this.props.findOrganizations ? OrganizationsCollection.find(
					q,
					{fields: {name: 1, _id: 1, id: 1}, sort: {name: 1}}).fetch() : {};
				var contributorMatches = this.props.findContributors ? ContributorsCollection.find(
					q,
					{fields: {name: 1, _id: 1, id: 1, email: 1}, sort: {name: 1}}).fetch() : {};

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
			width: screen.width < 700 ? 330 : "100%",
			findContributors: true,
			findOrganizations: true,
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

	onBlur() {
		var _this = this;
		setTimeout(function() { _this.toggleDropdown(false); }, 150); // TODO HACK: to facilitate clicking first
	},

	onSelected() {
		this.toggleDropdown(true);
	},

	handleOrganizationClick: function(e) {
		e.preventDefault();
		e.stopPropagation();
		if (this.props.onClick) {
			this.props.onClick(e.target.text, 'organization');
		}
	},

	handleContributorClick: function(e) {
		e.preventDefault();
		e.stopPropagation();
		if (this.props.onClick) {
			this.props.onClick(e.target.id, 'contributor');
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
						<a href="#!" className="collection-item" key={i} id={o.email} object={o}
						   onClick={ this.handleContributorClick }>{o.name}</a>);
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
		var s = "a person or an organization";
		if (!this.props.findContributors) {
			s = "an organization";
		} else if (!this.props.findOrganizations) {
			s = "a person";
		}
		s = "Click here to search for a " + s;

		return (
			<div style={{width:this.props.width}}>
				<input className="button" type="text" id="orgSelection" ref="textInput"
					   onChange={this.onInputChange} placeholder={s}
						onBlur={this.onBlur} onSelect={this.onSelected}/>
				<label htmlFor="orgSelection"/>

				<div id='dropdown1' className={this.getDropdownClasses()}>
					{this.renderDropdownItems()}
				</div>
			</div>
		);
	},
});
