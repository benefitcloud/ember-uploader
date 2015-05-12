import Uploader from 'ember-uploader/uploader';

var get = Ember.get,
    set = Ember.set;

export default Uploader.extend({
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

      if (json.endpoint) {
        url = json.endpoint;
        delete json.endpoint;
      } else if (json.region) {
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
