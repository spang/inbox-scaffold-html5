(function() {
  define(["angular", "Events", "underscore", "error"], function(angular, Events, _, error) {
    return angular.module("baobab.service.threads", []).service('$threads', [
      '$namespaces', function($namespaces) {
        var events, makeAPIRequest;
        events = Events;
        events(this);
        this._list = null;
        this._listVersion = 0;
        this._listPendingParams = {};
        this._listIsCompleteSet = false;
        this._filters = {};
        this._page = 0;
        this._pageSize = 100;
        makeAPIRequest = (function(_this) {
          return function() {
            var pageSize, params, requested;
            pageSize = _this._pageSize;
            params = _.extend({}, _this._filters, {
              limit: pageSize,
              offset: _this._page * pageSize
            });
            if (_.isEqual(params, _this._listPendingParams)) {
              return;
            }
            if (_this._listIsCompleteSet) {
              return;
            }
            _this._listVersion += 1;
            _this._listPendingParams = params;
            _this.setSilentRefreshEnabled(false);
            requested = _this._listVersion;
            return $namespaces.current().threads({}, params).then(function(threads) {
              if (_this._listVersion !== requested) {
                return;
              }
              _this._listIsCompleteSet = threads.length < pageSize;
              if (_this._list) {
                threads = threads.concat(_this._list);
              }
              _this.setList(threads);
              _this.setSilentRefreshEnabled(true);
              return _this._page += 1;
            }, error._handleAPIError);
          };
        })(this);
        this.reload = (function(_this) {
          return function() {
            _this._page = 0;
            _this._listPendingParams = {};
            _this._listIsCompleteSet = false;
            _this.setList(null);
            return makeAPIRequest();
          };
        })(this);
        this.list = (function(_this) {
          return function() {
            return _this._list;
          };
        })(this);
        this.setList = (function(_this) {
          return function(list) {
            if (list) {
              list.sort(function(a, b) {
                return b.lastMessageDate.getTime() - a.lastMessageDate.getTime();
              });
            }
            _this._list = list;
            return _this.emit('update', _this);
          };
        })(this);
        this.extendList = function() {
          return makeAPIRequest();
        };
        this.listIsCompleteSet = (function(_this) {
          return function() {
            return _this._listIsCompleteSet;
          };
        })(this);
        this.listIsMultiplePages = (function(_this) {
          return function() {
            return _this._page > 1;
          };
        })(this);
        this.item = (function(_this) {
          return function(id) {
            return _.find(_this._list, function(t) {
              return t.id === id;
            });
          };
        })(this);
        this.itemArchived = (function(_this) {
          return function(id) {
            if (_this._filters['tag'] === 'archive') {
              return;
            }
            return _this.setList(_.filter(_this._list, function(t) {
              return t.id !== id;
            }));
          };
        })(this);
        this.filters = (function(_this) {
          return function() {
            return _this._filters;
          };
        })(this);
        this.setFilters = (function(_this) {
          return function(filters) {
            var key, _i, _len;
            if (_.isEqual(filters, _this._filters)) {
              return;
            }
            for (_i = 0, _len = filters.length; _i < _len; _i++) {
              key = filters[_i];
              if (filters[key] === '') {
                delete filters[key];
              }
            }
            _this._filters = filters;
            return _this.reload();
          };
        })(this);
        this.appendFilters = (function(_this) {
          return function(filtersToAppend) {
            _this.setFilters(_.extend({}, _this._filters, filtersToAppend));
            return _this.reload();
          };
        })(this);
        this.silentRefresh = (function(_this) {
          return function() {
            var params, requested;
            params = _.extend({}, _this._filters, {
              offset: 0,
              limit: _this._page * _this._pageSize
            });
            _this.setSilentRefreshEnabled(false);
            requested = _this._listVersion;
            return $namespaces.current().threads({}, params).then(function(threads) {
              if (_this._listVersion !== requested) {
                return;
              }
              _this.setList(threads);
              return _this.setSilentRefreshEnabled(true);
            }, error._handleAPIError);
          };
        })(this);
        this.setSilentRefreshEnabled = (function(_this) {
          return function(enabled) {
            if (_this._timer) {
              clearInterval(_this._timer);
            }
            if (enabled) {
              return _this._timer = setInterval(_this.silentRefresh, 10000);
            }
          };
        })(this);
        return this;
      }
    ]);
  });

}).call(this);
