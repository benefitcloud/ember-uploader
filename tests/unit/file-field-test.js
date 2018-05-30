import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import FileField from 'dummy/components/file-field';

module('EmberUploader.FileField', function(hooks) {
  setupTest(hooks);

  test('it triggers `filesDidChange` on change', function(assert) {
    let result;
    assert.expect(1);

    const fileField = this.owner.factoryFor('component:file-field').create({
      filesDidChange (files) {
        result = files;
      }
    });

    fileField.change({ target: { files: [ 'foo' ] }});

    assert.deepEqual(result, [ 'foo' ], 'it returns the files that changed');
  });
});
