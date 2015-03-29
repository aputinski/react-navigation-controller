const React = require('react');
const View = require('./view');

class ViewA extends View {
  constructor(props) {
    super(props);
    this.state = {
      counter: 0,
      color: '#001f3f'
    };
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
  renderContent() {
    return (
      <div>
        <h1>View A</h1>
        <button onClick={this.onNext.bind(this)}>Next</button>
        <button onClick={this.incrementCounter.bind(this)}>
          Increment Counter ({this.state.counter})
        </button>
      </div>
    );
  }
}

class ViewB extends View {
  constructor(props) {
    super(props);
    this.state = {
      color: '#0074D9'
    };
  }
  onBack() {
    this.props.navigationController.popView();
  }
  renderContent() {
    return (
      <div>
        <h1>View B</h1>
        <button onClick={this.onBack.bind(this)}>Back</button>
      </div>
    );
  }
}


module.exports = {
  ViewA,
  ViewB
};
