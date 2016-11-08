import React from 'react'
import NavigationController from '../../src/navigation-controller'

const {
  Transition
} = NavigationController

const colors = [
  '#0074D9', '#7FDBFF', '#39CCCC', '#2ECC40', '#FFDC00', '#FF851B', '#FF4136',
  '#F012BE', '#B10DC9'
]

function getColor () {
  const color = colors.shift()
  colors.push(color)
  return color
}

class View extends React.Component {
  constructor (props) {
    super(props)
    const now = new Date()
    this.state = {
      counter: 0,
      color: getColor(),
      time: `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`
    }
  }
  incrementCounter () {
    this.setState({
      counter: this.state.counter + 1
    })
  }
  onNext () {
    const view = <View index={this.props.index + 1} />
    this.props.navigationController.pushView(view, {})
  }
  onBack () {
    this.props.navigationController.popView({
      transition: this.props.modal ? Transition.type.REVEAL_DOWN : Transition.type.PUSH_RIGHT
    })
  }
  onModal () {
    const view = <View index={this.props.index + 1} modal />
    this.props.navigationController.pushView(view, {
      transition: Transition.type.COVER_UP
    })
  }
  onPopToRoot () {
    this.props.navigationController.popToRootView({
      transition: this.props.modal ? Transition.type.REVEAL_DOWN : Transition.type.PUSH_RIGHT
    })
  }
  render () {
    return (
      <div
        className='ReactNavigationControllerViewContent'
        style={{ background: this.state.color }}>
        <header>
          {this.renderBackButton()}
          {this.renderNextButton()}
        </header>
        <section>
          <h3>View {this.props.index}</h3>
          <button onClick={this.incrementCounter.bind(this)}>
            Increment Counter ({this.state.counter})
          </button>
          <button onClick={this.onModal.bind(this)}>
            Show Modal
          </button>
          {this.renderPopToRootButton()}
          <div style={{height: '100px', overflow: 'scroll'}}>
            <div style={{height: '50px'}}>
            Scroll It: 1
            </div>
            <div style={{height: '50px'}}>
            Scroll It: 2
            </div>
            <div style={{height: '50px'}}>
            Scroll It: 3
            </div>
            <div style={{height: '50px'}}>
            Scroll It: 4
            </div>
          </div>
        </section>
      </div>
    )
  }
  renderBackButton () {
    const text = this.props.modal ? 'Close' : 'Back'
    return this.props.index === 1
      ? <div />
      : <button onClick={this.onBack.bind(this)}>{text}</button>
  }
  renderNextButton () {
    return this.props.modal === true
      ? <div />
      : <button onClick={this.onNext.bind(this)}>Next</button>
  }
  renderPopToRootButton () {
    return this.props.index === 1
      ? <div />
      : <button onClick={this.onPopToRoot.bind(this)}>Pop To Root</button>
  }
}

View.defaultProps = {
  index: 1
}

export default View
