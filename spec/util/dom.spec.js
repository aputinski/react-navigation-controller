const {
  getVendorPrefix
} = require('../../src/util/dom');

describe('Util', () => {
  describe('DOM', () => {
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
});
