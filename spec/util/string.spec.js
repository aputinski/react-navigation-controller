import {
  capitalize
} from '../../src/util/string';

describe('Util', () => {
  describe('String', () => {
    describe('#capitalize', () => {
      it('capitalizes the first character of a word', () => {
        expect(capitalize('hello')).to.equal('Hello');
        expect(capitalize('Hello')).to.equal('Hello');
        expect(capitalize('hello world')).to.equal('Hello world');
      });
    });
  });
});
