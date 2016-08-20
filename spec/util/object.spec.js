/* global describe, it, expect */

import {
  assign
} from '../../src/util/object'

describe('Util', () => {
  describe('Object', () => {
    describe('#assign', () => {
      it('merges the sources into the target', () => {
        expect(assign({ foo: 'bar' }, { foo: 'baz' })).to.have.property('foo', 'baz')
        const a = assign({ foo: 'bar' }, { foo: 'baz', hello: 'world' })
        expect(a).to.have.property('foo', 'baz')
        expect(a).to.have.property('hello', 'world')
      })
    })
  })
})
