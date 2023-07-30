import { module } from 'qunit';
import { setupTest } from 'ember-qunit';
import { computed } from '@ember/object';
import $ from 'jquery';
import S3Uploader from 'ember-uploader/uploaders/s3';
import test from 'ember-sinon-qunit/test-support/test';
import { startMirage } from 'dummy/initializers/ember-cli-mirage';

let file;

module('EmberUploader.S3Uploader', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    this.server = startMirage();

    file = new Blob(['test'], { type: 'text/plain' });
    file.mime = 'text/plain';
    file.name = 'test.txt';
  });

  hooks.afterEach(function() {
    this.server.shutdown();
  });

  test('it has a sign url of "/api/signed-url"', function(assert) {
    assert.expect(1);

    let uploader = S3Uploader.create({
      signingUrl: '/api/signed-url'
    });

    assert.equal(uploader.signingUrl, '/api/signed-url');
  });

  test('it uploads after signing', function(assert) {
    assert.expect(1);

    let uploader = S3Uploader.extend({
      ajax() {
        assert.ok(true, 'ajax method was called');
      }
    }).create();

    uploader.upload(file);
  });

  test('it has default sign request type as "GET"', function(assert) {
    assert.expect(1);

    let uploader = S3Uploader.create();
    assert.equal(uploader.get('signingMethod'), 'GET');
  });

  test('sign request type can be customized', function(assert) {
    assert.expect(1);

    let uploader = S3Uploader.create({
      method: 'POST'
    });
    assert.equal(uploader.get('method'), 'POST');
  });

  test('uploads to s3', async function(assert) {
    assert.expect(1);

    let uploader = S3Uploader.create({
      file: file
    });

    uploader.on('didSign', function() {
      assert.ok(true, 'didUpload callback was called');
    });

    await uploader.upload(file);
  });

  test('it allows overriding ajax sign settings', function(assert) {
    this.stub($, 'ajax');

    assert.expect(1);

    const settings = {
      headers: {
        'Content-Type': 'text/html'
      }
    };

    const uploader = S3Uploader.extend({
      signingAjaxSettings: settings
    }).create();

    uploader.sign('/test');

    assert.equal($.ajax.getCall(0).args[0].headers['Content-Type'], 'text/html');
  });

  test('it allows signingAjaxSettings to be a computed property', function(assert) {
    this.stub($, 'ajax');

    assert.expect(2);

    const uploader = S3Uploader.extend({
      _testIterator: 0,

      signingAjaxSettings: computed('_testIterator', function() {
        return {
          headers: {
            'X-My-Incrementor': this.get('_testIterator'),
          }
        };
      }),
    }).create();

    uploader.sign('/test');
    assert.equal($.ajax.getCall(0).args[0].headers['X-My-Incrementor'], '0');

    uploader.set('_testIterator', 1);
    uploader.sign('/test');
    assert.equal($.ajax.getCall(1).args[0].headers['X-My-Incrementor'], '1');
  });
});
