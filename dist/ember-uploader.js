(function() {

var get = Ember.get,
    set = Ember.set;

Ember.Uploader = Ember.Object.extend(Ember.Evented, {
  url: null,
  paramNamespace: null,
  paramName: 'file',

  /**
   * ajax request type (method), by default it will be POST
   *
   * @property type
   */
  type: 'POST',

  upload: function(file, extra) {
    extra = extra || {};
    var data = this.setupFormData(file, extra);
    var url  = get(this, 'url');
    var type = get(this, 'type');
    var self = this;

    set(this, 'isUploading', true);

    return this.ajax(url, data, type).then(function(respData) {
      self.didUpload(respData);
      return respData;
    });
  },

  setupFormData: function(file, extra) {
    var formData = new FormData();

    for (var prop in extra) {
      if (extra.hasOwnProperty(prop)) {
        formData.append(this.toNamespacedParam(prop), extra[prop]);
      }
    }

    formData.append(this.toNamespacedParam(this.paramName), file);

    return formData;
  },

  toNamespacedParam: function(name) {
    if (this.paramNamespace) {
      return this.paramNamespace + '[' + name + ']';
    }

    return name;
  },

  didUpload: function(data) {
    set(this, 'isUploading', false);

    this.trigger('didUpload', data);
  },

  didProgress: function(e) {
    e.percent = e.loaded / e.total * 100;
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

  upload: function(file) {
    var self = this;

    set(this, 'isUploading', true);

    return this.sign(file).then(function(json) {
      var url = "http://" + json.bucket + ".s3.amazonaws.com";
      var data = self.setupFormData(file, json);

      return self.ajax(url, data);
    }).then(function(respData) {
      self.didUpload(respData);
      return respData;
    });
  },

  sign: function(file) {
    var settings = {
      url: get(this, 'url'),
      type: 'GET',
      contentType: 'json',
      data: {
        name: file.name,
        type: file.type,
        size: file.size
      }
    };

    return this._ajax(settings);
  }
});


})();

(function() {

var set = Ember.set;

Ember.FileField = Ember.TextField.extend({
  type: 'file',
  attributeBindings: ['multiple'],
  multiple: false,
  change: function(e) {
    var input = e.target;
    if (!Ember.isEmpty(input.files)) {
      set(this, 'files', input.files);
    }
  }
});


})();