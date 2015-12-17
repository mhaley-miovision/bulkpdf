// App component - represents the whole app
App = React.createClass({
    render() {
        return (
            <div>
                <header>
                    <NavbarComponent />
                </header>

                <div className="container">
                    {this.props.yield}
                </div>

                <br/>

                <footer>

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


