/**
 * Get the vendor prefix for a property
 *
 * @param {array} 
 * @returns {string}
 */
function getVendorPrefix(property, el) {
  el = el || document.createElement('div');
  const prefixes = ['', 'ms', 'Moz', 'webkit'];
  let result;
  prefixes.forEach(prefix => {
    if (result) return;
    let prop = prefix ? prefix + capitalize(property) : property;
    if (typeof el.style[prop] !== 'undefined') {
      result = prop;
    }
  });
  return result;
}

/**
 * Creates a slice of `array` with `n` elements dropped from the end.
 *
 * @param {array} array The array to query.
 * @param {number} [n=1] The number of elements to drop.
 * @returns {array} Returns the slice of `array`.
 */
function dropRight(array, n=1) {
  const length = array ? array.length : 0;
  if (!length) {
    return [];
  }
  n = length - (+n || 0);
  return array.slice(0, n < 0 ? 0 : n);
}

/**
 * Gets the last element of `array`.
 *
 * @param {array} array The array to query.
 * @param {number} [n=1] The number of elements to drop.
 * @returns {*} Returns the last element of `array`.
 */
function last(array) {
  const length = array ? array.length : 0;
  return length ? array[length - 1] : undefined;
}

/**
 * Creates a slice of `array` with `n` elements taken from the end.
 *
 * @param {array} array The array to query.
 * @param {number} [n=1] The number of elements to take.
 * @returns {array} Returns the slice of `array`.
 */
function takeRight(array, n=1) {
  var length = array ? array.length : 0;
  if (!length) {
    return [];
  }
  n = length - (+n || 0);
  return array.slice(n < 0 ? 0 : n);
}

/**
 * Capitalizes the first character of `string`.
 *
 * @param {string} [string=''] The string to capitalize.
 * @returns {string} Returns the capitalized string.
 */
function capitalize(string) {
  return string && (string.charAt(0).toUpperCase() + string.slice(1));
}

module.exports = {

  getVendorPrefix,

  dropRight,
  last,
  takeRight,

  capitalize

};
