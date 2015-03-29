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
    this.__transformViews(0, 0, -100, 0);
    // Push the last view
    this.pushView(last(this.props.views), 'none');
  }

  componentWillUnmount() {
    this.__viewSpring.destroy();
  }

  __transformViews(prevX, prevY, nextX, nextY) {
    const [prev,next] = this.__viewIndexes;
    const prevView = this[`__view-wrapper-${prev}`];
    const nextView = this[`__view-wrapper-${next}`];
    requestAnimationFrame(() => {
      prevView.style[transformPrefix] = `translate3d(${prevX}%,${prevY}%,0)`;
      nextView.style[transformPrefix] = `translate3d(${nextX}%,${nextY}%,0)`;
    });
  }

  __animateViews(value=0, transition='none') {
    let prevX = 0, prevY = 0;
    let nextX = 0, nextY = 0;
    switch (transition) {
      case 'none':
      case 'slide-left':
        prevX = mapValueInRange(value, 0, 1, 0, -100);
        nextX = mapValueInRange(value, 0, 1, 100, 0);
        break;
      case 'slide-right':
        prevX = mapValueInRange(value, 0, 1, 0, 100);
        nextX = mapValueInRange(value, 0, 1, -100, 0);
        break;
      case 'slide-up':
        prevY = mapValueInRange(value, 0, 1, 0, -100);
        nextY = mapValueInRange(value, 0, 1, 100, 0);
        break;
      case 'slide-down':
        prevY = mapValueInRange(value, 0, 1, 0, 100);
        nextY = mapValueInRange(value, 0, 1, -100, 0);
        break;
    }
    return [prevX,prevY,nextX,nextY];
  }

  __animateViewsComplete() {
    this.__isTransitioning = false;
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

  __displayViews(value) {
    this['__view-wrapper-0'].style.display = value;
    this['__view-wrapper-1'].style.display = value;
  }

  __viewOnSpringUpdate(spring) {
    if (!this.__isTransitioning) return;
    const value = spring.getCurrentValue();
    this.__transformViews.apply(this,
       this.__animateViews(value, this.state.transition)
    );
  }

  __viewOnSpringAtRest(spring) {
    this.__animateViewsComplete();
    this.__viewSpring.setCurrentValue(0);
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
    this.__displayViews('block');
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
    this.__displayViews('block');
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
