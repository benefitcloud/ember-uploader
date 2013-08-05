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
