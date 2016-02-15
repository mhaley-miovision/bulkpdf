var chartHeight = 700;
var chartHeightMobile = 700;
var chartWidth = 1024;
var chartWidthMobile = 303;
var donutChartRadius = 16;
var duration = 250;
var rectW = 200;
var rectH = 80;
var nodeMargin = 10;

// Topdown card view

var TreeView = (function() {
	var width = screen.width < 700 ? chartWidthMobile : chartWidth;
	var height = screen.width < 700 ? chartHeightMobile : chartHeight;
	var zoomAnchorX = width / 2 - rectW / 2;
	var zoomAnchorY = 20;
	var zoomedNode = null;

	function findNodeByName(startNode, nodeName) {
		if (startNode && nodeName) {
			if (getName(startNode).toLowerCase() === nodeName.toLowerCase()) {
				return startNode;
			}
			if (startNode.children && startNode.children.length > 0) {
				for (var c in startNode.children) {
					var n = findNodeByName(startNode.children[c], nodeName);
					if (n) {
						return n;
					}
				}
			}
		}
		return null;
	}

	var i = 0;

	var tree = d3.layout.tree().nodeSize([rectW + nodeMargin, rectH + nodeMargin]);
	var diagonal = d3.svg.diagonal()
		.projection(function (d) {
			return [d.x + rectW / 2, d.y + rectH / 2];
		});

	var zm = d3.behavior.zoom().scaleExtent([1,3]).on("zoom", redraw);

	var svg;

	function collapse(d) {
		if (d.children) {
			d._children = d.children;
			d._children.forEach(collapse);
			d.children = null;
		}
	}

	function treeNodeNameText(original) {
		if (original.length > 40) {
			return original.substring(0,33) + "...";
		} else {
			return original;
		}
	}

	function htmlForTreeNode(d) {
		var ownersHtmlString = '';
		for (var i in d.owners) {
			//url = "/organization?objectId=" + d.owners[i].email + "&objectType=contributor&mode=acc";
			//ownersHtmlString += '<a href="'+url+'"><img class="treeItemProfilePhoto" src="' + d.owners[i].photo + '" title="' + d.owners[i].email + '"/></a>';
			ownersHtmlString += '<img class="treeItemProfilePhoto" src="' + d.owners[i].photo + '" title="' + d.owners[i].email + '"/>';
		}

		return '<div class="d3treelabel"><div>' + treeNodeNameText(d.name) + '</div><div>' + ownersHtmlString + '</div>'
			+ '</div>';
	}

	function update(source) {

		// Compute the new tree layout.
		var nodes = tree.nodes(root).reverse(),
			links = tree.links(nodes);

		// Normalize for fixed-depth.
		nodes.forEach(function (d) {
			d.y = d.depth * 180;
		});

		// Update the nodes…
		var node = svg.selectAll("g.node")
			.data(nodes, function (d) {
				return d.id || (d.id = ++i);
			});

		// Enter any new nodes at the parent's previous position.
		var nodeEnter = node.enter().append("g")
			.attr("class", "node")
			.attr("transform", function (d) {
				return "translate(" + source.x0 + "," + source.y0 + ")";
			})
			.on("click", click);

		nodeEnter.append("rect")
			.attr("class", "goalTreeNodeRect")
			.attr("width", rectW)
			.attr("height", rectH)
			.attr("stroke", "black")
			.style("box-shadow", "5px 5px 3px #888888")
			.attr("stroke-width", 1);

		nodeEnter.append("foreignObject")
			.attr("class", "goalTreeNode")
			.classed("foreign-object", true)
			.attr("width", rectW)
			.attr("height", rectH)
			.append("xhtml:body") 
			.html(htmlForTreeNode);

		//=========================== drop shadows for the boxes //===========================//========================

		// filters go in defs element
		var defs = svg.append("defs");

		// create filter with id #drop-shadow
		// height=130% so that the shadow is not clipped
		var filter = defs.append("filter")
			.attr("id", "drop-shadow")
			.attr("height", "130%");

		// SourceAlpha refers to opacity of graphic that this filter will be applied to
		// convolve that with a Gaussian with standard deviation 3 and store result
		// in blur
		filter.append("feGaussianBlur")
			.attr("in", "SourceAlpha")
			.attr("stdDeviation", 5)
			.attr("result", "blur");

		// translate output of Gaussian blur to the right and downwards with 2px
		// store result in offsetBlur
		filter.append("feOffset")
			.attr("in", "blur")
			.attr("dx", 5)
			.attr("dy", 5)
			.attr("result", "offsetBlur");

		// overlay original SourceGraphic over translated blurred opacity by using
		// feMerge filter. Order of specifying inputs is important!
		var feMerge = filter.append("feMerge");

		feMerge.append("feMergeNode")
			.attr("in", "offsetBlur")
		feMerge.append("feMergeNode")
			.attr("in", "SourceGraphic");

		//=========================== donut chart //===========================//===========================

		var color = function(i) {
			if (i == 0) {
				return "#33cc33";
			} else if (i == 1) {
				return "#ffe166";
			} else if (i == 2) {
				return "#ff6666";
			}
			return "#888888";
		}

		var pie = d3.layout.pie()
			.sort(null);

		var arc = d3.svg.arc()
			.innerRadius(donutChartRadius - 10)
			.outerRadius(donutChartRadius - 5);

		var g1 = nodeEnter.append("g")
			.attr("class", "goalTreeDonutChart")
			.attr("width", donutChartRadius*2)
			.attr("height", donutChartRadius*2)
			.attr("transform", function (d) {
				return "translate(" + rectW/2 + "," + (rectH + donutChartRadius + 3) + ")";
				//return "translate(" + rectW/2 + "," + rectH + donutChartRadius + 5 + ")";
			});
		/*
			.append("circle")
				.attr("r", donutChartRadius-5)
				.attr("stroke", "black")
				.attr("fill", "none")
				.attr("stroke-width", 1);*/

		nodeEnter.each(function(d) {
			//var yy = 0;
			var p = g1.selectAll("path")
				.data(function(d) {
					//console.log("data" + yy++);
					//console.log("data being called for d=" + d.name);
					return pie([d.stats.completed, d.stats.inProgress, d.stats.notStarted])
				})
				.enter().append("path")
				.attr("fill", function(d, i) { return color(i); })
				.attr("d", arc);
		});

		//===========================//===========================//===========================//===========

		// Transition nodes to their new position.
		var nodeUpdate = node.transition()
			.duration(duration)
			.attr("transform", function (d) {
				return "translate(" + d.x + "," + d.y + ")";
			});

		nodeUpdate.select("rect")
			.attr("width", rectW)
			.attr("height", rectH)
			.attr("stroke", "black")
			.attr("stroke-width", 1)
			.style("filter", "url(#drop-shadow)")
			.style("fill", function (d) {
				return d._children ? "#74AFAD" : "#fff";
			});

		nodeUpdate.select("text")
			.style("fill-opacity", 1);

		// Transition exiting nodes to the parent's new position.
		var nodeExit = node.exit().transition()
			.duration(duration)
			.attr("transform", function (d) {
				return "translate(" + source.x + "," + source.y + ")";
			})
			.remove();

		nodeExit.select("rect")
			.attr("width", rectW)
			.attr("height", rectH)
			//.attr("width", bbox.getBBox().width)""
			//.attr("height", bbox.getBBox().height)
			.attr("stroke", "black")
			.attr("stroke-width", 1);

		nodeExit.select("text");

		// Update the links…
		var link = svg.selectAll("path.link")
			.data(links, function (d) {
				return d.target.id;
			});

		// Enter any new links at the parent's previous position.
		link.enter().insert("path", "g")
			.attr("class", "link")
			.attr("x", rectW / 2)
			.attr("y", rectH / 2)
			.attr("d", function (d) {
				var o = {
					x: source.x0,
					y: source.y0
				};
				return diagonal({
					source: o,
					target: o
				});
			});

		// Transition links to their new position.
		link.transition()
			.duration(duration)
			.attr("d", diagonal);

		// Transition exiting nodes to the parent's new position.
		link.exit().transition()
			.duration(duration)
			.attr("d", function (d) {
				var o = {
					x: source.x,
					y: source.y
				};
				return diagonal({
					source: o,
					target: o
				});
			})
			.remove();

		// Stash the old positions for transition.
		nodes.forEach(function (d) {
			d.x0 = d.x;
			d.y0 = d.y;
		});
	}

	function zoomToNode(source) {
		return;

		if (zoomedNode) {
			console.log("Prev node: ");
			console.log(zoomedNode);
		}

		scale = zm.scale();
		x = source.y0;
		y = -source.x0;


		x = x * scale - width / 2;
		y = y * scale - height / 2;

		console.log(source);
		/*
		console.log("scale: " + scale)
		console.log("source: " + source.x + "," + source.y);
		console.log("source.0: " + source.x0 + "," + source.y0);
		 */
		console.log("new: " + x + "," + y);

		d3.select('g').transition()
			.duration(duration)
			.attr("transform", "translate(" + x + "," + y + ")scale(" + scale + ")");

		zm.scale(scale);
		zm.translate([x, y]);

		zoomedNode = source;
	}

	// Toggle children on click.
	function click(d) {
		if (d.children) {
			d._children = d.children;
			d.children = null;
		} else {
			d.children = d._children;
			d._children = null;
		}
		update(d);
		zoomToNode(d);
	}

	// Redraw for zoom
	function redraw() {
		//console.log("here", d3.event.translate, d3.event.scale);
		svg.attr("transform",
			"translate(" + d3.event.translate + ")"
			+ " scale(" + d3.event.scale + ")");
	}

	return {
		loadData: function(data) {
			root = data;

			$(".chartContainer").empty();

			svg = d3.select(".chartContainer").append("svg").attr("width", width).attr("height", height)
				.call(zm).append("g")
				.attr("transform", "translate(" + zoomAnchorX + "," + zoomAnchorY + ")");

			//necessary so that zoom knows where to zoom and unzoom from
			zm.translate([zoomAnchorX, zoomAnchorY]);

			zoomedNode = root;

			root.x0 = 0;
			root.y0 = height / 2;

			if (root.children) {
				root.children.forEach(collapse);
			}
			update(root);

			d3.select(".chartContainer").style("height", "800px");
		}
	}
})();

Tree = React.createClass({
	mixins: [ReactMeteorData],

	propTypes: {
		objectId: React.PropTypes.string.isRequired,
		objectType: React.PropTypes.string,
	},

	getInitialState() {
		return {
			objectId: this.props.objectId,
			objectType: this.props.objectType,
		};
	},

	getDefaultProps() {
		return {
			objectType: "organization",
			searchVisible: true,
		}
	},

	// TODO: move some of this log into server-side methods
	getMeteorData() {
		var _this = this;

		if (this.state.objectType == 'organization') {
			Meteor.call("loadGoalTree", function (err, data) {
				_this.data.goals = data;
				_this.data.doneLoading = true;
				_this.updateTreeView();
			});
		} else if (this.state.objectType == 'contributor') {
			Meteor.call("loadGoalTreeForContributor", this.state.objectId, function (err, data) {
				_this.data.goals = data;
				_this.data.doneLoading = true;
				_this.updateTreeView();
			});
		}
		return this.data ? this.data : {};
	},

	handleSearch(objectId, objectType) {
		this.setState({objectId: objectId, objectType:objectType});
	},

	updateTreeView() {
		console.log("updating tree view!");
		if (this.data.doneLoading) {
			console.log("data is loaded, rendering tree");
			var goals = this.data.goals; // as loaded from the db
			// this is super FUCKED
			// no fucking clue why this has to relinquish control, but it must be react-related, or maybe a bug???
			setTimeout(function () {
				TreeView.loadData(goals);
			}, 0);
		} else {
			console.log("data isn't loaded yet");
		}
	},

	componentWillUpdate(nextProps, nextState) {
		if (nextProps.objectType != this.props.objectType) {
			// detected role mode change!
		}
		console.log("componentWillUpdate called!");

		this.updateTreeView();
	},

	shouldComponentUpdate(nextProps, nextState) {
		if (this.state.objectId === nextState.objectId) {
			return false;
		}

		return true;
	},

	componentDidMount() {
		console.log("tree component mounted");

		this.updateTreeView();
	},

	renderLoading() {
		if (this.data.isLoading) {
			return <Loading/>;
		}
	},

	renderSearch() {
		if (this.props.searchVisible) {
			return (
				<div>
					<ObjectSearch onClick={this.handleSearch} findContributors={true} findOrganizations={false}/>
				</div>
			);
		}
	},

	render() {
		var divStyle = {
			height: h = screen.width < 700 ? chartHeightMobile : chartHeight,
		};

		return (
			<div>
				{this.renderSearch()}
				{this.renderLoading()}
				<div className="chartContainer" style={divStyle}>
				</div>
				<div className="clear-block"/>
			</div>
		);
	}
});