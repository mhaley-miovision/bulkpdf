OrganizationComponent = React.createClass({

	componentDidMount() {
		this.graph = this.main(this.refs.graphContainer);

		console.log(this.refs);

		this.refs.zoomInButton.onclick = this.handleZoomIn;
		this.refs.zoomOutButton.onclick = this.handleZoomOut;
	},

	handleZoomIn() {
		this.graph.zoomIn();
	},

	handleZoomOut() {
		this.graph.zoomOut();
	},

	render() {
		return (
			<div className="graphEditorRoot">
				<a href="#" ref="zoomInButton" >
					<i className="material-icons">zoom_in</i>
				</a>
				<a href="#" ref="zoomOutButton" >
					<i className="material-icons">zoom_out</i>
				</a>
				<div ref="graphContainer"
					 className="graphContainer">
				</div>
			</div>
		);
	},

	// Program starts here. Creates a sample graph in the
	// DOM node with the specified ID. This function is invoked
	// from the onLoad event handler of the document (see below).
	main(container)
	{
		// Checks if the browser is supported
		if (!mxClient.isBrowserSupported())
		{
			// Displays an error message if the browser is not supported.
			mxUtils.error('Browser is not supported!', 200, false);

			return null;
		}
		else
		{
			// Creates the graph inside the given container
			var graph = new mxGraph(container);
			graph.centerZoom = false;

			// Links level of detail to zoom level but can be independent of zoom
			graph.isCellVisible = function(cell)
			{
				return cell.lod == null || cell.lod / 2 < this.view.scale;
			};

			// Gets the default parent for inserting new cells. This
			// is normally the first child of the root (ie. layer 0).
			var parent = graph.getDefaultParent();

			// Adds cells to the model in a single step
			graph.getModel().beginUpdate();
			try
			{
				var v1 = graph.insertVertex(parent, null, '1', 20, 20, 80, 30);
				v1.lod = 1;
				var v2 = graph.insertVertex(parent, null, '1', 200, 150, 80, 30);
				v2.lod = 1;
				var v3 = graph.insertVertex(parent, null, '2', 20, 150, 40, 20);
				v3.lod = 2;
				var v4 = graph.insertVertex(parent, null, '3', 200, 10, 20, 20);
				v4.lod = 3;
				var e1 = graph.insertEdge(parent, null, '2', v1, v2, 'strokeWidth=2');
				e1.lod = 2;
				var e2 = graph.insertEdge(parent, null, '2', v3, v4, 'strokeWidth=2');
				e2.lod = 2;
				var e2 = graph.insertEdge(parent, null, '3', v1, v4, 'strokeWidth=1');
				e2.lod = 3;
			}
			finally
			{
				// Updates the display
				graph.getModel().endUpdate();
			}

			return graph;
		}
	}

});