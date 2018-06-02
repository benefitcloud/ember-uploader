'use strict';

module.exports = {
  name: 'ember-uploader',
  treeForAddon: function(dir) {
    let version = require('./lib/version');
    let merge = require('broccoli-merge-trees');

    return this._super.treeForAddon.call(this, merge([version(), dir]));
  }
};
