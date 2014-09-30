(function() {
  define(['angular', 'underscore'], function(angular, _) {
    return angular.module('baobab.directive.autocomplete', []).directive('autocomplete', function($compile) {
      return {
        restrict: 'A',
        scope: {
          "results": "=",
          "autocomplete": "=",
          "target": "="
        },
        template: function(elem, attr) {
          return '<div><span ng-repeat="tag in target track by $index" class="tag" ' + 'ng-include="\'/partials/tag.html\'"></span><span ' + 'class="tag-wrap-input" ng-transclude/></div>';
        },
        transclude: 'element',
        replace: true,
        link: function(scope, elem, attr) {
          var AutocompleteException, input, results, setWidth, span;
          elem.addClass('autocomplete');
          input = elem.find('[autocomplete]');
          results = {
            completions: [],
            selection: null,
            index: 0
          };
          scope.results = results;
          span = document.createElement("span");
          setWidth = function() {
            var content;
            content = input.val() || "";
            span.textContent = content;
            span.style.visibility = "hidden";
            span.style.position = "absolute";
            input.after(span);
            span.style.left = input[0].offsetLeft + input[0].clientLeft + 1 + "px";
            span.style.top = input[0].offsetTop + input[0].clientTop + 1 + "px";
            input.css("width", 20 + span.offsetWidth + "px");
            return span.remove();
          };
          AutocompleteException = function(message) {
            this.name = "AutocompleteException";
            return this.message = message;
          };
          return scope.$watch('autocomplete', _.once(function(options) {
            var complete, keys, parse, removeTag, selectCompletion, updateCompletions, updateIndex;
            if (!options) {
              throw new AutocompleteException("" + "Could not retrieve options while configuring autocomplete");
            }
            if (!options.complete) {
              throw new AutocompleteException("" + "No completion function provided to autocomplete");
            }
            if (!options.parse) {
              throw new AutocompleteException("No parse provided in autocomplete model");
            }
            complete = options.complete;
            parse = options.parse;
            updateCompletions = function() {
              setWidth();
              results.completions = complete(input.val());
              results.index = results.completions.indexOf(results.selection);
              if (results.index < 0) {
                results.index = 0;
              }
              return results.selection = results.completions[results.index] || null;
            };
            selectCompletion = function() {
              var model;
              if (_.isEmpty(results.selection)) {
                return;
              }
              model = scope.target;
              if (!model) {
                console.log("WARN: No model on selectCompletion");
                return;
              }
              model.push(results.selection);
              input.val("");
              return updateCompletions();
            };
            removeTag = function() {
              var model;
              model = scope.target;
              if (!model) {
                console.log("WARN: No model on removeTag");
                return;
              }
              return model.pop();
            };
            updateIndex = function(f) {
              return scope.$apply(function() {
                results.index = f(results.index);
                if (results.index >= 0) {
                  return results.selection = results.completions[results.index];
                } else {
                  return results.selection = null;
                }
              });
            };
            input.on('input', function(event) {
              var last, val;
              val = input.val();
              if (val.indexOf(",") >= 0) {
                val = _.map(val.split(","), function(text) {
                  return text.replace(/[]*$/, '').replace(/^ */, '');
                });
                last = _.last(val);
                val = _.map(_.compact(_.initial(val)), parse);
                return scope.$apply(function() {
                  var model;
                  model = scope.target;
                  if (!model) {
                    console.log("WARN: No model on comma completion");
                    return;
                  }
                  _.map(val, function(contact) {
                    return model.push(contact);
                  });
                  input.val(last);
                  setWidth();
                  return updateCompletions();
                });
              } else {
                return scope.$apply(updateCompletions);
              }
            });
            input.on('blur', function(event) {
              var val;
              val = input.val();
              val = _.map(val.split(","), function(text) {
                return text.replace(/[]*$/, '').replace(/^ */, '');
              });
              val = _.map(_.compact(val), parse);
              return scope.$apply(function() {
                var model;
                model = scope.target;
                if (!model) {
                  console.log("WARN: No model on blur");
                  return;
                }
                _.map(val, function(contact) {
                  return model.push(contact);
                });
                input.val("");
                setWidth();
                return updateCompletions();
              });
            });
            keys = {
              13: function(event) {
                if (_.isEmpty(results.completions)) {
                  return true;
                }
                if (_.isEmpty(results.selection)) {
                  return true;
                }
                scope.$apply(selectCompletion);
                return event.preventDefault();
              },
              39: function(event) {
                if (_.isEmpty(results.completions)) {
                  return true;
                }
                if (_.isEmpty(results.selection)) {
                  return true;
                }
                scope.$apply(selectCompletion);
                return event.preventDefault();
              },
              9: function(event) {
                if (_.isEmpty(results.completions)) {
                  return true;
                }
                if (_.isEmpty(results.selection)) {
                  return true;
                }
                scope.$apply(selectCompletion);
                return event.preventDefault();
              },
              38: function(event) {
                updateIndex(function(i) {
                  return Math.max(i - 1, -1);
                });
                return event.preventDefault();
              },
              40: function(event) {
                updateIndex(function(i) {
                  return Math.min(i + 1, results.completions.length - 1);
                });
                return event.preventDefault();
              },
              8: function(event) {
                if (input.val() === "") {
                  scope.$apply(removeTag);
                  return event.preventDefault();
                }
              }
            };
            return input.on('keydown', function(event) {
              if (!keys[event.which]) {
                return true;
              }
              return keys[event.which](event);
            });
          }));
        }
      };
    });
  });

}).call(this);
