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

    return this.ajax(url, data, type);
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
    return data;
  },

  didError: function(jqXHR, textStatus, errorThrown) {
    set(this, 'isUploading', false);

    // Borrowed from Ember Data
    var isObject = jqXHR !== null && typeof jqXHR === 'object';

    if (isObject) {
      jqXHR.then = null;
      if (!jqXHR.errorThrown) {
        if (typeof errorThrown === 'string') {
          jqXHR.errorThrown = new Error(errorThrown);
        } else {
          jqXHR.errorThrown = errorThrown;
        }
      }
    }

    this.trigger('didError', jqXHR, textStatus, errorThrown);

    return jqXHR;
  },

  didProgress: function(e) {
    e.percent = e.loaded / e.total * 100;
    this.trigger('progress', e);
  },

  abort: function() {
    set(this, 'isUploading', false);

    this.trigger('isAborting');
  },

  ajaxSettings: function(url, params, method) {
    var self = this;
    return {
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
  },

  ajax: function(url, params, method) {
    return this._ajax(this.ajaxSettings(url, params, method));
  },

  _ajax: function(settings) {
    var self = this;

    return new Ember.RSVP.Promise(function(resolve, reject) {
      settings.success = function(data) {
        Ember.run(null, resolve, self.didUpload(data));
      };

      settings.error = function(jqXHR, responseText, errorThrown) {
        Ember.run(null, reject, self.didError(jqXHR, responseText, errorThrown));
      };

      Ember.$.ajax(settings);
    });
  }
});
