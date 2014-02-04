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

  upload: function(file) {
    var data = this.setupFormData(file);
    var url  = get(this, 'url');
    var type = get(this, 'type');
    var self = this;

    set(this, 'isUploading', true);

    return this.ajax(url, data, type).then(function(respData) {
      self.didUpload(respData);
      return respData;
    });
  },

  setupFormData: function(file, data) {
    var formData = new FormData();

    for (var prop in data) {
      if (data.hasOwnProperty(prop)) {
        formData.append(this.toNamespacedParam(prop), data[prop]);
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
