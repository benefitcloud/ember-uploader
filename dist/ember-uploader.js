(function() {

var get = Ember.get,
    set = Ember.set;

Ember.Uploader = Ember.Object.extend(Ember.Evented, {
  file: null,
  url: null,
  progress: 0,

  upload: function() {
    var data = new FormData(),
        self = this;

    set(this, 'isUploading', true);

    data.append('file', get(this, 'file'));

    return this._ajax(data).then(function(data) {
      self.didUpload(data);
    });
  },

  didUpload: function(data) {
    var file = get(this, 'file');

    set(this, 'isUploading', false);

    // Hack to get around small file progress
    if (get(this, 'progress') === 0) {
      this.didProgress({
        total: file.size,
        loaded: file.size
      });
    }

    this.trigger('didUpload', data);
  },

  didProgress: function(e) {
    set(this, 'progress', e.loaded / e.total * 100);
    this.trigger('progress', e);
  },

  _xhr: function() {
    var xhr = Ember.$.ajaxSettings.xhr();
    xhr.upload.onprogress = this.didProgress.bind(this);
    return xhr;
  },

  _ajax: function(data) {
    var settings = {
      url: get(this, 'url'),
      type: 'POST',
      contentType: false,
      processData: false,
      xhr: get(this, 'xhr'),
      data: data
    };

    return new Ember.RSVP.Promise(function(resolve, reject) {
      settings.success = function(data) {
        Ember.run(null, resolve, data);
      };

      settings.error = function(jqXHR, textStatus, errorThrown) {
        Ember.run(null, reject, jqXHR);
      };

      Ember.$.ajax(settings);
    });
  }
});


})();