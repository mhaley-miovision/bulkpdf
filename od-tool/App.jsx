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
                    <div className="footer-copyright">
                        <div className="container">
                            © 2016 Miovision OD Tool
                            <a className="grey-text text-lighten-4 right modal-trigger"
							   onClick={this.handleFeedbackClick}>Provide Feedback</a>
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


