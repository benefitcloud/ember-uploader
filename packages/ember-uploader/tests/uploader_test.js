var Uploader, file;

module("Ember.Uploader", {
  setup: function() {
    if (typeof WebKitBlobBuilder === "undefined") {
      file = new Blob(['test'], { type: 'text/plain' });
    } else {
      var builder;
      builder = new WebKitBlobBuilder();
      builder.append('test');
      file = builder.getBlob();
    }

    Uploader = Ember.Uploader.extend({
      url: '/test',
    });
  }
});

test("has a url of '/test'", function() {
  var uploader = Uploader.create();
  equal(uploader.url, '/test');
});

test("uploads to the given url", function() {
  expect(1);

  var uploader = Uploader.create({
    url: '/upload',
    file: file
  });

  uploader.on('didUpload', function(data) {
    start();
    equal(data, 'OK');
  });

  uploader.upload();

  stop();
});

test("emits progress event", function() {
  expect(1);

  var uploader = Uploader.create({
    url: '/upload',
    file: file
  });

  uploader.on('progress', function(e) {
    start();
    equal(uploader.progress, 100);
  });

  uploader.upload();

  stop();
});
