const React = require('react/addons');
const {
  isCompositeComponent,
  renderIntoDocument
} = React.addons.TestUtils;

const NavigationController = require('../src/navigation-controller');
const {
  getVendorPrefix
} = require('../src/util');

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
  describe('constructor', () => {
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
  describe('componentWillMount', () => {
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
  describe('componentDidMount', () => {
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
})