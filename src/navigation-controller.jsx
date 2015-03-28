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
    // Setup
    this.__isTransitioning = false;
    this.__viewStates = [];
    this.__viewIdxs = [0,1];
    // Animation
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
    this.__animateViews(0);
    // Push the last view
    const view = last(this.props.views);
    this.pushView(view, 'none');
  }

  componentWillUnmount() {
    this.__viewSpring.destroy();
  }

  __viewOnSpringUpdate(spring) {
    if (!this.__isTransitioning) return;
    const value = spring.getCurrentValue();
    this.__animateViews(value);
  }

  __viewOnSpringAtRest(spring) {
    this.__isTransitioning = false;
    // Reset the spring
    this.__viewSpring.setCurrentValue(0);
    const [a,b] = this.__viewIdxs;
    // Hide the previous view wrapper
    const prevViewWrapper = this[`__view-wrapper-${a}`];
          prevViewWrapper.style.display = 'none';
    // Unmount the previous view
    const mountedViews = [];
          mountedViews[a] = null;
          mountedViews[b] = last(this.state.views);
    // Prev view
    this.setState({
      mountedViews: mountedViews
    }, () => {
      this.__viewIdxs = this.__viewIdxs[0] === 0 ? [1,0] : [0,1];
    });
  }

  __animateViews(value, transition) {
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
    const [a,b] = this.__viewIdxs;
    const prevView = this[`__view-wrapper-${a}`];
    const nextView = this[`__view-wrapper-${b}`];
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
    const [a,b] = this.__viewIdxs;
    let views = this.state.views.slice();
    // Alternate mounted views order
    const mountedViews = [];
          mountedViews[a] = last(views);
          mountedViews[b] = view;
    // Add the new view
    views = views.concat(view);
    // Show the wrappers
    this.__displayViewWrappers('block');
    // State
    this.setState({
      transition,
      views,
      mountedViews
    }, () => {
      // Prev view
      const prevView = this.refs[`view-0`];
      if (prevView) {
        // Save the state from the previous view
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
    const [a,b] = this.__viewIdxs;
    const views = dropRight(this.state.views);
    // Alternate mounted views order
    const p = takeRight(this.state.views, 2).reverse();
    const mountedViews = [];
          mountedViews[a] = p[0];
          mountedViews[b] = p[1];
    // Show the wrappers
    this.__displayViewWrappers('block');
    // State
    this.setState({
      transition,
      views,
      mountedViews
    }, () => {
      // Next view
      const nextView = this.refs[`view-1`];
      if (nextView) {
        const state = this.__viewStates.pop();
        // Rehydrate the state from the previous view
        if (state) {
          nextView.setState(state);  
        }
      }
      // Start the animation
      if (transition === 'none') {
        this.__viewSpring.setCurrentValue(1);
      }
      else {
        this.__viewSpring.setEndValue(1);
      }
    });
    this.__isTransitioning = true;
  }

  pushView() {
    this.__pushView(...arguments);
    /*setTimeout(() => {
      this.__pushView(...arguments);
    }, 200);*/
  }

  popView() {
    this.__popView(...arguments);
    /*setTimeout(() => {
      this.__popView(...arguments);
    }, 200);*/
  }

  renderPrevView() {
    const view = this.state.mountedViews[0];
    if (!view) return null;
    return React.cloneElement(view, {
      ref: `view-${this.__viewIdxs[0]}`,
      navigationController: this
    });
  }

  renderNextView() {
    const [a,b] = this.__viewIdxs;
    const view = this.state.mountedViews[1];
    if (!view) return null;
    return React.cloneElement(view, {
      ref: `view-${this.__viewIdxs[1]}`,
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
          ref={`view-wrapper-${0}`}>
          {this.renderPrevView()}
        </div>
        <div
          className={wrapperClassName}
          ref={`view-wrapper-${1}`}>
          {this.renderNextView()}
        </div>
      </div>
    );
  }

}

NavigationController.propTypes = {
  views: React.PropTypes.arrayOf(
    React.PropTypes.element
  )
};

module.exports = NavigationController;
