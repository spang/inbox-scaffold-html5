(function() {
  define(["angular", "error"], function(angular, error) {
    return angular.module('baobab.service.contacts', []).service('$contacts', [
      '$namespaces', function($namespaces) {
        this._list = [];
        this.list = (function(_this) {
          return function() {
            return _this._list;
          };
        })(this);
        $namespaces.current().contacts().then((function(_this) {
          return function(contacts) {
            return _this._list = contacts;
          };
        })(this), error._handleAPIError);
        return this;
      }
    ]);
  });

}).call(this);
