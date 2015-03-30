const React = require('react');

const colors = [
  '#0074D9', '#7FDBFF',  '#39CCCC', '#2ECC40', '#FFDC00', '#FF851B', '#FF4136',
  '#F012BE', '#B10DC9' 
];

function getColor() {
  const color = colors.shift();
  colors.push(color);
  return color;
}

class View extends React.Component {
  constructor(props) {
    super(props);
    const now = new Date();
    this.state = {
      counter: 0,
      color: getColor(),
      time: `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`
    };
  }
  incrementCounter() {
    this.setState({
      counter: this.state.counter + 1
    });
  }
  onNext() {
    this.props.navigationController.pushView(
      <View index={this.props.index+1} />
    );
  }
  onBack() {
    this.props.navigationController.popView();
  }
  render() {
    return (
      <div
        className="ReactNavigationControllerViewContent"
        style={{background:this.state.color}}>
        <div>
          <div>
            <h1>View {this.props.index}</h1>
            <button onClick={this.incrementCounter.bind(this)}>
              Increment Counter ({this.state.counter})
            </button>
            <button onClick={this.onNext.bind(this)}>Next</button>
            {this.renderBackButton()}
          </div>
        </div>
      </div>
    );
  }
  renderBackButton() {
    return this.props.index === 1
      ? null
      : <button onClick={this.onBack.bind(this)}>Back</button>;
  }
}

View.defaultProps ={
  index: 1
};

module.exports = View;
