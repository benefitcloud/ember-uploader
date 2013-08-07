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
