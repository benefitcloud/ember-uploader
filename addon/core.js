import Namespace from '@ember/application/namespace';
import Ember   from 'ember';
import VERSION from 'ember-uploader/version';

/**
 * @module ember-uploader
 */

/**
 * All Ember Uploader methods and functions are defined inside of this namespace.
 *
 * @class EmberUploader
 * @static
 */

/**
 * @property VERSION
 * @type string
 * @static
 */

const EmberUploader = Namespace.create({
  VERSION
});

if (Ember.libraries) {
  Ember.libraries.registerCoreLibrary('Ember Uploader', EmberUploader.VERSION);
}

export default EmberUploader;
