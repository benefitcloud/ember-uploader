define("ember-uploader",
  ["ember-uploader/uploader","ember-uploader/s3","ember-uploader/file-field","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __exports__) {
    "use strict";
    var Uploader = __dependency1__["default"];
    var S3Uploader = __dependency2__["default"];
    var FileField = __dependency3__["default"];

    __exports__["default"] = {
      Uploader: Uploader,
      S3Uploader: S3Uploader,
      FileField: FileField
    };
  });
define("ember-uploader/file-field",
  ["exports"],
  function(__exports__) {
    "use strict";
    var set = Ember.set;

    __exports__["default"] = Ember.TextField.extend({
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
  });
define("ember-uploader/s3",
  ["ember-uploader/uploader","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var Uploader = __dependency1__["default"];

    var get = Ember.get,
        set = Ember.set;

    __exports__["default"] = Uploader.extend({
      /**
        Url used to request a signed upload url

        @property url
      */
      url: '/sign',
      headers: null,

      didSign: function(response) {
        this.trigger('didSign', response);
        return response;
      },

      upload: function(file, data) {
        var self = this;

        set(this, 'isUploading', true);

        return this.sign(file, data).then(function(json) {
          var url;

          if (json.region) {
            url = "//s3-" + json.region + ".amazonaws.com/" + json.bucket;
            delete json.region;
          } else {
            url = "//" + json.bucket + ".s3.amazonaws.com";
          }

          var formData = self.setupFormData(file, json);

          return self.ajax(url, formData);
        });
      },

      sign: function(file, data) {
        var self = this;

        data = data || {};
        data.name = file.name;
        data.type = file.type;
        data.size = file.size;

        var settings = {
          url: get(this, 'url'),
          headers: get(this, 'headers'),
          type: 'GET',
          contentType: 'json',
          data: data
        };

        return new Ember.RSVP.Promise(function(resolve, reject) {
          settings.success = function(data) {
            Ember.run(null, resolve, self.didSign(data));
          };

          settings.error = function(jqXHR, responseText, errorThrown) {
            Ember.run(null, reject, self.didError(jqXHR, responseText, errorThrown));
          };

          Ember.$.ajax(settings);
        });
      }
    });
  });
define("ember-uploader/uploader",
  ["exports"],
  function(__exports__) {
    "use strict";
    var get = Ember.get,
        set = Ember.set;

    __exports__["default"] = Ember.Object.extend(Ember.Evented, {
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
            Ember.run(null, resolve, self.didUpload(data));
          };

          settings.error = function(jqXHR, responseText, errorThrown) {
            Ember.run(null, reject, self.didError(jqXHR, responseText, errorThrown));
          };

          Ember.$.ajax(settings);
        });
      }
    });
  });