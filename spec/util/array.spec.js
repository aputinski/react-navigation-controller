const {
  dropRight,
  last,
  takeRight
} = require('../../src/util/array');

describe('Util', () => {
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
});
