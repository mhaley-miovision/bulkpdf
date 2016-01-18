var Chart = (function () {
	var root_2 = Math.sqrt(2),
		w = screen.width < 700 ? 303 : 700,
		h = screen.width < 700 ? 303 : 700,
		r = screen.width < 700 ? 270 : 650,
		x = d3.scale.linear().range([0, r]),
		y = d3.scale.linear().range([0, r]),
		node,
		root,
		vis, pack,
		zoomedToRole,
		$roleDetails,
		zoomed,
		loaded,
		color = d3.scale.linear()
			.domain([-1, 18])
			.range(["hsl(0,0%,100%)", "hsl(228,30%,40%)"])
			.interpolate(d3.interpolateHcl);

	function classesForNode(d) {
		var classes = [];
		classes.push(d.children ? "parent" : "child");
		classes.push(d.type === "contributor" ? "role" : d.type);
		if (d.type === 'role' || d.type === 'contributor') {
			classes.push(d.contributor || d.type == "contributor" ? "filled" : "unfilled");
		}
		if (d.structural_role) {
			classes.push("structural");
		}
		if (d.core_role) {
			classes.push("core-role");
		}
		if (d.role_alert) {
			classes.push("alert");
		}
		if (d.type === 'label') {
			classes.push("text-main1");
		}
		return classes.join(" ");
	}

	function foreignObjectHtml(d) {
		d.url = "#";
		var content = '<div class="d3label"><div class="title"><a href="' + d.url + '" class="' + classesForNode(d) + '">'
			+ _.escape(d.name ? d.name : d.contributor) + '</a></div>';
		return content + '</div>';
	}

	function showTitle(d, scalingFactor) {
		if (d.type === 'role' || d.type === 'contributor')
			return scalingFactor * d.r > 20;
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
			});
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
					fos.style("opacity", function (d) {
						return showTitle(d, k) ? 1 : 0;
					});
				},
				makeFontSizer: function(factor) {
					return function (d) {
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

		zoomToOrg: function (zoomToOrg) {
			if (zoomToOrg) {
				if (this.orgNameToNode[zoomToOrg]) {
					this.zoom(this.orgNameToNode[zoomToOrg], true);
				} else {
					console.log("this.orgNameToNode[zoomToOrg] is undefined");
				}
			} else {
				console.log("zoomToOrg is undefined");
			}
		},

		zoom: function (zoomTo, shouldAnimate = false) {
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
				.height($('#js-role-details').height() - $roleBody.position().top)
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


		/* TODO: To make this callable upon update, I should split this out into the initialization and update function,
			which calls enter/update/exit and transitions in between to make for a smooth switch when properties are
			updated :)

			Note that this is an additive only method - I need to modify this to remove nodes as well
		* */
		loadData: function (data, zoomToOrg) {
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
			$roleDetails = $('#js-role-details');
			var nodes = pack.nodes(root);

			// add the circles
			var circles = vis.selectAll("organization").data(nodes).enter().append("svg:circle");
			initCircles(circles);

			// create map of orgName -> node
			this.orgNameToNode = [];
			nodes.filter(n => n.type == "organization").forEach(n => this.orgNameToNode[n.name] = n);

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

				console.log("*** CIRCLE CLICK ZOOM***");
				console.log(zoomTo);

				function loadRoleDetails(id) {
					$roleDetails.html("<b>This is a test</b>");
					//vis.selectAll('.title').style('opacity', '0');
					$roleDetails.attr('class', 'role-details ' + classesForNode(zoomTo));
					Chart.setRoleDetailHeight();
				}

				if (zoomTo.type == 'role') {
					loadRoleDetails(zoomTo.id);
				}
				Chart.zoom(zoomTo, true);
			});

			d3.select(".chartContainer").on("click", function () {
				Chart.zoom(root, true);
			})

			if (zoomToOrg && this.orgNameToNode[zoomToOrg])
			{
				Chart.zoom(this.orgNameToNode[zoomToOrg]);
			} else {
				Chart.zoom(root, false);
			}
		}
	};
})();

Organization = React.createClass({
	mixins: [ReactMeteorData],

	propTypes: {
		org : React.PropTypes.string.isRequired,
		roleMode : React.PropTypes.bool,
	},

	getDefaultProperties() {
		return {
			roleMode: true
		}
	},

	getInitialState() {
		return {
			initialLoad: true,
		}
	},

	// TODO: move some of this log into server-side methods
	getMeteorData() {
		var handle1 = Meteor.subscribe("organizations");
		var handle2 = Meteor.subscribe("roles");
		var handle3 = Meteor.subscribe("contributors");
		var handle4 = Meteor.subscribe("job_accountabilities");
		var handle5 = Meteor.subscribe("org_accountabilities");

		var data = { isLoading: !handle1.ready() && !handle2.ready() && !handle3.ready() && !handle4.ready() && !handle5.ready() };

		if (!data.isLoading) {

			// TODO: SHOULD OPTIMIZE THESE QUERIES TO USE THE DB MORE RATHER THAN DO THIS CLIENT-SIDE

			let org = OrganizationsCollection.findOne({ name: this.props.org });
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
							o.children.push(r[x]);
						}
					}
				}

				let attachOrgContributors = function (o) {
					if (typeof(o.children) === 'undefined') {
						o.children = [];
					}
					o.children.forEach(c => attachOrgContributors(c));
					let q = ContributorsCollection.find({physicalTeam: o.name});
					if (q.count() > 0) {
						var r = q.fetch();
						for (var x in r) {
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
				if (this.props.roleMode) {
					attachOrgRoles(org);
				} else {
					attachOrgContributors(org);
					removeEmptyOrgs(org);
				}
				attachOrgLabels(org);

				data.organization = org;
			} else {
				Materialize.toast("Could not find organization: " + this.props.org, 3000);
				return {};
			}
		};
		return data;
	},

	zoomToOrg(orgName) {
		console.log(orgName);
		Chart.zoomToOrg(orgName);
	},

	componentWillUpdate(nextProps, nextState) {
		if (!this.data.isLoading) {
			var org = this.data.organization; // as loaded from the db
			var zoomToOrg = this.state && this.state.zoomToOrg ? this.state.zoomToOrg : "";

			if (nextProps.roleMode != this.props.roleMode) {
				// detected role mode change!
			}

			console.log("componentWillUpdate called!");

			// this is super FUCKED
			// no fucking clue why this has to relinquish control, but it must be react-related, or maybe a bug???
			setTimeout(function(){ Chart.loadData(org, zoomToOrg); }, 0);
		};
	},

	shouldComponentUpdate(nextProps, nextState) {
		// let d3 do the updating!
		console.log("shouldComponentUpdate called for component with root: " + this.props.org);

		if (this.props.roleMode != nextProps.roleMode) {
			// update the role vs ic mode
			console.log("detected switch of role vs IC mode!");
		}

		return true;
	},

	componentDidMount() {
		console.log("org component mounted");
	},

	renderLoading() {
		if (this.data.isLoading) {
			return <Loading/>;
		}
	},

	render() {
		return (
			<div>
				<div className="chartContainer">
					{this.renderLoading()}
				</div>
				<div className="clear-block"/>
			</div>
		);
	}
});

