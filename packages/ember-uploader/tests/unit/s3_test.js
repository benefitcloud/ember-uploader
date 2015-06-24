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

test("it has default sign request type as 'GET'", function() {
  expect(1);

  var uploader = Uploader.create();
  equal(uploader.get('signRequestType'), 'GET');
});

test("sign request type can be customized", function() {
  expect(1);

  var uploader = Uploader.create({
    signRequestType: 'POST'
  });
  equal(uploader.get('signRequestType'), 'POST');
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
test("it allows overriding sign headers", function() {
  expect(1);
  var TestUploader = Uploader.extend({
    headers: {
      'Content-Type': 'text/html'
    }
  });

  var uploader = TestUploader.create();
  var settings = uploader.ajaxSignSettings('/test', {});
  equal(settings.headers['Content-Type'], 'text/html');
});

test("it allows overriding ajax sign settings", function() {
  expect(2);
  var TestUploader = Uploader.extend({
    ajaxSignSettings: function() {
      var settings = this._super.apply(this, arguments);
      settings.headers = {
        'Content-Type': 'text/html'
      }
      return settings;
    }
  });

  var uploader = TestUploader.create();
  var settings = uploader.ajaxSignSettings('/test', {});
  equal(settings.headers['Content-Type'], 'text/html');
  equal(settings.url, '/test');
});
