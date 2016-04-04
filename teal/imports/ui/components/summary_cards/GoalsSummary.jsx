import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';
import { createContainer } from 'meteor/react-meteor-data';

import Teal from '../../../shared/Teal'

import { RolesCollection } from '../../../api/roles'
import { GoalsCollection } from '../../../api/goals'

import GoalListModal from '../goals/GoalListModal.jsx'
import Loading from '../Loading.jsx'

class GoalsSummary extends Component {
	constructor(props) {
		super(props);
		this.handleAddGoalsNudge = this.handleAddGoalsNudge.bind(this);

		if (props.goals && props.goals.length > 0) {
			this.updateChart();
		}
	}

	notImplemented() {
		Materialize.toast( "Not implemented yet, stay tuned!", 1000);
	}

	renderGoalsControls(g) {
		let controls = [];

		// public controls
		controls.push(
			<a key={g._id+"1"} onClick={this.notImplemented} className="secondary-content">
				<i className="material-icons summaryCardIcon grey-text">message</i>
			</a>
		);

		// private controls
		// TODO: check for permissions here

		controls.push(
			<a key={g._id+"2"} onClick={this.notImplemented} className="secondary-content">
				<i className="material-icons summaryCardIcon grey-text">thumb_down</i>
			</a>
		);
		controls.push(
			<a key={g._id+"3"} onClick={this.notImplemented} className="secondary-content">
				<i className="material-icons summaryCardIcon grey-text">thumb_up</i>
			</a>
		);

		return controls;
	}

	renderLateGoals() {
		if (this.props.doneLoading) {
			return this.props.lateGoals.map(g => {
				return (
					<li className="collection-item" key={g._id}>
						<div className="collection-item-text">
							{g.name},
						</div>
						{this.renderGoalsControls(g)}
					</li>
				);
			});
		}
	}

	getLateClasses() {
		let classes = "goalDueDate right";
		if (this.props.lateGoals.length > 0) {
			classes += " late";
		}
		return classes;
	}

	renderLateGoalsHeader() {
		if (this.props.lateGoals.length > 0) {
			return (
				<li className="collection-item summaryCardSubHeader" key="goalSummary4">
					Late goals
				</li>
			);
		}
	}

	componentDidUpdate(prevProps, prevState) {
		if (this.props.goals) {
			this.updateChart();
		}
	}

	updateChart() {
		let _this = this;
		setTimeout(function () {
			// Get context with jQuery - using jQuery's .get() method.
			var ctx = $("#goalDonutChart").get(0).getContext("2d");

			// This will get the first returned node in the jQuery collection.
			var c = new Chart(ctx);
			var g = _this.props.summaryGoal;
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

			var ctx = $('#goalDonutChart').get(0).getContext("2d");

			var myDoughnut = new Chart(ctx).Doughnut(data,{
				animation:true,
				animationSteps: 50,
				responsive: true,
				showTooltips: false,
				percentageInnerCutout : 80,
				segmentShowStroke : false,
				onAnimationComplete: function() {
					var canvasWidthvar = $('#goalDonutChart').width();
					var canvasHeight = $('#goalDonutChart').height();
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
		}, 50);
	}

	handleAddGoalsNudge() {
		Materialize.toast("Functionality coming soon, stay tuned.", 1000);
	}

	showGoalsModal() {
		// TODO: move this to a method on the component
		$('#userGoalListModalId').openModal();
	}

	renderSection() {
		if (this.props.doneLoading && this.props.goals.length) {
			var url = FlowRouter.path("goalsList", {}, {objectId:this.props.objectId});
			var goalsSection = [];
			goalsSection.push(
				<li className="collection-item" key="goalSummary1">
					<div style={{width:"120px", height: "120px"}} className="goalDonutChart">
						<canvas id="goalDonutChart" width="90" height="90">
						</canvas>
					</div>
				</li>
			);
			goalsSection.push(
				<li className="collection-item" key="goalSummary2">
					<div className="collection-item-text">{this.props.goals.length} Goals
						(<a className="tealLink" onClick={ this.showGoalsModal }>view all</a>)
					</div>
					<a className="secondary-content" onClick={ this.showGoalsModal }>
						<i className="material-icons summaryCardIcon grey-text">search</i>
					</a>
				</li>
			);
			goalsSection.push(
				<li className="collection-item" key="goalSummary3">
					<div className="collection-item-text">Number of overdue goals: </div>
					<span className={this.getLateClasses()} style={{margin:"4px 10px 0 0"}}>{this.props.lateGoals.length} late</span>
				</li>
			);
			goalsSection.push(this.renderLateGoalsHeader());
			goalsSection.push(this.renderLateGoals());
			goalsSection.push(<GoalListModal key="userGoalListModalId" id="userGoalListModalId" goalList={this.props.goals}/>);
			return goalsSection;
		} else {
			return (
				<div className="grey-text">
					<p style={{textAlign:"center"}}>
						This person has no goals defined yet.<br/>
						<a className="tealLink" onClick={this.handleAddGoalsNudge}>Nudge them to add some.</a>
					</p>
				</div>
			);
		}
	}

	render() {
		if (this.props.doneLoading) {
			return (
				<div>
					<ul className="collection with-header">
						<li className="collection-header summaryCardHeader">Goals</li>
						{this.renderSection()}
					</ul>
				</div>
			);
		} else {
			return <Loading spinner={true}/>
		}
	}
}

GoalsSummary.propTypes = {
	objectId: React.PropTypes.string.isRequired,
};

export default createContainer((params) => {
	"use strict";

	let handle = Meteor.subscribe("teal.goals");

	const { objectId } = params;

	if (handle.ready()) {
		// get this person's top goals
		let allRolestopGoals = RolesCollection.find(
			{email:objectId},
			{fields:{topGoals:1}}).map(x => {return x.topGoals});
		let goalIds = [];
		allRolestopGoals.forEach(topGoalsForRole => {
			goalIds = goalIds.concat(topGoalsForRole);
		});
		let goals = GoalsCollection.find( {_id: {$in: goalIds} }).fetch();

		// summarize late goals, and sum up totals
		let notStarted = 0, inProgress = 0, completed = 0;
		let lateGoals = [];
		goals.forEach(g => {
			var gd = g.dueDate ? new Date(g.dueDate) : null;
			var complete = g.state == 2;
			var overdue = gd && (gd < new Date());
			if (!complete && overdue) {
				lateGoals.push(g);
			}
			notStarted += g.stats.notStarted;
			inProgress += g.stats.inProgress;
			completed += g.stats.completed;
		});

		let summaryGoal = { name: "Goal completion", stats: { notStarted:notStarted, inProgress:inProgress, completed:completed }  };
		let data = { doneLoading: true, goals: goals, summaryGoal: summaryGoal, lateGoals: lateGoals };
		return data;
	} else {
		return { doneLoading: false };
	}
}, GoalsSummary);
