const React = require('react');
const NavigationController = require('../src/navigation-controller')

class ViewA extends React.Component {
  onNext() {
    this.props.navigationController.pushView(
      <ViewB />
    );
  }
  render() {
    return (
      <div className="ReactNavigationControllerViewContent" style={{background:'blue'}}>
        <div>
          <h1>View A</h1>
          <button onClick={this.onNext.bind(this)}>Next</button>
        </div>
      </div>
    );
  }
}

class ViewB extends React.Component {
  onBack() {
    this.props.navigationController.popView();
  }
  render() {
    return (
      <div className="ReactNavigationControllerViewContent" style={{background:'red'}}>
        <div>
          <h1>View B</h1>
          <button onClick={this.onBack.bind(this)}>Back</button>
        </div>
      </div>
    );
  }
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      views: [
        <ViewA />,
        <ViewB />
      ]
    }
  }
  render() {
    return (
      <NavigationController
        views={this.state.views} />
    );
  }
}

React.render(<App />, document.body);