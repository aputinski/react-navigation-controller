const React = require('react');

const NavigationController = require('../../src/navigation-controller');
const {
  ViewA,
  ViewB,
  ViewC
} = require('./views');

const a = (
  <ViewA />
);

const b = (
  <ViewB />
);

const c = (
  <ViewC />
);

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
          views={[a]}
          preserveState={true}
          transitionTension={10}
          transitionFriction={5} />
        <h2>Multiple Views</h2>
        <p>Start with multiple views on the stack</p>
        <NavigationController
          views={[a,b,c]}
          preserveState={true}
          transitionTension={10}
          transitionFriction={5} />
      </main>
    );
  }
}

React.render(<App />, document.body);
