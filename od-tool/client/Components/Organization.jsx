var Chart = (function () {
	var root_2 = Math.sqrt(2),
		w = 800,
		h = 800,
		r = 750,
		x = d3.scale.linear().range([0, r]),
		y = d3.scale.linear().range([0, r]),
		node,
		root,
		vis, pack,
		zoomedToRole,
		$roleDetails,
		zoomed,
		loaded;

	function browserSupportsForeignObjects() {
		return typeof SVGForeignObjectElement !== 'undefined';
	}

	function classesForNode(d) {
		var classes = [];
		classes.push(d.children ? "parent" : "child");
		classes.push(d.type);
		if (d.type === 'role') {
			classes.push(d.filled ? "filled" : "unfilled");
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
		return classes.join(" ");
	}

	function foreignObjectHtml(d) {
		d.url = "#";
		var content = '<div class="d3label"><div class="title"><a href="' + d.url + '" class="' + classesForNode(d) + '">' + _.escape(d.name) + '</a></div>';
		return content + '</div>';
	}

	function showTitle(d, scalingFactor) {
		return scalingFactor * d.r > 20;
	}

	function showRoleDetails(d, scalingFactor) {
		return d.type === 'role' ? scalingFactor * d.r >= r / 2 : showTitle(d, scalingFactor);
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

	function addIeLinks(foreignObjects) {
		foreignObjects.append("svg:a")
			.attr("xlink:href", function (d) {
				return d.url;
			})
			.append("svg:text")
			.attr("class", classesForNode)
			.attr("x", dx)
			.attr("y", dy)
			.attr("dy", ".35em")
			.attr("text-anchor", "middle")
			.style("opacity", function (d) {
				return showTitle(d, 1) ? 1 : 0;
			})
			.text(function (d) {
				return _.escape(d.name);
			})
			.call(d3.wrap, 40);
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
			.attr("cx", dx)
			.attr("cy", dy)
			.attr("r", function (d) {
				return d.r;
			})
			.attr("title", function (d) {
				return _.unescape(d.name);
			})
	}

	return {
		transitionDuration: function () {
			return 750
		},

		zoomFunctions: function (k) {
			return {
				foreignObjSize: function(d) {
					return d.r * k * 2 / root_2;
				},
				setOpacity: function(fos) {
					fos.style("opacity", function (d) {
						return showTitle(d, k) ? 1 : 0;
					});
				},
				makeFontSizer: function(factor) {
					return function (d) {
						return parseInt(Math.min(Math.max(10, Chart.zoomFunctions(k).foreignObjSize(d) / factor), 32)) + 'px';
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

		zoom: function (zoomTo, i) {
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
				.duration(d3.event ? (d3.event.altKey ? 3.5 * Chart.transitionDuration() : Chart.transitionDuration()) : 0);

			t.each("end", function () {
				if (zoomTo.type == 'role') {
					Chart.enterRole(zoomTo);
				}
				zoomed = true;
				Chart.setRoleDetailHeight();
			});
			zoomCircles(t, k);
			var fos = t.selectAll(".foreign-object");
			var labelFos = t.selectAll('.foreign-object.label');
			zoomFos(labelFos, zf, 3, 2.5, zf.labelWidth);
			zf.setOpacity(labelFos);

			var fos = t.selectAll(".foreign-object");
			var roleFos = t.selectAll('.foreign-object.role');
			zoomFos(roleFos, zf, 1, 6, zf.foreignObjSize);
			zf.setOpacity(roleFos);

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
			vis.selectAll('.title').style('opacity', '1');
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
			if (a.type == 'label') {
				return 1
			} else if (b.type == 'label') {
				return -1
			} else if (a.type == 'organization' && b.type == 'role') {
				return 1
			} else if (b.type == 'organization' && a.type == 'role') {
				return -1
			}
			return 0
		},

		loadData: function (data) {
			console.log(JSON.stringify(data));

			pack = d3.layout.pack()
				.size([r, r])
				.sort(Chart.comparator)
				.value(function (d) {
					//return 5;
					return 5 + Math.random() * 95;
				})
				.padding(0.2);

			$("#js-chart-container").empty();
			vis = d3.select("#js-chart-container").insert("svg:svg", "h2")
				.attr("width", w)
				.attr("height", h)
				.append("svg:g")
				.attr("transform", "translate(" + (w - r) / 2 + "," + (h - r) / 2 + ")");

			node = root = data;

			$roleDetails = $('#js-role-details');

			var nodes = pack.nodes(root);

			var circles = vis.selectAll("organization").data(nodes).enter().append("svg:circle");
			//var circles = vis.selectAll("circle").data(nodes).enter().append("svg:circle");
			initCircles(circles);
			// only add labels to roles
			var foreignObjects = vis.selectAll(".foreign-object")
				.data(nodes.filter(function (d) {
					console.log(d.type);
					return d.type !== 'organization';
				}))
				.enter();

			if (browserSupportsForeignObjects()) {
				circles.on("click", function (d) {
					var zoomTo = node === d ? root : d;

					function loadRoleDetails(id) {
						// do something!
					}

					if (zoomTo.type == 'role') {
						loadRoleDetails(zoomTo.id);
					}
					var t = Chart.zoom(zoomTo);
				});
				addForeignObjects(foreignObjects);

				Chart.zoom(root);
			} else {
				circles.on("click", Chart.clickIe);
				addIeLinks(foreignObjects);
				Materialize.toast("You are using an unsupported browsers! Please use Chrome or FireFox.");
			}
		}
	};
})();

OrganizationComponent = React.createClass({
	mixins: [ReactMeteorData],

	getMeteorData() {
		var handle1 = Meteor.subscribe("organizations");
		var handle2 = Meteor.subscribe("roles");
		var handle3 = Meteor.subscribe("contributors");
		var handle4 = Meteor.subscribe("job_accountabilities");
		var handle5 = Meteor.subscribe("org_accountabilities");

		var data = { isLoading: !handle1.ready() && !handle2.ready() && !handle3.ready() && !handle4.ready() && !handle5.ready() };

		if (!data.isLoading) {
			let orgName = "Miovision";
			let org = OrganizationsCollection.findOne({ name: orgName });
			let o = { name: org.name, id: org.id, type: 'organization' };

			if (org) {
				// helper to build tree
				getOrgChildren = function (o) {
					var c = [];
					var query = OrganizationsCollection.find({parent: o});
					if (query.count() > 0) {
						var r = query.fetch();

						for (var x in r) {
							r[x].children = getOrgChildren(r[x].name); // add the children of the child

							c.push({
								name: r[x].name,
								id: r[x].id
							});

							//c.push(r[x]); // add the child
						}
						return c;
					}
					return [];
				}

				// append label children
				attachLabelChildren = function(n) {
					if (typeof(n.children) == 'undefined') {
						n.children = [];
					}
					for (var c in n.children) {
						attachLabelChildren(n.children[c]);
					}
					n.children.push({
						type: 'label',
						name: n.name
					});
				}

				o.children = getOrgChildren(o.name);

				attachLabelChildren(o);

				data.organization = o;
			} else {
				Materialize.toast("Could not find organization: " + orgName);
				return {};
			}
		};
		return data;
	},

	componentDidMount() {
	},

	componentWillUpdate(nextProps, nextState) {
		if (!this.data.isLoading) {
			var org = this.data.organization;

			// this is super FUCKED
			// no fucking clue why this has to relinquish control, but it must be react-related, or maybe a bug???
			setTimeout(function(){ Chart.loadData(org); }, 0);
		};
	},

	render() {
		if (this.data.isLoading) {
			return (
				<div className="container">
					<div className="progress">
						<div className="indeterminate"></div>
					</div>
				</div>
			);
		} else {
			return (
				<div className="container">
					<div ref="js-chart-container" id="js-chart-container"></div>
					<div className="clear-block"></div>
				</div>
			);
		}
	}
});

