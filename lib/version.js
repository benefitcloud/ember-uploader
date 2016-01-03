/* eslint-disable */
var createFile = require('broccoli-file-creator');
var version = require('../package.json').version;

module.exports = function () {
  return createFile('version.js', 'export default "' + version + '";');
}
/* eslint-enable */
