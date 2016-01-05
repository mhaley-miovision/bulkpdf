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

		load: function () {
			d3.json("/testData.json", Chart.loadData);
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
					console.log("makeFontSizer");
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
					console.log("'" + d.name + "'=" + s)
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
			} else if (a.type == 'circle' && b.type == 'role') {
				return 1
			} else if (b.type == 'circle' && a.type == 'role') {
				return -1
			}
			return 0
		},

		loadData: function (data) {
			pack = d3.layout.pack()
				.size([r, r])
				.sort(Chart.comparator)
				.value(function (d) {
					return d.size;
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
			var circles = vis.selectAll("circle").data(nodes).enter().append("svg:circle");
			initCircles(circles);
			var foreignObjects = vis.selectAll(".foreign-object")
				.data(nodes.filter(function (d) {
					return d.type !== 'circle';
				}))
				.enter();

			if (browserSupportsForeignObjects()) {
				circles.on("click", function (d) {
					var zoomTo = node === d ? root : d;

					function loadRoleDetails(id) {
						$.ajax({
							success: function (request) {
								$roleDetails.html(request);
								vis.selectAll('.title').style('opacity', '0');
								$roleDetails.attr('class', 'role-details ' + classesForNode(zoomTo));
								/*
								$roleDetails.find('.filled-by a, .role-notes a').tipsy({
									live: true,
									opacity: 1.0,
									fade: false,
									gravity: 'w'
								});
								*/
								loaded = true;
								Chart.setRoleDetailHeight();
							},
							error: function (request, status, error) {
								$roleDetails.html(request.responseText);
							},
							type: 'get',

							url: document.location.protocol + '//' + document.location.host + '/roles/' + id + '/chart_details'
						});
					}

					if (zoomTo.type == 'role') {
						loadRoleDetails(zoomTo.id);
					}
					var t = Chart.zoom(zoomTo);
				});
				addForeignObjects(foreignObjects);

				Chart.zoom(root);

				/*
				$('circle').tipsy({live: true, opacity: 1.0, fade: false, gravity: 'se', trigger: 'hover'});
				*/

			} else {
				circles.on("click", Chart.clickIe);
				addIeLinks(foreignObjects);
				$('#notice').html(util.unsupportedBrowserMessage());
			}
		}
	};
})();

OrganizationComponent = React.createClass({

	componentDidMount() {
		/*
		this.refs.zoomInButton.onclick = this.handleZoomIn;
		this.refs.zoomOutButton.onclick = this.handleZoomOut;
		*/

		if ($('#js-chart-container'	).length === 1) {
			Chart.load();
		} else {
			console.log("not good");
		}
	},

	handleZoomIn() {
		this.graph.zoomIn();
	},

	handleZoomOut() {
		this.graph.zoomOut();
	},

	render() {
		return (
			<div className="container">
				<div ref="js-chart-container" id="js-chart-container"></div>
				<div className="clear-block"></div>
			</div>
		);
	}
});

