var Uploader, file;
var OldFormData;

module("EmberUploader.Uploader", {
  setup: function() {
    if (typeof WebKitBlobBuilder === "undefined") {
      file = new Blob(['test'], { type: 'text/plain' });
    } else {
      var builder;
      builder = new WebKitBlobBuilder();
      builder.append('test');
      file = builder.getBlob();
    }

    Uploader = EmberUploader.Uploader.extend({
      url: '/test'
    });

    OldFormData = FormData;

    FormData = function() {};

    FormData.data = {};

    FormData.reset = function() {
      this.data = {};
    };

    FormData.prototype.append = function(name, value) {
      FormData.data[name] = value;
    };

    window.server = sinon.fakeServer.create();
    window.server.autoRespond = true;
  },

  teardown: function() {
    window.server.restore();

    FormData.reset();
    FormData = OldFormData;
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

test("it can upload multiple files", function() {
  expect(3);

  var uploader = Uploader.create({ paramName: 'files' });
  uploader.setupFormData([1,2,3]);
  equal(FormData.data['files[0]'], 1);
  equal(FormData.data['files[1]'], 2);
  equal(FormData.data['files[2]'], 3);
});

test("uploads to the given url", function() {
  window.server.respondWith('POST', '/upload', [200, {}, 'OK']);

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

test("uploads promise gets resolved", function() {
  window.server.respondWith('POST', '/upload', [200, {}, 'OK']);

  expect(1);

  var uploader = Uploader.create({
    url: '/upload',
    file: file
  });

  uploader.upload(file).then(function(data) {
    start();
    equal(data, 'OK');
  });

  stop();
});

test("uploads promise gets rejected", function() {
  window.server.respondWith('POST', '/upload', [400, {}, '']);

  expect(1);

  var uploader = Uploader.create({
    url: '/upload',
    file: file
  });

  uploader.upload(file).then(function(data) {
  }, function(data) {
    start();
    ok(true);
  });

  stop();
});

test("error response not undefined", function() {
  window.server.respondWith('POST', '/upload', [409, {}, '']);

  expect(1);

  var uploader = Uploader.create({
    url: '/upload'
  });

  uploader.upload(file).then(null, function(error) {
    start();
    equal(error.status, 409);
  });

  stop();
});

// TODO: Reimplement this test without actually uploading

// test("emits progress event", function() {
//   expect(1);
//
//   var uploader = Uploader.create({
//     url: '/upload',
//     file: file
//   });
//
//   uploader.on('progress', function(e) {
//     start();
//     equal(e.percent, 100);
//   });
//
//   uploader.upload(file);
//
//   stop();
// });

test("it can receive extra data", function() {
  window.server.respondWith('POST', '/upload', [200, {}, '']);
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
