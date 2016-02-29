GoalsStatsDonut = React.createClass({
	propTypes: {
		goal: React.PropTypes.object.isRequired,
		width: React.PropTypes.string,
		height: React.PropTypes.string,
	},

	getInitialState() {
		return { chartId: "chart_" + Math.floor((1 + Math.random()*1000)) };
	},

	getDefaultProps() {
		return { width: "120px", height: "120px" };
	},

	getChartId() {
		return this.state.chartId;
	},

	updateChart() {
		let _this = this;

		var g = _this.props.goal;
		var data = [
			{
				value: g.stats.completed,
				color:"#46BFBD",
				highlight: "#FF5A5E",
				label: "Completed"
			},
			{
				value: g.stats.inProgress,
				color:"#FDB45C",
				highlight: "#FFC870",
				label: "In Progress"
			},
			{
				value: g.stats.notStarted,
				color: "#ff6666",
				highlight: "#FF5A5E",
				label: "Not Started",
			},
		];

		var ctx = $('#'+_this.getChartId()).get(0).getContext("2d");
		new Chart(ctx).Doughnut(data,{
			animation:true,
			animationSteps: 35,
			responsive: true,
			showTooltips: false,
			percentageInnerCutout : 80,
			segmentShowStroke : false,
			onAnimationComplete: function() {
				var canvasWidthvar = $('#'+_this.getChartId()).width();
				var canvasHeight = $('#'+_this.getChartId()).height();

				//this constant base on canvasHeight / 2.8em
				var constant = 104;
				var fontsize = (canvasHeight/constant).toFixed(2);
				ctx.font=fontsize +"em Verdana";
				ctx.textBaseline="middle";
				ctx.fillStyle = "#999999";
				var total = 0;
				$.each(data,function() {
					total += parseInt(this.value,10);
				});
				var tpercentage = ((data[0].value/total)*100).toFixed(2)+"%";
				var textWidth = ctx.measureText(tpercentage).width;

				var txtPosx = Math.round((canvasWidthvar - textWidth)/2);
				ctx.fillText(tpercentage, txtPosx, canvasHeight/2);
			}
		});
	},

	componentDidMount() {
		this.updateChart();
	},

	areSameStats(p1, p2) {
		if (!!p1.goal && !!p2.goal && !!p1.goal.stats && !!p2.goal.stats) {
			return p1.goal.stats.inProgress === p2.goal.stats.inProgress
				&& p1.goal.stats.completed === p2.goal.stats.completed
				&& p1.goal.stats.notStarted === p2.goal.stats.notStarted;
		}
		return false;
	},

	componentDidUpdate(prevProps, prevState) {
		console.log("udpating on componentDidUpdate")
		if (!this.areSameStats(prevProps, this.props)) {
			this.updateChart();
		}
	},

	render() {
		return (
			<div style={{width:this.props.width, height: this.props.height}} className="goalDonutChart">
				<canvas id={this.getChartId()} width={this.props.width} height={this.props.height}>
				</canvas>
			</div>
		);
	}
});