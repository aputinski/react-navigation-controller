const React = require('react');

const NavigationController = require('../src/navigation-controller');
const {
  ViewA,
  ViewB
} = require('./views');

const a = (
  <ViewA />
);

const b = (
  <ViewB />
);

class App extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <main>
        <NavigationController
          views={[a]} />
        <NavigationController
          views={[a,b]} />
      </main>
    );
  }
}

React.render(<App />, document.body);
