module("Ember");

test("it is defined and an Ember.Namespace", function() {
  ok(Ember);
  ok(Ember.Namespace.detectInstance(Ember));
});