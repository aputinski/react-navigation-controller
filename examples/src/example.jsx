const React = require('react');

const NavigationController = require('../../src/navigation-controller');
const View =require('./view');

class App extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <main>
        <h2>Single View</h2>
        <p>Start with a single view on the stack</p>
        <NavigationController
          views={[<View />]}
          preserveState={true}
          transitionTension={10}
          transitionFriction={6} />
        <h2>Multiple Views</h2>
        <p>Start with multiple views on the stack</p>
        <NavigationController
          views={[<View />, <View index={2} />, <View index={3} />]}
          preserveState={true}
          transitionTension={10}
          transitionFriction={6} />
      </main>
    );
  }
}

React.render(<App />, document.body);
