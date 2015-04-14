var Uploader, file;

module("EmberUploader.S3Uploader", {
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

    Uploader = EmberUploader.S3Uploader.extend();

    window.server = sinon.fakeServer.create();
    window.server.autoRespond = true;
  },

  teardown: function() {
    window.server.restore();
  }
});

test("it has a sign url of '/api/signed-url'", function() {
  expect(1);

  var uploader = Uploader.create({
    url: '/api/signed-url'
  });

  equal(uploader.url, '/api/signed-url');
});

test("it uploads after signing", function() {
  var responseData = JSON.stringify({ port: '4567', bucket: 'test' });

  window.server.respondWith('GET', /^\/sign(.*)$/,
                            [200, { "Content-Type": "application/json" },
                             responseData]);

  expect(2);

  var NewUploader = Uploader.extend({
    ajax: function(url) {
      equal(url, '//test.s3.amazonaws.com:4567');
      start();
      ok(true);
    }
  });

  var uploader = NewUploader.create();

  uploader.upload(file);

  stop();
});

test("it builds s3 url", function() {
  var uploader = Uploader.extend({}).create();
  var url;

  url = uploader.buildS3Url({port: '4567', bucket: 'test', region: 'us-west-1'});
  equal(url, "s3-us-west-1.amazonaws.com:4567/test");

  url = uploader.buildS3Url({port: '4567', bucket: 'test'});
  equal(url, "test.s3.amazonaws.com:4567");

  url = uploader.buildS3Url({bucket: 'test'});
  equal(url, "test.s3.amazonaws.com");

  url = uploader.buildS3Url({bucket: 'test', region: 'us-west-1'});
  equal(url, "s3-us-west-1.amazonaws.com/test");
});

// TODO: Reimplement this test without actually using S3

// test("uploads to s3", function() {
//   expect(1);
//
//   var uploader = Uploader.create({
//     file: file
//   });
//
//   uploader.on('didUpload', function(data) {
//     start();
//     equal(data, '');
//   });
//
//   uploader.upload(file);
//
//   stop();
// });
