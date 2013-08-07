(function() {

var get = Ember.get,
    set = Ember.set;

Ember.Uploader = Ember.Object.extend(Ember.Evented, {
  file: null,
  url: null,
  progress: 0,

  upload: function() {
    var data = this.setupFormData(),
        url  = get(this, 'url'),
        self = this;

    set(this, 'isUploading', true);

    return this.ajax(url, data).then(function(respData) {
      self.didUpload(respData);
      return respData;
    });
  },

  setupFormData: function(obj) {
    var data = new FormData();
    var file = get(this, 'file');

    if (typeof obj === 'undefined') {
      obj = {};
    }

    for (var prop in obj) {
      if (obj.hasOwnProperty(prop)) {
        data.append(prop, obj[prop]);
      }
    }

    data.append('file', file);

    return data;
  },

  didUpload: function(data) {
    var file = get(this, 'file');

    set(this, 'isUploading', false);

    this.trigger('didUpload', data);
  },

  didProgress: function(e) {
    set(this, 'progress', e.loaded / e.total * 100);
    this.trigger('progress', e);
  },

  ajax: function(url, params, method) {
    var self = this;
    var settings = {
      url: url,
      type: method || 'POST',
      contentType: false,
      processData: false,
      xhr: function() {
        var xhr = Ember.$.ajaxSettings.xhr();
        xhr.upload.onprogress = function(e) {
          self.didProgress(e);
        };
        return xhr;
      },
      data: params
    };

    return this._ajax(settings);
  },

  _ajax: function(settings) {
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

(function() {

var get = Ember.get,
    set = Ember.set;

Ember.S3Uploader = Ember.Uploader.extend({
  /**
    Url used to request a signed upload url

    @property url
  */
  url: '/sign',

  upload: function() {
    var self = this;

    set(this, 'isUploading', true);

    return this.sign().then(function(json) {
      var url = "http://" + json.bucket + ".s3.amazonaws.com";
      var data = self.setupFormData(json);

      return self.ajax(url, data);
    }).then(function(respData) {
      self.didUpload(respData);
      return respData;
    });
  },

  sign: function() {
    var file = get(this, 'file');
    var settings = {
      url: get(this, 'url'),
      type: 'GET',
      contentType: 'json',
      data: {
        name: file.name
      }
    };

    return this._ajax(settings);
  }
});


})();