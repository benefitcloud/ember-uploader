/* global EmberUploader */

var FileField;

module("EmberUploader.FileField");

test("it triggers `filesDidChange` on change", function() {
  var result;
  expect(1);

  var FileField = EmberUploader.FileField.extend({
    filesDidChange: function(files) {
      result = files;
    }
  });
  var fileField = FileField.create();
  fileField.change({ target: { files: [ 'foo' ] }});

  deepEqual(result, [ 'foo' ], 'it returns the files that changed');
});

test("it can observe the files attr", function() {
  var result;
  expect(1);

  var FileField = EmberUploader.FileField.extend({
    filesDidChange: Ember.observer('files', function() {
      var files = this.get('files');

      result = files;
    })
  });
  var fileField = FileField.create();
  fileField.change({ target: { files: [ 'foo' ] }});

  deepEqual(result, [ 'foo' ], 'it returns the files that changed');
});
