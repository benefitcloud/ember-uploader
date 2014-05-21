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
      url: '/test'
    });
  }
});

test("has a url of '/test'", function() {
  var uploader = Uploader.create();
  equal(uploader.url, '/test');
});

test("has a paramName of 'upload'", function() {
  var uploader = Uploader.create({ paramName: 'upload' });
  equal(uploader.paramName, 'upload');
});

test("has a paramNamespace of 'post'", function() {
  var uploader = Uploader.create({ paramNamespace: 'post' });
  equal(uploader.paramNamespace, 'post');
});

test("creates a param namespace", function() {
  var uploader = Uploader.create({ paramNamespace: 'post' });
  equal(uploader.toNamespacedParam('upload'), 'post[upload]');
});

test("has an ajax request of type 'PUT'", function() {
  var uploader = Uploader.create({type: 'PUT'});
  equal(uploader.type, 'PUT');
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

  uploader.upload(file);

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
    equal(e.percent, 100);
  });

  uploader.upload(file);

  stop();
});

test("it can receive extra data", function() {
  expect(1);

  var data = { test: 'valid' };

  var TestUploader = Uploader.extend({
    url: '/upload',
    setupFormData: function(file, extra) {
      equal(extra, data);
      return this._super(file, extra);
    }
  });

  var uploader = TestUploader.create();
  uploader.upload(file, data);
});
