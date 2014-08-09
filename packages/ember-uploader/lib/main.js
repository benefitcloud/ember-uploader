import Uploader from 'ember-uploader/uploader';
import S3Uploader from 'ember-uploader/s3';
import FileField from 'ember-uploader/file-field';

var EmberUploader = {};
EmberUploader.Uploader = Uploader;
EmberUploader.S3Uploader = S3Uploader;
EmberUploader.FileField = FileField;

export default EmberUploader;
