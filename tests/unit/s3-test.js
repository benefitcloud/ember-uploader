import { S3Uploader } from 'ember-uploader/uploaders';
import test from 'dummy/tests/ember-sinon-qunit/test';
import startMirage from '../helpers/setup-mirage-for-units';

let file;

module("EmberUploader.S3Uploader", {
  setup () {
    startMirage(this.container);
    if (typeof WebKitBlobBuilder === "undefined") {
      file = new Blob(['test'], { type: 'text/plain' });
    } else {
      const builder = new WebKitBlobBuilder();
      builder.append('test');
      file = builder.getBlob();
    }

    file.mime = 'text/plain';
    file.name = 'test.txt';
  }
});

test("it has a sign url of '/api/signed-url'", () => {
  expect(1);

  let uploader = S3Uploader.create({
    signingUrl: '/api/signed-url'
  });

  equal(uploader.signingUrl, '/api/signed-url');
});

test("it uploads after signing", function () {
  expect(1);

  let uploader = S3Uploader.extend({
    ajax: function() {
      start();
      ok(true);
    }
  }).create();

  uploader.upload(file);

  stop();
});

test("it has default sign request type as 'GET'", function () {
  expect(1);

  let uploader = S3Uploader.create();
  equal(uploader.get('signingMethod'), 'GET');
});

test("sign request type can be customized", function () {
  expect(1);

  let uploader = S3Uploader.create({
    method: 'POST'
  });
  equal(uploader.get('method'), 'POST');
});

test("uploads to s3", function() {
  expect(1);

  var uploader = S3Uploader.create({
    file: file
  });

  uploader.on('didUpload', function(data) {
    start();
    ok(true);
  });

  uploader.upload(file);

  stop();
});

test("it allows overriding ajax sign settings", function () {
  this.stub(Ember.$, 'ajax');

  expect(1);

  const settings = {
    headers: {
      'Content-Type': 'text/html'
    }
  };

  const uploader = S3Uploader.extend({
    signingAjaxSettings: settings
  }).create();

  uploader.sign('/test');

  equal(Ember.$.ajax.getCall(0).args[0].headers['Content-Type'], 'text/html');
});

test("it allows signingAjaxSettings to be a computed property", function () {
  this.stub(Ember.$, 'ajax');

  expect(2);

  const uploader = S3Uploader.extend({
    _testIterator: 0,

    signingAjaxSettings: Ember.computed('_testIterator', function() {
      return {
        headers: {
          'X-My-Incrementor': this.get('_testIterator'),
        }
      };
    }),
  }).create();

  uploader.sign('/test');
  equal(Ember.$.ajax.getCall(0).args[0].headers['X-My-Incrementor'], '0');

  uploader.set('_testIterator', 1);
  uploader.sign('/test');
  equal(Ember.$.ajax.getCall(1).args[0].headers['X-My-Incrementor'], '1');
});
