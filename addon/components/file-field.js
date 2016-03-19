import Ember from 'ember';

export default Ember.Component.extend(Ember.Evented, {
  tagName: 'input',
  type: 'file',
  attributeBindings: ['type', 'multiple'],
  multiple: false,
  change (event) {
    const input = event.target;
    if (!Ember.isEmpty(input.files)) {
      this.trigger('filesDidChange', input.files);
    }
  }
});
