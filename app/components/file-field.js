import Ember from 'ember';

const { set, isEmpty } = Ember;

export default Ember.Component.extend(Ember.Evented, {
  tagName: 'input',
  type: 'file',
  attributeBindings: ['multiple'],
  multiple: false,
  change (event) {
    const input = event.target;
    if (!isEmpty(input.files)) {
      this.trigger('filesDidChange', input.files);
      set(this, 'files', input.files); // to be removed in future release, needed for `files` observer to continue working
    }
  }
});
