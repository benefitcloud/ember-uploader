/* eslint-disable */
var path = require('path');
var jsStringEscape = require('js-string-escape');
var EmberAddon = require('ember-cli/lib/broccoli/ember-addon');

function render(errors) {
  if (!errors) { return ''; }
  return errors.map(function(error) {
    return error.line + ':' + error.column + ' ' +
      ' - ' + error.message + ' (' + error.ruleId +')';
  }).join('\n');
}

// Qunit test generator
function eslintTestGenerator(relativePath, errors) {
  var pass = !errors || errors.length === 0;
  return "import { module, test } from 'qunit';\n" +
    "module('ESLint - " + path.dirname(relativePath) + "');\n" +
    "test('" + relativePath + " should pass ESLint', function(assert) {\n" +
    "  assert.ok(" + pass + ", '" + relativePath + " should pass ESLint." +
    jsStringEscape("\n" + render(errors)) + "');\n" +
   "});\n";
}

module.exports = function(defaults) {
  var app = new EmberAddon(defaults, {
    hinting: false,
    "ember-cli-qunit": {
      useLintTree: false
    },
    eslint: {
      testGenerator: eslintTestGenerator
    },
    babel: {
      includePolyfill: true
    }
    // Add options here
  });

  /*
    This build file specifes the options for the dummy test app of this
    addon, located in `/tests/dummy`
    This build file does *not* influence how the addon or the app using it
    behave. You most likely want to be modifying `./index.js` or app's build file
  */

  return app.toTree();
};
/* eslint-enable */
