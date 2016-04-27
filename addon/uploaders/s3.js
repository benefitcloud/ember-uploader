import Ember    from 'ember';
import Uploader from 'ember-uploader/uploaders/base';

const {
  get,
  set,
  run
} = Ember;

export default Uploader.extend({
  /**
   * Target url used to request a signed upload policy
   *
   * @property url
   */
  signingUrl: '/sign',

  /**
   * request method for signing
   *
   * @property method
   */
  signingMethod: 'GET',

  /**
   * Boolean property changed to true upon signing start and false upon
   * signing end
   *
   * @property isSigning
   */
  isSigning: false,

  /**
   * Request signed upload policy and upload file(s) and any extra data
   *
   * @param  {object|array} files  One file object or one array of files object
   * @param  {object} extra Extra data to be sent with the upload
   * @return {object} Returns a Ember.RSVP.Promise wrapping the signing
   * request object
   */
  upload (file, extra = {}) {
    return this.sign(file, extra).then((json) => {
      let url;

      set(this, 'isUploading', true);

      if (json.endpoint) {
        url = json.endpoint;
        delete json.endpoint;
      } else if (json.region) {
        url = `//s3-${json.region}.amazonaws.com/${json.bucket}`;
        delete json.region;
      } else {
        url = `//${json.bucket}.s3.amazonaws.com`;
      }

      return this.ajax(url, this.createFormData(file, json));
    });
  },

  /**
   * Request signed upload policy
   *
   * @param  {object|array} files  One file object or one array of files object
   * @param  {object} extra Extra data to be sent with the upload
   * @return {object} Returns a Ember.RSVP.Promise wrapping the signing
   * request object
   */
  sign (file, extra = {}) {
    const url    = get(this, 'signingUrl');
    const method = get(this, 'signingMethod');
    const signingAjaxSettings = get(this, 'signingAjaxSettings');

    extra.name = file.name;
    extra.type = file.type;
    extra.size = file.size;

    const settings = {
      ...signingAjaxSettings,
      contentType: 'application/json',
      dataType: 'json',
      data: method.match(/get/i) ? extra : JSON.stringify(extra),
      method,
      url
    };

    set(this, 'isSigning', true);

    return new Ember.RSVP.Promise((resolve, reject) => {
      settings.success = (json) => {
        run(null, resolve, this.didSign(json));
      };

      settings.error = (jqXHR, responseText, errorThrown) => {
        run(null, reject, this.didErrorOnSign(jqXHR, responseText, errorThrown));
      };

      Ember.$.ajax(settings);
    });
  },

  /**
   * Triggers didErrorOnSign event and sets isSigning to false
   *
   * @param {object} jqXHR jQuery XMLHttpRequest object
   * @param {string} textStatus The status code of the error
   * @param {object} errorThrown The error caused
   * @return {object} Returns the jQuery XMLHttpRequest
   */
  didErrorOnSign (jqXHR, textStatus, errorThrown) {
    set(this, 'isSigning', false);
    this.trigger('didErrorOnSign');
    this.didError(jqXHR, textStatus, errorThrown);
    return jqXHR;
  },

  /**
   * Triggers didSign event and returns the signing response
   *
   * @param {object} response The signing response
   * @return {object} The signing response
   */
  didSign (response) {
    this.trigger('didSign', response);
    return response;
  }
});
