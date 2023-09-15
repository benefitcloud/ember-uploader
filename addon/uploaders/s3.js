import { Promise } from 'rsvp';
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
    this.signingXhrSettings = this.signingXhrSettings || {};
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

      return this.makeRequest(url, this.createFormData(file, json));
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
    let url    = this.signingUrl;
    let method = this.signingMethod;

    extra.name = file.name;
    extra.type = file.type;
    extra.size = file.size;

    let data = method.match(/get/i) ? extra : JSON.stringify(extra);

    this.isSigning = true;

    return new Promise((resolve, reject) => {
      let xhr = new XMLHttpRequest();

      xhr.open(method, url, true);

      xhr.setRequestHeader('Content-Type', 'application/json');

      if ('headers' in this.signingXhrSettings) {
        for (const [key, value] of Object.entries(this.signingXhrSettings.headers)) {
          xhr.setRequestHeader(key, value);
        }
      }

      xhr.onload = () => {
        let responseBody = this.formatResponse(xhr);

        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(this.didSign(responseBody));
        } else {
          reject(this.didErrorOnSign({
            status: xhr.status,
            statusText: xhr.statusText,
            responseBody
          }));
        }
      }

      xhr.onerror = () => {
        let responseBody = this.formatResponse(xhr);

        reject(this.didErrorOnSign({
          status: xhr.status,
          statusText: xhr.statusText,
          responseBody
        }));
      }

      xhr.send(data);
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
  didErrorOnSign(response) {
    this.isSigning = false;
    sendEvent(this, 'didErrorOnSign');
    this.didError(response);
    return response;
  }

  /**
   * Triggers didSign event and returns the signing response
   *
   * @param {object} response The signing response
   * @return {object} The signing response
   */
  didSign(response) {
    sendEvent(this, 'didSign', [response]);
    return response;
  }
}
