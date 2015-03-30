const React = require('react/addons');
const {
  isCompositeComponent,
  renderIntoDocument
} = React.addons.TestUtils;

const NavigationController = require('../src/navigation-controller');
const {
  getVendorPrefix
} = require('../src/util/dom');

const transformPrefix = getVendorPrefix('transform');

const {
  ViewA,
  ViewB
} = require('../examples/views');

const rebound = require('rebound');

describe('NavigationController', () => {
  const views = [
    <ViewA />
  ];
  let controller, viewWrapper0, viewWrapper1;
  beforeEach(() => {
    controller = renderIntoDocument(
      <NavigationController views={views} />
    );
    viewWrapper0 = controller['__view-wrapper-0'];
    viewWrapper1 = controller['__view-wrapper-1'];
  })
  it('exports a component', () => {
    let controller = renderIntoDocument(
      <NavigationController views={views} />
    );
    expect(isCompositeComponent(controller)).to.be.true;
  });
  describe('#constructor', () => {
    it('correctly saves the views to the state', () => {
      const a = <div />
      const b = <div />
      controller = new NavigationController({ views: [a,b] });
      expect(controller.state).not.to.be.undefined;
      expect(controller.state.views).to.have.length(1);
      controller = new NavigationController({ views: [a] });
      expect(controller.state).not.to.be.undefined;
      expect(controller.state.views).to.have.length(0);
    });
  });
  describe('#componentWillMount', () => {
    beforeEach(() => {
      controller = new NavigationController({ views: views });
      controller.componentWillMount();
    })
    it('defaults to __isTransitioning=false ', () => {
      expect(controller.__isTransitioning).to.be.false;
    });
    it('sets up an array for the view states', () => {
      expect(controller.__viewStates).not.to.be.undefined;
      expect(Array.isArray(controller.__viewStates)).to.be.true;
      expect(controller.__viewStates).to.have.length(0);
    });
    it('sets up an array for the view indexes', () => {
      expect(controller.__viewIndexes).not.to.be.undefined;
      expect(Array.isArray(controller.__viewIndexes)).to.be.true;
      expect(controller.__viewIndexes).to.have.length(2);
      expect(controller.__viewIndexes[0]).to.be.equal(0);
      expect(controller.__viewIndexes[1]).to.be.equal(1);
    });
    it('creates a new spring system', () => {
      expect(controller.__springSystem).to.be.an.instanceof(rebound.SpringSystem);
    });
  });
  describe('#componentDidMount', () => {
    it('caches the view wrappers', () => {
      expect(viewWrapper0).to.be.an.instanceof(HTMLElement);
      expect(viewWrapper1).to.be.an.instanceof(HTMLElement);
      expect(viewWrapper0).not.to.equal(viewWrapper1);
    });
    it('transforms the view wrappers', () => {
      expect(viewWrapper0).to.have.deep.property(`style.${transformPrefix}`);
      expect(viewWrapper1).to.have.deep.property(`style.${transformPrefix}`);
    });
  });
  describe('#componentWillUnmout', () => {
    
  });
  describe('#__transformViews', () => {
    it('translates the views', (done) => {
      controller.__transformViews(10, 20, 30, 40);
      requestAnimationFrame(() => {
        expect(viewWrapper0.style[transformPrefix]).to.equal(`translate3d(10%, 20%, 0px)`);
        expect(viewWrapper1.style[transformPrefix]).to.equal(`translate3d(30%, 40%, 0px)`);
        done();
      });
    });
  });
  describe('#__animateViews', () => {
    let prevX,prevY,nextX,nextY;
    it('slide-left', () => {
      [prevX,prevY,nextX,nextY] = controller.__animateViews(0, 'slide-left');
      expect(prevX).to.equal(0);
      expect(nextX).to.equal(100);
      [prevX,prevY,nextX,nextY] = controller.__animateViews(1, 'slide-left');
      expect(prevX).to.equal(-100);
      expect(nextX).to.equal(0);
    });
    it('slide-right', () => {
      [prevX,prevY,nextX,nextY] = controller.__animateViews(0, 'slide-right');
      expect(prevX).to.equal(0);
      expect(nextX).to.equal(-100);
      [prevX,prevY,nextX,nextY] = controller.__animateViews(1, 'slide-right');
      expect(prevX).to.equal(100);
      expect(nextX).to.equal(0);
    });
    it('slide-up', () => {
      [prevX,prevY,nextX,nextY] = controller.__animateViews(0, 'slide-up');
      expect(prevY).to.equal(0);
      expect(nextY).to.equal(100);
      [prevX,prevY,nextX,nextY] = controller.__animateViews(1, 'slide-up');
      expect(prevY).to.equal(-100);
      expect(nextY).to.equal(0);
    });
    it('slide-down', () => {
      [prevX,prevY,nextX,nextY] = controller.__animateViews(0, 'slide-down');
      expect(prevY).to.equal(0);
      expect(nextY).to.equal(-100);
      [prevX,prevY,nextX,nextY] = controller.__animateViews(1, 'slide-down');
      expect(prevY).to.equal(100);
      expect(nextY).to.equal(0);
    });
  });
  describe('#__animateViewsComplete', () => {
    it('sets to __isTransitioning=false ', () => {
      controller.__animateViewsComplete();
      expect(controller.__isTransitioning).to.be.false;
    });
    it('hides the previous view wrapper ', (done) => {
      controller.__animateViewsComplete();
      const [prev,next] = controller.__viewIndexes;
      requestAnimationFrame(() => {
        expect(controller[`__view-wrapper-${prev}`].style.display).to.equal('none');
        done();
      });
    });
    it('unmounts the previous view', (done) => {
      let prev,next;
      requestAnimationFrame(() => {
        [prev,next] = controller.__viewIndexes.slice();
        controller.__animateViewsComplete();
      });
      requestAnimationFrame(() => {
        expect(controller.state.mountedViews[prev]).to.be.null;
        expect(controller.state.mountedViews[next].type).to.equal(ViewA);
        done()
      });
    });
    it('alternates the view indexes', (done) => {
      let a,b;
      requestAnimationFrame(() => {
        a = controller.__viewIndexes.slice();
        controller.__animateViewsComplete();
      });
      requestAnimationFrame(() => {
        b = controller.__viewIndexes.slice();
        expect(a[0]).to.equal(b[1]);
        expect(a[1]).to.equal(b[0]);
        done();
      });
    });
  });
  describe('#__displayViews', () => {
    beforeEach(done => {
      requestAnimationFrame(() => {
        done();
      });
    });
    it('hides the views', (done) => {
      controller.__displayViews('none');
      requestAnimationFrame(() => {
        expect(controller[`__view-wrapper-0`].style.display).to.equal('none');
        expect(controller[`__view-wrapper-1`].style.display).to.equal('none');
        done();
      });
    });
    it('shows the views', (done) => {
      controller.__displayViews('block');
      requestAnimationFrame(() => {
        expect(controller[`__view-wrapper-0`].style.display).to.equal('block');
        expect(controller[`__view-wrapper-1`].style.display).to.equal('block');
        done();
      });
    });
  });
  describe('#__transitionViews', () => {
    beforeEach(done => {
      requestAnimationFrame(() => {
        done();
      });
    });
    it('sets the completion callback', () => {
      controller.__transitionViews(null, () => {});
      expect(controller.__transitionViewsComplete).to.be.a('function');
    });
    it('sets and calls the completion callback', (done) => {
      const transitionCallbackSpy = sinon.spy();
      controller.__transitionViews('none', transitionCallbackSpy);
      const transitionCompleteSpy = sinon.spy(controller, '__transitionViewsComplete');
      requestAnimationFrame(() => {
        expect(transitionCompleteSpy.calledOnce).to.be.true;
        expect(transitionCallbackSpy.calledOnce).to.be.true;
        done();
      });
    });
    it('manually runs a "none" transition', (done) => {
      const transformSpy = sinon.spy(controller, '__transformViews');
      const animateCompleteSpy = sinon.spy(controller, '__animateViewsComplete');
      controller.__transitionViews('none');
      const transitionCompleteSpy = sinon.spy(controller, '__transitionViewsComplete');
      requestAnimationFrame(() => {
        expect(transformSpy.calledOnce).to.be.true;
        expect(animateCompleteSpy.calledOnce).to.be.true;
        expect(transitionCompleteSpy.calledOnce).to.be.true;
        done();
      });
    });
    it('runs a built-in spring transition', (done) => {
      const animateSpy = sinon.spy(controller, '__animateViews');
      const transformSpy = sinon.spy(controller, '__transformViews');
      const animateCompleteSpy = sinon.spy(controller, '__animateViewsComplete');
      controller.__transitionViews('slide-left', function() {
        expect(animateSpy.callCount).to.be.above(1);
        expect(transformSpy.callCount).to.be.above(1);
        expect(animateCompleteSpy.calledOnce).to.be.true;
        done();
      });
      controller.__isTransitioning = true;
    });
    it('runs a custom transtion', (done) => {
      let _prevElement,_nextElement;
      controller.__transitionViews((prevElement, nextElement, done) => {
        _prevElement = prevElement;
        _nextElement = nextElement;
        prevElement.style[transformPrefix] = 'translate3d(10px, 20px, 0px)';
        nextElement.style[transformPrefix] = 'translate3d(30px, 40px, 0px)';
        setTimeout(done, 500);
      }, () => {
        expect(_prevElement.style[transformPrefix]).to.equal(`translate3d(10px, 20px, 0px)`);
        expect(_nextElement.style[transformPrefix]).to.equal(`translate3d(30px, 40px, 0px)`);
        done();
      });
    });
  });
  describe('#__pushView', () => {
    beforeEach(done => {
      requestAnimationFrame(() => {
        done();
      });
    });
    it('throws an error if a non-react view is passed', () => {
      expect(() => {
        controller.__pushView({});
      }).to.throw(/view/);
    });
    it('throws an error if an invalid callback is passed', () => {
      expect(() => {
        controller.__pushView(<ViewA />, { onComplete: true});
      }).to.throw(/onComplete/);
    });
    it('throws an error if an invalid transition is passed', () => {
      expect(() => {
        controller.__pushView(<ViewA />, { transition: true });
      }).to.throw(/transition/);
    });
    it('returns early if the controller is already transitioning', () => {
      const spy = sinon.spy(controller, 'setState');
      controller.__isTransitioning = true;
      controller.__pushView(<ViewA />);
      expect(spy.called).not.to.be.true;
    });
    it('shows the view wrappers', () => {
      const spy = sinon.spy(controller, '__displayViews');
      controller.__pushView(<ViewB />);
      expect(spy.calledWith('block')).to.be.true;
    });
    it('appends the view to state.views', (done) => {
      controller.__pushView(<ViewB />, {
        transition: 'none',
        onComplete: () => {
          expect(controller.state.views[1].type).to.equal(ViewB);
          done();
        }
      });
    });
    it('sets state.transition', (done) => {
      controller.__pushView(<ViewB />, {
        transition: 'none',
        onComplete: () => {
          done();
        }
      });
      requestAnimationFrame(() => {
        expect(controller.state.transition).to.equal('none');
      });
    });
    it('sets state.mountedViews', (done) => {
      const [prev,next] = controller.__viewIndexes;
      controller.__pushView(<ViewB />, {
        transition: 'none',
        onComplete: () => {
          expect(controller.state.views[1].type).to.equal(ViewB);
          done();
        }
      });
      requestAnimationFrame(() => {
        expect(controller.state.mountedViews[prev].type).to.equal(ViewA);
        expect(controller.state.mountedViews[next].type).to.equal(ViewB);
      });
    });
    it('transitions the views', (done) => {
      const spy = sinon.spy(controller, '__transitionViews');
      controller.__pushView(<ViewB />, { transition: 'none' });
      requestAnimationFrame(() => {
        expect(spy.calledOnce).to.be.true;
        done();
      });
    });
    it('sets __isTransitioning=true', () => {
      controller.__pushView(<ViewB />, { transition: 'none' });
      expect(controller.__isTransitioning).to.be.true;
    });
    it('calls the transitionDone callback', (done) => {
      controller.__pushView(<ViewB />, {
        transition: 'none',
        onComplete: () => {
          expect(true).to.be.true;
          done();
        }
      });
    });
    it('preserves the state', (done) => {
      controller = renderIntoDocument(
        <NavigationController views={views} preserveState={true} />
      );
      requestAnimationFrame(() => {
        controller.refs[`view-${controller.__viewIndexes[0]}`].setState({
          foo: 'bar'
        });
        controller.__pushView(<ViewB />, { transition: 'none' });
        requestAnimationFrame(() => {
          expect(controller.__viewStates).to.have.length(1);
          expect(controller.__viewStates[0]).to.have.property('foo');
          done();
        });
      })
    });
  });
  describe('#__popView', () => {
    beforeEach(done => {
      controller = renderIntoDocument(
        <NavigationController views={[<ViewA />,<ViewB />]} />
      );
      requestAnimationFrame(() => {
        done();
      });
    });
    it('throws an error if an only one view is in the stack', () => {
      controller.state.views = [<ViewA />];
      expect(() => {
        controller.__popView()
      }).to.throw(/stack/);
    });
    it('throws an error if an invalid callback is passed', () => {
      expect(() => {
        controller.__popView({ onComplete: true });
      }).to.throw(/onComplete/);
    });
    it('throws an error if an invalid transition is passed', () => {
      expect(() => {
        controller.__popView({ transition: true });
      }).to.throw(/transition/);
    });
    it('returns early if the controller is already transitioning', () => {
      const spy = sinon.spy(controller, 'setState');
      controller.__isTransitioning = true;
      controller.__popView();
      expect(spy.called).not.to.be.true;
    });
    it('shows the view wrappers', () => {
      const spy = sinon.spy(controller, '__displayViews');
      controller.__popView();
      expect(spy.calledWith('block')).to.be.true;
    });
    it('removes the last view from state.views', (done) => {
      controller.__popView({
        onComplete: () => {
          expect(controller.state.views).to.have.length(1);
          expect(controller.state.views[0].type).to.equal(ViewA);
          done();
        },
        transition: 'none'
      });
    });
    it('sets state.transition', (done) => {
      controller.__popView({
        transition: 'none',
        onComplete: () => {
          done();
        }
      });
      requestAnimationFrame(() => {
        expect(controller.state.transition).to.equal('none');
      });
    });
    it('sets state.mountedViews', (done) => {
      const [prev,next] = controller.__viewIndexes;
      controller.__popView({
        transition: 'none',
        onComplete: () => {
          done();
        }
      });
      requestAnimationFrame(() => {
        expect(controller.state.mountedViews[prev].type).to.equal(ViewB);
        expect(controller.state.mountedViews[next].type).to.equal(ViewA);
      });
    });
    it('transitions the views', (done) => {
      const spy = sinon.spy(controller, '__transitionViews');
      controller.__popView({ transition: 'none' });
      requestAnimationFrame(() => {
        expect(spy.calledOnce).to.be.true;
        done();
      });
    });
    it('sets __isTransitioning=true', () => {
      controller.__popView({ transition: 'none' });
      expect(controller.__isTransitioning).to.be.true;
    });
    it('calls the onComplete callback', (done) => {
      controller.__popView({
        onComplete: () => {
          expect(true).to.be.true;
          done();
        }
      });
    });
    it('does not rehydrate the state', (done) => {
      requestAnimationFrame(() => {
        controller.refs[`view-${controller.__viewIndexes[0]}`].setState({
          foo: 'bar'
        });
        controller.pushView(<ViewB />, {
          transition: 'none',
          onComplete: () => {
            controller.popView({
              transition: 'none',
              onComplete: () => {
                expect(controller.refs[`view-${controller.__viewIndexes[0]}`].state)
                  .not.to.have.property('foo');
                done();
              }
            });
          }
        });
      });
    });
    it('rehydrates the state', (done) => {
      controller = renderIntoDocument(
        <NavigationController views={views} preserveState={true} />
      );
      requestAnimationFrame(() => {
        controller.refs[`view-${controller.__viewIndexes[0]}`].setState({
          foo: 'bar'
        });
        controller.pushView(<ViewB />, {
          onComplete: () => {
            transition: 'none',
            controller.popView({
              transition: 'none',
              onComplete: () => {
                expect(controller.refs[`view-${controller.__viewIndexes[0]}`].state)
                  .to.have.property('foo');
                done();
              }
            });
          }
        });
      });
    });
  });
  describe('#__renderPrevView', () => {
    beforeEach(done => {
      requestAnimationFrame(() => {
        done();
      });
    });
    it('returns null if the previous view is no longer mounted', () => {
      expect(controller.__renderPrevView()).to.be.null;
    });
    it('returns a clone if the previous view is mounted', (done) => {
      controller.__pushView(<ViewB />);
      requestAnimationFrame(() => {
        const prevView = controller.__renderPrevView();
        const ref = controller.refs[`view-${controller.__viewIndexes[0]}`];
        expect(prevView).not.to.be.null;
        expect(ref).not.to.be.null;
        expect(ref.props.navigationController).to.equal(controller);
        done();
      });
    });
  });
  describe('#__renderNextView', () => {
    beforeEach(done => {
      requestAnimationFrame(() => {
        done();
      });
    });
    it('returns null if the next view is no longer mounted', (done) => {
      controller.__pushView(<ViewB />, {
        transition: 'none',
        onComplete: () => {
          expect(controller.__renderNextView()).to.be.null;
          done();
        }
      });
    });
    it('returns a clone if the next view is mounted', (done) => {
      controller.__pushView(<ViewB />);
      requestAnimationFrame(() => {
        const nextView = controller.__renderNextView();
        const ref = controller.refs[`view-${controller.__viewIndexes[1]}`];
        expect(nextView).not.to.be.null;
        expect(ref).not.to.be.null;
        expect(ref.props.navigationController).to.equal(controller);
        done();
      });
    });
  });
});
