/**
 * Get the vendor prefix for a property
 *
 * @param {array} 
 * @returns {string}
 */
exports.getVendorPrefix = function(property) {
  const el = document.createElement('div');
  const prefixes = ['', 'ms', 'Moz', 'Webkit'];
  let result;
  prefixes.forEach(prefix => {
    if (result) return;
    let prop = prefix ? _.capitalize(property) : property;
    let p = `${prefix}${prop}`;
    if (typeof el.style[p] !== 'undefined') {
      result = p;
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
exports.dropRight = function(array, n=1) {
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
exports.last = function(array) {
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
exports.takeRight = function(array, n=1) {
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
exports.capitalize = function(string) {
  return string && (string.charAt(0).toUpperCase() + string.slice(1));
}
