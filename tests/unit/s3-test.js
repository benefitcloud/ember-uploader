import { module } from 'qunit';
import { setupTest } from 'ember-qunit';
import { on } from '@ember/object/evented';
import test from 'ember-sinon-qunit/test-support/test';
import { startMirage } from 'dummy/initializers/ember-cli-mirage';
import S3Uploader from 'ember-uploader/uploaders/s3';

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

  test('it uploads after signing', async function(assert) {
    assert.expect(1);

    let uploader = S3Uploader.extend({
      makeRequest() {
        assert.ok(true, 'ajax method was called');
      }
    }).create();

    await uploader.upload(file);
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
      file: file,
      didSign: on('didSign', function() {
        assert.ok(true, 'didUpload callback was called');
      }),
    });

    await uploader.upload(file);
  });
});
