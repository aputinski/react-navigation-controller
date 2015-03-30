const {
  getVendorPrefix,
  dropRight,
  last,
  takeRight,
  capitalize,
  assign
} = require('../src/util');

describe('Util', () => {
  describe('Misc', () => {
    describe('#getVendorPrefix', () => {
      let el;
      it('gets the correct prefix', () => {
        el = {style:{'transform':true,'webkitTransform':true}};
        expect(getVendorPrefix('transform', el)).to.equal('transform');
        el = {style:{'webkitTransform':true}};
        expect(getVendorPrefix('transform', el)).to.equal('webkitTransform');
      });
    });
  });
  describe('Array', () => {
    describe('#dropRight', () => {
      it('drops the last element from the array', () => {
        const a = dropRight([1,2,3,4,5,6,7,8,9,10]);
        expect(a).to.have.length(9);
        expect(a[8]).to.equal(9);
      });
      it('drops the specified number of elements from the end of the array', () => {
        const a = dropRight([1,2,3,4,5,6,7,8,9,10], 2);
        expect(a).to.have.length(8);
        expect(a[7]).to.equal(8);
      });
    });
    describe('#last', () => {
      it('gets the last element in the array', () => {
        expect(last([1,2,3])).to.equal(3);
      });
    });
    describe('#takeRight', () => {
      it('get the last element from the array', () => {
        const a = takeRight([1,2,3,4,5,6,7,8,9,10]);
        expect(a).to.have.length(1);
        expect(a[0]).to.equal(10);
      });
      it('gets the specified number of elements from the end of the array', () => {
        const a = takeRight([1,2,3,4,5,6,7,8,9,10], 3);
        expect(a).to.have.length(3);
        expect(a[0]).to.equal(8);
        expect(a[1]).to.equal(9);
        expect(a[2]).to.equal(10);
      });
    });
  });
  describe('String', () => {
    describe('#capitalize', () => {
      it('capitalizes the first character of a word', () => {
        expect(capitalize('hello')).to.equal('Hello');
        expect(capitalize('Hello')).to.equal('Hello');
        expect(capitalize('hello world')).to.equal('Hello world');
      });
    });
  });
  describe('Object', () => {
    describe('#assign', () => {
      it('merges the sources into the target', () => {
        expect(assign({foo:'bar'},{foo:'baz'})).to.have.property('foo', 'baz');
        const a = assign({foo:'bar'},{foo:'baz',hello:'world'})
        expect(a).to.have.property('foo', 'baz');
        expect(a).to.have.property('hello', 'world');
      });
    });
  });
});