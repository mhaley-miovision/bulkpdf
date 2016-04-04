import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';
import { createContainer } from 'meteor/react-meteor-data';

import '../third_party/Chart'

import { ContributorsCollection } from '../../../api/contributors'
import { SkillsCollection } from '../../../api/skills'

import Loading from '../Loading.jsx'

class SkillsSummary extends Component {

	componentDidUpdate(prevProps, prevState) {
		if (this.props.skills) {
			this.updateChart();
		}
	}

	updateChart() {
		let _this = this;

			$("#skillsPolarGraph").remove();
			$('#skillsPolarGraphContainer').append('<canvas id="skillsPolarGraph"><canvas>');

			// Get context with jQuery - using jQuery's .get() method.
			var ctx = $("#skillsPolarGraph").get(0).getContext("2d");
			// This will get the first returned node in the jQuery collection.
			var myNewChart = new Chart(ctx);

			var labels = [];
			var data = [];
			_this.props.skills.forEach(s => {
				labels.push(s.skill);
				data.push(s.rating);
			});

			var data = {
				labels: labels,
				datasets: [
					{
						label: "Skills",
						fillColor: "rgba(220,220,220,0.2)",
						strokeColor: "rgba(220,220,220,1)",
						pointColor: "rgba(220,220,220,1)",
						pointStrokeColor: "#fff",
						pointHighlightFill: "#fff",
						pointHighlightStroke: "rgba(220,220,220,1)",
						data: data
					},
				]
			};

			// create the chart!
			new Chart(ctx).Radar(data, Chart.defaults.Radar );

	}

	renderCanvas() {
		if (this.props.skills.length > 0) {
			return (
				<div id="skillsPolarGraphContainer">
					<canvas id="skillsPolarGraph" width="175px" height="175px" className="skillsPolarGraph"></canvas>
				</div>
			);
		} else {
			return (
				<div className="grey-text">
					<p style={{textAlign:"center"}}>
						{this.props.name} has no skills defined yet.
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
						<li className="collection-header summaryCardHeader">Skills</li>
						{this.renderCanvas()}
					</ul>
				</div>
			);
		} else {
			return <Loading spinner={true}/>
		}
	}
}

SkillsSummary.propTypes = {
	objectId: React.PropTypes.string.isRequired,
};

export default createContainer((params) => {
	"use strict";

	let handle = Meteor.subscribe("teal.contributors");
	let handle2 = Meteor.subscribe("teal.skills");

	const { objectId } = params;

	if (handle.ready() && handle2.ready()) {
		let c = ContributorsCollection.findOne({email: objectId});
		let s = SkillsCollection.find({email: objectId }).fetch();
		return { skills: s, doneLoading: true, name: c.name };
	} else {
		return { doneLoading: false };
	}
}, SkillsSummary);
