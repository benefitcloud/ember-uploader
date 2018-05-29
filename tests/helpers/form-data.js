import { isArray } from '@ember/array';
function TestableFormData() {
  this.data = {}
}

TestableFormData.inject = function() {
  if (window) {
    this.OldFormData = window.FormData;
    window.FormData = TestableFormData;
  }
}

TestableFormData.remove = function() {
  if (window && this.OldFormData) {
    window.FormData = this.OldFormData;
    delete this.OldFormData;
  }
}

TestableFormData.prototype.append = function(key, value) {
  // FormData expects the key for arrays to be postfixed with empty brackets
  // This same key is used each time a new item is added.
  let matches = key.match(/^(.*)\[\]$/);

  if (matches) {
    const arrayKey = matches.reverse()[0];

    if (!isArray(this.data[arrayKey])) {
      this.data[arrayKey] = [];
    }

    this.data[arrayKey].push(value);
  } else {
    this.data[key] = value;
  }
}

export default TestableFormData;
