import Ember from 'ember';

const { Component, Evented } = Ember;

export default Component.extend(Evented, {
  tagName: 'input',
  type: 'file',
  attributeBindings: [
    'name',
    'disabled',
    'form',
    'type',
    'accept',
    'autofocus',
    'required',
    'multiple'
  ],
  multiple: false,

  didInsertElement (...args) {
    this._super(...args);

    this.$().on('change', (event) => { this.handleChange(event); });
  },

  handleChange (event) {
    const input = event.target;
    if (!Ember.isEmpty(input.files)) {
      this.trigger('filesDidChange', input.files);
    }
  }
});
