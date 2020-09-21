import { module } from 'qunit';
import { setupTest } from 'ember-qunit';
import { computed } from '@ember/object';
import $ from 'jquery';
import Uploader from 'ember-uploader/uploaders/uploader';
import test from 'ember-sinon-qunit/test-support/test';
import TestableFormData from '../helpers/form-data';
import { startMirage } from 'dummy/initializers/ember-cli-mirage';

let file;

module('EmberUploader.Uploader', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    this.server = startMirage();

    if (typeof WebKitBlobBuilder === "undefined") {
      file = new Blob(['test'], { type: 'text/plain' });
    } else {
      const builder = new WebKitBlobBuilder();
      builder.append('test');
      file = builder.getBlob();
    }

    TestableFormData.inject();
  });

  hooks.afterEach(function() {
    this.server.shutdown();
    TestableFormData.remove();
  });

  test("has a url of '/test'", function(assert) {
    let uploader = Uploader.extend({
      url: '/test'
    }).create();

    assert.equal(uploader.get('url'), '/test');
  });

  test("has a paramName of 'upload'", function(assert) {
    let uploader = Uploader.extend({
      paramName: 'upload'
    }).create();

    assert.equal(uploader.get('paramName'), 'upload');
  });

  test("has a paramNamespace of 'post'", function(assert) {
    let uploader = Uploader.extend({
      paramNamespace: 'post'
    }).create();

    assert.equal(uploader.get('paramNamespace'), 'post');
  });

  test("creates a param namespace", function(assert) {
    let uploader = Uploader.extend({
      paramNamespace: 'post'
    }).create();

    assert.equal(uploader.toNamespacedParam('upload'), 'post[upload]');
  });

  test("has an ajax request of type 'PUT'", function(assert) {
    let uploader = Uploader.extend({
      method: 'PUT'
    }).create();

    assert.equal(uploader.get('method'), 'PUT');
  });

  test("it can upload multiple files", function(assert) {
    assert.expect(3);

    let uploader = Uploader.extend({
      paramName: 'files'
    }).create();

    let formData = uploader.createFormData([1,2,3]);
    assert.equal(formData.data['files'][0], 1);
    assert.equal(formData.data['files'][1], 2);
    assert.equal(formData.data['files'][2], 3);
  });

  test("uploads to the given url", function(assert) {
    assert.expect(2);

    let uploader = Uploader.extend({
      url: '/upload',
      file: file
    }).create();

    uploader.on('didUpload', function(data) {
      assert.ok(true);
    });

    uploader.on('didUpload.withHeaders', function(data) {
      assert.ok(true);
    });

    uploader.upload(file);
  });

  test("uploads promise gets resolved", function(assert) {
    assert.expect(1);

    let uploader = Uploader.extend({
      url: '/upload',
      file: file
    }).create();

    uploader.upload(file).then(function(data) {
      assert.ok(true);
    });
  });

  test("uploads promise gets rejected", function(assert) {
    assert.expect(1);

    let uploader = Uploader.extend({
      url: '/invalid',
      file: file
    }).create();

    uploader.upload(file).then(function(data) {
    }, function(data) {
      assert.ok(true);
    });
  });

  test("error response not undefined", function(assert) {
    assert.expect(1);

    let uploader = Uploader.extend({
      url: '/invalid'
    }).create();

    uploader.upload(file).then(null, function(error) {
      assert.equal(error.status, 404);
    });
  });

  test("emits progress event", async function(assert) {
    assert.expect(1);

    server.timing = 100;

    let uploader = Uploader.extend({
      url: '/upload',
      file: file
    }).create();

    uploader.on('progress', function(e) {
      assert.ok(true, 'progress event was emitted');
    });

    await uploader.upload(file);
  });

  test("it can receive extra data", function(assert) {
    assert.expect(1);

    let data = { test: 'valid' };

    let uploader = Uploader.extend({
      url: '/upload',
      createFormData: function(file, extra) {
        assert.equal(extra, data);
        return this._super(file, extra);
      }
    }).create();

    uploader.upload(file, data);
  });

  test("it allows overriding ajax settings", function(assert) {
    this.stub($, 'ajax');

    assert.expect(1);

    let uploader = Uploader.extend({
      ajaxSettings: {
        headers: {
          'Content-Type': 'text/html'
        }
      }
    }).create();

    uploader.upload(file);

    assert.equal($.ajax.getCall(0).args[0].headers['Content-Type'], 'text/html');
  });

  test("it allows ajaxSettings to be a computed property", function(assert) {
    this.stub($, 'ajax');

    assert.expect(2);

    let uploader = Uploader.extend({
      _testIterator: 0,

      ajaxSettings: computed('_testIterator', function() {
        return {
          headers: {
            'X-My-Incrementor': this.get('_testIterator'),
          }
        };
      }),
    }).create();

    uploader.upload(file);
    assert.equal($.ajax.getCall(0).args[0].headers['X-My-Incrementor'], '0');

    uploader.set('_testIterator', 1);
    uploader.upload(file);
    assert.equal($.ajax.getCall(1).args[0].headers['X-My-Incrementor'], '1');
  });
});
