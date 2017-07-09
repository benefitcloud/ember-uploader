import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import jQuery from 'jquery';


moduleForComponent('file-field', 'Integration | Component | file field', {
  integration: true
});

function fillInFileInput(selector, file) {
  // Get the input
  let input = jQuery(selector);

  // Get out file options
  let { fileName, type, content } = file;

  // Create a custom event for change and inject target
  let event = jQuery.Event('change', {
    target: { files: [{ fileName, type }] }
  });

  // Trigger event
  input.trigger(event);
}

test('renders input with multiple attributes', function(assert) {
  assert.expect(7);

  this.render(hbs`{{file-field 
    type='file'
    disabled=true
    name='My name'
    autofocus=true
    required=true
    multiple=true
    form='formId'
    accept='audio/*|video/*|image/*'
  }}`);

  assert.equal(
    this.$('input').attr('disabled'),
    'disabled',
    'File field is disabled'
  );

   assert.equal(
    this.$('input').attr('name'),
    'My name',
    'File field has name'
  );

  assert.equal(
    this.$('input').attr('autofocus'),
    'autofocus',
    'File field has autofocus'
  );

  assert.equal(
    this.$('input').attr('required'),
    'required',
    'File field has required'
  );

  assert.equal(
    this.$('input').attr('multiple'),
    'multiple',
    'File field has multiple'
  );

  assert.equal(
    this.$('input').attr('form'),
    'formId',
    'File field is associated with a form'
  );

  assert.equal(
    this.$('input').attr('accept'),
    'audio/*|video/*|image/*',
    'File field accept types as: audio, video and image'
  );

});

test('file upload works correcly', function(assert) {
  let filesDidChange = sinon.spy();

  let fileName = 'surprise.png';
  let content = 'data:image/png;base64,no-surprises-here';
  let type = 'image/png';
  

  this.set('filesDidChange', filesDidChange);
  this.render(hbs`
   {{file-field id="file-input" filesDidChange=filesDidChange}}
  `);

  fillInFileInput('#file-input', { fileName, content, type });

  assert.ok(filesDidChange.calledOnce, 'Hook `filesDidChange` should be called once.');
  assert.ok(filesDidChange.calledWithExactly([{fileName, type}]), 'Hook `filesDidChange` should be called with exact arguments');
});
