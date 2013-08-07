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

    file.mime = 'text/plain';
    file.name = 'test.txt';

    Uploader = Ember.S3Uploader.extend({
      url: '/signed-url'
    });
  }
});

test("it has a sign url of '/sign-upload'", function() {
  expect(1);

  var uploader = Uploader.create();
  equal(uploader.url, '/signed-url');
});

test("uploads to s3", function() {
  expect(1);

  var uploader = Uploader.create({
    file: file
  });

  uploader.on('didUpload', function(data) {
    start();
    equal(data, '');
  });

  uploader.upload();

  stop();
});
