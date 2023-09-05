import { Promise } from 'rsvp';
import jQuery from 'jquery';
import { run } from '@ember/runloop';
import { sendEvent } from '@ember/object/events';
import Uploader from './uploader';

export default class S3Uploader extends Uploader {
  /**
   * Target url used to request a signed upload policy
   *
   * @property url
   */

  /**
   * request method for signing
   *
   * @property method
   */

  /**
   * Boolean property changed to true upon signing start and false upon
   * signing end
   *
   * @property isSigning
   */
  constructor() {
    super(...arguments);
    this.signingUrl = this.signingUrl || '/sign';
    this.signingMethod = this.signingMethod || 'GET';
    this.isSigning = false;
  }

  /**
   * Request signed upload policy and upload file(s) and any extra data
   *
   * @param  {object} file  A file object
   * @param  {object} extra Extra data to be sent with the upload
   * @return {object} Returns a Ember.RSVP.Promise wrapping the signing
   * request object
   */
  upload(file, extra = {}) {
    return this.sign(file, extra).then((json) => {
      let url;

      this.isUploading = true;

      if (json.endpoint) {
        url = json.endpoint;
        delete json.endpoint;
      } else if (json.region) {
        url = `https://s3-${json.region}.amazonaws.com/${json.bucket}`;
        delete json.region;
      } else {
        url = `https://${json.bucket}.s3.amazonaws.com`;
      }

      return this.ajax(url, this.createFormData(file, json));
    });
  }

  /**
   * Request signed upload policy
   *
   * @param  {object} file  A file object
   * @param  {object} extra Extra data to be sent with the upload
   * @return {object} Returns a Ember.RSVP.Promise wrapping the signing
   * request object
   */
  sign(file, extra = {}) {
    const url    = this.signingUrl;
    const method = this.signingMethod;
    const signingAjaxSettings = this.signingAjaxSettings;

    extra.name = file.name;
    extra.type = file.type;
    extra.size = file.size;

    const settings = Object.assign(
      {},
      {
        contentType: 'application/json',
        dataType: 'json',
        data: method.match(/get/i) ? extra : JSON.stringify(extra),
        method,
        url
      },
      signingAjaxSettings,
    );

    this.isSigning = true;

    return new Promise((resolve, reject) => {
      settings.success = (json) => {
        run(null, resolve, this.didSign(json));
      };

      settings.error = (jqXHR, responseText, errorThrown) => {
        run(null, reject, this.didErrorOnSign(jqXHR, responseText, errorThrown));
      };

      jQuery.ajax(settings);
    });
  }

  /**
   * Triggers didErrorOnSign event and sets isSigning to false
   *
   * @param {object} jqXHR jQuery XMLHttpRequest object
   * @param {string} textStatus The status code of the error
   * @param {object} errorThrown The error caused
   * @return {object} Returns the jQuery XMLHttpRequest
   */
  didErrorOnSign(jqXHR, textStatus, errorThrown) {
    this.isSigning = false;
    sendEvent(this, 'didErrorOnSign');
    this.didError(jqXHR, textStatus, errorThrown);
    return jqXHR;
  }

  /**
   * Triggers didSign event and returns the signing response
   *
   * @param {object} response The signing response
   * @return {object} The signing response
   */
  didSign(response) {
    sendEvent(this, 'didSign', response);
    return response;
  }
}
