const React = require('react');

class View extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div
        className="ReactNavigationControllerViewContent"
        style={{background:this.state.color}}>
        <div>
          {this.renderContent()}
        </div>
      </div>
    );
  }
  renderContent() {
    return null;
  }
}

module.exports = View;
