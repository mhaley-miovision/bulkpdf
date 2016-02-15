var chartHeight = 700;
var chartHeightMobile = 303;
var chartWidth = 1024;
var chartWidthMobile = 303;

var Chart = (function () {
	var root_2 = Math.sqrt(2),
		w = screen.width < 700 ? chartWidthMobile : chartWidth,
		h = screen.width < 700 ? chartHeightMobile : chartHeight,
		r = screen.width < 700 ? chartHeightMobile - 30 : chartHeight - 50,
		x = d3.scale.linear().range([0, r]),
		y = d3.scale.linear().range([0, r]),
		node,
		root,
		vis, pack,
		zoomedToRole,
		$roleDetails,
		zoomed,
		loaded,
		zoomedToObject,
		color = d3.scale.linear()
			.domain([-1, 18])
			.range(["hsl(0,0%,100%)", "hsl(228,30%,40%)"])
			.interpolate(d3.interpolateHcl);

	function getChildCount(d) {
		if (d) {
			if (d.children) {
				var count = 1;
				d.children.forEach(c => count += getChildCount(c));
				return count;
			}
			return 0;
		}
	}

	function classesForNode(d) {
		var classes = [];
		classes.push(d.children ? "parent" : "child");
		classes.push(d.type === "contributor" ? "role" : d.type);
		if (d.type === 'role' || d.type === 'contributor') {
			classes.push(d.contributor || d.type == "contributor" ? "filled" : "unfilled");
			if (d.numGoals > 0) {
				classes.push("hasGoals");
			}
		}
		if (d.isHighlighted) {
			classes.push("highlight");
		}
		if (d.type === 'label') {
			classes.push("text-main1");
		}
		return classes.join(" ");
	}

	function foreignObjectHtml(d) {
		var html = '';
		if (d.type === 'role') {
			//TODO: brutal hack here to remove the team from the role
			var l = d.accountabilityLabel.split(",")[0];
			html = "<div><strong>"+_.escape(l)+"</strong></div>";
			html += "<div class='text-main1'>"+_.escape(d.contributor)+"</div>";
		} else if (d. type === 'contributor') {
			html += "<div>"+_.escape(d.name)+"</div>";
		} else {
			html = _.escape(d.name);
		}

		d.url = "#";
		var content =
			'<div class="d3label"><div class="title"><a href="' + d.url + '" class="' + classesForNode(d) + '">'
			+ html + '</a></div>';

		return content + '</div>';
	}

	function showTitle(d, scalingFactor) {
		if (d.type === 'role' || d.type === 'contributor')
			return scalingFactor * d.r > 30;
		else
			return true;//return scalingFactor * d.r > 30;
	}

	function showRoleDetails(d, scalingFactor) {
		return d.type === 'role' || d.type === 'contributor' ? scalingFactor * d.r >= r / 2 : (scalingFactor * d.r > 20);
	}

	function innerSquareSize(d) {
		return d.r * 2 / root_2;
	}

	function dx(d) {
		return d.x;
	}

	function dy(d) {
		return d.y;
	}

	function isObjectTooDeepToShow(o) {
		if (zoomedToObject) {
			if (o.depth) {
				var depthThreshold = 2;
				// only show currently zoomed to level + 1
				return (o.depth - zoomedToObject.depth > depthThreshold);
			} else {
				// does not belong in depth tree
				return false;
			}
		} else {
			// no object zoomed to
			return false;
		}
	}

	function addForeignObjects(foreignObjects) {
		foreignObjects.append("foreignObject")
			.attr("class", classesForNode)
			.classed("foreign-object", true)
			.attr("width", innerSquareSize)
			.attr("height", innerSquareSize)
			.attr("x", function (d) {
				return d.x - d.r;
			})
			.attr("y", function (d) {
				return d.y - d.r;
			})
			.append("xhtml:body")
			.html(foreignObjectHtml);
	}

	function zoomFos(fos, zf, xAdjust, fontAdjust, widthFn) {
		fos
			.attr("x", zf.makeXYAdjuster(x, 'x', xAdjust))
			.attr("y", zf.makeXYAdjuster(y, 'y', 1))
			.attr("width", widthFn)
			.attr("height", zf.foreignObjSize)
			.select(".title")
			.style("font-size", zf.makeFontSizer(fontAdjust));
	}

	function zoomCircles(t, k) {
		t.selectAll("circle")
			.attr("cx", function (d) {
				return x(d.x);
			})
			.attr("cy", function (d) {
				return y(d.y);
			})
			.attr("r", function (d) {
				return k * d.r;
			})
			.attr("class", classesForNode);
	}

	function initCircles(circles) {
		circles
			.attr("class", classesForNode)
			.style("fill", function(d) {
				if (d['color']) {
					return d.color;
				} else {
					return d.children ? color(d.depth) : '';
				}
			})
			.attr("cx", dx)
			.attr("cy", dy)
			.attr("r", function (d) {
				return d.r;
			})
			.attr("title", function (d) {
				return _.unescape(d.name);
			});
	}

	return {
		transitionDuration: function () {
			return 750
		},

		zoomFunctions: function (k) {
			return {
				foreignObjSize: function(d) {
					if (d.type === 'role' || d.type === 'contributor') {
						return d.r * k * 2 / root_2;
					} else {
						return d.r * k * 2;
					}
				},
				setOpacity: function(fos) {
					fos.style("display", function (d) {
						return showTitle(d, k) && !isObjectTooDeepToShow(d) ? "inline-block" : "none";
					}).style("opacity", function (d) {
						return showTitle(d, k) && !isObjectTooDeepToShow(d) ? 1 : 0;
					});
				},
				makeFontSizer: function(factor) {
					return function (d) {

						if (d.type !== 'role' && d.parent) {
							var cc = getChildCount(d.parent);
							if (d.depth < 3) {
								if (cc < 5) {
									return "12px";
								} else if (cc < 10) {
									return "16px";
								} else if (cc > 50) {
									return "36px";
								} else {
									return "24px";
								}
							}
						}

						return parseInt(Math.min(Math.max(10, Chart.zoomFunctions(k).foreignObjSize(d) / factor), 18)) + 'px';

					}
				},
				makeXYAdjuster: function(fn, key, factor) {
					return function (d) {
						return fn(d[key]) - Chart.zoomFunctions(k).foreignObjSize(d) * factor / 2;
					}
				},
				roleDetailZoomed: function(d){
					return showRoleDetails(d, k) ? 'role-details zoomed' : 'role-details';
				},
				roleDetailOpacity: function (d) {
					return showRoleDetails(d, k) ? 1 : 0;
				},
				labelWidth: function(d) {
					var s =  Chart.zoomFunctions(k).foreignObjSize(d) * 3;
					return s;
				}
			}
		},

		clickIe: function (zoomTo) {
			if (!browserSupportsForeignObjects()) {
				window.location = window.location.protocol + "//" + window.location.host + zoomTo.url;
			}
		},

		isDescendantOf(n, parent) {
			if (n.parent) {
				if (n.parent === parent) {
					return true;
				} else {
					return this.isDescendantOf(n.parent, parent);
				}
			} else {
				return false;
			}
		},

		getLowestCommonParent(nodes, root) {
			var parents = [];
			// for each node, see which child of root they match up to as a parent
			for (var ni in nodes) {
				var n = nodes[ni];

				// the root isn't even a parent!
				if (!this.isDescendantOf(n, root)) {
					return null;
				}

				// check the root children
				for (var ci in root.children) {
					if (this.isDescendantOf(n, root.children[ci])) {
						parents.push(root.children[ci]);
						break;
					}
				}
			}
			// sanity check
			if (parents.length != nodes.length) {
				return root;
			}
			// are all parents the same?
			if (parents.length > 0) {
				var p = parents[0];
				for (var i = 1; i < parents.length; i++) {
					if (p != parents[i]) {
						return root; // different parents, root was the common parent
					}
				}
			} else {
				return root;
			}
			// div in to the next level
			return this.getLowestCommonParent(nodes, parents[0]);
		},

		highlightRoles(roles) {
			function clearHighlight(n) {
				if (n.children) {
					for (var ni in n.children) {
						n.children[ni].isHighlighted = false;
						clearHighlight(n.children[ni]);
					}
				}
			}
			clearHighlight(root);

			// highlight the roles
			for (var ri in roles) {
				roles[ri].isHighlighted = true;
			}
		},

		zoomToOrg: function (zoomToObject, shouldAnimate = true) {
			if (zoomToObject) {
				if (this.objectIdToNode[zoomToObject]) {
					this.highlightRoles([]);
					this.zoom(this.objectIdToNode[zoomToObject], true);
				} else {
					// TODO: hack - try finding as a contributor if an email was specified
					var c = ContributorsCollection.findOne({email: zoomToObject});
					if (c) {
						// see if multiple matches occured
						var roles = this.getRolesForContributorEmail(zoomToObject);
						var commonParent = this.getLowestCommonParent(roles, root);
						this.highlightRoles(roles);

						// zoom to the closest containing parent
						this.zoom(commonParent, shouldAnimate);
					} else {
						console.log("this.objectIdToNode[zoomToObject] is undefined");
					}
				}
			} else {
				console.log("zoomToObject is undefined");
			}
		},

		zoom: function (zoomTo, shouldAnimate = false) {
			zoomedToObject = zoomTo;
			zoomed = false;
			loaded = false;
			if (zoomedToRole) {
				Chart.leaveRole(zoomedToRole);
			}

			var k = r / zoomTo.r / 2;
			x.domain([zoomTo.x - zoomTo.r, zoomTo.x + zoomTo.r]);
			y.domain([zoomTo.y - zoomTo.r, zoomTo.y + zoomTo.r]);

			var zf = Chart.zoomFunctions(k);
			var t = vis.transition()
				.duration(shouldAnimate ? Chart.transitionDuration() : 0) ; //d3.event ? (d3.event.altKey ? 3.5 * Chart.transitionDuration() : Chart.transitionDuration()) : 0);

			t.each("end", function () {
				if (zoomTo.type === 'role' || zoomTo.type === 'contributor') {
					Chart.enterRole(zoomTo);
				}
				zoomed = true;
				Chart.setRoleDetailHeight();
			});
			zoomCircles(t, k);

			var fos = t.selectAll(".foreign-object");
			zoomFos(fos, zf, 1, 6, zf.foreignObjSize);
			zf.setOpacity(fos);

			/*
			var fos = t.selectAll(".foreign-object");
			var labelFos = t.selectAll('.foreign-object.label');
			zoomFos(labelFos, zf, 3, 2.5, zf.labelWidth);
			zf.setOpacity(labelFos);

			var fos = t.selectAll(".foreign-object");
			var roleFos = t.selectAll('.foreign-object.role');
			zoomFos(roleFos, zf, 1, 6, zf.foreignObjSize);
			zf.setOpacity(roleFos);*/

			node = zoomTo;
			d3.event && d3.event.stopPropagation();
			return t;
		},

		enterRole: function (zoomTo) {
			$roleDetails.show();
			zoomedToRole = zoomTo;
		},

		leaveRole: function () {
			$roleDetails.empty();
			$roleDetails.hide();
			//vis.selectAll('.title').style('opacity', '1');
			zoomedToRole = null;
		},

		setFos: function (zoomTo) {
			var t = vis;
			var k = r / zoomTo.r / 2;
			var zf = Chart.zoomFunctions(k);
		},

		setRoleDetailHeight: function () {
			if (!loaded || !zoomed) {
				return;
			}
			var $roleBody = $('.role-body');
			if ($roleBody.length < 1) {
				return;
			}
			$roleBody
				.height($('#role-zoomed').height() - $roleBody.position().top)
				.scrollbar({orientation: 'vertical'});
			if ($roleBody.hasOverflow()) {
				$roleBody.addClass('scrollable');
			} else {
				$roleBody.removeClass('scrollable');
			}
		},

		comparator: function (a, b) {
			if (a.type === 'label') {
				return 1
			} else if (b.type === 'label') {
				return -1
			} else if (a.type === 'organization' && b.type === 'role' && b.type === 'contributor') {
				return 1
			} else if (b.type === 'organization' && a.type === 'role' && b.type === 'contributor') {
				return -1
			}
			return 0
		},

		getRolesForContributorEmail(contributorEmail) {
			var c = ContributorsCollection.findOne({email: contributorEmail});
			if (c && c.email) {
				return this._getRolesForContributorName(c.name, root);
			} else {
				console.error("Contributor not found by email " + contributorEmail);
				return 0;
			}
		},

		_getRolesForContributorName(contributorName, n) {
			var roles = [];
			if (n.contributor === contributorName || n.name == contributorName) {
				roles.push(n);
			}
			if (n.children) {
				for (var i in n.children) {
					roles = roles.concat(this._getRolesForContributorName(contributorName, n.children[i]));
				}
			}
			return roles;
		},

		/* TODO: To make this callable upon update, I should split this out into the initialization and update function,
			which calls enter/update/exit and transitions in between to make for a smooth switch when properties are
			updated :)

			Note that this is an additive only method - I need to modify this to remove nodes as well
		* */
		loadData: function (data, initiallyZoomedTo) {
			// use the circle packing layout
			pack = d3.layout.pack()
				.size([r, r])
				.sort(Chart.comparator)
				.value(function (d) {
					if (d.type == 'label') {
						return d.depth;
					}
					//return 5 + Math.random() * 95;
					return 1;
				})
				//.padding(6);
				.padding(0.2);

			// clear the canvas
			$(".chartContainer").empty();

			// prepare the canvas
			vis = d3.select(".chartContainer").insert("svg:svg", "h2")
				.attr("width", w)
				.attr("height", h)
				.append("svg:g")
				.attr("transform", "translate(" + (w - r) / 2 + "," + (h - r) / 2 + ")");

			// node initialization
			node = root = data;
			var nodes = pack.nodes(root);

			// when zoomed into a role
			d3.select(".chartContainer").insert("div").attr("id", "role-zoomed");

			$roleDetails = $('#role-zoomed');

			// add the circles
			var circles = vis.selectAll("organization").data(nodes).enter().append("svg:circle");
			initCircles(circles);

			// create map of orgname and contributorname -> node
			this.objectIdToNode = [];
			nodes.filter(n => n.type == "organization").forEach(n => this.objectIdToNode[n.name] = n);

			// this will fail for multiple matches!
			// TODO: make this work for multiple matches
			nodes.filter(n => n.type == "role").forEach(n => this.objectIdToNode[n.contributor] = n);

			// contributors
			nodes.filter(n => n.type == "contributor").forEach(n => this.objectIdToNode[n.name] = n);

			// don't add these object to organizations, since we use the label object instead for them, as a circle
			var foreignObjects = vis.selectAll(".foreign-object")
				.data(nodes
					.filter(function (d) {
					return d.type !== 'organization';
					})
				)
				.enter();
			addForeignObjects(foreignObjects);

			circles.on("click", function (d) {
				var zoomTo = node === d ? root : d;

				function loadRoleDetails() {
					// get role accountability list
					var roleId = zoomTo.id;
					var accs = RoleAccountabilitiesCollection.find({id: roleId}).fetch();

					// profile image
					var c = ContributorsCollection.findOne({name: zoomTo.contributor});
					var url = zoomTo.photo ? zoomTo.photo : (c && c.photo) ? c.photo : "/img/user_avatar_blank.jpg";
					var s = "<div style='text-align:center; padding-bottom:10px'><img class='zoomedInRolePhoto' src='" + url + "'/></div>";

					var goalsUrl = FlowRouter.path("profile", {}, { objectId: d.email })
					s += '<div class="numGoalsLabel"><a href="' + goalsUrl + '">View Profile</a></div>';

					// bucketize the accountabilities
					var accountabilityBuckets = {};
					var j = 0;
					s += "<div style='margin-left:20px; margin-top:20px; overflow: auto; height: 200px'>";
					if (accs.length > 0) {
						while (accs[0][j]) {
							var a = accs[0][j];
							if (a) {
								if (typeof(accountabilityBuckets[a.accountabilityType]) === 'undefined') {
									accountabilityBuckets[a.accountabilityType] = [];
								}
								accountabilityBuckets[a.accountabilityType].push(a);
							}
							j++;
						}
						// output them to the html
						for (var k in Object.keys(accountabilityBuckets)) {
							var key = Object.keys(accountabilityBuckets)[k];
							s += '<div><b>' + key + '</b></div>';
							s += '<ul>';
							for (var i in accountabilityBuckets[key]) {
								var a = accountabilityBuckets[key][i];
								s += '<li>' + a.label + '</li>';
							}
							s += '</ul>';
						}
					} else {
						if (zoomTo.type === 'role') {
							s += "<div>No accountabilities defined for this role yet.</div>";
						}
					}
					s += '</div>';

					// has to do with update thread (but WTFFFF)
					setTimeout(function() {
						$roleDetails.html(s);
						$roleDetails.attr('class', 'role-details ' + classesForNode(zoomTo));
						Chart.setRoleDetailHeight();
					}, 100);
				}

				console.log("zoomTo.type:" + zoomTo.type);

				if (zoomTo.type === 'role' || zoomTo.type === 'contributor') {
					loadRoleDetails(zoomTo);
				}
				Chart.zoom(zoomTo, true);
			});

			d3.select(".chartContainer").on("click", function () {
				Chart.zoom(root, true);
			})

			if (initiallyZoomedTo)
			{
				Chart.zoom(root, false);

				setTimeout(
					function() { Chart.zoomToOrg(initiallyZoomedTo, true); },
					100
				);

			} else {
				Chart.zoom(root, false);
			}
		}
	};
})();

Organization = React.createClass({
	mixins: [ReactMeteorData],

	propTypes: {
		objectId : React.PropTypes.string.isRequired,
		objectType : React.PropTypes.string,
		zoomTo : React.PropTypes.string,
		roleMode : React.PropTypes.bool,
		roleModeVisible : React.PropTypes.bool,
		searchVisible : React.PropTypes.bool,
	},
	getDefaultProps() {
		return {
			roleMode: true,
			roleModeVisible: true,
			searchVisible: true,
		}
	},
	getInitialState() {
		return {
			initialLoad: true,
			roleMode : this.props.roleMode,
		}
	},
	handleRoleModeChanged(event) {
		this.setState( {roleMode: !this.refs.roleMode.checked });
	},


	handleSearch(o) {
		Chart.zoomToOrg(o);
	},

	// TODO: move some of this log into server-side methods
	getMeteorData() {
		var handle1 = Meteor.subscribe("organizations");
		var handle2 = Meteor.subscribe("roles");
		var handle3 = Meteor.subscribe("contributors");
		var handle4 = Meteor.subscribe("job_accountabilities");
		var handle5 = Meteor.subscribe("org_accountabilities");

		var data = { isLoading: !handle1.ready() && !handle2.ready() && !handle3.ready()
					&& !handle4.ready() && !handle5.ready() };

		if (!data.isLoading) {

			var objectId = this.props.objectId;
			if (this.props.objectType === 'contributor') {
				objectId = "Miovision";
			}

			// TODO: SHOULD OPTIMIZE THESE QUERIES TO USE THE DB MORE RATHER THAN DO THIS CLIENT-SIDE

			let org = OrganizationsCollection.findOne({ name: objectId });
			if (org) {
				// for building an org tree
				let populateOrgChildren = function (o) {
					o.children = [];
					var query = OrganizationsCollection.find({parent: o.name}); // find the children
					if (query.count() > 0) {
						var r = query.fetch();

						for (var x in r) {
							o.children.push(r[x]); // add the child
							r[x].level = o.level ? o.level+1 : 1; // attach a level
							populateOrgChildren(r[x]); // recurse for each child
						}
					}
				}
				// for adding roles as children
				let attachOrgRoles = function (o)  {
					if (typeof(o.children) === 'undefined') {
						o.children = [];
					}
					for (var c in o.children) {
						attachOrgRoles(o.children[c]);
					}

					// get all immediate roles attached to this org
					let q = RolesCollection.find({organization: o.name});
					if (q.count() > 0) {
						var r = q.fetch();
						for (var x in r) {
							var role = r[x];
							/* THIS IS TOO SLOW, PRE-POPULATE ON IMPORT INSTEAD
							// also find the number of goals this contributor has
							let c = ContributorsCollection.findOne({name: role.contributor});
							if (c && c !== '') {
								console.log("finding goals for '" + c.email + "'");
								let g = GoalsCollection.find({owners: c.email});
								role.numGoals = g.count();
								console.log(c.email + " has " + role.numGoals + " goals");
							} else {
								console.log("Couldn't find contributor for role: " + role);
							}*/
							o.children.push(role);
						}
					}
				}
				// for attaching contributors to orgs
				let attachOrgContributors = function (o) {
					if (typeof(o.children) === 'undefined') {
						o.children = [];
					}
					o.children.forEach(c => attachOrgContributors(c));
					let q = ContributorsCollection.find({physicalTeam: o.name});
					if (q.count() > 0) {
						var r = q.fetch();
						for (var x in r) {
							/* THIS IS TOO SLOW, PRE-POPULATE ON IMPORT INSTEAD
							let g = GoalsCollection.find({owners: q.email});
							r[x].numGoals = g.count();*/
							o.children.push(r[x]);
						}
					}
				}

				// for appending a label as a child
				let attachOrgLabels = function(n) {
					if (n.type !== 'organization') {
						return;
					}
					if (typeof(n.children) == 'undefined') {
						n.children = [];
					}
					for (var c in n.children) {
						attachOrgLabels(n.children[c]);
					}
					n.children.push({
						type: 'label',
						name: n.name
					});
				}

				let removeEmptyOrgs = function(o) {
					function isEmptyOrg(o) {
						return o.children ? o.children.findIndex(c => c.type === 'role ' || c.type === 'contributor') < 0 : false;
					}
					if (o.children)
					{
						// remove the empty ones
						o.children = o.children.filter(c => !isEmptyOrg(c) );
						// and repeat for the non-empty children
						o.children.forEach(c => removeEmptyOrgs(c));
					}
				}

				// build the view-centric object tree from the models
				org.level = 0;
				populateOrgChildren(org);
				if (this.state.roleMode) {
					attachOrgRoles(org);
				} else {
					attachOrgContributors(org);
					removeEmptyOrgs(org);
				}
				attachOrgLabels(org);

				data.organization = org;
			} else {
				Materialize.toast("Could not find organization: " + objectId, 3000);
				return {};
			}
		};
		return data;
	},

	updateOrganizationGraph() {
		if (!this.data.isLoading) {
			var org = this.data.organization; // as loaded from the db
			var zoomTo = this.props.objectType === 'contributor' ? this.props.objectId : this.props.zoomTo;

			// this is super FUCKED
			// no fucking clue why this has to relinquish control, but it must be react-related, or maybe a bug???
			setTimeout(function () {
				Chart.loadData(org, zoomTo);
			}, 0);
		}
	},

	componentWillUpdate(nextProps, nextState) {
		if (nextProps.roleMode != this.props.roleMode) {
			// detected role mode change!
		}
		console.log("componentWillUpdate called!");

		this.updateOrganizationGraph();
	},

	componentDidMount() {
		console.log("org component mounted");
		this.updateOrganizationGraph();
	},

	renderLoading() {
		if (this.data.isLoading) {
			return (
				<div className="centeredItem">
					<Loading/>
				</div>
			);
		}
	},

	renderRoleModeSwitch() {
		if (this.props.roleModeVisible) {
			return (
				<div className="section center">
					<div className="switch">
						<label>
							Role
							<input type="checkbox" checked={!this.state.roleMode} ref="roleMode" onChange={this.handleRoleModeChanged}/>
							<span className="lever" />
							Individual
						</label>
					</div>
				</div>
			);
		}
	},

	renderSearch() {
		if (this.props.searchVisible) {
			return (
				<div>
					<ObjectSearch onClick={this.handleSearch} findContributors={true} findOrganizations={true}/>
				</div>
			);
		}
	},

	render() {
		var divStyle = {
			height: h = screen.width < 700 ? chartHeightMobile : chartHeight,
		};

		return (
			<div className="center">
				{this.renderRoleModeSwitch()}
				{this.renderSearch()}
				{this.renderLoading()}
				<div className="chartContainer" style={divStyle}>
				</div>
				<div className="clear-block"/>
			</div>
		);
	}
});

