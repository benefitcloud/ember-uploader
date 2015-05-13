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
  var responseData = JSON.stringify({ bucket: 'test' });

  window.server.respondWith('GET', /^\/sign(.*)$/, [200, {}, responseData]);

  expect(1);

  var NewUploader = Uploader.extend({
    ajax: function() {
      start();
      ok(true);
    }
  });

  var uploader = NewUploader.create();

  uploader.upload(file);

  stop();
});

test("it can override the name of the file being uploaded", function() {
  expect(1);

  var uploader = Uploader.create({
    // Filename Override
    fileName: function(name, ext) {
      return name + '-cust-filename' + ext;
    },
  });

  equal(uploader.generateFileName('file.mp4'), 'file-cust-filename.mp4');
});

test("it takes the filename as given if no override exists", function() {
  expect(1);

  var uploader = Uploader.create();

  equal(uploader.generateFileName('file.mp4'), 'file.mp4');
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
