ObjectSearch = React.createClass({
	mixins: [ReactMeteorData],

	propTypes: {
		customLabel: React.PropTypes.string,
		findOrganizations: React.PropTypes.bool,
		findContributors: React.PropTypes.bool,
		findRoles: React.PropTypes.bool,
		findRoleLabels: React.PropTypes.bool,
		findAccountabilityLevels: React.PropTypes.bool,
		onClick: React.PropTypes.any.isRequired,
		notFoundLabel: React.PropTypes.string,
		initialValue: React.PropTypes.string,
	},

	getDefaultProps() {
		return {
			width: screen.width < 700 ? 330 : "100%",
			findContributors: false,
			findOrganizations: false,
			findRoles: false,
			findRoleLabels: false,
			findAccountabilityLevels: false,
			initialValue: '',
		};
	},

	getMeteorData() {
		var handle1 = Meteor.subscribe('teal.organizations');
		var handle2 = Meteor.subscribe('teal.contributors');
		var handle3 = Meteor.subscribe('teal.roles');
		var handle4 = Meteor.subscribe('teal.role_labels');
		var handle5 = Meteor.subscribe('teal.accountability_levels');

		if (handle1.ready() && handle2.ready() && handle3.ready() && handle4.ready() && handle5.ready()) {
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
				var roleLabelMatches = this.props.findRoleLabels ? RoleLabelsCollection.find(
					q,
					{ fields: {name: 1}, sort: {name: 1} }).fetch() : {};
				var accountabilityLevelMatches = this.props.findAccountabilityLevels ? AccountabilityLevelsCollection.find(
					q,
					{ fields: {name: 1}, sort: {name: 1} }).fetch() : {};

				return {
					isLoading: false,
					contributors: contributorMatches, organizations: organizationMatches,
					roles: roleMatches, roleLabels: roleLabelMatches, accountabilityLevels: accountabilityLevelMatches};
			}
		}
		return { isLoading: true, contributors: [], organizations: [], roles: [], roleLabels: [], accountabilityLevels: []};
	},

	getInitialState() {
		console.log(this.props);
		return {
			showList: false,
			searchResults: [],
			query: this.props.initialValue,
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

	// TODO: these methods need refactoring

	handleOrganizationClick(e) {
		e.preventDefault();
		e.stopPropagation();
		this.setState({inputValue:e.currentTarget.text});
		if (this.props.onClick) {
			this.props.onClick(e.currentTarget.text, 'organization', e.currentTarget.id);
		}
	},

	handleContributorClick(e) {
		e.preventDefault();
		e.stopPropagation();
		this.setState({inputValue:e.currentTarget.text});
		if (this.props.onClick) {
			this.props.onClick(e.currentTarget.text, 'contributor', e.currentTarget.id);
		}
	},

	handleRoleClick(e) {
		e.preventDefault();
		e.stopPropagation();
		this.setState({inputValue:e.currentTarget.text});
		if (this.props.onClick) {
			this.props.onClick(e.currentTarget.id, 'role', e.currentTarget.id);
		}
	},

	handleRoleLabelClick(e) {
		e.preventDefault();
		e.stopPropagation();
		this.setState({inputValue:e.currentTarget.text});
		if (this.props.onClick) {
			this.props.onClick(e.currentTarget.text, 'role_label', e.currentTarget.id);
		}
	},

	handleAccountabilityLevelClick(e) {
		console.log(e);
		e.preventDefault();
		e.stopPropagation();
		this.setState({inputValue:e.currentTarget.text});
		if (this.props.onClick) {
			this.props.onClick(e.currentTarget.text, 'accountability_level', e.currentTarget.id);
		}
	},

	renderDropdownItems() {
		if (   this.data.contributors.length > 0
			|| this.data.organizations.length > 0
			|| this.data.roles.length > 0
			|| this.data.roleLabels.length > 0
			|| this.data.accountabilityLevels.length > 0) {
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
			if (this.data.roleLabels.length > 0) {
				this.data.roleLabels.forEach(r => {
					collection.push(
						<a className="collection-item" key={r._id} id={r._id} object={r} style={{cursor:"pointer"}}
						   onClick={ this.handleRoleLabelClick }>{r.name}</a>
					);
				})
			}
			if (this.data.accountabilityLevels.length > 0) {
				this.data.accountabilityLevels.forEach(r => {
					collection.push(
						<a className="collection-item" key={r._id} id={r._id} object={r} style={{cursor:"pointer"}}
						   onClick={ this.handleAccountabilityLevelClick }>{r.name}</a>
					);
				})
			}
			return collection;
		} else {
			return <a href="#!" className="collection-item" onClick={this.onBlur}>{this.props.notFoundLabel}</a>
		}
	},

	onInputChange() {
		this.setState({ query: this.refs.textInput.value });
	},

	componentWillReceiveProps(nextProps, nextState) {
		if (nextProps.initialValue) {
			this.setState({query:nextProps.initialValue});
		}
	},

	render: function() {
		return (
			<div style={{width:this.props.width}}>
				<input className="text-main5" type="text" id="orgSelection" ref="textInput"
					   onChange={this.onInputChange}
					   placeholder={this.state.query ? '' : this.props.label} value={this.state.query}
					   onBlur={this.onBlur} onSelect={this.onSelected}/>
				<label htmlFor="orgSelection"/>

				<div id='dropdown1' className={this.getDropdownClasses()}>
					{this.renderDropdownItems()}
				</div>
			</div>
		);
	},
});
