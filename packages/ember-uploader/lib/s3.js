var get = Ember.get,
    set = Ember.set;

Ember.S3Uploader = Ember.Uploader.extend({
  /**
    Url used to request a signed upload url

    @property url
  */
  url: '/sign',
  headers: null,

  upload: function(file, data) {
    var self = this;

    set(this, 'isUploading', true);

    return this.sign(file, data).then(function(json) {
      var url = null;
      if (json.region) {
        url = "//s3-" + json.region + ".amazonaws.com/" + json.bucket;
        delete json.region;
      }
      else {
        url = "//" + json.bucket + ".s3.amazonaws.com";
      }
      var formData = self.setupFormData(file, json);

      return self.ajax(url, formData);
    }).then(function(respData) {
      self.didUpload(respData);
      return respData;
    });
  },  

  sign: function(file, data) {
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

    return this._ajax(settings);
  }
});
