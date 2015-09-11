import Uploader from 'ember-uploader/uploader';

var get = Ember.get,
    set = Ember.set,
    deprecate = Ember.deprecate,
    on = Ember.on;

export default Uploader.extend({
  /**
    Url used to request a signed upload url

    @property url
  */
  url: '/sign',

  /**
   * Modify the headers used for signing
   *
   * @deprecated
   * @property {object} headers
   */
  headers: null,

  signRequestType: 'GET',

  didSign: function(response) {
    this.trigger('didSign', response);
    return response;
  },

  upload: function(file, data) {
    var self = this;

    set(this, 'isUploading', true);

    return this.sign(file, data).then(function(json) {
      var url;

      if (json.endpoint) {
        url = json.endpoint;
        delete json.endpoint;
      } else if (json.region) {
        url = "//s3-" + json.region + ".amazonaws.com/" + json.bucket;
        delete json.region;
      } else {
        url = "//" + ".s3.amazonaws.com/" + json.bucket;
      }

      var formData = self.setupFormData(file, json);

      return self.ajax(url, formData);
    });
  },

  sign: function(file, data) {
    var self = this;
    var url = get(this, 'url');

    data = data || {};
    data.name = file.name;
    data.type = file.type;
    data.size = file.size;

    var signRequestType = get(this, 'signRequestType');
    if (signRequestType !== 'GET') {
      data = JSON.stringify(data);
    }

    var settings = this.ajaxSignSettings(url, data, signRequestType);

    return new Ember.RSVP.Promise(function(resolve, reject) {
      settings.success = function(data) {
        Ember.run(null, resolve, self.didSign(data));
      };

      settings.error = function(jqXHR, responseText, errorThrown) {
        Ember.run(null, reject, self.didError(jqXHR, responseText, errorThrown));
      };

      Ember.$.ajax(settings);
    });
  },

  ajaxSignSettings: function(url, data, method) {
    return {
      url: url,
      headers: get(this, 'headers'),
      type: method,
      contentType: 'application/json',
      dataType: 'json',
      data: data
    };
  },

  _deprecateHeadersProperty: on('init', function() {
    if (this.get('headers')) {
      deprecate('Using the `headers` property is deprecated, override `ajaxSignSettings` or `ajaxSettings` instead');
    }
  })
});
