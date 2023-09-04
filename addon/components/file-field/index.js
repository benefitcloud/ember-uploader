import Component from '@glimmer/component';
import { action } from '@ember/object';
import { isEmpty } from '@ember/utils';

export default class FileField extends Component {
  @action
  updateFile(event) {
    const input = event.target;

    if (!isEmpty(input.files)) {
      this.args.filesDidChange(input.files);
    }
  }
}
