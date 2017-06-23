/*
 * Allows to inject and remove a FormData polyfill which supports get() and
 * getAll() methods.
 *
 * Except for Chrome (>= 50) and Firefox (>= 39) major browser engines implement
 * only a very basic subset of FormData specification. Especially current Safari,
 * IE, Edge and PhantomJS does not support any methods to retrieve data of a
 * FormData object.
 * This is a hard limitation in testing. E.g. in an ember-cli-mirage route handler
 * you are not able to retrieve values of the request.
 *
 * Implementation follows FormData specification:
 *   https://xhr.spec.whatwg.org/#interface-formdata
 */

import { isArray } from '@ember/array';

function TestableFormData() {
  this._data = {};
}

/*
 * Injects FormData polyfill by overriding window.FormData if current browser
 * engine does not implement FormData.get method.
 * Overriding window.FormData could be forced by passing `true` as first argument.
 */
TestableFormData.inject = function(force) {
  if (
    window &&
    (force || typeof window.FormData.get === 'undefined')
  ) {
    this.OldFormData = window.FormData;
    window.FormData = TestableFormData;
  }
};

TestableFormData.remove = function() {
  if (window && this.OldFormData) {
    window.FormData = this.OldFormData;
    delete this.OldFormData;
  }
};

/*
 * FormData.append()
 *   The append(name, value) and append(name, blobValue, filename) methods, when
 *   invoked, must run these steps:
 *     1. Let value be value if given, and blobValue otherwise.
 *     2. Let entry be the result of creating an entry with name, value, and
 *        filename if given.
 *     3. Append entry to context object’s list of entries.
 *   Note: The reason there is an argument named value as well as blobValue is
 *   due to a limitation of the editing software used to write the XMLHttpRequest
 *   Standard.
 * https://xhr.spec.whatwg.org/#dom-formdata-append
 */
TestableFormData.prototype.append = function(name, value, filename) {
  if (!isArray(this._data[name])) {
    this._data[name] = [];
  }
  /*
   * To create an entry for name, value, and optionally a filename, run these steps:
   *   3. If value is a Blob object and not a File object, then set value to a
   *      new File object, representing the same bytes, whose name attribute
   *      value is "blob".
   *   4. If value is (now) a File object and filename is given, then set value
   *      to a new File object, representing the same bytes, whose name attribute
   *      value is filename.
   * https://xhr.spec.whatwg.org/#create-an-entry
   */
  if (
    // it's a Blob
    value instanceof Blob &&
    // but it's not a File yet
    !(value instanceof File) &&
    // File is supported by current engine
    typeof File === 'function'
  ) {
    value = new File([value], filename || 'blob');
  }
  this._data[name].push(value);
};

/*
 * FormData.get()
 *   The get(name) method, when invoked, must return the value of the first entry
 *   whose name is name, and null otherwise.
 * https://xhr.spec.whatwg.org/#dom-formdata-get
 */
TestableFormData.prototype.get = function(name) {
  let values = this._data[name];
  return ( isArray(values) && values.length > 0 ) ? values[0] : null;
};

/*
 * FormData.getAll()
 *   The getAll(name) method, when invoked, must return the values of all entries
 *   whose name is name, in list order, and the empty sequence otherwise.
 *   https://xhr.spec.whatwg.org/#dom-formdata-getall
 */
TestableFormData.prototype.getAll = function(name) {
  let value = this._data[name];
  return isArray(value) ? value : [];
};

export default TestableFormData;
