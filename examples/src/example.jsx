import React from 'react'
import ReactDOM from 'react-dom'

import NavigationController from '../../src/navigation-controller'
import View from './view'

class App extends React.Component {
  render () {
    return (
      <main>
        <h2>Single View</h2>
        <p>Start with a single view on the stack</p>
        <NavigationController
          views={[<View />]}
          preserveState
          transitionTension={10}
          transitionFriction={6} />
        <h2>Multiple Views</h2>
        <p>Start with multiple views on the stack</p>
        <NavigationController
          views={[<View />, <View index={2} />, <View index={3} />]}
          preserveState
          transitionTension={10}
          transitionFriction={6} />
        <h2>Preserve DOM</h2>
        <p>
          Preserve DOM for views on the stack, so that all status including
          srolling position can be reserved.
        </p>
        <NavigationController
          views={[<View />]}
          preserveDom
          transitionTension={10}
          transitionFriction={6} />
      </main>
    )
  }
}

ReactDOM.render(<App />, document.getElementById('app'))
