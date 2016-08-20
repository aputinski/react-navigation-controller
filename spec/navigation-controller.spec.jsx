/* global describe, it, beforeEach, expect, requestAnimationFrame, sinon */

import React from 'react/addons'

import {
  isCompositeComponent,
  renderIntoDocument
} from 'react-addons-test-utils'

import rebound from 'rebound'

import NavigationController from '../src/navigation-controller'
import View from '../examples/src/view'

const { Transition } = NavigationController

class ViewA extends View { }
class ViewB extends View { }
class ViewC extends View { }

describe('NavigationController', () => {
  const views = [
    <ViewA />
  ]
  let controller, viewWrapper0, viewWrapper1
  beforeEach(() => {
    controller = renderIntoDocument(
      <NavigationController views={views} />
    )
    viewWrapper0 = controller.refs['view-wrapper-0']
    viewWrapper1 = controller.refs['view-wrapper-1']
  })
  it('exports a component', () => {
    let controller = renderIntoDocument(
      <NavigationController views={views} />
    )
    expect(isCompositeComponent(controller)).to.be.true
  })
  describe('#constructor', () => {
    it('correctly saves the views to the state', () => {
      const a = <div />
      const b = <div />
      controller = new NavigationController({ views: [a, b] })
      expect(controller.state).not.to.be.undefined
      expect(controller.state.views).to.have.length(1)
      controller = new NavigationController({ views: [a] })
      expect(controller.state).not.to.be.undefined
      expect(controller.state.views).to.have.length(0)
    })
  })
  describe('#componentWillMount', () => {
    beforeEach(() => {
      controller = new NavigationController({ views: views })
      controller.componentWillMount()
    })
    it('defaults to __isTransitioning=false ', () => {
      expect(controller.__isTransitioning).to.be.false
    })
    it('sets up an array for the view states', () => {
      expect(controller.__viewStates).not.to.be.undefined
      expect(Array.isArray(controller.__viewStates)).to.be.true
      expect(controller.__viewStates).to.have.length(0)
    })
    it('sets up an array for the view indexes', () => {
      expect(controller.__viewIndexes).not.to.be.undefined
      expect(Array.isArray(controller.__viewIndexes)).to.be.true
      expect(controller.__viewIndexes).to.have.length(2)
      expect(controller.__viewIndexes[0]).to.be.equal(0)
      expect(controller.__viewIndexes[1]).to.be.equal(1)
    })
    it('creates a new spring system', () => {
      expect(controller.__springSystem).to.be.an.instanceof(rebound.SpringSystem)
    })
  })
  describe('#componentWillUnmount', () => {
    let spring
    beforeEach(() => {
      controller = new NavigationController({ views: views })
      controller.componentWillMount()
      spring = controller.__spring
      controller.componentWillUnmount()
    })
    it('cleans up spring system', () => {
      expect(controller.__springSystem).to.be.undefined
    })
    it('cleans up spring', () => {
      expect(controller.__spring).to.be.undefined
    })
    it('removes spring event listeners', () => {
      expect(spring.listeners).to.deep.equal([])
    })
  })
  describe('#componentDidMount', () => {
    it('transforms the view wrappers', () => {
      expect(viewWrapper0).to.have.deep.property(`style.transform`)
      expect(viewWrapper1).to.have.deep.property(`style.transform`)
    })
  })
  describe('#__transformViews', () => {
    beforeEach(done => {
      requestAnimationFrame(() => {
        done()
      })
    })
    it('translates the views', (done) => {
      controller.__transformViews(10, 20, 30, 40)
      requestAnimationFrame(() => {
        expect(viewWrapper1.style.transform).to.equal(`translate(10%, 20%)`)
        expect(viewWrapper0.style.transform).to.equal(`translate(30%, 40%)`)
        done()
      })
    })
    it('sets the correct zIndex for Reveal transitions', (done) => {
      controller.setState({
        transition: Transition.type.REVEAL_DOWN
      }, () => {
        controller.__transformViews(10, 20, 30, 40)
        requestAnimationFrame(() => {
          expect(viewWrapper0.style.zIndex).to.equal('0')
          expect(viewWrapper1.style.zIndex).to.equal('1')
          done()
        })
      })
    })
    it('sets the correct zIndex for Push/Cover transitions', (done) => {
      controller.setState({
        transition: Transition.type.COVER_DOWN
      }, () => {
        controller.__transformViews(10, 20, 30, 40)
        requestAnimationFrame(() => {
          expect(viewWrapper0.style.zIndex).to.equal('1')
          expect(viewWrapper1.style.zIndex).to.equal('0')
          done()
        })
      })
    })
  })
  describe('#__animateViews', () => {
    let prevX
    let prevY
    let nextX
    let nextY
    let set = (p) => {
      [prevX, prevY, nextX, nextY] = p
    }
    it('PUSH_LEFT', () => {
      set(controller.__animateViews(0, Transition.type.PUSH_LEFT))
      expect(prevX).to.equal(0)
      expect(nextX).to.equal(100)
      set(controller.__animateViews(1, Transition.type.PUSH_LEFT))
      expect(prevX).to.equal(-100)
      expect(nextX).to.equal(0)
    })
    it('PUSH_RIGHT', () => {
      set(controller.__animateViews(0, Transition.type.PUSH_RIGHT))
      expect(prevX).to.equal(0)
      expect(nextX).to.equal(-100)
      set(controller.__animateViews(1, Transition.type.PUSH_RIGHT))
      expect(prevX).to.equal(100)
      expect(nextX).to.equal(0)
    })
    it('PUSH_UP', () => {
      set(controller.__animateViews(0, Transition.type.PUSH_UP))
      expect(prevY).to.equal(0)
      expect(nextY).to.equal(100)
      set(controller.__animateViews(1, Transition.type.PUSH_UP))
      expect(prevY).to.equal(-100)
      expect(nextY).to.equal(0)
    })
    it('PUSH_DOWN', () => {
      set(controller.__animateViews(0, Transition.type.PUSH_DOWN))
      expect(prevY).to.equal(0)
      expect(nextY).to.equal(-100)
      set(controller.__animateViews(1, Transition.type.PUSH_DOWN))
      expect(prevY).to.equal(100)
      expect(nextY).to.equal(0)
    })
    it('COVER_LEFT', () => {
      set(controller.__animateViews(0, Transition.type.COVER_LEFT))
      expect(prevX).to.equal(0)
      expect(nextX).to.equal(100)
      set(controller.__animateViews(1, Transition.type.COVER_LEFT))
      expect(prevX).to.equal(0)
      expect(nextX).to.equal(0)
    })
    it('COVER_RIGHT', () => {
      set(controller.__animateViews(0, Transition.type.COVER_RIGHT))
      expect(prevX).to.equal(0)
      expect(nextX).to.equal(-100)
      set(controller.__animateViews(1, Transition.type.COVER_RIGHT))
      expect(prevX).to.equal(0)
      expect(nextX).to.equal(0)
    })
    it('COVER_UP', () => {
      set(controller.__animateViews(0, Transition.type.COVER_UP))
      expect(prevY).to.equal(0)
      expect(nextY).to.equal(100)
      set(controller.__animateViews(1, Transition.type.COVER_UP))
      expect(prevY).to.equal(0)
      expect(nextY).to.equal(0)
    })
    it('COVER_DOWN', () => {
      set(controller.__animateViews(0, Transition.type.COVER_DOWN))
      expect(prevY).to.equal(0)
      expect(nextY).to.equal(-100)
      set(controller.__animateViews(1, Transition.type.COVER_DOWN))
      expect(prevY).to.equal(0)
      expect(nextY).to.equal(0)
    })
    it('REVEAL_LEFT', () => {
      set(controller.__animateViews(0, Transition.type.REVEAL_LEFT))
      expect(prevX).to.equal(0)
      expect(nextX).to.equal(0)
      set(controller.__animateViews(1, Transition.type.REVEAL_LEFT))
      expect(prevX).to.equal(-100)
      expect(nextX).to.equal(0)
    })
    it('REVEAL_RIGHT', () => {
      set(controller.__animateViews(0, Transition.type.REVEAL_RIGHT))
      expect(prevX).to.equal(0)
      expect(nextX).to.equal(0)
      set(controller.__animateViews(1, Transition.type.REVEAL_RIGHT))
      expect(prevX).to.equal(100)
      expect(nextX).to.equal(0)
    })
    it('REVEAL_UP', () => {
      set(controller.__animateViews(0, Transition.type.REVEAL_UP))
      expect(prevY).to.equal(0)
      expect(nextY).to.equal(0)
      set(controller.__animateViews(1, Transition.type.REVEAL_UP))
      expect(prevY).to.equal(-100)
      expect(nextY).to.equal(0)
    })
    it('REVEAL_DOWN', () => {
      set(controller.__animateViews(0, Transition.type.REVEAL_DOWN))
      expect(prevY).to.equal(0)
      expect(nextY).to.equal(0)
      set(controller.__animateViews(1, Transition.type.REVEAL_DOWN))
      expect(prevY).to.equal(100)
      expect(nextY).to.equal(0)
    })
  })
  describe('#__animateViewsComplete', () => {
    it('sets to __isTransitioning=false ', () => {
      controller.__animateViewsComplete()
      expect(controller.__isTransitioning).to.be.false
    })
    it('hides the previous view wrapper ', (done) => {
      controller.__animateViewsComplete()
      const [prev] = controller.__viewIndexes
      requestAnimationFrame(() => {
        expect(controller.refs[`view-wrapper-${prev}`].style.display).to.equal('none')
        done()
      })
    })
    it('unmounts the previous view', (done) => {
      let prev
      let next
      requestAnimationFrame(() => {
        [prev, next] = controller.__viewIndexes.slice()
        controller.__animateViewsComplete()
      })
      requestAnimationFrame(() => {
        expect(controller.state.mountedViews[prev]).to.be.null
        expect(controller.state.mountedViews[next].type).to.equal(ViewA)
        done()
      })
    })
    it('alternates the view indexes', (done) => {
      let a
      let b
      requestAnimationFrame(() => {
        a = controller.__viewIndexes.slice()
        controller.__animateViewsComplete()
      })
      requestAnimationFrame(() => {
        b = controller.__viewIndexes.slice()
        expect(a[0]).to.equal(b[1])
        expect(a[1]).to.equal(b[0])
        done()
      })
    })
  })
  describe('#__displayViews', () => {
    beforeEach(done => {
      requestAnimationFrame(() => {
        done()
      })
    })
    it('hides the views', (done) => {
      controller.__displayViews('none')
      requestAnimationFrame(() => {
        expect(controller.refs[`view-wrapper-0`].style.display).to.equal('none')
        expect(controller.refs[`view-wrapper-1`].style.display).to.equal('none')
        done()
      })
    })
    it('shows the views', (done) => {
      controller.__displayViews('block')
      requestAnimationFrame(() => {
        expect(controller.refs[`view-wrapper-0`].style.display).to.equal('block')
        expect(controller.refs[`view-wrapper-1`].style.display).to.equal('block')
        done()
      })
    })
  })
  describe('#__transitionViews', () => {
    beforeEach(done => {
      requestAnimationFrame(() => {
        done()
      })
    })
    it('sets the completion callback', () => {
      controller.__transitionViews({})
      expect(controller.__transitionViewsComplete).to.be.a('function')
    })
    it('sets and calls the completion callback', (done) => {
      const transitionCallbackSpy = sinon.spy()
      controller.__transitionViews({
        transition: Transition.type.NONE,
        onComplete: transitionCallbackSpy
      })
      const transitionCompleteSpy = sinon.spy(controller, '__transitionViewsComplete')
      requestAnimationFrame(() => {
        expect(transitionCompleteSpy.calledOnce).to.be.true
        expect(transitionCallbackSpy.calledOnce).to.be.true
        done()
      })
    })
    it('manually runs a "none" transition', (done) => {
      const transformSpy = sinon.spy(controller, '__transformViews')
      const animateCompleteSpy = sinon.spy(controller, '__animateViewsComplete')
      controller.__transitionViews({
        transition: Transition.type.NONE
      })
      const transitionCompleteSpy = sinon.spy(controller, '__transitionViewsComplete')
      requestAnimationFrame(() => {
        expect(transformSpy.calledOnce).to.be.true
        expect(animateCompleteSpy.calledOnce).to.be.true
        expect(transitionCompleteSpy.calledOnce).to.be.true
        done()
      })
    })
    it('runs a built-in spring transition', (done) => {
      const animateSpy = sinon.spy(controller, '__animateViews')
      const transformSpy = sinon.spy(controller, '__transformViews')
      const animateCompleteSpy = sinon.spy(controller, '__animateViewsComplete')
      controller.__transitionViews({
        transition: Transition.type.PUSH_LEFT,
        onComplete () {
          expect(animateSpy.callCount).to.be.above(1)
          expect(transformSpy.callCount).to.be.above(1)
          expect(animateCompleteSpy.calledOnce).to.be.true
          done()
        }
      })
      controller.__isTransitioning = true
    })
    it('runs a custom transtion', (done) => {
      let _prevElement
      let _nextElement
      controller.__transitionViews({
        transition (prevElement, nextElement, done) {
          _prevElement = prevElement
          _nextElement = nextElement
          prevElement.style.transform = 'translate(10px, 20px)'
          nextElement.style.transform = 'translate(30px, 40px)'
          setTimeout(done, 500)
        },
        onComplete () {
          expect(_prevElement.style.transform).to.equal(`translate(10px, 20px)`)
          expect(_nextElement.style.transform).to.equal(`translate(30px, 40px)`)
          done()
        }
      })
    })
  })
  describe('#__pushView', () => {
    beforeEach(done => {
      requestAnimationFrame(() => {
        done()
      })
    })
    it('throws an error if a non-react view is passed', () => {
      expect(() => {
        controller.__pushView({})
      }).to.throw(/view/)
    })
    it('throws an error if an invalid callback is passed', () => {
      expect(() => {
        controller.__pushView(<ViewA />, { onComplete: true })
      }).to.throw(/onComplete/)
    })
    it('throws an error if an invalid transition is passed', () => {
      expect(() => {
        controller.__pushView(<ViewA />, { transition: true })
      }).to.throw(/transition/)
    })
    it('returns early if the controller is already transitioning', () => {
      const spy = sinon.spy(controller, 'setState')
      controller.__isTransitioning = true
      controller.__pushView(<ViewA />)
      expect(spy.called).not.to.be.true
    })
    it('shows the view wrappers', () => {
      const spy = sinon.spy(controller, '__displayViews')
      controller.__pushView(<ViewB />)
      expect(spy.calledWith('block')).to.be.true
    })
    it('appends the view to state.views', (done) => {
      controller.__pushView(<ViewB />, {
        transition: Transition.type.NONE,
        onComplete () {
          expect(controller.state.views[1].type).to.equal(ViewB)
          done()
        }
      })
    })
    it('sets state.transition', (done) => {
      controller.__pushView(<ViewB />, {
        transition: Transition.type.NONE,
        onComplete () {
          done()
        }
      })
      requestAnimationFrame(() => {
        expect(controller.state.transition).to.equal(Transition.type.NONE)
      })
    })
    it('sets state.mountedViews', (done) => {
      const [prev, next] = controller.__viewIndexes
      controller.__pushView(<ViewB />, {
        transition: Transition.type.PUSH_LEFT,
        onComplete () {
          expect(controller.state.views[1].type).to.equal(ViewB)
          done()
        }
      })
      requestAnimationFrame(() => {
        expect(controller.state.mountedViews[prev].type).to.equal(ViewA)
        expect(controller.state.mountedViews[next].type).to.equal(ViewB)
      })
    })
    it('transitions the views', (done) => {
      const spy = sinon.spy(controller, '__transitionViews')
      controller.__pushView(<ViewB />, { transition: Transition.type.NONE })
      requestAnimationFrame(() => {
        expect(spy.calledOnce).to.be.true
        done()
      })
    })
    it('sets __isTransitioning=true', () => {
      controller.__pushView(<ViewB />, { transition: Transition.type.NONE })
      expect(controller.__isTransitioning).to.be.true
    })
    it('calls the transitionDone callback', (done) => {
      controller.__pushView(<ViewB />, {
        transition: Transition.type.NONE,
        onComplete () {
          expect(true).to.be.true
          done()
        }
      })
    })
    it('preserves the state', (done) => {
      controller = renderIntoDocument(
        <NavigationController views={views} preserveState />
      )
      requestAnimationFrame(() => {
        controller.refs[`view-${controller.__viewIndexes[0]}`].setState({
          foo: 'bar'
        })
        controller.__pushView(<ViewB />, { transition: Transition.type.NONE })
        requestAnimationFrame(() => {
          expect(controller.__viewStates).to.have.length(1)
          expect(controller.__viewStates[0]).to.have.property('foo')
          done()
        })
      })
    })
  })
  describe('#__popView', () => {
    beforeEach(done => {
      controller = renderIntoDocument(
        <NavigationController views={[<ViewA />, <ViewB />]} />
      )
      requestAnimationFrame(() => {
        done()
      })
    })
    it('throws an error if an only one view is in the stack', () => {
      controller.state.views = [<ViewA />]
      expect(() => {
        controller.__popView()
      }).to.throw(/stack/)
    })
    it('throws an error if an invalid callback is passed', () => {
      expect(() => {
        controller.__popView({ onComplete: true })
      }).to.throw(/onComplete/)
    })
    it('throws an error if an invalid transition is passed', () => {
      expect(() => {
        controller.__popView({ transition: true })
      }).to.throw(/transition/)
    })
    it('returns early if the controller is already transitioning', () => {
      const spy = sinon.spy(controller, 'setState')
      controller.__isTransitioning = true
      controller.__popView()
      expect(spy.called).not.to.be.true
    })
    it('shows the view wrappers', () => {
      const spy = sinon.spy(controller, '__displayViews')
      controller.__popView()
      expect(spy.calledWith('block')).to.be.true
    })
    it('removes the last view from state.views', (done) => {
      controller.__popView({
        onComplete () {
          expect(controller.state.views).to.have.length(1)
          expect(controller.state.views[0].type).to.equal(ViewA)
          done()
        },
        transition: Transition.type.NONE
      })
    })
    it('sets state.transition', (done) => {
      controller.__popView({
        transition: Transition.type.NONE,
        onComplete () {
          done()
        }
      })
      requestAnimationFrame(() => {
        expect(controller.state.transition).to.equal(Transition.type.NONE)
      })
    })
    it('sets state.mountedViews', (done) => {
      const [prev, next] = controller.__viewIndexes
      controller.__popView({
        transition: Transition.type.PUSH_RIGHT,
        onComplete () {
          done()
        }
      })
      requestAnimationFrame(() => {
        expect(controller.state.mountedViews[prev].type).to.equal(ViewB)
        expect(controller.state.mountedViews[next].type).to.equal(ViewA)
      })
    })
    it('transitions the views', (done) => {
      const spy = sinon.spy(controller, '__transitionViews')
      controller.__popView({ transition: Transition.type.NONE })
      requestAnimationFrame(() => {
        expect(spy.calledOnce).to.be.true
        done()
      })
    })
    it('sets __isTransitioning=true', () => {
      controller.__popView({ transition: Transition.type.NONE })
      expect(controller.__isTransitioning).to.be.true
    })
    it('calls the onComplete callback', (done) => {
      controller.__popView({
        onComplete () {
          expect(true).to.be.true
          done()
        }
      })
    })
    it('does not rehydrate the state', (done) => {
      requestAnimationFrame(() => {
        controller.refs[`view-${controller.__viewIndexes[0]}`].setState({
          foo: 'bar'
        })
        controller.pushView(<ViewB />, {
          transition: Transition.type.NONE,
          onComplete () {
            controller.popView({
              transition: Transition.type.NONE,
              onComplete () {
                expect(controller.refs[`view-${controller.__viewIndexes[0]}`].state)
                  .not.to.have.property('foo')
                done()
              }
            })
          }
        })
      })
    })
    it('rehydrates the state', (done) => {
      controller = renderIntoDocument(
        <NavigationController views={views} preserveState />
      )
      requestAnimationFrame(() => {
        controller.refs[`view-${controller.__viewIndexes[0]}`].setState({
          foo: 'bar'
        })
        controller.pushView(<ViewB />, {
          transition: Transition.type.NONE,
          onComplete () {
            controller.popView({
              transition: Transition.type.NONE,
              onComplete () {
                expect(controller.refs[`view-${controller.__viewIndexes[0]}`].state)
                  .to.have.property('foo')
                done()
              }
            })
          }
        })
      })
    })
  })
  describe('#__popToRootView', () => {
    beforeEach(done => {
      controller = renderIntoDocument(
        <NavigationController views={[<ViewA />, <ViewB />, <ViewC />]} />
      )
      requestAnimationFrame(() => {
        done()
      })
    })
    it('throws an error if an only one view is in the stack', () => {
      controller.state.views = [<ViewA />]
      expect(() => {
        controller.__popToRootView()
      }).to.throw(/stack/)
    })
    it('returns early if the controller is already transitioning', () => {
      const spy = sinon.spy(controller, 'setState')
      controller.__isTransitioning = true
      controller.__popToRootView()
      expect(spy.called).not.to.be.true
    })
    it('shows the view wrappers', () => {
      const spy = sinon.spy(controller, '__displayViews')
      controller.__popToRootView()
      expect(spy.calledWith('block')).to.be.true
    })
    it('removes all but the root view from state.views', (done) => {
      controller.__popToRootView({
        onComplete () {
          expect(controller.state.views).to.have.length(1)
          expect(controller.state.views[0].type).to.equal(ViewA)
          done()
        },
        transition: Transition.type.NONE
      })
    })
    it('sets state.transition', (done) => {
      controller.__popToRootView({
        transition: Transition.type.NONE,
        onComplete () {
          done()
        }
      })
      requestAnimationFrame(() => {
        expect(controller.state.transition).to.equal(Transition.type.NONE)
      })
    })
    it('sets state.mountedViews', (done) => {
      const [prev, next] = controller.__viewIndexes
      controller.__popToRootView({
        transition: Transition.type.PUSH_RIGHT,
        onComplete () {
          done()
        }
      })
      requestAnimationFrame(() => {
        expect(controller.state.mountedViews[prev].type).to.equal(ViewC)
        expect(controller.state.mountedViews[next].type).to.equal(ViewA)
      })
    })
    it('transitions the views', (done) => {
      const spy = sinon.spy(controller, '__transitionViews')
      controller.__popToRootView({ transition: Transition.type.NONE })
      requestAnimationFrame(() => {
        expect(spy.calledOnce).to.be.true
        done()
      })
    })
    it('sets __isTransitioning=true', () => {
      controller.__popToRootView({ transition: Transition.type.NONE })
      expect(controller.__isTransitioning).to.be.true
    })
    it('calls the onComplete callback', (done) => {
      controller.__popToRootView({
        onComplete () {
          expect(true).to.be.true
          done()
        }
      })
    })
    it('does not rehydrate the state', (done) => {
      controller = renderIntoDocument(
        <NavigationController views={[<ViewA />]} preserveState={false} />
      )
      requestAnimationFrame(() => {
        var rootView = controller.refs[`view-${controller.__viewIndexes[0]}`]
        rootView.setState({
          foo: 'bar'
        })
        controller.pushView(<ViewB />, {
          transition: Transition.type.NONE,
          onComplete () {
            controller.pushView(<ViewC />, {
              transition: Transition.type.NONE,
              onComplete () {
                controller.popToRootView({
                  transition: Transition.type.NONE,
                  onComplete () {
                    rootView = controller.refs[`view-${controller.__viewIndexes[1]}`]
                    expect(rootView.state)
                      .not.to.have.property('foo')
                    done()
                  }
                })
              }
            })
          }
        })
      })
    })
    it('rehydrates the state', (done) => {
      controller = renderIntoDocument(
        <NavigationController views={[<ViewA />]} preserveState />
      )
      requestAnimationFrame(() => {
        controller.refs[`view-${controller.__viewIndexes[0]}`].setState({
          foo: 'bar'
        })
        controller.pushView(<ViewB />, {
          transition: Transition.type.NONE,
          onComplete () {
            controller.pushView(<ViewC />, {
              transition: Transition.type.NONE,
              onComplete () {
                controller.popToRootView({
                  transition: Transition.type.NONE,
                  onComplete () {
                    expect(controller.refs[`view-${controller.__viewIndexes[1]}`].state)
                      .to.have.property('foo')
                    done()
                  }
                })
              }
            })
          }
        })
      })
    })
  })
  describe('#__setViews', () => {
    beforeEach(done => {
      requestAnimationFrame(() => {
        done()
      })
    })
    it('pushes the last view on the stack', () => {
      controller.__setViews([<ViewB />], {
        transition: Transition.type.NONE,
        onComplete () {
          expect(controller.state.views).to.have.length(1)
        }
      })
    })
    it('clears the saved view states', () => {
      controller.__setViews([<ViewB />], {
        transition: Transition.type.NONE,
        onComplete () {
          expect(controller.__viewStates).to.have.length(0)
        }
      })
    })
  })
  describe('#__renderPrevView', () => {
    beforeEach(done => {
      requestAnimationFrame(() => {
        done()
      })
    })
    it('returns null if the previous view is no longer mounted', () => {
      expect(controller.__renderPrevView()).to.be.null
    })
    it('returns a clone if the previous view is mounted', (done) => {
      controller.__pushView(<ViewB />)
      requestAnimationFrame(() => {
        const prevView = controller.__renderPrevView()
        const ref = controller.refs[`view-${controller.__viewIndexes[0]}`]
        expect(prevView).not.to.be.null
        expect(ref).not.to.be.null
        expect(ref.props.navigationController).to.equal(controller)
        done()
      })
    })
  })
  describe('#__renderNextView', () => {
    beforeEach(done => {
      requestAnimationFrame(() => {
        done()
      })
    })
    it('returns null if the next view is no longer mounted', (done) => {
      controller.__pushView(<ViewB />, {
        transition: Transition.type.NONE,
        onComplete () {
          expect(controller.__renderNextView()).to.be.null
          done()
        }
      })
    })
    it('returns a clone if the next view is mounted', (done) => {
      controller.__pushView(<ViewB />)
      requestAnimationFrame(() => {
        const nextView = controller.__renderNextView()
        const ref = controller.refs[`view-${controller.__viewIndexes[1]}`]
        expect(nextView).not.to.be.null
        expect(ref).not.to.be.null
        expect(ref.props.navigationController).to.equal(controller)
        done()
      })
    })
  })
  describe('Lifecycle Events', () => {
    let stubLifecycleEvents = (onTransitionViews) => {
      const e = {
        prevView: {
          willHide: sinon.spy(),
          didHide: sinon.spy()
        },
        nextView: {
          willShow: sinon.spy(),
          didShow: sinon.spy()
        }
      }
      const stub = sinon.stub(controller, '__transitionViews', (options) => {
        let prevView = controller.refs['view-0']
        if (prevView) {
          prevView.navigationControllerWillHideView = e.prevView.willHide
          prevView.navigationControllerDidHideView = e.prevView.didHide
        }
        let nextView = controller.refs['view-1']
        if (nextView) {
          nextView.navigationControllerWillShowView = e.nextView.willShow
          nextView.navigationControllerDidShowView = e.nextView.didShow
        }
        stub.restore()
        controller.__transitionViews(options)
        onTransitionViews()
      })
      return e
    }
    let expectCallsBeforeTransition = (e) => {
      expect(e.prevView.willHide.calledOnce).to.be.true
      expect(e.nextView.willShow.calledOnce).to.be.true
      expect(e.prevView.didHide.calledOnce).to.be.false
      expect(e.nextView.didShow.calledOnce).to.be.false
      expect(e.prevView.willHide.calledBefore(e.nextView.willShow)).to.be.true
    }
    let expectCallsAfterTransition = (e) => {
      expect(e.prevView.didHide.calledOnce).to.be.true
      expect(e.nextView.didShow.calledOnce).to.be.true
      expect(e.prevView.didHide.calledBefore(e.nextView.didShow)).to.be.true
    }
    describe('#__pushView', () => {
      beforeEach(done => {
        requestAnimationFrame(() => {
          done()
        })
      })
      it('calls events with a "none" transition', (done) => {
        const e = stubLifecycleEvents(() => {
          expectCallsBeforeTransition(e)
        })
        controller.__pushView(<ViewB />, {
          transition: Transition.type.NONE,
          onComplete () {
            expectCallsAfterTransition(e)
            done()
          }
        })
      })
      it('calls events with a built-in spring animation', (done) => {
        const e = stubLifecycleEvents(() => {
          expectCallsBeforeTransition(e)
        })
        controller.__pushView(<ViewB />, {
          transition: Transition.type.PUSH_LEFT,
          onComplete () {
            expectCallsAfterTransition(e)
            done()
          }
        })
      })
    })
    describe('#__popView', () => {
      beforeEach(done => {
        controller = renderIntoDocument(
          <NavigationController views={[<ViewA />, <ViewB />]} />
        )
        requestAnimationFrame(() => {
          done()
        })
      })
      it('calls events with a "none" transition', (done) => {
        const e = stubLifecycleEvents(() => {
          expectCallsBeforeTransition(e)
        })
        controller.__popView({
          transition: Transition.type.NONE,
          onComplete () {
            expectCallsAfterTransition(e)
            done()
          }
        })
      })
      it('calls events with a built-in spring animation', (done) => {
        const e = stubLifecycleEvents(() => {
          expectCallsBeforeTransition(e)
        })
        controller.__popView({
          transition: Transition.type.PUSH_LEFT,
          onComplete () {
            expectCallsAfterTransition(e)
            done()
          }
        })
      })
    })
    describe('#__popToRootView', () => {
      beforeEach(done => {
        controller = renderIntoDocument(
          <NavigationController views={[<ViewA />, <ViewB />, <ViewC />]} />
        )
        requestAnimationFrame(() => {
          done()
        })
      })
      it('calls events with a "none" transition', (done) => {
        const e = stubLifecycleEvents(() => {
          expectCallsBeforeTransition(e)
        })
        controller.__popToRootView({
          transition: Transition.type.NONE,
          onComplete () {
            expectCallsAfterTransition(e)
            done()
          }
        })
      })
      it('calls events with a built-in spring animation', (done) => {
        const e = stubLifecycleEvents(() => {
          expectCallsBeforeTransition(e)
        })
        controller.__popToRootView({
          transition: Transition.type.PUSH_LEFT,
          onComplete () {
            expectCallsAfterTransition(e)
            done()
          }
        })
      })
    })
  })
})
