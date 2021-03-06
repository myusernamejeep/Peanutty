(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; },
    __indexOf = Array.prototype.indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  (function($) {
    var INTERNAL_ROUTES, Peanutty, handleInternalRoutes, reallyRunRoutes, views, _hash;
    Peanutty = require('Peanutty');
    views = require('views');
    views.Home = (function(_super) {

      __extends(Home, _super);

      function Home() {
        this.loadSolutions = __bind(this.loadSolutions, this);
        this.removeLevelElements = __bind(this.removeLevelElements, this);
        this.loadNewLevel = __bind(this.loadNewLevel, this);
        this.getEnvironmentCode = __bind(this.getEnvironmentCode, this);
        this.getLevelCode = __bind(this.getLevelCode, this);
        this.getScriptCode = __bind(this.getScriptCode, this);
        this.loadEnvironment = __bind(this.loadEnvironment, this);
        this.loadLevel = __bind(this.loadLevel, this);
        this.loadScript = __bind(this.loadScript, this);
        this.code = __bind(this.code, this);
        this.loadCode = __bind(this.loadCode, this);
        this.resetLevel = __bind(this.resetLevel, this);
        this.resizeAreas = __bind(this.resizeAreas, this);
        this.initTopButtons = __bind(this.initTopButtons, this);
        this.initTabs = __bind(this.initTabs, this);
        this.editorHasFocus = __bind(this.editorHasFocus, this);
        this.initEditors = __bind(this.initEditors, this);
        this.initCodeSaving = __bind(this.initCodeSaving, this);
        Home.__super__.constructor.apply(this, arguments);
      }

      Home.prototype.prepare = function() {
        var _this = this;
        window.Peanutty = Peanutty;
        window.b2d = Peanutty.b2d;
        window.view = this;
        window.level = {
          elements: {},
          removeElements: this.removeLevelElements,
          reset: this.resetLevel,
          load: this.loadNewLevel,
          find: this.$,
          lastTime: null,
          getTimeDiff: function() {
            var timeDiff;
            timeDiff = level.lastTime != null ? new Date() - level.lastTime : 0;
            level.lastTime = new Date();
            return timeDiff;
          },
          editorHasFocus: this.editorHasFocus,
          code: {
            script: this.getScriptCode,
            level: this.getLevelCode,
            environment: this.getEnvironmentCode
          }
        };
        this.templates = {
          main: this._requireTemplate('templates/home.html'),
          script: this._requireTemplate('templates/basic_script.coffee'),
          level: this._requireTemplate("templates/levels/" + this.data.level + "_level.coffee"),
          environment: this._requireTemplate('templates/basic_environment.coffee')
        };
        return this._requireScript("templates/levels/solutions/" + this.data.level + "_solution_list.js");
      };

      Home.prototype.renderView = function() {
        var _this = this;
        if (navigator.userAgent.indexOf("Chrome") === -1) {
          this.el.html(this._requireTemplate('templates/chrome_only.html').render());
          return;
        }
        this.el.html(this.templates.main.render());
        this.resizeAreas();
        $(window).bind('resize', this.resizeAreas);
        $(window).bind('keydown', function(e) {
          if (e.keyCode === 119) return Peanutty.runScript();
        });
        level.canvasContainer = this.$('#canvas_container');
        this.initTabs();
        this.initTopButtons();
        this.initEditors();
        this.loadCode();
        this.initCodeSaving();
        Peanutty.runScript();
        return this.loadSolutions();
      };

      Home.prototype.initCodeSaving = function() {
        var editorName, loadCode, _i, _len, _ref, _results,
          _this = this;
        if (this.data.params.nosave != null) return;
        loadCode = null;
        _ref = ['script', 'level', 'environment'];
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          editorName = _ref[_i];
          _results.push((function(editorName) {
            var editor, existingScript, levelName;
            editor = _this["" + editorName + "Editor"];
            levelName = level.name || _this.data.level;
            existingScript = localStorage.getItem("" + levelName + "_" + editorName);
            if ((existingScript != null) && existingScript.length > 0 && existingScript !== editor.getSession().getValue()) {
              if (loadCode || (!(loadCode != null) && confirm('You have some old code for this level.\n\nWould you like to load it?'))) {
                editor.getSession().setValue(existingScript);
                loadCode = true;
              } else {
                loadCode = false;
              }
            }
            return editor.getSession().on('change', function() {
              return localStorage.setItem("" + levelName + "_" + editorName, editor.getSession().getValue());
            });
          })(editorName));
        }
        return _results;
      };

      Home.prototype.initEditors = function() {
        var CoffeeScriptMode, editMessage, editor, screenToTextCoordinates, _i, _len, _ref, _results;
        screenToTextCoordinates = function(pageX, pageY) {
          var canvasPos, col, row;
          canvasPos = this.scroller.getBoundingClientRect();
          this.scrollLeft = this.session.$scrollLeft;
          this.scrollTop = this.session.$scrollTop;
          col = Math.round((pageX + this.scrollLeft - canvasPos.left - this.$padding - $(window).scrollLeft()) / this.characterWidth);
          row = Math.floor((pageY + this.scrollTop - canvasPos.top - $(window).scrollTop()) / this.lineHeight);
          return this.session.screenToDocumentPosition(row, Math.max(col, 0));
        };
        CoffeeScriptMode = ace.require("ace/mode/coffee").Mode;
        this.scriptEditor = ace.edit(this.$('#codes .script')[0]);
        this.scriptEditor.getSession().setMode(new CoffeeScriptMode());
        this.scriptEditor.renderer.screenToTextCoordinates = screenToTextCoordinates;
        window.scriptEditor = this.scriptEditor;
        this.levelEditor = ace.edit(this.$('#codes .level')[0]);
        this.levelEditor.getSession().setMode(new CoffeeScriptMode());
        this.levelEditor.renderer.screenToTextCoordinates = screenToTextCoordinates;
        this.environmentEditor = ace.edit(this.$('#codes .environment')[0]);
        this.environmentEditor.getSession().setMode(new CoffeeScriptMode());
        this.environmentEditor.renderer.screenToTextCoordinates = screenToTextCoordinates;
        _ref = this.$("#codes .code");
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          editor = _ref[_i];
          editMessage = $(document.createElement("DIV"));
          editMessage.addClass('edit_message');
          editMessage.html("Edit this code!<br/><br/>If you make a change, just hit 'Run Script' above to run it.");
          _results.push($(editor).append(editMessage));
        }
        return _results;
      };

      Home.prototype.editorHasFocus = function() {
        return this.scriptEditor.isFocused() || this.levelEditor.isFocused() || this.environmentEditor.isFocused();
      };

      Home.prototype.initTabs = function() {
        var _this = this;
        return this.$('.tabs .tab').bind('click', function(e) {
          var tab, tabName;
          $('.tabs .tab').removeClass('active');
          tab = $(e.currentTarget);
          tab.addClass('active');
          $('#codes .code').removeClass('selected');
          tabName = tab[0].className.replace('tab', '').replace('active', '').replace(/\s/ig, '');
          _this.$("#codes ." + tabName).addClass('selected');
          return _this["" + tabName + "Editor"].getSession().setValue(_this["" + tabName + "Editor"].getSession().getValue());
        });
      };

      Home.prototype.initTopButtons = function() {
        var _this = this;
        this.$('#code_buttons .run_script').bind('click', function(e) {
          $('.code_message').remove();
          peanutty.destroyWorld();
          _this.removeLevelElements();
          Peanutty.runScript();
          if (_this.f8Message == null) {
            _this.f8Message = true;
            return peanutty.sendCodeMessage({
              message: "You can also run your script by hitting F8 at any time."
            });
          }
        });
        this.$('#code_buttons .load_level').bind('click', function(e) {
          return peanutty.sendCodeMessage({
            message: "If you want to load in a new level simply paste the code in to the 'Level Code' tab."
          });
        });
        return this.$('#code_buttons .reset_level').bind('click', function(e) {
          if (confirm('Are you sure you want to reset this level?\n\nAll of your code changes will be lost.')) {
            return _this.resetLevel();
          }
        });
      };

      Home.prototype.resizeAreas = function() {
        var codeWidth, fullWidth, remainingWidth;
        fullWidth = $(window).width();
        codeWidth = fullWidth * 0.3;
        if (codeWidth < 390) codeWidth = 390;
        if (codeWidth > 450) codeWidth = 450;
        $('#code_buttons').width(codeWidth);
        $('#console').width(codeWidth);
        $('#codes .code').width(codeWidth);
        remainingWidth = fullWidth - codeWidth - 90;
        $('#canvas')[0].width = remainingWidth;
        if (typeof peanutty !== "undefined" && peanutty !== null) {
          return peanutty.screen.evaluateDimensions();
        }
      };

      Home.prototype.resetLevel = function() {
        var timeout, _i, _len, _ref;
        level.lastTime = null;
        peanutty.destroyWorld();
        this.removeLevelElements();
        _ref = Peanutty.executingCode;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          timeout = _ref[_i];
          clearTimeout(timeout);
        }
        this.loadCode();
        return Peanutty.runScript();
      };

      Home.prototype.loadCode = function() {
        this.loadScript();
        this.loadLevel();
        return this.loadEnvironment();
      };

      Home.prototype.code = function(template) {
        return template.html().replace(/^\n*/, '');
      };

      Home.prototype.loadScript = function() {
        return this.scriptEditor.getSession().setValue(this.code(this.templates.script));
      };

      Home.prototype.loadLevel = function() {
        return this.levelEditor.getSession().setValue(this.code(this.templates.level));
      };

      Home.prototype.loadEnvironment = function() {
        return this.environmentEditor.getSession().setValue(this.code(this.templates.environment));
      };

      Home.prototype.getScriptCode = function() {
        return this.scriptEditor.getSession().getValue();
      };

      Home.prototype.getLevelCode = function() {
        return this.levelEditor.getSession().getValue();
      };

      Home.prototype.getEnvironmentCode = function() {
        return this.environmentEditor.getSession().getValue();
      };

      Home.prototype.loadNewLevel = function(levelName) {
        return $.route.navigate("level/" + levelName, true);
      };

      Home.prototype.removeLevelElements = function() {
        var element, name, _ref;
        _ref = level.elements;
        for (name in _ref) {
          element = _ref[name];
          $(element).remove();
        }
        return level.elements = {};
      };

      Home.prototype.loadSolutions = function() {
        var index, solution, _len, _ref, _results,
          _this = this;
        this.$('#solutions').hide();
        if (this.solutionList == null) return;
        if (this.solutionList.length > 0) {
          this.$('#solutions').show();
        } else {
          this.$('#solutions').hide();
        }
        _ref = this.solutionList;
        _results = [];
        for (index = 0, _len = _ref.length; index < _len; index++) {
          solution = _ref[index];
          _results.push((function(solution, index) {
            var solutionLink;
            solutionLink = $(document.createElement("A"));
            solutionLink.html("Solution " + (index + 1));
            solutionLink.bind('click', function() {
              var src;
              src = "templates/levels/solutions/" + _this.data.level + "_" + solution + ".coffee";
              if (window.STATIC_SERVER) {
                src = "/build/client/versions/" + window.VERSION + "/" + src;
              }
              return $.ajax({
                method: 'GET',
                url: "" + src + "?" + (Math.random()),
                type: 'html',
                success: function(solutionCoffee) {
                  peanutty.destroyWorld();
                  _this.removeLevelElements();
                  _this.scriptEditor.getSession().setValue(solutionCoffee);
                  return Peanutty.runScript();
                }
              });
            });
            return _this.$('#solutions').append(solutionLink);
          })(solution, index));
        }
        return _results;
      };

      return Home;

    })(views.BaseView);
    INTERNAL_ROUTES = ['home', 'levels', 'create', 'coding', 'about', 'docs'];
    reallyRunRoutes = $.route.run;
    _hash = '';
    handleInternalRoutes = function(hash) {
      if (__indexOf.call(INTERNAL_ROUTES, hash) >= 0) {
        $.route.navigate(hash, false);
        $.timeout(1, function() {
          if (_hash.length) return $.route.navigate(_hash, false);
        });
      } else {
        if (hash.replace(/\s/g, '').length !== 0) _hash = hash;
        reallyRunRoutes(hash);
      }
    };
    $.route.run = handleInternalRoutes;
    return $.route.add({
      '': function() {
        return $('#content').view({
          name: 'Home',
          data: {
            level: 'hello_world',
            params: {}
          }
        });
      },
      'level/:level': function(level) {
        if (level.indexOf('&') > -1) return;
        return $('#content').view({
          name: 'Home',
          data: {
            level: level,
            params: {}
          }
        });
      },
      'level/:level&:params': function(level, paramInfo) {
        var param, params, _i, _len, _ref;
        params = {};
        _ref = (function() {
          var _j, _len, _ref, _results;
          _ref = paramInfo.split(/&/);
          _results = [];
          for (_j = 0, _len = _ref.length; _j < _len; _j++) {
            param = _ref[_j];
            _results.push(param.split(/\=/));
          }
          return _results;
        })();
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          param = _ref[_i];
          params[param[0]] = param[1];
        }
        return $('#content').view({
          name: 'Home',
          data: {
            level: level,
            params: params
          }
        });
      }
    });
  })(ender);

}).call(this);
