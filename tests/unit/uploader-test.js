import { Uploader } from 'ember-uploader/uploaders';
import test from 'dummy/tests/ember-sinon-qunit/test';
import startMirage from '../helpers/setup-mirage-for-units';
import TestableFormData from '../helpers/form-data';

let file;

module("EmberUploader.Uploader", {
  setup () {
    startMirage(this.container);
    if (typeof WebKitBlobBuilder === "undefined") {
      file = new Blob(['test'], { type: 'text/plain' });
    } else {
      const builder = new WebKitBlobBuilder();
      builder.append('test');
      file = builder.getBlob();
    }

    TestableFormData.inject();
  },

  teardown: function() {
    TestableFormData.remove();
  }
});

test("has a url of '/test'", function() {
  let uploader = Uploader.extend({
    url: '/test'
  }).create();

  equal(uploader.get('url'), '/test');
});

test("has a paramName of 'upload'", function() {
  let uploader = Uploader.extend({
    paramName: 'upload'
  }).create();

  equal(uploader.get('paramName'), 'upload');
});

test("has a paramNamespace of 'post'", function() {
  let uploader = Uploader.extend({
    paramNamespace: 'post'
  }).create();

  equal(uploader.get('paramNamespace'), 'post');
});

test("creates a param namespace", function() {
  let uploader = Uploader.extend({
    paramNamespace: 'post'
  }).create();

  equal(uploader.toNamespacedParam('upload'), 'post[upload]');
});

test("has an ajax request of type 'PUT'", function() {
  let uploader = Uploader.extend({
    method: 'PUT'
  }).create();

  equal(uploader.get('method'), 'PUT');
});

test("it can upload multiple files", function() {
  expect(3);

  let uploader = Uploader.extend({
    paramName: 'files'
  }).create();

  let formData = uploader.createFormData([1,2,3]);
  equal(formData.data['files[][0]'], 1);
  equal(formData.data['files[][1]'], 2);
  equal(formData.data['files[][2]'], 3);
});

test("uploads to the given url", function() {
  expect(1);

  let uploader = Uploader.extend({
    url: '/upload',
    file: file
  }).create();

  uploader.on('didUpload', function(data) {
    start();
    ok(true);
  });

  uploader.upload(file);

  stop();
});

test("uploads promise gets resolved", function() {
  expect(1);

  let uploader = Uploader.extend({
    url: '/upload',
    file: file
  }).create();

  uploader.upload(file).then(function(data) {
    start();
    ok(true);
  });

  stop();
});

test("uploads promise gets rejected", function() {
  expect(1);

  var uploader = Uploader.extend({
    url: '/invalid',
    file: file
  }).create();

  uploader.upload(file).then(function(data) {
  }, function(data) {
    start();
    ok(true);
  });

  stop();
});

test("error response not undefined", function() {
  expect(1);

  var uploader = Uploader.extend({
    url: '/invalid'
  }).create();

  uploader.upload(file).then(null, function(error) {
    start();
    equal(error.status, 404);
  });

  stop();
});

test("emits progress event", function() {
  expect(1);

  server.timing = 100;

  var uploader = Uploader.extend({
    url: '/upload',
    file: file
  }).create();

  uploader.on('progress', function(e) {
    start();
    ok(true);
  });

  uploader.upload(file);

  stop();
});

test("it can receive extra data", function() {
  expect(1);

  var data = { test: 'valid' };

  var uploader = Uploader.extend({
    url: '/upload',
    createFormData: function(file, extra) {
      equal(extra, data);
      return this._super(file, extra);
    }
  }).create();

  uploader.upload(file, data);
});

test("it allows overriding ajax settings", function() {
  this.stub(Ember.$, 'ajax');

  expect(1);

  let uploader = Uploader.extend({
    ajaxSettings: {
      headers: {
        'Content-Type': 'text/html'
      }
    }
  }).create();

  uploader.upload(file);

  equal(Ember.$.ajax.getCall(0).args[0].headers['Content-Type'], 'text/html');
});
