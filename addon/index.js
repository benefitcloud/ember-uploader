import Ember from 'ember';

/**
  Ember Uploader
  @module ember-uploader
  @main ember-uploader
*/

import EmberUploader from 'ember-uploader/core';
import { Uploader, S3Uploader } from 'ember-uploader/uploaders';

EmberUploader.Uploader   = Uploader;
EmberUploader.S3Uploader = S3Uploader;

import { FileField } from 'ember-uploader/components';

EmberUploader.FileField = FileField;

Ember.lookup.EmberUploader = EmberUploader;

export default EmberUploader;
