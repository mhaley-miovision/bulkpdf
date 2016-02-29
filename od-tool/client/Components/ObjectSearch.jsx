ObjectSearch = React.createClass({
	mixins: [ReactMeteorData],

	propTypes: {
		customLabel: React.PropTypes.string,
		findOrganizations: React.PropTypes.bool,
		findContributors: React.PropTypes.bool,
		findRoles: React.PropTypes.bool,
		onClick: React.PropTypes.any.isRequired,
		notFoundLabel: React.PropTypes.string,
	},

	getDefaultProps() {
		return {
			width: screen.width < 700 ? 330 : "100%",
			findContributors: true,
			findOrganizations: true,
		};
	},

	getMeteorData() {
		var handle1 = Meteor.subscribe('teal.organizations');
		var handle2 = Meteor.subscribe('teal.contributors');

		if (handle1.ready() && handle2.ready()) {
			if (this.state.query && this.state.query !== '') {

				var q = {name: {$regex: new RegExp('.*' + this.state.query + '.*', "i")}};

				// TODO: nosql injection risk here!?

				// TODO: filter by owned root organization!!!

				var organizationMatches = this.props.findOrganizations ? OrganizationsCollection.find(
					q,
					{ fields: {name: 1, _id: 1, id: 1}, sort: {name: 1} }).fetch() : {};
				var contributorMatches = this.props.findContributors ? ContributorsCollection.find(
					q,
					{ fields: {name: 1, _id: 1, id: 1, email: 1}, sort: {name: 1} }).fetch() : {};
				var roleMatches = this.props.findRoles ? RolesCollection.find(
					{ email: {$regex: new RegExp('.*' + this.state.query + '.*', "i")} },
					{ fields: {accountabilityLabel: 1, email:1, contributor:1}, sort: {accountabilityLabel: 1} }
				).fetch() : {};

				return {contributors: contributorMatches, organizations: organizationMatches, roles: roleMatches};
			}
		}
		return { contributors: [], organizations: [], roles: []};
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
			this.props.onClick(e.target.text, 'organization', e.target.id);
		}
	},

	handleContributorClick: function(e) {
		e.preventDefault();
		e.stopPropagation();
		if (this.props.onClick) {
			this.props.onClick(e.target.id, 'contributor', e.target.id);
		}
	},

	handleRoleClick: function(e) {
		e.preventDefault();
		e.stopPropagation();
		if (this.props.onClick) {
			this.props.onClick(e.target.id, 'role', e.target.id);
		}
	},

	renderDropdownItems() {
		if (this.data.contributors.length > 0 || this.data.organizations.length > 0 || this.data.roles.length > 0) {
			var collection = [];
			var i = 0;
			if (this.data.contributors.length > 0) {
				for (var c in this.data.contributors) {
					var o = this.data.contributors[c];
					collection.push(
						<a href="#!" className="collection-item" key={i} id={o.email} object={o} style={{cursor:"pointer"}}
						   onClick={ this.handleContributorClick }>{o.name}</a>);
					i++;
				}
			}
			if (this.data.organizations.length > 0) {
				for (var c in this.data.organizations) {
					var o = this.data.organizations[c];
					collection.push(
						<a href="#!" className="collection-item" key={i} id={o._id} object={o} style={{cursor:"pointer"}}
						   onClick={  this.handleOrganizationClick }>{o.name}</a>);
					i++;
				}
			}
			if (this.data.roles.length > 0) {
				this.data.roles.forEach(r => {
					let l = (r.contributor ? r.contributor : "&lt;Unfilled%gt;") + " - " + r.accountabilityLabel;
					collection.push(
						<a className="collection-item" key={r._id} id={r._id} object={r} style={{cursor:"pointer"}}
						   onClick={ this.handleRoleClick }>{l}</a>
					);
				})
			}
			return collection;
		} else {
			var s = "people or organizations";
			if (this.props.notFoundLabel) {
				s = this.props.notFoundLabel;
			} else {
				if (!this.props.findContributors) {
					s = "organizations";
				} else if (!this.props.findOrganizations) {
					s = "people";
				}
			}
			return <a href="#!" className="collection-item" onClick={this.onBlur}>No matching {s} found.</a>
		}
	},

	onInputChange() {
		this.setState({ query: this.refs.textInput.value });
	},

	render: function() {
		var s = "a person or an organization";
		if (this.props.label) {
			s = this.props.label;
		} else {
			if (!this.props.findContributors) {
				s = "an organization";
			} else if (!this.props.findOrganizations) {
				s = "a person";
			}
			s = "Click here to search for a " + s;
		}

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
