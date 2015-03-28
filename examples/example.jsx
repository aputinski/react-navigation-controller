const React = require('react');
const NavigationController = require('../src/navigation-controller')

class ViewA extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      counter: 0
    }
  }
  onNext() {
    this.props.navigationController.pushView(
      <ViewB />
    );
  }
  incrementCounter() {
    this.setState({
      counter: this.state.counter + 1
    });
  }
  render() {
    return (
      <div className="ReactNavigationControllerViewContent" style={{background:'#0074D9'}}>
        <div>
          <h1>View A</h1>
          <button onClick={this.onNext.bind(this)}>Next</button>
          <button onClick={this.incrementCounter.bind(this)}>
            Increment Counter ({this.state.counter})
          </button>
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
      <div className="ReactNavigationControllerViewContent" style={{background:'#001f3f'}}>
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