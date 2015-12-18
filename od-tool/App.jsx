// App component - represents the whole app
App = React.createClass({
	handleFeedbackClick() {
		this.refs.feedback.showDialog();
	},

    render() {
        return (
            <div>
                <header>
                    <NavbarComponent />
                </header>

                <main>
                    <div className="container">
                        {this.props.yield}
                    </div>

					<FeedbackComponent modalId="feedbackModal" ref="feedback"/>
                </main>

                <br/>

                <footer className="page-footer teal">
					<div className="container">
						<div className="row">
							<div className="col s9">
								<h5 className="white-text">Help us develop this software</h5>
								<p className="grey-text text-lighten-4">"Your feedback can help us build this software
									to serve our organization as we scale. Please assist us by reporting bugs,
									suggesting features, or just letting us know how we're doing" - Vic</p>

							</div>
							<div className="col s3">
								<br />
								<button className="btn waves-effect waves-light teal lighten-3 center"
										onClick={this.handleFeedbackClick}>Provide Feedback
								</button>
							</div>
						</div>
					</div>

                    <div className="footer-copyright">
                        <div className="container">
                            © 2016 Miovision OD Tool
                        </div>
                    </div>
                </footer>
            </div>
        );
    }
});

if (Meteor.isClient) {
    $(document).ready(function(){
        $('.parallax').parallax();
    });
}


