// ==========================================================================
// Project:   Ember Uploader - v0.1.0
// Homepage:  https://github.com/benefitcloud/ember-uploader
// Copyright: ©2013 Joshua Borton
// Licensed:  MIT
// ==========================================================================

var Uploader;

module("Ember.Uploader", {
  setup: function() {
    Uploader = Ember.Uploader.extend({
      url: '/test'
    });
  }
});

test("has a url of '/test'", function() {
  var uploader = Uploader.create();
  equal(uploader.url, '/test');
});
