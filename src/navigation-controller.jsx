const React = require('react');

const rebound = require('rebound');
const {
  mapValueInRange
} = rebound.MathUtil;

const {
  getVendorPrefix
} = require('./util/dom');

const {
  dropRight,
  last,
  takeRight
} = require('./util/array');

const {
  assign
} = require('./util/object');

const classNames = require('classnames');
const transformPrefix = getVendorPrefix('transform');

const optionTypes = {
  pushView: {
    view: React.PropTypes.element.isRequired,
    transition: React.PropTypes.oneOfType([
      React.PropTypes.func,
      React.PropTypes.string
    ]),
    onComplete: React.PropTypes.func
  },
  popView: {
    transition: React.PropTypes.oneOfType([
      React.PropTypes.func,
      React.PropTypes.string
    ]),
    onComplete: React.PropTypes.func
  },
  setViews: {
    views: React.PropTypes.arrayOf(
      React.PropTypes.element
    ).isRequired,
    preserveState: React.PropTypes.bool
  }
};

/**
 * Validate the options passed into a method
 *
 * @param {string} method - The name of the method to validate
 * @param {object} options - The options that were passed to "method"
 */
function checkOptions(method, options) {
  const optionType = optionTypes[method];
  Object.keys(options).forEach(key => {
    if (optionType[key]) {
      const e = optionType[key](options, key, method, 'prop');
      if (e) throw e;
    }
  });
}

class NavigationController extends React.Component {

  constructor(props) {
    super(props);
    const {views,preserveState} = this.props;
    this.state = {
      views: dropRight(views),
      preserveState,
      mountedViews: []
    };
    // Bind methats that were passed into createSpring()
    ['__onSpringUpdate', '__onSpringAtRest'].forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  componentWillMount() {
    this.__isTransitioning = false;
    this.__viewStates = [];
    this.__viewIndexes = [0,1];
    this.__springSystem = new rebound.SpringSystem();
    this.__spring = this.__springSystem.createSpring(15, 5);
    this.__spring.addListener({
      onSpringUpdate: this.__onSpringUpdate.bind(this),
      onSpringAtRest: this.__onSpringAtRest.bind(this)
    });
  }

  componentDidMount() {
    // Cache the view wrappers
    this['__view-wrapper-0'] = React.findDOMNode(this.refs[`view-wrapper-0`]);
    this['__view-wrapper-1'] = React.findDOMNode(this.refs[`view-wrapper-1`]);
    // Position the wrappers
    this.__transformViews(0, 0, -100, 0);
    // Push the last view
    this.pushView(last(this.props.views), { transition: 'none' });
  }

  componentWillUnmount() {
    this.__viewSpring.destroy();
  }

  /**
   * Translate the view wrappers by a specified percentage
   * 
   * @param {number} prevX
   * @param {number} prevY
   * @param {number} nextX
   * @param {number} nextY
   */
  __transformViews(prevX, prevY, nextX, nextY) {
    const [prev,next] = this.__viewIndexes;
    const prevView = this[`__view-wrapper-${prev}`];
    const nextView = this[`__view-wrapper-${next}`];
    requestAnimationFrame(() => {
      prevView.style[transformPrefix] = `translate3d(${prevX}%,${prevY}%,0)`;
      nextView.style[transformPrefix] = `translate3d(${nextX}%,${nextY}%,0)`;
    });
  }

  /**
   * Map a 0-1 value to a percentage for __transformViews()
   *
   * @param {number} value
   * @param {string} [transition] - The transition type
   * @return {array}
   */
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

  /**
   * Called once a view animation has completed
   */
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
      transition: null,
      mountedViews: mountedViews
    }, () => {
      this.__viewIndexes = this.__viewIndexes[0] === 0 ? [1,0] : [0,1];
    });
  }

  /**
   * Set the display style of the view wrappers
   *
   * @param {string} value
   */
  __displayViews(value) {
    this['__view-wrapper-0'].style.display = value;
    this['__view-wrapper-1'].style.display = value;
  }

  /**
   * Transtion the view wrappers manually, using a built-in animation, or custom animation
   *
   * @param {string} transition
   * @param {function} [onComplete] - Called once the transition is complete
   */
  __transitionViews(transition, onComplete) {
    this.__transitionViewsComplete = () => {
      delete this.__transitionViewsComplete;
      if (typeof onComplete === 'function') {
        onComplete();
      }
    };
    // Built-in transition
    if (typeof transition === 'string') {
      // Manually transition the views
      if (transition === 'none') {
        this.__transformViews.apply(this,
          this.__animateViews(1, transition)
        );
        requestAnimationFrame(() => {
          this.__animateViewsComplete();
          this.__transitionViewsComplete();
        });
      }
      // Otherwise use the springs
      else {
        this.__spring.setEndValue(1);
      }
    }
    // Custom transition
    if (typeof transition === 'function') {
      const [prev,next] = this.__viewIndexes;
      const prevView = this[`__view-wrapper-${prev}`];
      const nextView = this[`__view-wrapper-${next}`]; 
      transition(prevView, nextView, () => {
        this.__animateViewsComplete();
        this.__transitionViewsComplete();
      });
    }
  }

  __onSpringUpdate(spring) {
    if (!this.__isTransitioning) return;
    const value = spring.getCurrentValue();
    this.__transformViews.apply(this,
       this.__animateViews(value, this.state.transition)
    );
  }

  __onSpringAtRest(spring) {
    this.__animateViewsComplete();
    this.__transitionViewsComplete();
    this.__spring.setCurrentValue(0);
  }

  /**
   * Push a new view onto the stack
   *
   * @param {ReactElement} view - The view to push onto the stack
   * @param {object} [options]
   * @param {function} options.onComplete - Called once the transition is complete
   * @param {string|function} [options.transition] - The transtion type or custom transition
   */
  __pushView(view, options) {
    options = typeof options === 'object' ? options : {};
    const defaults = {
      transition: 'slide-left'
    };
    options = assign({}, defaults, options, { view });
    checkOptions('pushView', options);
    if (this.__isTransitioning) return;
    const {transition,onComplete} = options;
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
      // The view about to be hidden
      const prevView = this.refs[`view-0`];
      if (prevView && this.state.preserveState) {
        // Save the state before it gets unmounted
        this.__viewStates.push(prevView.state);
      }
      // Transition
      this.__transitionViews(transition, onComplete);
    });
    this.__isTransitioning = true;
  }

  /**
   * Pop the last view off the stack
   *
   * @param {object} [options]
   * @param {function} [options.onComplete] - Called once the transition is complete
   * @param {string|function} [options.transition] - The transtion type or custom transition
   */
  __popView(options) {
    options = typeof options === 'object' ? options : {};
    const defaults = {
      transition: 'slide-right'
    };
    options = assign({}, defaults, options);
    checkOptions('popView', options);
    if (this.state.views.length === 1) {
      throw new Error('popView() can only be called with two or more views in the stack')
    };
    if (this.__isTransitioning) return;
    const {transition,onComplete} = options;
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
      // The view about to be shown
      const nextView = this.refs[`view-1`];
      if (nextView && this.state.preserveState) {
        const state = this.__viewStates.pop();
        // Rehydrate the state
        if (state) {
          nextView.setState(state);  
        }
      }
      // Transition
      this.__transitionViews(transition, onComplete);
    });
    this.__isTransitioning = true;
  }

  /**
   * Replace the views currently managed by the controller
   * with the specified items.
   *
   * @param {array} views
   * @param {object} options
   * @param {function} [options.onComplete] - Called once the transition is complete
   * @param {string|function} [options.transition] - The transtion type or custom transition
   */
  __setViews(views, options) {
    options = typeof options === 'object' ? options : {};
    checkOptions('setViews', options);
    const {onComplete,preserveState} = options;
    options = assign({}, options, {
      onComplete: () => {
        this.__viewStates.length = 0;
        this.setState({
          views,
          preserveState
        }, () => {
          if (onComplete) {
            onComplete();
          }
        });
      }
    });
    this.__pushView(last(views), options);
  }

  pushView() {
    this.__pushView.apply(this, arguments);
  }

  popView() {
    this.__popView.apply(this, arguments);
  }

  setViews() {
    this.__setViews.apply(this, arguments);
  }

  __renderPrevView() {
    const view = this.state.mountedViews[0];
    if (!view) return null;
    return React.cloneElement(view, {
      ref: `view-${this.__viewIndexes[0]}`,
      navigationController: this
    });
  }

  __renderNextView() {
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
          {this.__renderPrevView()}
        </div>
        <div
          className={wrapperClassName}
          ref={'view-wrapper-1'}>
          {this.__renderNextView()}
        </div>
      </div>
    );
  }

}

NavigationController.propTypes = {
  views: React.PropTypes.arrayOf(
    React.PropTypes.element
  ).isRequired,
  preserveState: React.PropTypes.bool
};

NavigationController.defaultProps = {
  preserveState: false
};

module.exports = NavigationController;
