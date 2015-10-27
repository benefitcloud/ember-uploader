var deprecate = Ember.deprecate;
var set = Ember.set;
var on = Ember.on;

export default Ember.TextField.extend(Ember.Evented, {
  type: 'file',
  attributeBindings: ['multiple'],
  multiple: false,
  change: function(e) {
    var input = e.target;
    if (!Ember.isEmpty(input.files)) {
      this.trigger('filesDidChange', input.files);
      set(this, 'files', input.files); // to be removed in future release, needed for `files` observer to continue working
    }
  },

  _deprecateFileObserver: on('init', function() {
    var hasFilesObserver = this.hasObserverFor('files');

    deprecate('Observing the `files` attr is deprecated, use `filesDidChange` instead.', !hasFilesObserver, {
      id: 'ember-uploader.files-attr',
      until: '1.0'
    });
  })
});
