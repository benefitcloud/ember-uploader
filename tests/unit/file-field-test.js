import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, triggerEvent } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
// import { triggerEvent } from '../../dist/assets/test-support';

module('EmberUploader.FileField', function(hooks) {
  setupRenderingTest(hooks);

  test('it triggers `filesDidChange` on change', async function(assert) {
    assert.expect(1);

    this.set('filesDidChange', (actual) => {
      let expected = ['foo'];
      assert.deepEqual(actual, expected, 'submitted value is passed to external action');
    });

    await render(hbs`<FileField @filesDidChange={{this.filesDidChange}} />`);
    let inputElement = this.element.querySelector('input[type="file"]');
    await triggerEvent(inputElement, 'change', { files: ['foo'] });
  });
});
