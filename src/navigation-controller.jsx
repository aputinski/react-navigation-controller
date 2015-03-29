const React = require('react');

const rebound = require('rebound');
const {
  mapValueInRange
} = rebound.MathUtil;

const {
  dropRight,
  last,
  takeRight,
  getVendorPrefix
} = require('./util');

const classNames = require('classnames');
const transformPrefix = getVendorPrefix('transform');

class NavigationController extends React.Component {

  constructor(props) {
    super(props);
    const {views} = this.props;
    this.state = {
      views: dropRight(views),
      mountedViews: []
    };
    const autoBind = [
      '__viewOnSpringUpdate', '__viewOnSpringAtRest'
    ];
    autoBind.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  componentWillMount() {
    this.__isTransitioning = false;
    this.__viewStates = [];
    this.__viewIndexes = [0,1];
    this.__springSystem = new rebound.SpringSystem();
    this.__viewSpring = this.__springSystem.createSpring(15, 5);
    this.__viewSpring.addListener({
      onSpringUpdate: this.__viewOnSpringUpdate.bind(this),
      onSpringAtRest: this.__viewOnSpringAtRest.bind(this)
    });
  }

  componentDidMount() {
    // Cache the view wrappers
    this['__view-wrapper-0'] = React.findDOMNode(this.refs[`view-wrapper-0`]);
    this['__view-wrapper-1'] = React.findDOMNode(this.refs[`view-wrapper-1`]);
    // Position the wrappers
    this.__transformViews();
    // Push the last view
    this.pushView(
      last(this.props.views),
      'none'
    );
  }

  componentWillUnmount() {
    this.__viewSpring.destroy();
  }

  __viewOnSpringUpdate(spring) {
    if (!this.__isTransitioning) return;
    const value = spring.getCurrentValue();
    this.__transformViews(value);
  }

  __viewOnSpringAtRest(spring) {
    this.__isTransitioning = false;
    // Reset the spring
    this.__viewSpring.setCurrentValue(0);
    const [prev,next] = this.__viewIndexes;
    // Hide the previous view wrapper
    const prevViewWrapper = this[`__view-wrapper-${prev}`];
          prevViewWrapper.style.display = 'none';
    // Unmount the previous view
    const mountedViews = [];
          mountedViews[prev] = null;
          mountedViews[next] = last(this.state.views);
    this.setState({
      mountedViews: mountedViews
    }, () => {
      this.__viewIndexes = this.__viewIndexes[0] === 0 ? [1,0] : [0,1];
    });
  }

  __transformViews(value=0, transition) {
    let x1 = 0, y1 = 0;
    let x2 = 0, y2 = 0;
    transition = transition || this.state.transition;
    switch (transition) {
      case 'none':
        x1 = mapValueInRange(value, 0, 1, 0, -100);
        x2 = mapValueInRange(value, 0, 1, 100, 0);
        break;
      case 'slide-left':
        x1 = mapValueInRange(value, 0, 1, 0, -100);
        x2 = mapValueInRange(value, 0, 1, 100, 0);
        break;
      case 'slide-right':
        x1 = mapValueInRange(value, 0, 1, 0, 100);
        x2 = mapValueInRange(value, 0, 1, -100, 0);
        break;
      case 'slide-up':
        y1 = mapValueInRange(value, 0, 1, 0, -100);
        y2 = mapValueInRange(value, 0, 1, 100, 0);
        break;
      case 'slide-down':
        y1 = mapValueInRange(value, 0, 1, 0, 100);
        y2 = mapValueInRange(value, 0, 1, -100, 0);
        break;
    }
    const [prev,next] = this.__viewIndexes;
    const prevView = this[`__view-wrapper-${prev}`];
    const nextView = this[`__view-wrapper-${next}`];
    requestAnimationFrame(() => {
      prevView.style[transformPrefix] = `translate3d(${x1}%,${y1}%,0)`;
      nextView.style[transformPrefix] = `translate3d(${x2}%,${y2}%,0)`;
    });
  }

  __displayViewWrappers(value) {
    this['__view-wrapper-0'].style.display = value;
    this['__view-wrapper-1'].style.display = value;
  }

  __pushView(view, transition='slide-left') {
    if (!view) return;
    if (this.__isTransitioning) return;
    const [prev,next] = this.__viewIndexes;
    let views = this.state.views.slice();
    // Alternate mounted views order
    const mountedViews = [];
          mountedViews[prev] = last(views);
          mountedViews[next] = view;
    // Add the new view
    views = views.concat(view);
    // Show the wrappers
    this.__displayViewWrappers('block');
    // Push the view
    this.setState({
      transition,
      views,
      mountedViews
    }, () => {
      // The view that is about to be hidden
      const prevView = this.refs[`view-0`];
      if (prevView) {
        // Save the state before it gets unmounted
        this.__viewStates.push(prevView.state);
      }
      // Start the animation
      if (transition === 'none') {
        this.__viewSpring.setCurrentValue(1);
        requestAnimationFrame(this.__viewOnSpringAtRest);
      }
      else {
        this.__viewSpring.setEndValue(1);
      }
    });
    this.__isTransitioning = true;
  }

  __popView(transition='slide-right') {
    if (this.state.views.length === 1) return;
    if (this.__isTransitioning) return;
    const [prev,next] = this.__viewIndexes;
    const views = dropRight(this.state.views);
    // Alternate mounted views order
    const p = takeRight(this.state.views, 2).reverse();
    const mountedViews = [];
          mountedViews[prev] = p[0];
          mountedViews[next] = p[1];
    // Show the wrappers
    this.__displayViewWrappers('block');
    // Pop the view
    this.setState({
      transition,
      views,
      mountedViews
    }, () => {
      // The view that is about to be shown
      const nextView = this.refs[`view-1`];
      if (nextView) {
        const state = this.__viewStates.pop();
        // Rehydrate the state
        if (state) {
          nextView.setState(state);  
        }
      }
      // Start the animation
      if (transition === 'none') {
        this.__viewSpring.setCurrentValue(1);
        requestAnimationFrame(this.__viewOnSpringAtRest);
      }
      else {
        this.__viewSpring.setEndValue(1);
      }
    });
    this.__isTransitioning = true;
  }

  pushView() {
    this.__pushView.apply(this, arguments);
  }

  popView() {
    this.__popView.apply(this, arguments);
  }

  renderPrevView() {
    const view = this.state.mountedViews[0];
    if (!view) return null;
    return React.cloneElement(view, {
      ref: `view-${this.__viewIndexes[0]}`,
      navigationController: this
    });
  }

  renderNextView() {
    const view = this.state.mountedViews[1];
    if (!view) return null;
    return React.cloneElement(view, {
      ref: `view-${this.__viewIndexes[1]}`,
      navigationController: this
    });
  }

  render() {
    const className = classNames('ReactNavigationController',
      this.props.className
    );
    const wrapperClassName = classNames('ReactNavigationControllerView', {
      'ReactNavigationControllerView--transitioning': this.__isTransitioning
    });
    return (
      <div className={className}>
        <div
          className={wrapperClassName}
          ref={'view-wrapper-0'}>
          {this.renderPrevView()}
        </div>
        <div
          className={wrapperClassName}
          ref={'view-wrapper-1'}>
          {this.renderNextView()}
        </div>
      </div>
    );
  }

}

NavigationController.propTypes = {
  views: React.PropTypes.arrayOf(
    React.PropTypes.element
  ).isRequired
};

module.exports = NavigationController;
