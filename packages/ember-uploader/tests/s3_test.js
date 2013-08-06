var Uploader, file;

module("Ember.S3Uploader", {
  setup: function() {
    if (typeof WebKitBlobBuilder === "undefined") {
      file = new Blob(['test'], { type: 'text/plain' });
    } else {
      var builder;
      builder = new WebKitBlobBuilder();
      builder.append('test');
      file = builder.getBlob();
    }

    Uploader = Ember.S3Uploader.extend({
      url: '/S3-URL',
      signUrl: '/sign-upload'
    });
  }
});

test("it has a sign url of '/sign-upload'", function() {
  expect(1);

  var uploader = Uploader.create();
  equal(uploader.signUrl, '/sign-upload');
});
