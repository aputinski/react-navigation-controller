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
  capitalize
};
