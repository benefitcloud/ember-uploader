import FileField from 'dummy/components/file-field';

module('EmberUploader.FileField');

test('it triggers `filesDidChange` on change', () => {
  let result;
  expect(1);

  const fileField = FileField.extend({
    filesDidChange (files) {
      result = files;
    }
  }).create();
  fileField.change({ target: { files: [ 'foo' ] }});

  deepEqual(result, [ 'foo' ], 'it returns the files that changed');
});

test('attribute bindings are correct', () => {
  const fileField = FileField.extend({}).create();

  deepEqual(fileField.get('attributeBindings'), [
      'ariaRole:role',
      'name',
      'disabled',
      'form',
      'type',
      'accept',
      'capture',
      'autofocus',
      'required',
      'multiple'
    ]);
});
