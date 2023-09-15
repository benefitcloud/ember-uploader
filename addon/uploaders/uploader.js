import EmberObject from '@ember/object';
import { Promise } from 'rsvp';
import { sendEvent } from '@ember/object/events';

export default class Uploader extends EmberObject {
  /**
   * Target url to upload to
   *
   * @property url
   */

  /**
   * ajax request method, by default it will be POST
   *
   * @property method
   */

  /**
   * Used to define a namespace for the file param and any extra data params
   * that may be sent
   *
   * @property paramNamespace
   */

  /**
   * The parameter name for the file(s) to be uploaded
   *
   * @property paramName
   */

  /**
   * Boolean property changed to true upon upload start and false upon upload
   * end
   *
   * @property isUploading
   */
  constructor() {
    super(...arguments);
    this.url = this.url || null;
    this.method = this.method || 'POST';
    this.paramNamespace = this.paramNamespace || null;
    this.paramName = this.paramName || 'file';
    this.xhrSettings = this.xhrSettings || {};
    this.isUploading = false;
  }

  /**
   * Start upload of file(s) and any extra data
   *
   * @param  {object|array} files  One file object or one array of files object
   * @param  {object} extra Extra data to be sent with the upload
   * @return {object} Returns a Ember.RSVP.Promise wrapping the ajax request
   * object
   */
  upload(files, extra = {}) {
    const data   = this.createFormData(files, extra);
    this.isUploading = true;

    return this.makeRequest(this.url, data, this.method);
  }

  /**
   * Creates the FormData object with the file(s) and any extra data
   *
   * @param {object|array} files One file object or an array of file objects
   * @param {object} extra Extra data to be sent with the upload
   * @return {object} Returns a FormData object with the supplied file(s) and
   * extra data
   */
  createFormData(files, extra = {}) {
    const formData = new FormData();

    for (const prop in extra) {
      if (extra.hasOwnProperty(prop)) {
        formData.append(this.toNamespacedParam(prop), extra[prop]);
      }
    }

    // if is a array of files ...
    if (files.constructor === FileList || files.constructor === Array) {
      const paramKey = `${this.toNamespacedParam(this.paramName)}[]`;

      for (let i = 0; i < files.length; i++) {
        // FormData expects the key for arrays to be postfixed with empty
        // brackets This same key is used each time a new item is added.
        formData.append(paramKey, files[i]);
      }
    } else {
      // if has only one file object ...
      formData.append(this.toNamespacedParam(this.paramName), files);
    }

    return formData;
  }

  /**
   * Returns the param name namespaced if a namespace exists
   *
   * @param {string} name The param name to namespace
   * @return {string} Returns the namespaced param
   */
  toNamespacedParam(name) {
    return this.paramNamespace ?
      `${this.paramNamespace}[${name}]` :
      name;
  }

  /**
   * Triggers didUpload event with given params and sets isUploading to false
   *
   * @param {object} data Object of data supplied to the didUpload event
   * @return {object} Returns the given data
   */
  didUpload(data) {
    this.isUploading = false;
    sendEvent(this, 'didUpload', [data]);
    return data;
  }

  /**
   * Triggers didError event with given params and sets isUploading to false
   *
   * @param {object} jqXHR jQuery XMLHttpRequest object
   * @param {string} textStatus The status code of the error
   * @param {object} errorThrown The error caused
   * @return {object} Returns the jQuery XMLHttpRequest
   */
  didError(response) {
    this.isUploading = false;
    sendEvent(this, 'didError', [response]);

    return response;
  }

  /**
   * Triggers progress event supplying event with current percent
   *
   * @param {object} event Event from xhr onprogress
   */
  didProgress(event) {
    event.percent = event.loaded / event.total * 100;
    sendEvent(this, 'progress', [event]);
  }

  /**
   * Triggers isAborting event and sets isUploading to false
   */
  abort() {
    this.isUploading = false;
    sendEvent(this, 'isAborting');
  }

  /**
   * Starts a request to the given url sending the supplied data using the
   * supplied request method
   *
   * @param {string} url The target url for the request
   * @param {object} data The data to send with the request
   * @param {string} method The request method
   * @return {object} Returns a Ember.RSVP.Promise wrapping the ajax request
   * object
   */
  makeRequest(url, body = {}, method = this.method) {
    return new Promise((resolve, reject) => {
      let xhr = new XMLHttpRequest();

      xhr.upload.onprogress = (event) => {
        this.didProgress(event);
      };

      xhr.open(method, url, true);

      if ('headers' in this.xhrSettings) {
        for (const [key, value] of Object.entries(this.xhrSettings.headers)) {
          xhr.setRequestHeader(key, value);
        }
      }

      xhr.onload = () => {
        let responseBody = this.formatResponse(xhr);

        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(this.didUpload(responseBody));
        } else {
          reject(this.didError({
            status: xhr.status,
            statusText: xhr.statusText,
            responseBody
          }));
        }
      }

      xhr.onerror = () => {
        let responseBody = this.formatResponse(xhr);

        reject(this.didError({
          status: xhr.status,
          statusText: xhr.statusText,
          responseBody
        }));
      }

      xhr.send(body);
    });
  }

  formatResponse(xhr) {
    let type = xhr.getResponseHeader('Content-Type');

    if (typeof type !== 'string') {
      return xhr;
    }

    if (type.includes('json')) {
      return JSON.parse(xhr.responseText);
    }

    if (type.includes('xml')) {
      return xhr.responseXML;
    }

    return xhr.responseText;
  }
}
