import Ember from 'ember';

/**
  Ember Uploader
  @module ember-uploader
  @main ember-uploader
*/

import EmberUploader from 'ember-uploader/core';

if (Ember.VERSION.match(/^1/)) {
  Ember.Logger.warn(
    'This version of Ember Uploader has not been tested on Ember 1.x. Use at your own risk.');
}

import { Uploader, S3Uploader } from 'ember-uploader/uploaders';

EmberUploader.Uploader   = Uploader;
EmberUploader.S3Uploader = S3Uploader;

import { FileField } from 'ember-uploader/components';

EmberUploader.FileField = FileField;

Ember.lookup.EmberUploader = EmberUploader;

export default EmberUploader;
