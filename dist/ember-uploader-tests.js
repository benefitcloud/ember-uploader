// ==========================================================================
// Project:   Ember Uploader - v0.1.0
// Homepage:  https://github.com/benefitcloud/ember-uploader
// Copyright: ©2013 Joshua Borton
// Licensed:  MIT
// ==========================================================================

module("Ember");

test("it is defined and an Ember.Namespace", function() {
  ok(Ember);
  ok(Ember.Namespace.detectInstance(Ember));
});