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
  this.data[key] = value;
}

export default TestableFormData;
