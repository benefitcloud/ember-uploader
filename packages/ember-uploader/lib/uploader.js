var get = Ember.get,
    set = Ember.set;

export default Ember.Object.extend(Ember.Evented, {
  url: null,
  paramNamespace: null,
  paramName: 'file',
  isUploading: false,

  /**
   * ajax request type (method), by default it will be POST
   *
   * @property type
   */
  type: 'POST',

  /**
   * Start upload of files and extra data
   *
   * @param  {object|array} files  One file object or one array of files object
   * @param  {array} extra
   * @return {object}       jquery promise from ajax object
   */
  upload: function(files, extra) {
    extra = extra || {};
    var data = this.setupFormData(files, extra);
    var url  = get(this, 'url');
    var type = get(this, 'type');
    var self = this;

    set(this, 'isUploading', true);

    return this.ajax(url, data, type).then(function(respData) {
      self.didUpload(respData);
      return respData;
    }, function(error) {
      self.didError(error.jqXHR, error.textStatus, error.errorThrown);
      throw error;
    });
  },

  setupFormData: function(files, extra) {
    var formData = new FormData();

    for (var prop in extra) {
      if (extra.hasOwnProperty(prop)) {
        formData.append(this.toNamespacedParam(prop), extra[prop]);
      }
    }

    // if is a array of files ...
    if (Ember.isArray(files)) {
      var paramName;

      for (var i = files.length - 1; i >= 0; i--) {
        paramName = this.toNamespacedParam(this.paramName) + '[' + i + ']';
        formData.append(paramName , files[i]);
      }
    } else {
      // if has only one file object ...
      formData.append(this.toNamespacedParam(this.paramName), files);
    }

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

  didError: function(jqXHR, textStatus, errorThrown) {
    set(this, 'isUploading', false);
    this.trigger('didError', jqXHR, textStatus, errorThrown);
  },

  didProgress: function(e) {
    e.percent = e.loaded / e.total * 100;
    this.trigger('progress', e);
  },

  abort: function() {
    set(this, 'isUploading', false);

    this.trigger('isAborting');
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
        self.one('isAborting', function() { xhr.abort(); });
        return xhr;
      },
      data: params
    };

    return this._ajax(settings);
  },

  _ajax: function(settings) {
    var self = this;

    return new Ember.RSVP.Promise(function(resolve, reject) {
      settings.success = function(data) {
        Ember.run(null, resolve, data);
      };

      settings.error = function(jqXHR, textStatus, errorThrown) {
        Ember.run(null, reject, {
          jqXHR: jqXHR,
          textStatus: textStatus,
          errorThrown: errorThrown
        });
      };

      Ember.$.ajax(settings);
    });
  }
});
