import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import TestableFormData from 'dummy/tests/helpers/form-data';
import { isArray } from '@ember/array';
import { warn } from '@ember/debug';

module("test helper | FormData", function(hooks) {
  setupTest(hooks);

  test('supports empty value', function(assert) {
    let formData = new TestableFormData();

    assert.strictEqual(formData.get('not-existing'), null, 'get returns null');
    assert.ok(isArray(formData.getAll('not-existing')), 'getAll returns an array');
    assert.equal(formData.getAll('not-existing').length, 0, 'array returned by getAll is empty');
  });

  test('supports single value', function(assert) {
    let formData = new TestableFormData();
    formData.append('foo', 'a');

    assert.strictEqual(formData.get('foo'), 'a', 'get returns value');
    assert.ok(isArray(formData.getAll('foo')), 'getAll returns an array');
    assert.equal(formData.getAll('foo')[0], 'a', 'array returned by getAll contains value');
  });

  test('supports multiple values', function(assert) {
    let formData = new TestableFormData();
    formData.append('foo', 'a');
    formData.append('foo', 'b');

    assert.strictEqual(formData.get('foo'), 'a', 'get returns value which was set as first');
    assert.ok(isArray(formData.getAll('foo')), 'getAll returns an array');
    assert.equal(formData.getAll('foo')[0], 'a', 'array returned by getAll contains first value');
    assert.equal(formData.getAll('foo')[1], 'b', 'array returned by getAll contains second value');
  })

  test('supports appending Blob', function(assert) {
    let formData = new TestableFormData();
    formData.append('foo', new Blob([]));

    assert.ok(isArray(formData.getAll('foo')), 'getAll returns an array');
    assert.ok(formData.getAll('foo')[0] instanceof Blob, 'array returned by getAll contains value');
  });

  test('supports appending File', function(assert) {
    if (typeof File !== 'function') {
      warn('Skipping File tests since File not supported by current engine');
      assert.expect(0);
      return;
    }

    let formData = new TestableFormData();
    let fileObject = new File([], 'untouched');
    formData.append('foo', new Blob([]));
    formData.append('foo', fileObject);
    formData.append('foo', new Blob([]), 'test.jpg');

    assert.ok(formData.getAll('foo')[0] instanceof File, 'converts Blob to File object');
    assert.equal(formData.getAll('foo')[0].name, 'blob', 'sets name to blob if no name is given');
    assert.strictEqual(formData.getAll('foo')[1], fileObject, 'File object does not get changed');
    assert.ok(formData.getAll('foo')[2] instanceof File, 'converts Blob to File object');
    assert.equal(formData.getAll('foo')[2].name, 'test.jpg', 'supports specifing name');
  });
});
