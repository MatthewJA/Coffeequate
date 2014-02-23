(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        //Allow using this built library as an AMD module
        //in another project. That other project will only
        //see this AMD call, not the internal modules in
        //the closure below.
        define(factory);
    } else {
        //Browser globals case. Just assign the
        //result to a property on the global.
        root.libGlobalName = factory();
        window.coffeequate = factory();
    }
}(this, function () {
    //almond, and modules will be inlined here
/**
 * almond 0.2.6 Copyright (c) 2011-2012, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/almond for details
 */
//Going sloppy to avoid 'use strict' string cost, but strict practices should
//be followed.
/*jslint sloppy: true */
/*global setTimeout: false */

var requirejs, require, define;
(function (undef) {
    var main, req, makeMap, handlers,
        defined = {},
        waiting = {},
        config = {},
        defining = {},
        hasOwn = Object.prototype.hasOwnProperty,
        aps = [].slice;

    function hasProp(obj, prop) {
        return hasOwn.call(obj, prop);
    }

    /**
     * Given a relative module name, like ./something, normalize it to
     * a real name that can be mapped to a path.
     * @param {String} name the relative name
     * @param {String} baseName a real name that the name arg is relative
     * to.
     * @returns {String} normalized name
     */
    function normalize(name, baseName) {
        var nameParts, nameSegment, mapValue, foundMap,
            foundI, foundStarMap, starI, i, j, part,
            baseParts = baseName && baseName.split("/"),
            map = config.map,
            starMap = (map && map['*']) || {};

        //Adjust any relative paths.
        if (name && name.charAt(0) === ".") {
            //If have a base name, try to normalize against it,
            //otherwise, assume it is a top-level require that will
            //be relative to baseUrl in the end.
            if (baseName) {
                //Convert baseName to array, and lop off the last part,
                //so that . matches that "directory" and not name of the baseName's
                //module. For instance, baseName of "one/two/three", maps to
                //"one/two/three.js", but we want the directory, "one/two" for
                //this normalization.
                baseParts = baseParts.slice(0, baseParts.length - 1);

                name = baseParts.concat(name.split("/"));

                //start trimDots
                for (i = 0; i < name.length; i += 1) {
                    part = name[i];
                    if (part === ".") {
                        name.splice(i, 1);
                        i -= 1;
                    } else if (part === "..") {
                        if (i === 1 && (name[2] === '..' || name[0] === '..')) {
                            //End of the line. Keep at least one non-dot
                            //path segment at the front so it can be mapped
                            //correctly to disk. Otherwise, there is likely
                            //no path mapping for a path starting with '..'.
                            //This can still fail, but catches the most reasonable
                            //uses of ..
                            break;
                        } else if (i > 0) {
                            name.splice(i - 1, 2);
                            i -= 2;
                        }
                    }
                }
                //end trimDots

                name = name.join("/");
            } else if (name.indexOf('./') === 0) {
                // No baseName, so this is ID is resolved relative
                // to baseUrl, pull off the leading dot.
                name = name.substring(2);
            }
        }

        //Apply map config if available.
        if ((baseParts || starMap) && map) {
            nameParts = name.split('/');

            for (i = nameParts.length; i > 0; i -= 1) {
                nameSegment = nameParts.slice(0, i).join("/");

                if (baseParts) {
                    //Find the longest baseName segment match in the config.
                    //So, do joins on the biggest to smallest lengths of baseParts.
                    for (j = baseParts.length; j > 0; j -= 1) {
                        mapValue = map[baseParts.slice(0, j).join('/')];

                        //baseName segment has  config, find if it has one for
                        //this name.
                        if (mapValue) {
                            mapValue = mapValue[nameSegment];
                            if (mapValue) {
                                //Match, update name to the new value.
                                foundMap = mapValue;
                                foundI = i;
                                break;
                            }
                        }
                    }
                }

                if (foundMap) {
                    break;
                }

                //Check for a star map match, but just hold on to it,
                //if there is a shorter segment match later in a matching
                //config, then favor over this star map.
                if (!foundStarMap && starMap && starMap[nameSegment]) {
                    foundStarMap = starMap[nameSegment];
                    starI = i;
                }
            }

            if (!foundMap && foundStarMap) {
                foundMap = foundStarMap;
                foundI = starI;
            }

            if (foundMap) {
                nameParts.splice(0, foundI, foundMap);
                name = nameParts.join('/');
            }
        }

        return name;
    }

    function makeRequire(relName, forceSync) {
        return function () {
            //A version of a require function that passes a moduleName
            //value for items that may need to
            //look up paths relative to the moduleName
            return req.apply(undef, aps.call(arguments, 0).concat([relName, forceSync]));
        };
    }

    function makeNormalize(relName) {
        return function (name) {
            return normalize(name, relName);
        };
    }

    function makeLoad(depName) {
        return function (value) {
            defined[depName] = value;
        };
    }

    function callDep(name) {
        if (hasProp(waiting, name)) {
            var args = waiting[name];
            delete waiting[name];
            defining[name] = true;
            main.apply(undef, args);
        }

        if (!hasProp(defined, name) && !hasProp(defining, name)) {
            throw new Error('No ' + name);
        }
        return defined[name];
    }

    //Turns a plugin!resource to [plugin, resource]
    //with the plugin being undefined if the name
    //did not have a plugin prefix.
    function splitPrefix(name) {
        var prefix,
            index = name ? name.indexOf('!') : -1;
        if (index > -1) {
            prefix = name.substring(0, index);
            name = name.substring(index + 1, name.length);
        }
        return [prefix, name];
    }

    /**
     * Makes a name map, normalizing the name, and using a plugin
     * for normalization if necessary. Grabs a ref to plugin
     * too, as an optimization.
     */
    makeMap = function (name, relName) {
        var plugin,
            parts = splitPrefix(name),
            prefix = parts[0];

        name = parts[1];

        if (prefix) {
            prefix = normalize(prefix, relName);
            plugin = callDep(prefix);
        }

        //Normalize according
        if (prefix) {
            if (plugin && plugin.normalize) {
                name = plugin.normalize(name, makeNormalize(relName));
            } else {
                name = normalize(name, relName);
            }
        } else {
            name = normalize(name, relName);
            parts = splitPrefix(name);
            prefix = parts[0];
            name = parts[1];
            if (prefix) {
                plugin = callDep(prefix);
            }
        }

        //Using ridiculous property names for space reasons
        return {
            f: prefix ? prefix + '!' + name : name, //fullName
            n: name,
            pr: prefix,
            p: plugin
        };
    };

    function makeConfig(name) {
        return function () {
            return (config && config.config && config.config[name]) || {};
        };
    }

    handlers = {
        require: function (name) {
            return makeRequire(name);
        },
        exports: function (name) {
            var e = defined[name];
            if (typeof e !== 'undefined') {
                return e;
            } else {
                return (defined[name] = {});
            }
        },
        module: function (name) {
            return {
                id: name,
                uri: '',
                exports: defined[name],
                config: makeConfig(name)
            };
        }
    };

    main = function (name, deps, callback, relName) {
        var cjsModule, depName, ret, map, i,
            args = [],
            usingExports;

        //Use name if no relName
        relName = relName || name;

        //Call the callback to define the module, if necessary.
        if (typeof callback === 'function') {

            //Pull out the defined dependencies and pass the ordered
            //values to the callback.
            //Default to [require, exports, module] if no deps
            deps = !deps.length && callback.length ? ['require', 'exports', 'module'] : deps;
            for (i = 0; i < deps.length; i += 1) {
                map = makeMap(deps[i], relName);
                depName = map.f;

                //Fast path CommonJS standard dependencies.
                if (depName === "require") {
                    args[i] = handlers.require(name);
                } else if (depName === "exports") {
                    //CommonJS module spec 1.1
                    args[i] = handlers.exports(name);
                    usingExports = true;
                } else if (depName === "module") {
                    //CommonJS module spec 1.1
                    cjsModule = args[i] = handlers.module(name);
                } else if (hasProp(defined, depName) ||
                           hasProp(waiting, depName) ||
                           hasProp(defining, depName)) {
                    args[i] = callDep(depName);
                } else if (map.p) {
                    map.p.load(map.n, makeRequire(relName, true), makeLoad(depName), {});
                    args[i] = defined[depName];
                } else {
                    throw new Error(name + ' missing ' + depName);
                }
            }

            ret = callback.apply(defined[name], args);

            if (name) {
                //If setting exports via "module" is in play,
                //favor that over return value and exports. After that,
                //favor a non-undefined return value over exports use.
                if (cjsModule && cjsModule.exports !== undef &&
                        cjsModule.exports !== defined[name]) {
                    defined[name] = cjsModule.exports;
                } else if (ret !== undef || !usingExports) {
                    //Use the return value from the function.
                    defined[name] = ret;
                }
            }
        } else if (name) {
            //May just be an object definition for the module. Only
            //worry about defining if have a module name.
            defined[name] = callback;
        }
    };

    requirejs = require = req = function (deps, callback, relName, forceSync, alt) {
        if (typeof deps === "string") {
            if (handlers[deps]) {
                //callback in this case is really relName
                return handlers[deps](callback);
            }
            //Just return the module wanted. In this scenario, the
            //deps arg is the module name, and second arg (if passed)
            //is just the relName.
            //Normalize module name, if it contains . or ..
            return callDep(makeMap(deps, callback).f);
        } else if (!deps.splice) {
            //deps is a config object, not an array.
            config = deps;
            if (callback.splice) {
                //callback is an array, which means it is a dependency list.
                //Adjust args if there are dependencies
                deps = callback;
                callback = relName;
                relName = null;
            } else {
                deps = undef;
            }
        }

        //Support require(['a'])
        callback = callback || function () {};

        //If relName is a function, it is an errback handler,
        //so remove it.
        if (typeof relName === 'function') {
            relName = forceSync;
            forceSync = alt;
        }

        //Simulate async callback;
        if (forceSync) {
            main(undef, deps, callback, relName);
        } else {
            //Using a non-zero value because of concern for what old browsers
            //do, and latest browsers "upgrade" to 4 if lower value is used:
            //http://www.whatwg.org/specs/web-apps/current-work/multipage/timers.html#dom-windowtimers-settimeout:
            //If want a value immediately, use require('id') instead -- something
            //that works in almond on the global level, but not guaranteed and
            //unlikely to work in other AMD implementations.
            setTimeout(function () {
                main(undef, deps, callback, relName);
            }, 4);
        }

        return req;
    };

    /**
     * Just drops the config on the floor, but returns req in case
     * the config return value is used.
     */
    req.config = function (cfg) {
        config = cfg;
        if (config.deps) {
            req(config.deps, config.callback);
        }
        return req;
    };

    /**
     * Expose module registry for debugging and tooling
     */
    requirejs._defined = defined;

    define = function (name, deps, callback) {

        //This module may not have dependencies
        if (!deps.splice) {
            //deps is not an array, so probably means
            //an object literal or factory function for
            //the value. Adjust args.
            callback = deps;
            deps = [];
        }

        if (!hasProp(defined, name) && !hasProp(waiting, name)) {
            waiting[name] = [name, deps, callback];
        }
    };

    define.amd = {
        jQuery: true
    };
}());

define("lib/almond", function(){});

// Generated by CoffeeScript 1.6.3
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define('parse',["require"], function(require) {
    var CONSTANT_REGEX, DIMENSIONS_REGEX, ParseError, RATIO_REGEX, SYMBOLIC_CONSTANT_REGEX, StringToExpression, VARIABLE_REGEX, stringToTerminal;
    ParseError = (function(_super) {
      __extends(ParseError, _super);

      function ParseError(input, type) {
        this.input = input;
        this.type = type;
      }

      ParseError.prototype.toString = function() {
        return "Could not parse '" + this.input + "' as " + this.type;
      };

      return ParseError;

    })(Error);
    VARIABLE_REGEX = /^@*[a-zA-Z\u0391-\u03A9\u03B1-\u03C9][a-zA-Z\u0391-\u03A9\u03B1-\u03C9_\-\d]*$/;
    CONSTANT_REGEX = /^-?\d+(\.\d+)?$/;
    RATIO_REGEX = /^-?\d+(\.\d+)?\/\d+(\.\d+)?$/;
    SYMBOLIC_CONSTANT_REGEX = /^\\@*[a-zA-Z\u0391-\u03A9\u03B1-\u03C9][a-zA-Z\u0391-\u03A9\u03B1-\u03C9_\-\d]*$/;
    DIMENSIONS_REGEX = /^[^:]*::\{[^:+]*\}$/;
    stringToTerminal = function(string) {
      var segments, terminal, terminals;
      if (/\^/.test(string)) {
        throw new Error("Unexpected carat (^). Coffeequate uses ** for exponentiation");
      }
      if (DIMENSIONS_REGEX.test(string)) {
        segments = string.split("::");
        terminal = stringToTerminal(segments[0]);
        terminal.units = new StringToExpression(segments[1].slice(1, segments[1].length - 1));
        return terminal;
      }
      string = string.trim();
      terminals = require("terminals");
      if (CONSTANT_REGEX.test(string) || RATIO_REGEX.test(string)) {
        return new terminals.Constant(string);
      } else if (VARIABLE_REGEX.test(string)) {
        if (string[0] === "σ") {
          return new terminals.Uncertainty(string.slice(1));
        }
        return new terminals.Variable(string);
      } else if (SYMBOLIC_CONSTANT_REGEX.test(string)) {
        return new terminals.SymbolicConstant(string.slice(1));
      } else {
        throw new ParseError(string, "terminal");
      }
    };
    StringToExpression = (function() {
      /*
      			ADDN := MULT | ADDN "+" MULT
      			MULT := POWR | MULT "*" POWR
      			POWR := BRAC | POWR "**" BRAC
      			BRAC := "-" BRAC | "(" ADDN ")" | TERM
      			TERM := <Existing Code>
      */

      function StringToExpression(string, simplify) {
        var parseResult;
        if (simplify == null) {
          simplify = true;
        }
        this.tokens = StringToExpression.tokenise(string).reverse();
        this.upto = 0;
        this.operators = require("operators");
        parseResult = this.parseAddition();
        if (simplify) {
          parseResult = parseResult.expandAndSimplify();
        }
        return parseResult;
      }

      StringToExpression.tokenise = function(string) {
        return string.split(/(\*\*|[+*()\-:]|\s)/).filter(function(z) {
          return !/^\s*$/.test(z);
        });
      };

      StringToExpression.prototype.getToken = function() {
        return this.tokens[this.upto];
      };

      StringToExpression.prototype.parseAddition = function() {
        var addn, mult;
        mult = this.parseMultiplication();
        if (this.getToken() !== "+") {
          return mult;
        }
        this.upto += 1;
        addn = this.parseAddition();
        return new this.operators.Add(addn, mult);
      };

      StringToExpression.prototype.parseMultiplication = function() {
        var mult, powr;
        powr = this.parsePower();
        if (this.getToken() && VARIABLE_REGEX.test(this.getToken())) {
          throw new ParseError(this.getToken(), "multiplication");
        }
        if (this.getToken() !== "*") {
          return powr;
        }
        this.upto += 1;
        mult = this.parseMultiplication();
        return new this.operators.Mul(mult, powr);
      };

      StringToExpression.prototype.parsePower = function() {
        var brac, powr;
        brac = this.parseBracket();
        if (this.getToken() !== "**") {
          return brac;
        }
        this.upto += 1;
        powr = this.parsePower();
        return new this.operators.Pow(powr, brac);
      };

      StringToExpression.prototype.parseBracket = function() {
        var addn, term;
        if (this.getToken() === ")") {
          this.upto += 1;
          addn = this.parseAddition();
          if (this.getToken() !== "(") {
            throw new Error(("ParseError: Expected '(' but found '" + (this.getToken()) + "' at position ") + ("" + (this.tokens.length - this.upto) + "/" + this.tokens.length + " in token stream '" + (this.tokens.reverse().join(" ")) + "'"));
          }
          this.upto += 1;
          if (this.getToken() === "-") {
            this.upto += 1;
            return new this.operators.Mul(-1, addn);
          } else {
            return addn;
          }
        } else {
          term = this.parseTerm();
          if (this.getToken() === "-") {
            this.upto += 1;
            return new this.operators.Mul(-1, term);
          } else {
            return term;
          }
        }
      };

      StringToExpression.prototype.parseTerm = function() {
        var term, terminal;
        terminal = [];
        if (this.getToken()[this.getToken().length - 1] === "}") {
          while (this.getToken()[0] !== ":") {
            terminal.push(this.getToken());
            this.upto += 1;
          }
          terminal.push(this.getToken());
          this.upto += 1;
          terminal.push(this.getToken());
          this.upto += 1;
          terminal.push(this.getToken());
          term = stringToTerminal(terminal.reverse().join(""));
        } else {
          term = stringToTerminal(this.getToken());
        }
        this.upto += 1;
        return term;
      };

      return StringToExpression;

    })();
    return {
      ParseError: ParseError,
      stringToExpression: function(string, simplify) {
        if (simplify == null) {
          simplify = true;
        }
        return new StringToExpression(string, simplify);
      },
      constant: function(value) {
        if (typeof value === "string" || value instanceof String) {
          if (value === "") {
            throw new ParseError("", "constant");
          }
          value = value.split("/");
          if (value.length === 1) {
            return [parseFloat(value[0]), 1];
          } else if (value.length === 2) {
            return [parseFloat(value[0]), parseFloat(value[1])];
          } else {
            throw new ParseError(value.join("/"), "constant");
          }
        } else if (typeof value === "number" || value instanceof Number) {
          return [value, 1];
        } else {
          throw new ParseError(value, "constant");
        }
      },
      stringToTerminal: stringToTerminal
    };
  });

}).call(this);

// Generated by CoffeeScript 1.6.3
(function() {
  define('generateInfo',[],function() {
    return {
      getMathMLInfo: function(equationID, expression, equality) {
        var html, mathClass, mathID, mathIDstring;
        if (equality == null) {
          equality = "0";
        }
        mathClass = expression ? "expression" : "equation";
        mathID = "" + mathClass + "-" + (equationID != null ? equationID : Math.floor(Math.random() * 10000000).toString(16));
        mathIDstring = equationID != null ? 'id="' + mathID + '"' : "";
        html = '<div ' + mathIDstring + ' class="' + mathClass + '"><math xmlns="http://www.w3.org/1998/Math/MathML">' + (equality != null ? (isFinite(equality) ? "<mn>" + equality + "</mn>" : (equality.toMathML != null ? "" + (equality.toMathML(equationID, expression)) : "<mi>" + equality + "</mi>")) + "<mo>=</mo>" : "");
        return [mathClass, mathID, html];
      },
      getHTMLInfo: function(equationID, expression, equality) {
        var html, mathClass, mathID, mathIDstring;
        if (equality == null) {
          equality = "0";
        }
        mathClass = expression ? "expression" : "equation";
        mathID = "" + mathClass + "-" + (equationID != null ? equationID : Math.floor(Math.random() * 10000000).toString(16));
        mathIDstring = equationID != null ? 'id="' + mathID + '"' : "";
        html = '<div ' + mathIDstring + ' class="' + mathClass + '">' + (equality != null ? (equality.toHTML != null ? "" + (equality.toHTML(equationID, expression)) : "" + equality) + "=" : "");
        return [mathClass, mathID, html];
      }
    };
  });

}).call(this);

// Generated by CoffeeScript 1.6.3
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define('nodes',["generateInfo"], function(generateInfo) {
    var BasicNode;
    BasicNode = (function() {
      function BasicNode(label) {
        this.label = label;
      }

      BasicNode.prototype.getChildren = function() {
        return [];
      };

      BasicNode.prototype.getAllVariables = function() {
        return [];
      };

      BasicNode.prototype.toDrawingNode = function() {
        throw new Error("toDrawingNode not implemented for " + (self.toString()));
      };

      BasicNode.prototype.toLaTeX = function() {
        return this.toDrawingNode().renderLaTeX();
      };

      BasicNode.prototype.toString = function() {
        return this.toDrawingNode().renderString();
      };

      BasicNode.prototype.toLisp = function() {
        return this.label;
      };

      BasicNode.prototype.toMathML = function(equationID, expression, equality, topLevel) {
        var closingHTML, mathClass, mathID, openingHTML, _ref;
        if (equality == null) {
          equality = "0";
        }
        if (topLevel == null) {
          topLevel = false;
        }
        _ref = generateInfo.getMathMLInfo(equationID, expression, equality), mathClass = _ref[0], mathID = _ref[1], openingHTML = _ref[2];
        if (!topLevel) {
          openingHTML = "";
          closingHTML = "";
        } else {
          closingHTML = "</math></div>";
        }
        return openingHTML + this.toDrawingNode().renderMathML(equationID, expression) + closingHTML;
      };

      BasicNode.prototype.stringEqual = function(other) {
        return other.toString() === this.toString();
      };

      return BasicNode;

    })();
    return {
      BasicNode: BasicNode,
      RoseNode: (function(_super) {
        __extends(_Class, _super);

        function _Class(label, children) {
          this.children = children != null ? children : null;
          if (this.children == null) {
            this.children = [];
          }
          _Class.__super__.constructor.call(this, label);
        }

        _Class.prototype.getChildren = function() {
          return this.children;
        };

        _Class.prototype.toLisp = function() {
          var childrenStrings;
          childrenStrings = this.children.map(function(x) {
            if (x.toLisp) {
              return x.toLisp();
            } else {
              return x;
            }
          });
          return "(" + this.label + (this.children ? " " : "") + (childrenStrings.join(" ")) + ")";
        };

        return _Class;

      })(BasicNode),
      BinaryNode: (function(_super) {
        __extends(_Class, _super);

        function _Class(label, left, right) {
          this.label = label;
          this.children = {
            left: left,
            right: right
          };
        }

        _Class.prototype.getChildren = function() {
          return [this.children.left, this.children.right];
        };

        _Class.prototype.toLisp = function() {
          var lispify;
          lispify = function(x) {
            if (x.toLisp) {
              return x.toLisp();
            } else {
              return x;
            }
          };
          return "(" + this.label + " " + (lispify(this.children.left)) + " " + (lispify(this.children.right)) + ")";
        };

        return _Class;

      })(BasicNode)
    };
  });

}).call(this);

// Generated by CoffeeScript 1.6.3
(function() {
  var __slice = [].slice,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define('prettyRender',[],function() {
    var Add, Bracket, DrawingNode, Fraction, Mul, Number, Pow, Surd, Uncertainty, Variable;
    DrawingNode = (function() {
      function DrawingNode() {}

      DrawingNode.prototype.toString = function() {
        throw new Error("not implemented");
      };

      DrawingNode.prototype.renderLaTeX = function() {
        throw new Error("not implemented");
      };

      DrawingNode.prototype.bindingStrength = function() {
        return 8;
      };

      DrawingNode.prototype.bracketIfNeeded = function(child) {
        if (child.bindingStrength() <= this.bindingStrength()) {
          return new Bracket(child);
        }
        return child;
      };

      return DrawingNode;

    })();
    DrawingNode.makeWithBrackets = function() {
      var node, terms;
      terms = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      node = new this();
      terms = terms.map(function(x) {
        if (x.bindingStrength() <= node.bindingStrength()) {
          return new Bracket(x);
        } else {
          return x;
        }
      });
      node.terms = terms;
      return node;
    };
    Add = (function(_super) {
      __extends(Add, _super);

      function Add() {
        var terms;
        terms = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        this.terms = terms;
      }

      Add.prototype.bindingStrength = function() {
        return 4;
      };

      Add.prototype.renderLaTeX = function() {
        return this.terms.map(function(x) {
          return x.renderLaTeX();
        }).join(" + ");
      };

      Add.prototype.renderString = function() {
        return this.terms.map(function(x) {
          return x.renderString();
        }).join(" + ");
      };

      Add.prototype.renderMathML = function(equationID, expression) {
        return this.terms.map(function(x) {
          return x.renderMathML(equationID, expression);
        }).join("<mo>+</mo>");
      };

      return Add;

    })(DrawingNode);
    Mul = (function(_super) {
      __extends(Mul, _super);

      function Mul() {
        var terms;
        terms = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        this.terms = terms;
      }

      Mul.prototype.bindingStrength = function() {
        return 6;
      };

      Mul.prototype.renderLaTeX = function() {
        return this.terms.map(function(x) {
          return x.renderLaTeX();
        }).join(" \\cdot ");
      };

      Mul.prototype.renderString = function() {
        return this.terms.map(function(x) {
          return x.renderString();
        }).join("*");
      };

      Mul.prototype.renderMathML = function(equationID, expression) {
        return this.terms.map(function(x) {
          return x.renderMathML(equationID, expression);
        }).join("<mo>&middot;</mo>");
      };

      return Mul;

    })(DrawingNode);
    Pow = (function(_super) {
      __extends(Pow, _super);

      function Pow(left, right) {
        this.left = left;
        this.right = right;
      }

      Pow.prototype.renderLaTeX = function() {
        return "" + (this.left.renderLaTeX()) + "^{" + (this.right.renderLaTeX()) + "}";
      };

      Pow.prototype.renderString = function() {
        return "" + (this.left.renderString()) + "**" + (this.bracketIfNeeded(this.right).renderString());
      };

      Pow.prototype.renderMathML = function(equationID, expression) {
        return "<msup>" + (this.left.renderMathML(equationID, expression)) + (this.right.renderMathML(equationID, expression)) + "</msup>";
      };

      return Pow;

    })(DrawingNode);
    Bracket = (function(_super) {
      __extends(Bracket, _super);

      function Bracket(contents) {
        this.contents = contents;
      }

      Bracket.prototype.bindingStrength = function() {
        return 9;
      };

      Bracket.prototype.renderLaTeX = function() {
        return "\\left(" + (this.contents.renderLaTeX()) + "\\right)";
      };

      Bracket.prototype.renderString = function() {
        return "(" + (this.contents.renderString()) + ")";
      };

      Bracket.prototype.renderMathML = function(equationID, expression) {
        return ("<mfenced>" + (this.contents.renderMathML(equationID, expression))) + "</mfenced>";
      };

      return Bracket;

    })(DrawingNode);
    Number = (function(_super) {
      __extends(Number, _super);

      function Number(value) {
        this.value = value;
      }

      Number.prototype.bindingStrength = function() {
        return 10;
      };

      Number.prototype.renderLaTeX = function() {
        return this.value + "";
      };

      Number.prototype.renderString = function() {
        return this.value + "";
      };

      Number.prototype.renderMathML = function(equationID, expression) {
        return "<mn class=\"constant\">" + this.value + "</mn>";
      };

      return Number;

    })(DrawingNode);
    Variable = (function(_super) {
      __extends(Variable, _super);

      function Variable(label, _class) {
        this.label = label;
        this["class"] = _class != null ? _class : "default";
      }

      Variable.prototype.bindingStrength = function() {
        return 10;
      };

      Variable.prototype.renderLaTeX = function() {
        return this.label;
      };

      Variable.prototype.renderString = function() {
        return this.label;
      };

      Variable.prototype.renderMathML = function(equationID, expression) {
        var atCount, atEnd, atStart, i, label, labelArray, labelID;
        labelArray = this.label.split("-");
        label = labelArray[0];
        labelID = (labelArray[1] != null ? 'id="variable-' + (expression ? "expression" : "equation") + ("-" + equationID + "-") + this.label + '"' : "");
        atCount = 0;
        while (label[0] === "@") {
          atCount += 1;
          label = label.slice(1);
        }
        atStart = "<mover accent=\"true\">";
        atEnd = "<mrow><mo>" + ((function() {
          var _i, _results;
          _results = [];
          for (i = _i = 0; 0 <= atCount ? _i < atCount : _i > atCount; i = 0 <= atCount ? ++_i : --_i) {
            _results.push(".");
          }
          return _results;
        })()).join("") + "</mo></mrow></mover>";
        if (label.length > 1) {
          return atStart + '<msub class="variable"' + labelID + '><mi>' + label[0] + '</mi><mi>' + label.slice(1) + "</mi></msub>" + atEnd;
        } else {
          return '<mi class="variable"' + labelID + '>' + label + '</mi>';
        }
      };

      return Variable;

    })(DrawingNode);
    Fraction = (function(_super) {
      __extends(Fraction, _super);

      function Fraction(top, bottom) {
        this.top = top;
        this.bottom = bottom;
      }

      Fraction.prototype.bindingStrength = function() {
        return 8;
      };

      Fraction.prototype.renderLaTeX = function() {
        return "\\frac{" + (this.top.renderLaTeX()) + "}{" + (this.bottom.renderLaTeX()) + "}";
      };

      Fraction.prototype.renderString = function() {
        return "" + (this.bracketIfNeeded(this.top).renderString()) + "/" + (this.bracketIfNeeded(this.bottom).renderString());
      };

      Fraction.prototype.renderMathML = function(x, y) {
        return "<mfrac>      <mrow>" + (this.top.renderMathML(x, y)) + "</mrow>      <mrow>" + (this.bottom.renderMathML(x, y)) + "</mrow>      </mfrac>";
      };

      return Fraction;

    })(DrawingNode);
    Surd = (function(_super) {
      __extends(Surd, _super);

      function Surd(contents, power) {
        this.contents = contents;
        this.power = power != null ? power : null;
      }

      Surd.prototype.renderLaTeX = function() {
        if (this.power && this.power !== 2) {
          return "\\sqrt[" + this.power + "]{" + (this.contents.renderLaTeX()) + "}";
        } else {
          return "\\sqrt{" + (this.contents.renderLaTeX()) + "}";
        }
      };

      Surd.prototype.renderString = function() {
        if (this.power && this.power !== 2) {
          return "" + (this.bracketIfNeeded(this.contents).renderString()) + " ** " + this.power + "}";
        } else {
          return "sqrt(" + (this.contents.renderString()) + ")";
        }
      };

      Surd.prototype.renderMathML = function() {
        var x, _ref, _ref1, _ref2;
        x = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        if (this.power && this.power !== 2) {
          return "<mroot>                  <mrow>                    " + ((_ref = this.power).renderMathML.apply(_ref, x)) + "                  </mrow>                  <mrow>                    " + ((_ref1 = this.contents).renderMathML.apply(_ref1, x)) + "                  </mrow>                </mroot>";
        } else {
          return "<msqrt>                  " + ((_ref2 = this.contents).renderMathML.apply(_ref2, x)) + "                </msqrt>";
        }
      };

      return Surd;

    })(DrawingNode);
    Uncertainty = (function(_super) {
      __extends(Uncertainty, _super);

      function Uncertainty(label, _class) {
        this.label = label;
        this["class"] = _class != null ? _class : "default";
      }

      Uncertainty.prototype.bindingStrength = function() {
        return 9;
      };

      Uncertainty.prototype.renderLaTeX = function() {
        return "\\sigma_{" + this.label + "}";
      };

      Uncertainty.prototype.renderString = function() {
        return "σ(" + this.label + ")";
      };

      Uncertainty.prototype.renderMathML = function() {
        var dummy, x;
        x = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        dummy = new Variable(this.label);
        return "&sigma;[" + (dummy.renderMathML.apply(dummy, x)) + "]";
      };

      return Uncertainty;

    })(DrawingNode);
    return {
      DrawingNode: DrawingNode,
      Add: Add,
      Mul: Mul,
      Pow: Pow,
      Bracket: Bracket,
      Number: Number,
      Variable: Variable,
      Fraction: Fraction,
      Surd: Surd,
      Uncertainty: Uncertainty
    };
  });

}).call(this);

// Generated by CoffeeScript 1.6.3
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    __slice = [].slice;

  define('terminals',["parse", "generateInfo", "nodes", "prettyRender"], function(parse, generateInfo, nodes, prettyRender) {
    var Constant, SymbolicConstant, Terminal, Uncertainty, Variable;
    Terminal = (function(_super) {
      __extends(Terminal, _super);

      function Terminal(label) {
        this.label = label;
      }

      Terminal.prototype.evaluate = function() {};

      Terminal.prototype.copy = function() {
        return new Terminal(this.label);
      };

      return Terminal;

    })(nodes.BasicNode);
    Constant = (function(_super) {
      __extends(Constant, _super);

      function Constant(value, denominator) {
        var _ref, _ref1;
        this.denominator = denominator != null ? denominator : null;
        this.cmp = -6;
        if (this.denominator != null) {
          _ref = parse.constant(value), this.numerator = _ref[0], denominator = _ref[1];
          this.denominator *= denominator;
        } else {
          _ref1 = parse.constant(value), this.numerator = _ref1[0], this.denominator = _ref1[1];
        }
        if (this.denominator < 0) {
          this.denominator *= -1;
          this.numerator *= -1;
        }
        this.numerator = parseFloat(this.numerator.toPrecision(6));
      }

      Constant.prototype.evaluate = function() {
        return parseFloat((this.numerator / this.denominator).toPrecision(6));
      };

      Constant.prototype.copy = function() {
        return new Constant(this.numerator, this.denominator);
      };

      Constant.prototype.compareSameType = function(b) {
        if (this.evaluate() < b.evaluate()) {
          return -1;
        } else if (this.evaluate() === b.evaluate()) {
          return 0;
        } else {
          return 1;
        }
      };

      Constant.prototype.multiply = function(b) {
        return new Constant(this.numerator * b.numerator, this.denominator * b.denominator);
      };

      Constant.prototype.add = function(b) {
        return new Constant(b.denominator * this.numerator + this.denominator * b.numerator, this.denominator * b.denominator);
      };

      Constant.prototype.equals = function(b) {
        if (!(b instanceof Constant)) {
          return false;
        }
        return this.evaluate() === b.evaluate();
      };

      Constant.prototype.replaceVariables = function(replacements) {
        return this.copy();
      };

      Constant.prototype.getAllVariables = function() {
        return [];
      };

      Constant.prototype.sub = function(substitutions, uncertaintySubstitutions) {
        return this.copy();
      };

      Constant.prototype.simplifyInPlace = function() {
        var a, b, gcd, _ref;
        a = this.numerator;
        b = this.denominator;
        while (b !== 0) {
          _ref = [b, Math.round(a % b * 10) / 10], a = _ref[0], b = _ref[1];
        }
        gcd = a;
        this.numerator /= gcd;
        this.numerator = Math.round(this.numerator * 10) / 10;
        this.denominator /= gcd;
        return this.denominator = Math.round(this.denominator * 10) / 10;
      };

      Constant.prototype.simplify = function() {
        var constant;
        constant = this.copy();
        return constant;
      };

      Constant.prototype.expand = function() {
        return this.copy();
      };

      Constant.prototype.expandAndSimplify = function() {
        return this.simplify();
      };

      Constant.prototype.substituteExpression = function(sourceExpression, variable, equivalencies) {
        return [this.copy()];
      };

      Constant.prototype.getUncertainty = function() {
        return new Constant(0);
      };

      Constant.prototype.getVariableUnits = function() {
        return null;
      };

      Constant.prototype.setVariableUnits = function(variable, equivalencies, units) {
        return null;
      };

      Constant.prototype.toMathML2 = function(equationID, expression, equality, topLevel) {
        var closingHTML, html, mathClass, mathID, _ref;
        if (expression == null) {
          expression = false;
        }
        if (equality == null) {
          equality = "0";
        }
        if (topLevel == null) {
          topLevel = false;
        }
        if (topLevel) {
          _ref = generateInfo.getMathMLInfo(equationID, expression, equality), mathClass = _ref[0], mathID = _ref[1], html = _ref[2];
          closingHTML = "</math></div>";
        } else {
          html = "";
          closingHTML = "";
        }
        if (this.denominator === 1) {
          return html + ("<mn class=\"constant\">" + this.numerator + "</mn>") + closingHTML;
        }
        return html + ("<mfrac class=\"constant\"><mrow><mn>" + this.numerator + "</mn></mrow><mrow><mn>" + this.denominator + "</mn></mrow></mfrac>") + closingHTML;
      };

      Constant.prototype.toHTML = function(equationID, expression, equality, topLevel) {
        var closingHTML, html, mathClass, mathID, _ref;
        if (expression == null) {
          expression = false;
        }
        if (equality == null) {
          equality = "0";
        }
        if (topLevel == null) {
          topLevel = false;
        }
        _ref = generateInfo.getHTMLInfo(equationID, expression, equality), mathClass = _ref[0], mathID = _ref[1], html = _ref[2];
        if (!topLevel) {
          html = "";
          closingHTML = "";
        } else {
          closingHTML = "</div>";
        }
        if (this.denominator === 1) {
          return html + ("" + this.numerator) + closingHTML;
        }
        return html + ("(" + this.numerator + "/" + this.denominator + ")") + closingHTML;
      };

      Constant.prototype.toDrawingNode = function() {
        var FractionNode, NumberNode;
        NumberNode = prettyRender.Number;
        FractionNode = prettyRender.Fraction;
        if (this.denominator === 1) {
          return new NumberNode(this.numerator);
        }
        return new FractionNode(new NumberNode(this.numerator), new NumberNode(this.denominator));
      };

      Constant.prototype.toLisp = function() {
        if (this.denominator === 1) {
          return "" + this.numerator;
        }
        return "" + this.numerator + "/" + this.denominator;
      };

      Constant.prototype.differentiate = function(variable) {
        return new Constant(0);
      };

      return Constant;

    })(Terminal);
    SymbolicConstant = (function(_super) {
      __extends(SymbolicConstant, _super);

      function SymbolicConstant(label, value, units) {
        this.label = label;
        this.value = value != null ? value : null;
        this.units = units != null ? units : null;
        this.cmp = -5;
      }

      SymbolicConstant.prototype.copy = function() {
        return new SymbolicConstant(this.label, this.value, this.units);
      };

      SymbolicConstant.prototype.compareSameType = function(b) {
        if (this.label < b.label) {
          return -1;
        } else if (this.label === b.label) {
          return 0;
        } else {
          return 1;
        }
      };

      SymbolicConstant.prototype.evaluate = function() {
        return this.value;
      };

      SymbolicConstant.prototype.equals = function(b) {
        if (!(b instanceof SymbolicConstant)) {
          return false;
        }
        return this.label === b.label && this.value === b.value;
      };

      SymbolicConstant.prototype.replaceVariables = function(replacements) {
        return this.copy();
      };

      SymbolicConstant.prototype.getAllVariables = function() {
        return [];
      };

      SymbolicConstant.prototype.sub = function(substitutions, uncertaintySubstitutions) {
        return this.copy();
      };

      SymbolicConstant.prototype.simplify = function() {
        return this.copy();
      };

      SymbolicConstant.prototype.expand = function() {
        return this.copy();
      };

      SymbolicConstant.prototype.expandAndSimplify = function() {
        return this.copy();
      };

      SymbolicConstant.prototype.substituteExpression = function(sourceExpression, variable, equivalencies) {
        return [this.copy()];
      };

      SymbolicConstant.prototype.getUncertainty = function() {
        return new Constant(0);
      };

      SymbolicConstant.prototype.getVariableUnits = function() {
        return null;
      };

      SymbolicConstant.prototype.setVariableUnits = function(variable, equivalencies, units) {
        return null;
      };

      SymbolicConstant.prototype.toHTML = function(equationID, expression, equality, topLevel) {
        var closingHTML, html, mathClass, mathID, _ref;
        if (expression == null) {
          expression = false;
        }
        if (equality == null) {
          equality = "0";
        }
        if (topLevel == null) {
          topLevel = false;
        }
        if (topLevel) {
          _ref = generateInfo.getHTMLInfo(equationID, expression, equality), mathClass = _ref[0], mathID = _ref[1], html = _ref[2];
          closingHTML = "</div>";
        } else {
          html = "";
          closingHTML = "";
        }
        return html + "<span class=\"constant symbolic-constant\">" + this.toString() + "</span>" + closingHTML;
      };

      SymbolicConstant.prototype.toMathML2 = function(equationID, expression, equality, topLevel) {
        var closingHTML, html, mathClass, mathID, _ref;
        if (expression == null) {
          expression = false;
        }
        if (equality == null) {
          equality = "0";
        }
        if (topLevel == null) {
          topLevel = false;
        }
        if (topLevel) {
          _ref = generateInfo.getMathMLInfo(equationID, expression, equality), mathClass = _ref[0], mathID = _ref[1], html = _ref[2];
          closingHTML = "</math></div>";
        } else {
          html = "";
          closingHTML = "";
        }
        return "" + html + "<mn class=\"constant symbolic-constant\">" + this.label + "</mn>" + closingHTML;
      };

      SymbolicConstant.prototype.toDrawingNode = function() {
        var VariableNode;
        VariableNode = prettyRender.Variable;
        return new VariableNode(this.label, "symbolic-constant");
      };

      SymbolicConstant.prototype.differentiate = function(variable) {
        return new Constant(0);
      };

      return SymbolicConstant;

    })(Terminal);
    Variable = (function(_super) {
      __extends(Variable, _super);

      function Variable(label, units) {
        this.label = label;
        this.units = units != null ? units : null;
        this.cmp = -4;
      }

      Variable.prototype.copy = function() {
        return new Variable(this.label, this.units);
      };

      Variable.prototype.compareSameType = function(b) {
        if (this.label < b.label) {
          return -1;
        } else if (this.label === b.label) {
          return 0;
        } else {
          return 1;
        }
      };

      Variable.prototype.equals = function(b, equivalencies) {
        var _ref;
        if (equivalencies == null) {
          equivalencies = null;
        }
        if (!(b instanceof Variable)) {
          return false;
        }
        if (equivalencies != null) {
          return _ref = this.label, __indexOf.call(equivalencies.get(b.label), _ref) >= 0;
        } else {
          return b.label === this.label;
        }
      };

      Variable.prototype.replaceVariables = function(replacements) {
        var copy;
        copy = this.copy();
        if (this.label in replacements) {
          copy.label = replacements[this.label];
        }
        return copy;
      };

      Variable.prototype.getAllVariables = function() {
        return [this.label];
      };

      Variable.prototype.sub = function(substitutions, uncertaintySubstitutions) {
        var substitute;
        if (this.label in substitutions) {
          substitute = substitutions[this.label];
          if (substitute.copy != null) {
            return substitute.copy();
          } else {
            return new Constant(substitute);
          }
        } else {
          return this.copy();
        }
      };

      Variable.prototype.substituteExpression = function(sourceExpression, variable, equivalencies, eliminate) {
        var e, sourceExpressions, variableEquivalencies, _ref;
        if (equivalencies == null) {
          equivalencies = null;
        }
        if (eliminate == null) {
          eliminate = false;
        }
        if (equivalencies == null) {
          equivalencies = {
            get: function(variable) {
              return [variable];
            }
          };
        }
        variableEquivalencies = equivalencies.get(variable);
        if (eliminate) {
          sourceExpressions = sourceExpression.solve(variable);
        } else {
          sourceExpressions = [sourceExpression];
        }
        if (this.label === variable || (_ref = this.label, __indexOf.call(variableEquivalencies, _ref) >= 0)) {
          return (function() {
            var _i, _len, _results;
            _results = [];
            for (_i = 0, _len = sourceExpressions.length; _i < _len; _i++) {
              e = sourceExpressions[_i];
              _results.push(e.copy());
            }
            return _results;
          })();
        } else {
          return [this.copy()];
        }
      };

      Variable.prototype.getUncertainty = function() {
        return new Uncertainty(this.label);
      };

      Variable.prototype.getVariableUnits = function(variable, equivalencies) {
        var _ref;
        if (equivalencies != null) {
          if (_ref = this.label, __indexOf.call(equivalencies.get(variable), _ref) >= 0) {
            return this.units;
          }
        } else if (this.label === variable) {
          return this.units;
        }
        return null;
      };

      Variable.prototype.setVariableUnits = function(variable, equivalencies, units) {
        var _ref;
        if (equivalencies != null) {
          if (_ref = this.label, __indexOf.call(equivalencies.get(variable), _ref) >= 0) {
            return this.units = units;
          }
        } else if (this.label === variable) {
          return this.units = units;
        }
      };

      Variable.prototype.simplify = function() {
        return this.copy();
      };

      Variable.prototype.expand = function() {
        return this.copy();
      };

      Variable.prototype.expandAndSimplify = function() {
        return this.copy();
      };

      Variable.prototype.toMathML2 = function(equationID, expression, equality, topLevel) {
        var atCount, atEnd, atStart, closingHTML, html, i, label, labelArray, labelID, mathClass, mathID, _ref;
        if (expression == null) {
          expression = false;
        }
        if (equality == null) {
          equality = "0";
        }
        if (topLevel == null) {
          topLevel = false;
        }
        if (topLevel) {
          _ref = generateInfo.getMathMLInfo(equationID, expression, equality), mathClass = _ref[0], mathID = _ref[1], html = _ref[2];
          closingHTML = "</math></div>";
        } else {
          html = "";
          closingHTML = "";
        }
        labelArray = this.label.split("-");
        label = labelArray[0];
        labelID = labelArray[1] != null ? 'id="variable-' + (expression ? "expression" : "equation") + ("-" + equationID + "-") + this.label + '"' : "";
        atCount = 0;
        while (label[0] === "@") {
          atCount += 1;
          label = label.slice(1);
        }
        atStart = "<mover accent=\"true\">";
        atEnd = "<mrow><mo>" + ((function() {
          var _i, _results;
          _results = [];
          for (i = _i = 0; 0 <= atCount ? _i < atCount : _i > atCount; i = 0 <= atCount ? ++_i : --_i) {
            _results.push(".");
          }
          return _results;
        })()).join("") + "</mo></mrow></mover>";
        if (label.length > 1) {
          return html + atStart + '<msub class="variable"' + labelID + '><mi>' + label[0] + '</mi><mi>' + label.slice(1) + "</mi></msub>" + atEnd + closingHTML;
        } else {
          return html + atStart + '<mi class="variable"' + labelID + '>' + label + '</mi>' + atEnd + closingHTML;
        }
      };

      Variable.prototype.toHTML = function(equationID, expression, equality, topLevel) {
        var closingHTML, html, label, labelArray, labelID, mathClass, mathID, _ref;
        if (expression == null) {
          expression = false;
        }
        if (equality == null) {
          equality = "0";
        }
        if (topLevel == null) {
          topLevel = false;
        }
        if (topLevel) {
          _ref = generateInfo.getHTMLInfo(equationID, expression, equality), mathClass = _ref[0], mathID = _ref[1], html = _ref[2];
          closingHTML = "</div>";
        } else {
          html = "";
          closingHTML = "";
        }
        labelArray = this.label.split("-");
        label = labelArray[0];
        labelID = labelArray[1] != null ? 'id="variable-' + (expression ? "expression" : "equation") + ("-" + equationID + "-") + this.label + '"' : "";
        return html + '<span class="variable"' + labelID + '>' + label + '</span>' + closingHTML;
      };

      Variable.prototype.toDrawingNode = function() {
        var VariableNode;
        VariableNode = prettyRender.Variable;
        return new VariableNode(this.label);
      };

      Variable.prototype.differentiate = function(variable) {
        if (variable === this.label) {
          return new Constant(1);
        }
        return new Constant(0);
      };

      return Variable;

    })(Terminal);
    Uncertainty = (function(_super) {
      __extends(Uncertainty, _super);

      function Uncertainty(label) {
        this.label = label;
        this.cmp = -4.5;
      }

      Uncertainty.prototype.copy = function() {
        return new Uncertainty(this.label);
      };

      Uncertainty.prototype.compareSameType = function(b) {
        if (this.label < b.label) {
          return -1;
        } else if (this.label === b.label) {
          return 0;
        } else {
          return 1;
        }
      };

      Uncertainty.prototype.equals = function(b, equivalencies) {
        var _ref;
        if (equivalencies == null) {
          equivalencies = null;
        }
        if (!(b instanceof Uncertainty)) {
          return false;
        }
        if (equivalencies != null) {
          return _ref = this.label, __indexOf.call(equivalencies.get(b.label), _ref) >= 0;
        } else {
          return b.label === this.label;
        }
      };

      Uncertainty.prototype.replaceVariables = function(replacements) {
        var copy;
        copy = this.copy();
        if (this.label in replacements) {
          copy.label = replacements[this.label];
        }
        return copy;
      };

      Uncertainty.prototype.getAllVariables = function() {
        return [this.label];
      };

      Uncertainty.prototype.sub = function(substitutions, uncertaintySubstitutions, equivalencies, assumeZero) {
        var substitute;
        if (equivalencies == null) {
          equivalencies = null;
        }
        if (assumeZero == null) {
          assumeZero = false;
        }
        if (this.label in uncertaintySubstitutions && (uncertaintySubstitutions[this.label] != null)) {
          substitute = uncertaintySubstitutions[this.label];
          if (substitute.copy != null) {
            return substitute.copy();
          } else {
            return new Constant(substitute);
          }
        } else {
          if (!assumeZero) {
            return this.copy();
          } else {
            return new Constant("0");
          }
        }
      };

      Uncertainty.prototype.substituteExpression = function(sourceExpression, variable, equivalencies, eliminate) {
        if (equivalencies == null) {
          equivalencies = null;
        }
        if (eliminate == null) {
          eliminate = false;
        }
        throw new Error("Can't sub uncertainties");
      };

      Uncertainty.prototype.getUncertainty = function() {
        throw new Error("Can't take uncertainty of an uncertainty");
      };

      Uncertainty.prototype.getVariableUnits = function(variable, equivalencies) {
        throw new Error("Can't do that with uncertainties");
      };

      Uncertainty.prototype.setVariableUnits = function(variable, equivalencies, units) {
        throw new Error("Can't do that with uncertainties");
      };

      Uncertainty.prototype.simplify = function() {
        return this.copy();
      };

      Uncertainty.prototype.expand = function() {
        return this.copy();
      };

      Uncertainty.prototype.expandAndSimplify = function() {
        return this.copy();
      };

      Uncertainty.prototype.toHTML = function() {
        var args, dummyVar;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        dummyVar = new Variable("σ" + this.label);
        return dummyVar.toHTML.apply(dummyVar, args);
      };

      Uncertainty.prototype.toMathML2 = function() {
        var dummyVar;
        dummyVar = new Variable("σ(" + label + ")");
        return dummyVar.toMathML2(arguments);
      };

      Uncertainty.prototype.toDrawingNode = function() {
        var UncertaintyNode;
        UncertaintyNode = prettyRender.Uncertainty;
        return new UncertaintyNode(this.label);
      };

      Uncertainty.prototype.differentiate = function(variable) {
        throw new Error("Can't differentiate uncertainties!");
      };

      return Uncertainty;

    })(Terminal);
    return {
      Terminal: Terminal,
      Variable: Variable,
      Constant: Constant,
      SymbolicConstant: SymbolicConstant,
      Uncertainty: Uncertainty
    };
  });

}).call(this);

// Generated by CoffeeScript 1.6.3
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define('AlgebraError',[],function() {
    var AlgebraError;
    return AlgebraError = (function(_super) {
      __extends(AlgebraError, _super);

      function AlgebraError(expr, variable, postscript) {
        if (postscript == null) {
          postscript = null;
        }
        AlgebraError.__super__.constructor.call(this, "Unsolvable: " + expr + " for " + variable + (postscript ? ";" + postscript : ""));
      }

      return AlgebraError;

    })(Error);
  });

}).call(this);

// Generated by CoffeeScript 1.6.3
(function() {
  var __slice = [].slice;

  define('parseArgs',["nodes", "parse", "terminals"], function(nodes, parse, terminals) {
    var parseArgs;
    return parseArgs = function() {
      var arg, args, outArgs, _i, _len;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      outArgs = [];
      for (_i = 0, _len = args.length; _i < _len; _i++) {
        arg = args[_i];
        if (typeof arg === "string" || arg instanceof String) {
          outArgs.push(parse.stringToTerminal(arg));
        } else if (typeof arg === "number" || arg instanceof Number) {
          outArgs.push(new terminals.Constant(arg));
        } else if (arg instanceof terminals.Terminal || arg instanceof nodes.BasicNode || (arg.isTerminal != null)) {
          outArgs.push(arg);
        } else {
          throw new Error("Invalid argument " + arg + ", (" + (typeof arg) + "), (" + (arg.toString()) + ")");
        }
      }
      return outArgs;
    };
  });

}).call(this);

// Generated by CoffeeScript 1.6.3
(function() {
  define('compare',[],function() {
    var compare;
    return compare = function(a, b) {
      /*
      		Order:
      		-6: Constants, by value
      		-5: Symbolic constants, by label
      		-4: Variables, by label
      		-3: Power nodes, by base
      		-2: Multiplication nodes, by first child
      		-1: Addition nodes, by first child
      */

      if ((a.cmp != null) && (b.cmp != null)) {
        if (a.cmp === b.cmp) {
          return a.compareSameType(b);
        } else {
          return (a.cmp - b.cmp) / Math.abs(a.cmp - b.cmp);
        }
      } else {
        return 0;
      }
    };
  });

}).call(this);

// Generated by CoffeeScript 1.6.3
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __slice = [].slice,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  define('operators/Add',["nodes", "terminals", "generateInfo", "AlgebraError", "parseArgs", "require", "compare", "prettyRender"], function(nodes, terminals, generateInfo, AlgebraError, parseArgs, require, compare, prettyRender) {
    var Add, combinations;
    combinations = function(list) {
      var i, ii, results, _i, _j, _len, _len1, _ref, _ref1;
      if (list.length === 1) {
        return (function() {
          var _i, _len, _ref, _results;
          _ref = list[0];
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            i = _ref[_i];
            _results.push(i);
          }
          return _results;
        })();
      } else {
        results = [];
        _ref = list[0];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          i = _ref[_i];
          _ref1 = combinations(list.slice(1));
          for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
            ii = _ref1[_j];
            results.push([i].concat(ii));
          }
        }
        return results;
      }
    };
    return Add = (function(_super) {
      __extends(Add, _super);

      function Add() {
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        if (args.length < 1) {
          throw new Error("Add nodes must have at least one child.");
        }
        this.cmp = -1;
        args = parseArgs.apply(null, args);
        Add.__super__.constructor.call(this, "+", args);
      }

      Add.prototype.copy = function() {
        var args, i;
        args = (function() {
          var _i, _len, _ref, _results;
          _ref = this.children;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            i = _ref[_i];
            _results.push(i.copy != null ? i.copy() : i);
          }
          return _results;
        }).call(this);
        return (function(func, args, ctor) {
          ctor.prototype = func.prototype;
          var child = new ctor, result = func.apply(child, args);
          return Object(result) === result ? result : child;
        })(Add, args, function(){});
      };

      Add.prototype.compareSameType = function(b) {
        var c, child, index, lengthComparison, _i, _len, _ref;
        if (this.children.length === b.children.length) {
          lengthComparison = 0;
        } else if (this.children.length < b.children.length) {
          lengthComparison = -1;
        } else {
          lengthComparison = 1;
        }
        _ref = this.children;
        for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
          child = _ref[index];
          if (b.children[index] == null) {
            return 1;
          }
          c = compare(this.children[index], b.children[index]);
          if (c !== 0) {
            return c;
          }
        }
        return lengthComparison;
      };

      Add.prototype.getVariableUnits = function(variable, equivalencies) {
        var child, childVariableUnits, variableEquivalencies, _i, _len, _ref, _ref1;
        variableEquivalencies = equivalencies != null ? equivalencies.get(variable) : [variable];
        _ref = this.children;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          child = _ref[_i];
          if (child instanceof terminals.Variable && (_ref1 = child.label, __indexOf.call(variableEquivalencies, _ref1) >= 0)) {
            return child.units;
          } else {
            childVariableUnits = child.getVariableUnits(variable, equivalencies);
            if (childVariableUnits != null) {
              return childVariableUnits;
            }
          }
        }
        return null;
      };

      Add.prototype.setVariableUnits = function(variable, equivalencies, units) {
        var child, variableEquivalencies, _i, _len, _ref, _results;
        variableEquivalencies = equivalencies != null ? equivalencies.get(variable) : {
          get: function(z) {
            return [z];
          }
        };
        _ref = this.children;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          child = _ref[_i];
          _results.push(child.setVariableUnits(variable, equivalencies, units));
        }
        return _results;
      };

      Add.prototype.expand = function() {
        var add, c, child, children, _i, _j, _len, _len1, _ref, _ref1;
        children = [];
        _ref = this.children;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          child = _ref[_i];
          if (child.expand != null) {
            child = child.expand();
          } else if (child.copy != null) {
            child = child.copy();
          }
          if (child instanceof Add) {
            _ref1 = child.children;
            for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
              c = _ref1[_j];
              children.push(c);
            }
          } else {
            children.push(child);
          }
        }
        add = (function(func, args, ctor) {
          ctor.prototype = func.prototype;
          var child = new ctor, result = func.apply(child, args);
          return Object(result) === result ? result : child;
        })(Add, children, function(){});
        add.sort();
        return add;
      };

      Add.prototype.sort = function() {
        var child, _i, _len, _ref;
        _ref = this.children;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          child = _ref[_i];
          if (typeof child.sort === "function") {
            child.sort();
          }
        }
        return this.children.sort(compare);
      };

      Add.prototype.equals = function(b, equivalencies) {
        var child, index, _i, _len, _ref;
        if (!(b instanceof Add)) {
          return false;
        }
        if (b.children.length !== this.children.length) {
          return false;
        }
        _ref = this.children;
        for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
          child = _ref[index];
          if (child.equals != null) {
            if (!child.equals(b.children[index], equivalencies)) {
              return false;
            }
          } else {
            if (child !== b.children[index]) {
              return false;
            }
          }
        }
        return true;
      };

      Add.prototype.simplify = function(equivalencies) {
        var Mul, c, child, constantterm, constanttermmul, found, i, index, liketerm, liketerms, newAdd, newMul, term, terms, variabletermmul, _base, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _len5, _m, _n, _ref, _ref1, _ref2;
        Mul = require("operators/Mul");
        if (equivalencies == null) {
          equivalencies = {
            get: function(variable) {
              return [variable];
            }
          };
        }
        terms = [];
        _ref = this.children;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          child = _ref[_i];
          if (child.simplify != null) {
            child = child.simplify(equivalencies);
          } else if (child.copy != null) {
            child = child.copy();
          }
          terms.push(child);
        }
        liketerms = [];
        constantterm = null;
        i = 0;
        while (i < terms.length) {
          term = terms[i];
          if (term instanceof Add) {
            terms.splice(i, 1)[0];
            _ref1 = term.children;
            for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
              c = _ref1[_j];
              terms.push(c);
            }
            i -= 1;
          } else if (term instanceof terminals.Constant) {
            if (constantterm != null) {
              constantterm = constantterm.add(term);
            } else {
              constantterm = term.copy();
            }
          } else if (term instanceof Mul) {
            constanttermmul = null;
            variabletermmul = null;
            _ref2 = term.children;
            for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
              child = _ref2[_k];
              if (child instanceof terminals.Constant) {
                if (constanttermmul != null) {
                  constanttermmul = constanttermmul.multiply(child);
                } else {
                  constanttermmul = child.copy();
                }
              } else {
                if (variabletermmul != null) {
                  variabletermmul.children.push(child);
                } else {
                  variabletermmul = new Mul(child);
                }
              }
            }
            if (variabletermmul.children.length === 1) {
              variabletermmul = variabletermmul.children[0];
            }
            if ((constanttermmul != null) && (variabletermmul == null)) {
              if (constantterm != null) {
                constantterm = constantterm.add(constanttermmul);
              } else {
                constantterm = constanttermmul.copy();
              }
            } else {
              if (constanttermmul == null) {
                constanttermmul = new terminals.Constant("1");
              }
              found = false;
              for (index = _l = 0, _len3 = liketerms.length; _l < _len3; index = ++_l) {
                liketerm = liketerms[index];
                if (liketerm[0].equals != null) {
                  if (liketerm[0].equals(variabletermmul, equivalencies)) {
                    liketerms[index][1] = new Add(liketerm[1], constanttermmul);
                    liketerms[index][1] = liketerms[index][1].simplify(equivalencies);
                    found = true;
                  }
                } else if (liketerm[0] === variabletermmul) {
                  liketerms[index][1] = new Add(liketerm[1], constanttermmul);
                  liketerms[index][1] = liketerms[index][1].simplify(equivalencies);
                  found = true;
                }
              }
              if (!found) {
                liketerms.push([variabletermmul, constanttermmul]);
              }
            }
          } else {
            found = false;
            for (index = _m = 0, _len4 = liketerms.length; _m < _len4; index = ++_m) {
              liketerm = liketerms[index];
              if (liketerm[0].equals != null) {
                if (liketerm[0].equals(term, equivalencies)) {
                  liketerms[index][1] = new Add(liketerm[1], new terminals.Constant("1"));
                  liketerms[index][1] = liketerms[index][1].simplify(equivalencies);
                  found = true;
                }
              } else if (liketerm[0] === term) {
                liketerms[index][1] = new Add(liketerm[1], new terminals.Constant("1"));
                liketerms[index][1] = liketerms[index][1].simplify(equivalencies);
                found = true;
              }
            }
            if (!found) {
              liketerms.push([term, new terminals.Constant("1")]);
            }
          }
          i += 1;
        }
        newAdd = null;
        for (_n = 0, _len5 = liketerms.length; _n < _len5; _n++) {
          liketerm = liketerms[_n];
          if ((liketerm[0].children != null) && liketerm[0].children.length === 1) {
            liketerm[0] = liketerm[0].children[0];
          }
          if ((typeof (_base = liketerm[1]).evaluate === "function" ? _base.evaluate() : void 0) !== 1) {
            newMul = new Mul(liketerm[0], liketerm[1]);
            newMul = newMul.simplify(equivalencies);
          } else {
            newMul = liketerm[0];
          }
          if (newAdd != null) {
            newAdd.children.push(newMul);
          } else {
            newAdd = new Add(newMul);
          }
        }
        if (newAdd == null) {
          return constantterm;
        }
        if ((constantterm != null) && constantterm.evaluate() !== 0) {
          newAdd.children.push(constantterm);
        }
        newAdd.sort();
        if (newAdd.children.length !== 1) {
          return newAdd;
        }
        return newAdd.children[0];
      };

      Add.prototype.expandAndSimplify = function(equivalencies) {
        var expr;
        expr = this.expand();
        if (expr.simplify != null) {
          return expr.simplify(equivalencies);
        }
        return expr;
      };

      Add.prototype.solve = function(variable, equivalencies) {
        var Mul, Pow, a, a1, a2, added, answer, b, c, d, equiv, expr, factorised, factorisedEquatable, factorisedSquares, factorisedSquaresEquatable, factorisedTerm, inv, invSquare, inversed, inversedEquatable, inversedSquares, inversedSquaresEquatable, negatedTerms, negatedTermsEquatable, newAdd, newMul, newPow, nonNegatedTermsEquatable, power, quadratic, rd, subterm, subterms, term, termsContainingVariable, termsNotContainingVariable, units, v1, v2, variableUnits, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _len5, _m, _n, _ref, _ref1, _ref10, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9;
        if (equivalencies == null) {
          equivalencies = null;
        }
        Mul = require("operators/Mul");
        Pow = require("operators/Pow");
        expr = this.expandAndSimplify(equivalencies);
        if (equivalencies == null) {
          equivalencies = {
            get: function(variable) {
              return [variable];
            }
          };
        }
        termsContainingVariable = [];
        termsNotContainingVariable = [];
        variableUnits = null;
        for (_i = 0, _len = equivalencies.length; _i < _len; _i++) {
          equiv = equivalencies[_i];
          units = this.getVariableUnits(equiv);
          if (units != null) {
            variableUnits = units;
            break;
          }
        }
        if (expr instanceof terminals.Terminal) {
          if (expr instanceof terminals.Variable && (expr.label === variable || (_ref = expr.label, __indexOf.call(equivalencies.get(variable), _ref) >= 0))) {
            return [new terminals.Constant("0")];
          } else {
            throw new AlgebraError(expr.toString(), variable);
          }
        }
        if (!(expr instanceof Add)) {
          return expr.solve(variable, equivalencies);
        }
        _ref1 = expr.children;
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          term = _ref1[_j];
          if (term.copy != null) {
            term = term.copy();
          }
          if (term instanceof Pow) {
            if (term.children.left instanceof terminals.Variable && (term.children.left.label === variable || (_ref2 = term.children.left.label, __indexOf.call(equivalencies.get(variable), _ref2) >= 0))) {
              termsContainingVariable.push(term);
            } else {
              termsNotContainingVariable.push(term);
            }
          } else if (term instanceof Mul) {
            added = false;
            _ref3 = term.children;
            for (_k = 0, _len2 = _ref3.length; _k < _len2; _k++) {
              subterm = _ref3[_k];
              if (subterm instanceof terminals.Variable && (subterm.label === variable || (_ref4 = subterm.label, __indexOf.call(equivalencies.get(variable), _ref4) >= 0))) {
                termsContainingVariable.push(term);
                added = true;
                break;
              } else if (subterm instanceof Pow && subterm.children.left instanceof terminals.Variable && (subterm.children.left.label === variable || (_ref5 = subterm.children.left.label, __indexOf.call(equivalencies.get(variable), _ref5) >= 0))) {
                termsContainingVariable.push(term);
                added = true;
                break;
              }
            }
            if (!added) {
              termsNotContainingVariable.push(term);
            }
          } else if (term instanceof terminals.Variable && (term.label === variable || (_ref6 = term.label, __indexOf.call(equivalencies.get(variable), _ref6) >= 0))) {
            termsContainingVariable.push(term);
          } else {
            termsNotContainingVariable.push(term);
          }
        }
        if (termsContainingVariable.length === 0) {
          throw new AlgebraError(expr.toString(), variable);
        }
        factorised = [];
        factorisedSquares = [];
        inversed = [];
        inversedSquares = [];
        for (_l = 0, _len3 = termsContainingVariable.length; _l < _len3; _l++) {
          term = termsContainingVariable[_l];
          if (term instanceof terminals.Variable) {
            factorised.push(new terminals.Constant("1"));
          } else if (term instanceof Pow) {
            if (!(term.children.right instanceof terminals.Constant)) {
              throw new AlgebraError(expr.toString(), variable);
            }
            power = term.children.right.evaluate();
            if (term.children.left instanceof terminals.Variable && (term.children.left.label === variable || (_ref7 = term.children.left.label, __indexOf.call(equivalencies.get(variable), _ref7) >= 0))) {
              if (power === 1) {
                factorised.push(new terminals.Constant("1"));
              } else if (power === 2) {
                factorisedSquares.push(new terminals.Constant("1"));
              } else if (power === -1) {
                inversed.push(new terminals.Constant("1"));
              } else if (power === -2) {
                inversedSquares.push(new terminals.Constant("1"));
              } else {
                throw new AlgebraError(expr.toString(), variable, " (not supported)");
              }
            } else {
              throw new AlgebraError(expr.toString(), variable, " (this shouldn't happen)");
            }
          } else if (term instanceof Mul) {
            subterms = [];
            quadratic = false;
            inv = false;
            invSquare = false;
            _ref8 = term.children;
            for (_m = 0, _len4 = _ref8.length; _m < _len4; _m++) {
              subterm = _ref8[_m];
              if (subterm instanceof terminals.Variable && (subterm.label === variable || (_ref9 = subterm.label, __indexOf.call(equivalencies.get(variable), _ref9) >= 0))) {

              } else if (subterm instanceof Pow) {
                if (!(subterm.children.right instanceof terminals.Constant)) {
                  throw new AlgebraError(expr.toString(), variable);
                }
                power = subterm.children.right.evaluate();
                if (subterm.children.left instanceof terminals.Variable && (subterm.children.left.label === variable || (_ref10 = subterm.children.left.label, __indexOf.call(equivalencies.get(variable), _ref10) >= 0))) {
                  if (power === 1) {

                  } else if (power === 2) {
                    quadratic = true;
                  } else if (power === -1) {
                    inv = true;
                  } else if (power === -2) {
                    invSquare = true;
                  } else {
                    throw new AlgebraError(expr.toString(), variable, " (not supported)");
                  }
                } else {
                  subterms.push(subterm);
                }
              } else {
                subterms.push(subterm);
              }
            }
            factorisedTerm = subterms.length > 0 ? (function(func, args, ctor) {
              ctor.prototype = func.prototype;
              var child = new ctor, result = func.apply(child, args);
              return Object(result) === result ? result : child;
            })(Mul, subterms, function(){}) : new terminals.Constant("1");
            if (quadratic) {
              factorisedSquares.push(factorisedTerm);
            } else if (inv) {
              inversed.push(factorisedTerm);
            } else if (invSquare) {
              inversedSquares.push(factorisedTerm);
            } else {
              factorised.push(factorisedTerm);
            }
          }
        }
        negatedTerms = [];
        for (_n = 0, _len5 = termsNotContainingVariable.length; _n < _len5; _n++) {
          term = termsNotContainingVariable[_n];
          newMul = new Mul("-1", (term.copy != null ? term.copy() : term));
          newMul = newMul.simplify(equivalencies);
          negatedTerms.push(newMul);
        }
        if (negatedTerms.length !== 0) {
          negatedTermsEquatable = (function(func, args, ctor) {
            ctor.prototype = func.prototype;
            var child = new ctor, result = func.apply(child, args);
            return Object(result) === result ? result : child;
          })(Add, negatedTerms, function(){});
        }
        if (termsNotContainingVariable.length !== 0) {
          nonNegatedTermsEquatable = (function(func, args, ctor) {
            ctor.prototype = func.prototype;
            var child = new ctor, result = func.apply(child, args);
            return Object(result) === result ? result : child;
          })(Add, termsNotContainingVariable, function(){});
        }
        if (factorised.length !== 0) {
          factorisedEquatable = (function(func, args, ctor) {
            ctor.prototype = func.prototype;
            var child = new ctor, result = func.apply(child, args);
            return Object(result) === result ? result : child;
          })(Add, factorised, function(){});
        }
        if (factorisedSquares.length !== 0) {
          factorisedSquaresEquatable = (function(func, args, ctor) {
            ctor.prototype = func.prototype;
            var child = new ctor, result = func.apply(child, args);
            return Object(result) === result ? result : child;
          })(Add, factorisedSquares, function(){});
        }
        if (inversed.length !== 0) {
          inversedEquatable = (function(func, args, ctor) {
            ctor.prototype = func.prototype;
            var child = new ctor, result = func.apply(child, args);
            return Object(result) === result ? result : child;
          })(Add, inversed, function(){});
        }
        if (inversedSquares.length !== 0) {
          inversedSquaresEquatable = (function(func, args, ctor) {
            ctor.prototype = func.prototype;
            var child = new ctor, result = func.apply(child, args);
            return Object(result) === result ? result : child;
          })(Add, inversedSquares, function(){});
        }
        if (negatedTerms.length === 0) {
          negatedTermsEquatable = new terminals.Constant("0");
        }
        if (factorisedSquares.length === 0) {
          if (factorised.length === 0) {
            if (inversed.length === 0) {
              if (inversedSquares.length === 0) {
                throw new AlgebraError(expr.toString(), variable);
              } else {
                answer = new Mul(new Pow(inversedSquaresEquatable, "1/2"), new Pow(negatedTermsEquatable, "-1/2"));
                a1 = new Mul(-1, answer.copy());
                a1 = a1.expandAndSimplify(equivalencies);
                a2 = answer.expandAndSimplify(equivalencies);
                if (typeof a1.equals === "function" ? a1.equals(a2) : void 0) {
                  return [a1];
                } else {
                  return [a1, a2];
                }
              }
            } else {
              if (inversedSquares.length === 0) {
                answer = new Mul(inversedEquatable, new Pow(negatedTermsEquatable, "-1"));
                return [answer.expandAndSimplify(equivalencies)];
              } else {
                newAdd = new Add(new Mul(nonNegatedTermsEquatable, new Pow(new terminals.Variable(variable, variableUnits), 2)), new Mul(inversedEquatable, new terminals.Variable(variable, variableUnits)), inversedSquaresEquatable);
                return newAdd.solve(variable, equivalencies);
              }
            }
          } else if (inversed.length === 0) {
            if (inversedSquares.length === 0) {
              answer = new Mul(negatedTermsEquatable, new Pow(factorisedEquatable, "-1"));
              return [answer.expandAndSimplify(equivalencies)];
            } else {
              throw new AlgebraError(expr.toString(), variable, " (not supported)");
            }
          } else {
            throw new AlgebraError(expr.toString(), variable, " (not supported)");
          }
        } else if (factorised.length === 0) {
          if (inversed.length === 0) {
            if (inversedSquares.length === 0) {
              answer = new Pow(new Mul(negatedTermsEquatable, new Pow(factorisedSquaresEquatable, "-1")), "1/2");
              a1 = new Mul("-1", answer.copy());
              a1 = a1.expandAndSimplify(equivalencies);
              a2 = answer.expandAndSimplify(equivalencies);
              if (typeof a1.equals === "function" ? a1.equals(a2) : void 0) {
                return [a1];
              } else {
                return [a1, a2];
              }
            } else {
              throw new AlgebraError(expr.toString(), variable, " (not supported)");
            }
          } else {
            throw new AlgebraError(expr.toString(), variable, " (not supported)");
          }
        } else {
          if (inversed.length > 0 || inversedSquares.length > 0) {
            throw new AlgebraError(expr.toString(), variable, " (not supported)");
          }
          if (nonNegatedTermsEquatable != null) {
            a = factorisedSquaresEquatable;
            b = factorisedEquatable;
            c = nonNegatedTermsEquatable;
            d = new Add(new Pow(b, "2"), new Mul("-4", a, c));
            rd = new Pow(d, "1/2");
            v1 = new Mul(new Add(new Mul("-1", b), rd), new Pow(new Mul("2", a), "-1"));
            v2 = new Mul("-1", new Add(b, rd), new Pow(new Mul("2", a), "-1"));
            v1 = v1.expandAndSimplify(equivalencies);
            v2 = v2.expandAndSimplify(equivalencies);
            if ((v1.equals != null) && v1.equals(v2)) {
              return [v1];
            }
            return [v1, v2];
          } else {
            newPow = new Pow(factorisedSquaresEquatable, "-1");
            newMul = new Mul("-1", factorisedEquatable, newPow);
            newMul = newMul.simplify(equivalencies);
            return [0, newMul];
          }
        }
      };

      Add.prototype.getAllVariables = function() {
        var child, childVariables, outVariables, variable, variables, _i, _j, _len, _len1, _ref;
        variables = {};
        _ref = this.children;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          child = _ref[_i];
          if (child instanceof terminals.Variable) {
            variables[child.label] = true;
          } else if (child.getAllVariables != null) {
            childVariables = child.getAllVariables();
            for (_j = 0, _len1 = childVariables.length; _j < _len1; _j++) {
              variable = childVariables[_j];
              variables[variable] = true;
            }
          }
        }
        outVariables = [];
        for (variable in variables) {
          outVariables.push(variable);
        }
        return outVariables;
      };

      Add.prototype.replaceVariables = function(replacements) {
        var child, children, index, _i, _len, _ref;
        children = [];
        _ref = this.children;
        for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
          child = _ref[index];
          if (child instanceof terminals.Variable && child.label in replacements) {
            children.push(child.copy());
            children[index].label = replacements[child.label];
          } else if (child.replaceVariables != null) {
            children.push(child.replaceVariables(replacements));
          } else {
            children.push(child.copy());
          }
        }
        return (function(func, args, ctor) {
          ctor.prototype = func.prototype;
          var child = new ctor, result = func.apply(child, args);
          return Object(result) === result ? result : child;
        })(Add, children, function(){});
      };

      Add.prototype.sub = function(substitutions, uncertaintySubstitutions, equivalencies, assumeZeroUncertainty) {
        var child, children, equiv, newAdd, subbed, variable, variableEquivalencies, _i, _j, _len, _len1, _ref;
        if (equivalencies == null) {
          equivalencies = null;
        }
        if (assumeZeroUncertainty == null) {
          assumeZeroUncertainty = false;
        }
        for (variable in substitutions) {
          if (!(substitutions[variable] instanceof terminals.Terminal || substitutions[variable] instanceof nodes.BasicNode)) {
            substitutions[variable] = new terminals.Constant(substitutions[variable]);
          }
        }
        if (equivalencies == null) {
          equivalencies = {
            get: function(z) {
              return [z];
            }
          };
        }
        children = [];
        _ref = this.children;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          child = _ref[_i];
          if (child instanceof terminals.Variable) {
            variableEquivalencies = equivalencies.get(child.label);
            subbed = false;
            for (_j = 0, _len1 = variableEquivalencies.length; _j < _len1; _j++) {
              equiv = variableEquivalencies[_j];
              if (equiv in substitutions) {
                children.push(substitutions[equiv].copy());
                subbed = true;
                break;
              }
            }
            if (!subbed) {
              children.push(child.copy());
            }
          } else if (child.sub != null) {
            children.push(child.sub(substitutions, uncertaintySubstitutions, equivalencies, assumeZeroUncertainty));
          } else {
            children.push(child.copy());
          }
        }
        newAdd = (function(func, args, ctor) {
          ctor.prototype = func.prototype;
          var child = new ctor, result = func.apply(child, args);
          return Object(result) === result ? result : child;
        })(Add, children, function(){});
        newAdd = newAdd.expandAndSimplify(equivalencies);
        return newAdd;
      };

      Add.prototype.substituteExpression = function(sourceExpression, variable, equivalencies, eliminate) {
        var child, children, childrenArray, childrenExpressions, expression, newAdd, results, sourceExpressions, variableEquivalencies, _i, _j, _k, _len, _len1, _len2, _ref, _ref1;
        if (equivalencies == null) {
          equivalencies = null;
        }
        if (eliminate == null) {
          eliminate = false;
        }
        if (eliminate) {
          sourceExpressions = sourceExpression.solve(variable, equivalencies);
        } else {
          sourceExpressions = [sourceExpression];
        }
        if (equivalencies == null) {
          equivalencies = {
            get: function(variable) {
              return [variable];
            }
          };
        }
        variableEquivalencies = equivalencies.get(variable);
        results = [];
        for (_i = 0, _len = sourceExpressions.length; _i < _len; _i++) {
          expression = sourceExpressions[_i];
          childrenExpressions = [];
          _ref = this.children;
          for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
            child = _ref[_j];
            if (child instanceof terminals.Variable && (child.label === variable || (_ref1 = child.label, __indexOf.call(variableEquivalencies, _ref1) >= 0))) {
              childrenExpressions.push([expression.copy()]);
            } else if (child.substituteExpression != null) {
              childrenExpressions.push(child.substituteExpression(expression, variable, equivalencies));
            } else {
              childrenExpressions.push([child.copy()]);
            }
          }
          childrenArray = combinations(childrenExpressions);
        }
        for (_k = 0, _len2 = childrenArray.length; _k < _len2; _k++) {
          children = childrenArray[_k];
          newAdd = (function(func, args, ctor) {
            ctor.prototype = func.prototype;
            var child = new ctor, result = func.apply(child, args);
            return Object(result) === result ? result : child;
          })(Add, children, function(){});
          results.push(newAdd.expandAndSimplify(equivalencies));
        }
        return results;
      };

      Add.prototype.toMathML2 = function(equationID, expression, equality, topLevel) {
        var closingHTML, html, mathClass, mathID, _ref;
        if (expression == null) {
          expression = false;
        }
        if (equality == null) {
          equality = "0";
        }
        if (topLevel == null) {
          topLevel = false;
        }
        _ref = generateInfo.getMathMLInfo(equationID, expression, equality), mathClass = _ref[0], mathID = _ref[1], html = _ref[2];
        if (!topLevel) {
          html = "";
          closingHTML = "";
        } else {
          closingHTML = "</math></div>";
        }
        return html + "<mrow>" + this.children.map(function(child) {
          return child.toMathML2(equationID, expression);
        }).join("<mo>+</mo>") + "</mrow>" + closingHTML;
      };

      Add.prototype.toHTML = function(equationID, expression, equality, topLevel) {
        var closingHTML, html, mathClass, mathID, _ref;
        if (expression == null) {
          expression = false;
        }
        if (equality == null) {
          equality = "0";
        }
        if (topLevel == null) {
          topLevel = false;
        }
        _ref = generateInfo.getHTMLInfo(equationID, expression, equality), mathClass = _ref[0], mathID = _ref[1], html = _ref[2];
        if (!topLevel) {
          html = "";
          closingHTML = "";
        } else {
          closingHTML = "</div>";
        }
        return html + this.children.map(function(child) {
          return child.toHTML();
        }).join("+") + closingHTML;
      };

      Add.prototype.toDrawingNode = function() {
        var AddNode;
        AddNode = prettyRender.Add;
        return AddNode.makeWithBrackets.apply(AddNode, this.children.map(function(term) {
          return term.toDrawingNode();
        }));
      };

      Add.prototype.differentiate = function(variable) {
        var derivative, newChildren;
        newChildren = this.children.map(function(x) {
          return x.differentiate(variable);
        });
        derivative = (function(func, args, ctor) {
          ctor.prototype = func.prototype;
          var child = new ctor, result = func.apply(child, args);
          return Object(result) === result ? result : child;
        })(Add, newChildren, function(){});
        return derivative.expandAndSimplify();
      };

      return Add;

    })(nodes.RoseNode);
  });

}).call(this);

// Generated by CoffeeScript 1.6.3
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __slice = [].slice,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  define('operators/Mul',["nodes", "terminals", "generateInfo", "AlgebraError", "parseArgs", "require", "compare", "prettyRender"], function(nodes, terminals, generateInfo, AlgebraError, parseArgs, require, compare, prettyRender) {
    var Mul, combinations;
    combinations = function(list) {
      var i, ii, results, _i, _j, _len, _len1, _ref, _ref1;
      if (list.length === 1) {
        return (function() {
          var _i, _len, _ref, _results;
          _ref = list[0];
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            i = _ref[_i];
            _results.push(i);
          }
          return _results;
        })();
      } else {
        results = [];
        _ref = list[0];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          i = _ref[_i];
          _ref1 = combinations(list.slice(1));
          for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
            ii = _ref1[_j];
            results.push([i].concat(ii));
          }
        }
        return results;
      }
    };
    return Mul = (function(_super) {
      __extends(Mul, _super);

      function Mul() {
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        if (args.length < 1) {
          throw new Error("Mul nodes must have at least one child.");
        }
        this.cmp = -2;
        args = parseArgs.apply(null, args);
        Mul.__super__.constructor.call(this, "*", args);
      }

      Mul.prototype.copy = function() {
        var args, i;
        args = (function() {
          var _i, _len, _ref, _results;
          _ref = this.children;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            i = _ref[_i];
            _results.push(i.copy != null ? i.copy() : i);
          }
          return _results;
        }).call(this);
        return (function(func, args, ctor) {
          ctor.prototype = func.prototype;
          var child = new ctor, result = func.apply(child, args);
          return Object(result) === result ? result : child;
        })(Mul, args, function(){});
      };

      Mul.prototype.simplifyConstants = function() {
        var child, constantterm, variableterm, _i, _len, _ref;
        constantterm = new terminals.Constant("1");
        variableterm = null;
        _ref = this.children;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          child = _ref[_i];
          if (child instanceof terminals.Constant) {
            constantterm = constantterm.multiply(child);
          } else {
            if (variableterm != null) {
              variableterm.children.push(child);
            } else {
              variableterm = new Mul(child);
            }
          }
        }
        if (variableterm == null) {
          return constantterm;
        }
        if (constantterm.evaluate() === 1) {
          return variableterm;
        }
        return new Mul(constantterm, variableterm);
      };

      Mul.prototype.compareSameType = function(b) {
        var c, child, index, lengthComparison, _i, _len, _ref;
        if (this.children.length === b.children.length) {
          lengthComparison = 0;
        } else if (this.children.length < b.children.length) {
          lengthComparison = -1;
        } else {
          lengthComparison = 1;
        }
        _ref = this.children;
        for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
          child = _ref[index];
          if (b.children[index] == null) {
            return 1;
          }
          c = compare(this.children[index], b.children[index]);
          if (c !== 0) {
            return c;
          }
        }
        return lengthComparison;
      };

      Mul.prototype.getVariableUnits = function(variable, equivalencies) {
        var child, childVariableUnits, variableEquivalencies, _i, _len, _ref, _ref1;
        variableEquivalencies = equivalencies != null ? equivalencies.get(variable) : [variable];
        _ref = this.children;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          child = _ref[_i];
          if (child instanceof terminals.Variable && (_ref1 = child.label, __indexOf.call(variableEquivalencies, _ref1) >= 0)) {
            return child.units;
          } else {
            childVariableUnits = child.getVariableUnits(variable, equivalencies);
            if (childVariableUnits != null) {
              return childVariableUnits;
            }
          }
        }
        return null;
      };

      Mul.prototype.setVariableUnits = function(variable, equivalencies, units) {
        var child, variableEquivalencies, _i, _len, _ref, _results;
        variableEquivalencies = equivalencies != null ? equivalencies.get(variable) : {
          get: function(z) {
            return [z];
          }
        };
        _ref = this.children;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          child = _ref[_i];
          _results.push(child.setVariableUnits(variable, equivalencies, units));
        }
        return _results;
      };

      Mul.expandMulAdd = function(mul, add) {
        var Add, c, child, newAdd, newMul, results, _i, _j, _len, _len1, _ref, _ref1;
        Add = require("operators/Add");
        results = [];
        _ref = add.children;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          child = _ref[_i];
          if (child.copy != null) {
            child = child.copy();
          }
          if (child instanceof Mul) {
            newMul = mul.copy();
            _ref1 = child.children;
            for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
              c = _ref1[_j];
              newMul.children.push(c);
            }
          } else if (child instanceof Add) {
            newMul = Mul.expandMulAdd(mul, child);
          } else {
            if (mul.children.length === 1) {
              newMul = mul.copy();
              newMul.children.push(child.copy());
            } else {
              newMul = new Mul(mul.copy(), child.copy());
            }
          }
          results.push(newMul);
        }
        newAdd = (function(func, args, ctor) {
          ctor.prototype = func.prototype;
          var child = new ctor, result = func.apply(child, args);
          return Object(result) === result ? result : child;
        })(Add, results, function(){});
        newAdd = newAdd.expand();
        return newAdd;
      };

      Mul.prototype.equals = function(b, equivalencies) {
        var child, index, _i, _len, _ref;
        if (!(b instanceof Mul)) {
          return false;
        }
        if (b.children.length !== this.children.length) {
          return false;
        }
        _ref = this.children;
        for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
          child = _ref[index];
          if (child.equals != null) {
            if (!child.equals(b.children[index], equivalencies)) {
              return false;
            }
          } else {
            if (child !== b.children[index]) {
              return false;
            }
          }
        }
        return true;
      };

      Mul.prototype.expand = function() {
        var Add, child, newMul, results, term, _base, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2;
        Add = require("operators/Add");
        term = [];
        _ref = this.children;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          child = _ref[_i];
          if (child.expand != null) {
            child = child.expand();
          } else if (child.copy != null) {
            child = child.copy();
          }
          term.push(child);
        }
        while (term.length > 1) {
          if (term[0] instanceof Mul) {
            if (term[1] instanceof Add) {
              term[0] = Mul.expandMulAdd(term[0], term.splice(1, 1)[0]);
            } else if (term[1] instanceof Mul) {
              _ref1 = term.splice(1, 1)[0].children;
              for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
                child = _ref1[_j];
                term[0].children.push(child);
              }
            } else {
              term[0].children.push(term.splice(1, 1)[0]);
            }
          } else if (term[0] instanceof Add) {
            if (term[1] instanceof Add) {
              results = [];
              _ref2 = term[0].children;
              for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
                child = _ref2[_k];
                newMul = new Mul(child, term[1]);
                newMul = newMul.expand();
                results.push(newMul);
              }
              term.splice(1, 1);
              term[0] = (function(func, args, ctor) {
                ctor.prototype = func.prototype;
                var child = new ctor, result = func.apply(child, args);
                return Object(result) === result ? result : child;
              })(Add, results, function(){});
              term[0] = term[0].expand();
            } else if (term[1] instanceof Mul) {
              term[0] = Mul.expandMulAdd(term.splice(1, 1)[0], term[0]);
            } else {
              term[0] = new Mul(term[0], term.splice(1, 1)[0]);
            }
          } else {
            term[0] = new Mul(term[0]);
          }
        }
        if (typeof (_base = term[0]).sort === "function") {
          _base.sort();
        }
        return term[0];
      };

      Mul.prototype.simplify = function(equivalencies) {
        var Add, Pow, base, c, child, constantterm, found, i, index, liketerm, liketerms, newMul, newPow, numerical, power, term, terms, _base, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _len5, _m, _n, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6;
        Add = require("operators/Add");
        Pow = require("operators/Pow");
        if (equivalencies == null) {
          equivalencies = {
            get: function(variable) {
              return [variable];
            }
          };
        }
        terms = [];
        _ref = this.children;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          child = _ref[_i];
          if (child.simplify != null) {
            child = child.simplify(equivalencies);
          } else if (child.copy != null) {
            child = child.copy();
          }
          terms.push(child);
        }
        liketerms = [];
        constantterm = null;
        i = 0;
        while (i < terms.length) {
          term = terms[i];
          if (term instanceof Mul) {
            child = terms.splice(i, 1)[0];
            _ref1 = child.children;
            for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
              c = _ref1[_j];
              terms.push(c);
            }
            i -= 1;
          } else if (term instanceof terminals.Constant) {
            if (constantterm != null) {
              constantterm = constantterm.multiply(term);
            } else {
              constantterm = term.copy();
            }
          } else if (term instanceof Pow) {
            base = term.children.left;
            power = term.children.right;
            found = false;
            for (index = _k = 0, _len2 = liketerms.length; _k < _len2; index = ++_k) {
              liketerm = liketerms[index];
              if (liketerm[0].equals != null) {
                if (liketerm[0].equals(base, equivalencies)) {
                  liketerms[index][1] = new Add(liketerm[1], power);
                  liketerms[index][1] = liketerms[index][1].simplify(equivalencies);
                  if (((_ref2 = liketerms[index][1].children) != null ? _ref2.length : void 0) === 1) {
                    liketerms[index][1] = liketerms[index][1].children[0];
                  }
                  found = true;
                }
              } else if (liketerm[0] === base) {
                liketerms[index][1] = new Add(liketerm[1], power);
                liketerms[index][1] = liketerms[index][1].simplify(equivalencies);
                if (((_ref3 = liketerms[index][1].children) != null ? _ref3.length : void 0) === 1) {
                  liketerms[index][1] = liketerms[index][1].children[0];
                }
                found = true;
              }
            }
            if (!found) {
              liketerms.push([base, power]);
            }
          } else {
            found = false;
            for (index = _l = 0, _len3 = liketerms.length; _l < _len3; index = ++_l) {
              liketerm = liketerms[index];
              if (liketerm[0].equals != null) {
                if (liketerm[0].equals(term, equivalencies)) {
                  liketerms[index][1] = new Add(liketerm[1], new terminals.Constant("1"));
                  liketerms[index][1] = liketerms[index][1].simplify(equivalencies);
                  if (((_ref4 = liketerms[index][1].children) != null ? _ref4.length : void 0) === 1) {
                    liketerms[index][1] = liketerms[index][1].children[0];
                  }
                  found = true;
                }
              } else if (liketerm[0] === term) {
                liketerms[index][1] = new Add(liketerm[1], new terminals.Constant("1"));
                liketerms[index][1] = liketerms[index][1].simplify(equivalencies);
                if (((_ref5 = liketerms[index][1].children) != null ? _ref5.length : void 0) === 1) {
                  liketerms[index][1] = liketerms[index][1].children[0];
                }
                found = true;
              }
            }
            if (!found) {
              liketerms.push([term, new terminals.Constant("1")]);
            }
          }
          i += 1;
        }
        if ((constantterm != null ? typeof constantterm.evaluate === "function" ? constantterm.evaluate() : void 0 : void 0) === 0) {
          return new terminals.Constant("0");
        }
        newMul = null;
        for (_m = 0, _len4 = liketerms.length; _m < _len4; _m++) {
          liketerm = liketerms[_m];
          if ((typeof (_base = liketerm[1]).evaluate === "function" ? _base.evaluate() : void 0) !== 1) {
            newPow = new Pow(liketerm[0], liketerm[1]);
            newPow = newPow.simplify(equivalencies);
          } else {
            newPow = liketerm[0];
          }
          if (newMul != null) {
            newMul.children.push(newPow);
          } else {
            newMul = new Mul(newPow);
          }
        }
        if (newMul == null) {
          return constantterm;
        }
        if ((constantterm != null) && constantterm.evaluate() !== 1) {
          newMul.children.push(constantterm);
        }
        newMul.sort();
        numerical = true;
        _ref6 = newMul.children;
        for (_n = 0, _len5 = _ref6.length; _n < _len5; _n++) {
          child = _ref6[_n];
          if (!(child instanceof terminals.Constant)) {
            numerical = false;
            break;
          }
        }
        if (numerical) {
          return newMul.simplifyConstants();
        }
        if (newMul.children.length !== 1) {
          return newMul;
        }
        return newMul.children[0];
      };

      Mul.prototype.sort = function() {
        var child, _i, _len, _ref;
        _ref = this.children;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          child = _ref[_i];
          if (typeof child.sort === "function") {
            child.sort();
          }
        }
        return this.children.sort(compare);
      };

      Mul.prototype.expandAndSimplify = function(equivalencies) {
        var expr;
        expr = this.expand();
        if (expr.simplify != null) {
          return expr.simplify(equivalencies);
        }
        return expr;
      };

      Mul.prototype.solve = function(variable, equivalencies) {
        var Pow, child, error, expr, _i, _len, _ref, _ref1, _ref2;
        if (equivalencies == null) {
          equivalencies = null;
        }
        Pow = require("operators/Pow");
        expr = this.expandAndSimplify(equivalencies);
        if (equivalencies == null) {
          equivalencies = {
            get: function(variable) {
              return [variable];
            }
          };
        }
        if (expr instanceof terminals.Terminal) {
          if (expr instanceof terminals.Variable && (expr.label === variable || (_ref = expr.label, __indexOf.call(equivalencies.get(variable), _ref) >= 0))) {
            return [new terminals.Constant("0")];
          } else {
            throw new AlgebraError(expr.toString(), variable);
          }
        }
        if (!(expr instanceof Mul)) {
          return expr.solve(variable, equivalencies);
        }
        _ref1 = expr.children;
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          child = _ref1[_i];
          if (child instanceof terminals.Variable && (child.label === variable || (_ref2 = child.label, __indexOf.call(equivalencies.get(variable), _ref2) >= 0))) {
            return [new terminals.Constant("0")];
          } else if (child instanceof Pow) {
            try {
              return child.solve(variable, equivalencies);
            } catch (_error) {
              error = _error;
              if (error instanceof AlgebraError) {
                continue;
              } else {
                throw error;
              }
            }
          }
        }
        throw new AlgebraError(expr.toString(), variable);
      };

      Mul.prototype.getAllVariables = function() {
        var child, childVariables, outVariables, variable, variables, _i, _j, _len, _len1, _ref;
        variables = {};
        _ref = this.children;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          child = _ref[_i];
          if (child instanceof terminals.Variable) {
            variables[child.label] = true;
          } else if (child.getAllVariables != null) {
            childVariables = child.getAllVariables();
            for (_j = 0, _len1 = childVariables.length; _j < _len1; _j++) {
              variable = childVariables[_j];
              variables[variable] = true;
            }
          }
        }
        outVariables = [];
        for (variable in variables) {
          outVariables.push(variable);
        }
        return outVariables;
      };

      Mul.prototype.replaceVariables = function(replacements) {
        var child, children, index, _i, _len, _ref;
        children = [];
        _ref = this.children;
        for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
          child = _ref[index];
          if (child instanceof terminals.Variable && child.label in replacements) {
            children.push(child.copy());
            children[index].label = replacements[child.label];
          } else if (child.replaceVariables != null) {
            children.push(child.replaceVariables(replacements));
          } else {
            children.push(child.copy());
          }
        }
        return (function(func, args, ctor) {
          ctor.prototype = func.prototype;
          var child = new ctor, result = func.apply(child, args);
          return Object(result) === result ? result : child;
        })(Mul, children, function(){});
      };

      Mul.prototype.sub = function(substitutions, uncertaintySubstitutions, equivalencies, assumeZeroUncertainty) {
        var child, children, equiv, newMul, subbed, variable, variableEquivalencies, _i, _j, _len, _len1, _ref;
        if (equivalencies == null) {
          equivalencies = null;
        }
        if (assumeZeroUncertainty == null) {
          assumeZeroUncertainty = false;
        }
        for (variable in substitutions) {
          if (!(substitutions[variable] instanceof terminals.Terminal || substitutions[variable] instanceof nodes.BasicNode)) {
            substitutions[variable] = new terminals.Constant(substitutions[variable]);
          }
        }
        if (equivalencies == null) {
          equivalencies = {
            get: function(z) {
              return [z];
            }
          };
        }
        children = [];
        _ref = this.children;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          child = _ref[_i];
          if (child instanceof terminals.Variable) {
            variableEquivalencies = equivalencies.get(child.label);
            subbed = false;
            for (_j = 0, _len1 = variableEquivalencies.length; _j < _len1; _j++) {
              equiv = variableEquivalencies[_j];
              if (equiv in substitutions) {
                children.push(substitutions[equiv].copy());
                subbed = true;
                break;
              }
            }
            if (!subbed) {
              children.push(child.copy());
            }
          } else if (child.sub != null) {
            console.log(assumeZeroUncertainty);
            children.push(child.sub(substitutions, uncertaintySubstitutions, equivalencies, assumeZeroUncertainty));
          } else {
            children.push(child.copy());
          }
        }
        newMul = (function(func, args, ctor) {
          ctor.prototype = func.prototype;
          var child = new ctor, result = func.apply(child, args);
          return Object(result) === result ? result : child;
        })(Mul, children, function(){});
        newMul = newMul.expandAndSimplify(equivalencies);
        return newMul;
      };

      Mul.prototype.substituteExpression = function(sourceExpression, variable, equivalencies, eliminate) {
        var child, children, childrenArray, childrenExpressions, expression, newMul, results, sourceExpressions, variableEquivalencies, _i, _j, _k, _len, _len1, _len2, _ref, _ref1;
        if (equivalencies == null) {
          equivalencies = null;
        }
        if (eliminate == null) {
          eliminate = false;
        }
        if (eliminate) {
          sourceExpressions = sourceExpression.solve(variable, equivalencies);
        } else {
          sourceExpressions = [sourceExpression];
        }
        if (equivalencies == null) {
          equivalencies = {
            get: function(variable) {
              return [variable];
            }
          };
        }
        variableEquivalencies = equivalencies.get(variable);
        results = [];
        for (_i = 0, _len = sourceExpressions.length; _i < _len; _i++) {
          expression = sourceExpressions[_i];
          childrenExpressions = [];
          _ref = this.children;
          for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
            child = _ref[_j];
            if (child instanceof terminals.Variable && (child.label === variable || (_ref1 = child.label, __indexOf.call(variableEquivalencies, _ref1) >= 0))) {
              childrenExpressions.push([expression.copy()]);
            } else if (child.substituteExpression != null) {
              childrenExpressions.push(child.substituteExpression(expression, variable, equivalencies));
            } else {
              childrenExpressions.push([child.copy()]);
            }
          }
          console.log("childrenExpressions", childrenExpressions);
          childrenArray = combinations(childrenExpressions);
          console.log("childrenArray", childrenArray);
          for (_k = 0, _len2 = childrenArray.length; _k < _len2; _k++) {
            children = childrenArray[_k];
            newMul = (function(func, args, ctor) {
              ctor.prototype = func.prototype;
              var child = new ctor, result = func.apply(child, args);
              return Object(result) === result ? result : child;
            })(Mul, children, function(){});
            results.push(newMul.expandAndSimplify(equivalencies));
          }
        }
        console.log(results);
        return results;
      };

      Mul.prototype.toMathML2 = function(equationID, expression, equality, topLevel) {
        var Add, Pow, child, closingHTML, denominator, denominatorWithoutNegatives, html, i, mathClass, mathID, negativeCount, numerator, numeratorWithoutNegatives, _ref;
        if (expression == null) {
          expression = false;
        }
        if (equality == null) {
          equality = "0";
        }
        if (topLevel == null) {
          topLevel = false;
        }
        Add = require("operators/Add");
        Pow = require("operators/Pow");
        _ref = generateInfo.getMathMLInfo(equationID, expression, equality), mathClass = _ref[0], mathID = _ref[1], html = _ref[2];
        if (!topLevel) {
          html = "";
          closingHTML = "";
        } else {
          closingHTML = "</math></div>";
        }
        denominator = (function() {
          var _i, _len, _ref1, _results;
          _ref1 = this.children;
          _results = [];
          for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
            child = _ref1[_i];
            if (child instanceof Pow && (child.children.right.evaluate != null) && child.children.right.evaluate() < 0) {
              _results.push((new Pow(child, "-1")).simplify());
            }
          }
          return _results;
        }).call(this);
        numerator = (function() {
          var _i, _len, _ref1, _results;
          _ref1 = this.children;
          _results = [];
          for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
            child = _ref1[_i];
            if (!(child instanceof Pow && (child.children.right.evaluate != null) && child.children.right.evaluate() < 0)) {
              _results.push(child);
            }
          }
          return _results;
        }).call(this);
        numeratorWithoutNegatives = numerator.filter(function(child) {
          return !(child instanceof terminals.Constant && (typeof child.evaluate === "function" ? child.evaluate() : void 0) === -1);
        });
        denominatorWithoutNegatives = denominator.filter(function(child) {
          return !(child instanceof terminals.Constant && (typeof child.evaluate === "function" ? child.evaluate() : void 0) === -1);
        });
        negativeCount = denominator.length - denominatorWithoutNegatives.length + numerator.length - numeratorWithoutNegatives.length;
        if (denominator.length > 0 && numerator.length > 0) {
          return html + ((function() {
            var _i, _results;
            _results = [];
            for (i = _i = 0; 0 <= negativeCount ? _i < negativeCount : _i > negativeCount; i = 0 <= negativeCount ? ++_i : --_i) {
              _results.push("<mo>-</mo>");
            }
            return _results;
          })()).join("") + "<mfrac><mrow>" + numeratorWithoutNegatives.map(function(child) {
            if (child instanceof Add) {
              return "<mfenced>" + child.toMathML2(equationID, expression) + "</mfenced>";
            } else {
              return child.toMathML2(equationID, expression);
            }
          }).join("<mo>&middot;</mo>") + "</mrow><mrow>" + denominatorWithoutNegatives.map(function(child) {
            if (child instanceof Add) {
              return "<mfenced>" + child.toMathML2(equationID, expression) + "</mfenced>";
            } else {
              return child.toMathML2(equationID, expression);
            }
          }).join("<mo>&middot;</mo>") + "</mrow></mfrac>" + closingHTML;
        } else if (denominator.length > 0) {
          return html + ((function() {
            var _i, _results;
            _results = [];
            for (i = _i = 0; 0 <= negativeCount ? _i < negativeCount : _i > negativeCount; i = 0 <= negativeCount ? ++_i : --_i) {
              _results.push("<mo>-</mo>");
            }
            return _results;
          })()).join("") + "<mfrac><mn>1</mn><mrow>" + denominatorWithoutNegatives.map(function(child) {
            if (child instanceof Add) {
              return "<mfenced>" + child.toMathML2(equationID, expression) + "</mfenced>";
            } else {
              return child.toMathML2(equationID, expression);
            }
          }).join("<mo>&middot;</mo>") + "</mrow></mfrac>" + closingHTML;
        } else if (numerator.length > 0) {
          return html + ((function() {
            var _i, _results;
            _results = [];
            for (i = _i = 0; 0 <= negativeCount ? _i < negativeCount : _i > negativeCount; i = 0 <= negativeCount ? ++_i : --_i) {
              _results.push("<mo>-</mo>");
            }
            return _results;
          })()).join("") + "<mrow>" + numeratorWithoutNegatives.map(function(child) {
            if (child instanceof Add) {
              return "<mfenced>" + child.toMathML2(equationID, expression) + "</mfenced>";
            } else {
              return child.toMathML2(equationID, expression);
            }
          }).join("<mo>&middot;</mo>") + "</mrow>" + closingHTML;
        } else {
          throw new Error("No terms in Mul node.");
        }
      };

      Mul.prototype.toHTML = function(equationID, expression, equality, topLevel) {
        var Add, closingHTML, html, mathClass, mathID, _ref;
        if (expression == null) {
          expression = false;
        }
        if (equality == null) {
          equality = "0";
        }
        if (topLevel == null) {
          topLevel = false;
        }
        Add = require("operators/Add");
        _ref = generateInfo.getHTMLInfo(equationID, expression, equality), mathClass = _ref[0], mathID = _ref[1], html = _ref[2];
        if (!topLevel) {
          html = "";
          closingHTML = "";
        } else {
          closingHTML = "</div>";
        }
        return html + this.children.map(function(child) {
          if (child instanceof Add) {
            return "(" + child.toHTML() + ")";
          } else {
            return child.toHTML();
          }
        }).join("&middot;") + closingHTML;
      };

      Mul.prototype.toDrawingNode = function() {
        var Pow, bottom, child, newBottom, power, top, _i, _len, _ref, _ref1, _ref2;
        Pow = require("operators/Pow");
        terminals = require("terminals");
        top = [];
        bottom = [];
        _ref = this.children;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          child = _ref[_i];
          if (child instanceof Pow) {
            power = child.children.right;
            if (power instanceof terminals.Constant) {
              if (power.denominator < 0) {
                power.denominator *= -1;
                power.numerator *= -1;
              }
              if (power.numerator < 0) {
                if (Math.abs(power.numerator / power.denominator) - 1 > 0.000001) {
                  bottom.push(new Pow(child.children.left, new terminals.Constant(power.numerator, -power.denominator)).toDrawingNode());
                } else {
                  bottom.push(child.children.left.toDrawingNode());
                }
              } else {
                top.push(child.toDrawingNode());
              }
            } else {
              top.push(child.toDrawingNode());
            }
          } else if (child instanceof terminals.Constant) {
            if (child.numerator !== 1) {
              top.unshift(new prettyRender.Number(child.numerator));
            }
            if (child.denominator !== 1) {
              bottom.unshift(new prettyRender.Number(child.denominator));
            }
          } else {
            top.push(child.toDrawingNode());
          }
        }
        if (bottom.length === 1) {
          newBottom = bottom[0];
        } else if (bottom.length > 1) {
          newBottom = (_ref1 = prettyRender.Mul).makeWithBrackets.apply(_ref1, bottom);
        }
        if (top.length === 1) {
          top = top[0];
        } else if (top.length > 1) {
          top = (_ref2 = prettyRender.Mul).makeWithBrackets.apply(_ref2, top);
        }
        if (bottom.length === 0) {
          return top;
        } else if (top.length === 0) {
          return new prettyRender.Fraction(new prettyRender.Number(1), newBottom);
        } else {
          return new prettyRender.Fraction(top, newBottom);
        }
      };

      Mul.prototype.differentiate = function(variable) {
        var Add, f, g;
        Add = require("operators/Add");
        if (this.children.length === 0) {
          throw new Error("I'm pretty sure you need children in your Mul node");
        }
        if (this.children.length === 1) {
          return this.children[0].differentiate(variable).expandAndSimplify();
        } else {
          f = this.children[0];
          g = (function(func, args, ctor) {
            ctor.prototype = func.prototype;
            var child = new ctor, result = func.apply(child, args);
            return Object(result) === result ? result : child;
          })(Mul, this.children.slice(1), function(){});
          return new Add(new Mul(f, g.differentiate(variable)), new Mul(g, f.differentiate(variable))).expandAndSimplify();
        }
      };

      return Mul;

    })(nodes.RoseNode);
  });

}).call(this);

// Generated by CoffeeScript 1.6.3
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __slice = [].slice,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  define('operators/Pow',["nodes", "terminals", "generateInfo", "AlgebraError", "parseArgs", "require", "compare", "prettyRender"], function(nodes, terminals, generateInfo, AlgebraError, parseArgs, require, compare, prettyRender) {
    var Pow;
    return Pow = (function(_super) {
      __extends(Pow, _super);

      function Pow() {
        var args, base, power, _ref;
        base = arguments[0], power = arguments[1], args = 3 <= arguments.length ? __slice.call(arguments, 2) : [];
        if (!((base != null) && (power != null))) {
          throw new Error("Pow nodes must have two children.");
        }
        if (args.length > 0) {
          throw new Error("Pow nodes must have two children.");
        }
        this.cmp = -3;
        _ref = parseArgs(base, power), base = _ref[0], power = _ref[1];
        Pow.__super__.constructor.call(this, "**", base, power);
      }

      Pow.prototype.copy = function() {
        return new Pow((this.children.left.copy != null ? this.children.left.copy() : this.children.left), (this.children.right.copy != null ? this.children.right.copy() : this.children.right));
      };

      Pow.prototype.sort = function() {
        var _base, _base1;
        if (typeof (_base = this.children.left).sort === "function") {
          _base.sort();
        }
        return typeof (_base1 = this.children.right).sort === "function" ? _base1.sort() : void 0;
      };

      Pow.prototype.equals = function(b, equivalencies) {
        if (!(b instanceof Pow)) {
          return false;
        }
        if (this.children.left.equals != null) {
          if (!this.children.left.equals(b.children.left, equivalencies)) {
            return false;
          }
        } else {
          if (this.children.left !== b.children.left) {
            return false;
          }
        }
        if (this.children.right.equals != null) {
          if (!this.children.right.equals(b.children.right, equivalencies)) {
            return false;
          }
        } else {
          if (this.children.right !== b.children.right) {
            return false;
          }
        }
        return true;
      };

      Pow.prototype.compareSameType = function(b) {
        var c;
        c = compare(this.children.left, b.children.left);
        if (c !== 0) {
          return c;
        } else {
          return compare(this.children.right, b.children.right);
        }
      };

      Pow.prototype.getVariableUnits = function(variable, equivalencies) {
        var leftVariableUnits, rightVariableUnits, variableEquivalencies, _ref, _ref1;
        variableEquivalencies = equivalencies != null ? equivalencies.get(variable) : {
          get: function(z) {
            return [z];
          }
        };
        if (this.children.left instanceof terminals.Variable && (_ref = this.children.left.label, __indexOf.call(variableEquivalencies, _ref) >= 0)) {
          return this.children.left.units;
        } else {
          leftVariableUnits = this.children.left.getVariableUnits(variable, equivalencies);
          if (leftVariableUnits != null) {
            return leftVariableUnits;
          }
        }
        if (this.children.right instanceof terminals.Variable && (_ref1 = this.children.right.label, __indexOf.call(variableEquivalencies, _ref1) >= 0)) {
          return this.children.right.units;
        } else {
          rightVariableUnits = this.children.right.getVariableUnits(variable, equivalencies);
          if (rightVariableUnits != null) {
            return rightVariableUnits;
          }
        }
        return null;
      };

      Pow.prototype.setVariableUnits = function(variable, equivalencies, units) {
        var variableEquivalencies;
        variableEquivalencies = equivalencies != null ? equivalencies.get(variable) : {
          get: function(z) {
            return [z];
          }
        };
        this.children.left.setVariableUnits(variable, equivalencies, units);
        return this.children.right.setVariableUnits(variable, equivalencies, units);
      };

      Pow.prototype.expand = function() {
        var Add, Mul, child, children, i, index, left, newMul, newPow, right, _i, _j, _len, _ref, _ref1;
        Mul = require("operators/Mul");
        Add = require("operators/Add");
        if (this.children.left.expand != null) {
          left = this.children.left.expand();
        } else if (this.children.left.copy != null) {
          left = this.children.left.copy();
        } else {
          left = this.children.left;
        }
        if (this.children.right.expand != null) {
          right = this.children.right.expand();
        } else if (this.children.right.copy != null) {
          right = this.children.right.copy();
        } else {
          right = this.children.right;
        }
        if (left.children != null) {
          if (left instanceof Pow) {
            left.children.right = new Mul(left.children.right, right);
            left.expand();
          } else if (left instanceof Mul) {
            _ref = left.children;
            for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
              child = _ref[index];
              newPow = new Pow(child, right);
              newPow = newPow.expand();
              left.children[index] = newPow;
            }
          } else if (left instanceof Add) {
            if (right instanceof terminals.Constant && right.evaluate() % 1 === 0 && right.evaluate() > 0) {
              children = [];
              for (i = _j = 1, _ref1 = right.evaluate(); 1 <= _ref1 ? _j <= _ref1 : _j >= _ref1; i = 1 <= _ref1 ? ++_j : --_j) {
                children.push(left);
              }
              newMul = (function(func, args, ctor) {
                ctor.prototype = func.prototype;
                var child = new ctor, result = func.apply(child, args);
                return Object(result) === result ? result : child;
              })(Mul, children, function(){});
              newMul = newMul.expand();
              left = newMul;
            } else {
              left = new Pow(left, right);
            }
          }
          return left;
        } else {
          return new Pow(left, right);
        }
      };

      Pow.prototype.simplify = function(equivalencies) {
        var Mul, left, newPow, power, right;
        Mul = require("operators/Mul");
        if (equivalencies == null) {
          equivalencies = {
            get: function(variable) {
              return [variable];
            }
          };
        }
        if (this.children.left.simplify != null) {
          left = this.children.left.simplify(equivalencies);
        } else if (this.children.left.copy != null) {
          left = this.children.left.copy();
        } else {
          left = this.children.left;
        }
        if (this.children.right.simplify != null) {
          right = this.children.right.simplify(equivalencies);
        } else if (this.children.right.copy != null) {
          right = this.children.right.copy();
        } else {
          right = this.children.right;
        }
        if ((typeof right.evaluate === "function" ? right.evaluate() : void 0) === 1) {
          return left;
        } else if ((typeof left.evaluate === "function" ? left.evaluate() : void 0) === 1) {
          return left;
        } else if ((typeof right.evaluate === "function" ? right.evaluate() : void 0) === 0) {
          return new terminals.Constant("1");
        } else {
          if (right instanceof terminals.Constant && left instanceof terminals.Constant) {
            return new terminals.Constant(Math.pow(left.evaluate(), right.evaluate()));
          } else if (left instanceof Pow) {
            power = new Mul(left.children.right, right);
            newPow = new Pow(left.children.left, power);
            newPow = newPow.simplify(equivalencies);
            return newPow;
          } else {
            return new Pow(left, right);
          }
        }
      };

      Pow.prototype.expandAndSimplify = function(equivalencies) {
        var expr;
        expr = this.expand();
        if (expr.simplify != null) {
          return expr.simplify(equivalencies);
        }
        return expr;
      };

      Pow.prototype.solve = function(variable, equivalencies) {
        var Mul, error, expr, negative, returnables, solution, solutions, _i, _len, _ref, _ref1;
        Mul = require("operators/Mul");
        if (equivalencies == null) {
          equivalencies = {
            get: function(variable) {
              return [variable];
            }
          };
        }
        expr = this.expandAndSimplify(equivalencies);
        if (expr instanceof terminals.Terminal) {
          if (expr instanceof terminals.Variable && (expr.label === variable || (_ref = expr.label, __indexOf.call(equivalencies.get(variable), _ref) >= 0))) {
            return [new terminals.Constant("0")];
          } else {
            throw new AlgebraError(expr.toString(), variable);
          }
        }
        if (expr instanceof Pow) {
          if (expr.children.left instanceof terminals.Variable) {
            if (expr.children.left.label === variable || (_ref1 = expr.children.left.label, __indexOf.call(equivalencies.get(variable), _ref1) >= 0)) {
              return [new terminals.Constant("0")];
            }
            throw new AlgebraError(expr.toString(), variable);
          } else if (expr.children.left instanceof terminals.Terminal) {
            throw new AlgebraError(expr.toString(), variable);
          } else {
            try {
              solutions = expr.children.left.solve(variable, equivalencies);
            } catch (_error) {
              error = _error;
              throw error;
            }
            if ((expr.children.right.evaluate != null) && expr.children.right.evaluate() % 2 === 0) {
              returnables = [];
              for (_i = 0, _len = solutions.length; _i < _len; _i++) {
                solution = solutions[_i];
                negative = (new Mul(-1, solution)).simplify(equivalencies);
                if (negative.equals != null) {
                  if (!negative.equals(solution)) {
                    returnables.push(negative);
                  }
                  returnables.push(solution);
                } else {
                  if (negative !== solution) {
                    returnables.push(negative);
                  }
                  returnables.push(solution);
                }
              }
              return returnables;
            } else {
              return solutions;
            }
          }
        } else {
          return expr.solve(variable, equivalencies);
        }
      };

      Pow.prototype.sub = function(substitutions, uncertaintySubstitutions, equivalencies, assumeZeroUncertainty) {
        var equiv, left, newPow, right, subbed, variable, variableEquivalencies, _i, _j, _len, _len1;
        if (equivalencies == null) {
          equivalencies = null;
        }
        if (assumeZeroUncertainty == null) {
          assumeZeroUncertainty = false;
        }
        for (variable in substitutions) {
          if (!(substitutions[variable] instanceof terminals.Terminal || substitutions[variable] instanceof nodes.BasicNode)) {
            substitutions[variable] = new terminals.Constant(substitutions[variable]);
          }
        }
        if (equivalencies == null) {
          equivalencies = {
            get: function(z) {
              return [z];
            }
          };
        }
        left = null;
        right = null;
        if (this.children.left instanceof terminals.Variable) {
          variableEquivalencies = equivalencies.get(this.children.left.label);
          subbed = false;
          for (_i = 0, _len = variableEquivalencies.length; _i < _len; _i++) {
            equiv = variableEquivalencies[_i];
            if (equiv in substitutions) {
              left = substitutions[equiv].copy();
              subbed = true;
              break;
            }
          }
          if (!subbed) {
            left = this.children.left.copy();
          }
        } else if (this.children.left.sub != null) {
          left = this.children.left.sub(substitutions, uncertaintySubstitutions, equivalencies, assumeZeroUncertainty);
        } else {
          left = this.children.left.copy();
        }
        if (this.children.right instanceof terminals.Variable) {
          variableEquivalencies = equivalencies.get(this.children.right.label);
          subbed = false;
          for (_j = 0, _len1 = variableEquivalencies.length; _j < _len1; _j++) {
            equiv = variableEquivalencies[_j];
            if (equiv in substitutions) {
              right = substitutions[equiv].copy();
              subbed = true;
              break;
            }
          }
          if (!subbed) {
            right = this.children.right.copy();
          }
        } else if (this.children.right.sub != null) {
          right = this.children.right.sub(substitutions, uncertaintySubstitutions, equivalencies, assumeZeroUncertainty);
        } else {
          right = this.children.right.copy();
        }
        newPow = new Pow(left, right);
        newPow = newPow.expandAndSimplify(equivalencies);
        return newPow;
      };

      Pow.prototype.getAllVariables = function() {
        var leftVariables, outVariables, rightVariables, variable, variables, _i, _j, _len, _len1;
        variables = {};
        if (this.children.left instanceof terminals.Variable) {
          variables[this.children.left.label] = true;
        } else if (this.children.left.getAllVariables != null) {
          leftVariables = this.children.left.getAllVariables();
          for (_i = 0, _len = leftVariables.length; _i < _len; _i++) {
            variable = leftVariables[_i];
            variables[variable] = true;
          }
        }
        if (this.children.right instanceof terminals.Variable) {
          variables[this.children.right.label] = true;
        } else if (this.children.right.getAllVariables != null) {
          rightVariables = this.children.right.getAllVariables();
          for (_j = 0, _len1 = rightVariables.length; _j < _len1; _j++) {
            variable = rightVariables[_j];
            variables[variable] = true;
          }
        }
        outVariables = [];
        for (variable in variables) {
          outVariables.push(variable);
        }
        return outVariables;
      };

      Pow.prototype.replaceVariables = function(replacements) {
        var left, right;
        left = this.children.left.copy();
        right = this.children.right.copy();
        if (left instanceof terminals.Variable && left.label in replacements) {
          left.label = replacements[left.label];
        } else if (left.replaceVariables != null) {
          left = left.replaceVariables(replacements);
        }
        if (right instanceof terminals.Variable && right.label in replacements) {
          right.label = replacements[right.label];
        } else if (right.replaceVariables != null) {
          right = right.replaceVariables(replacements);
        }
        return new Pow(left, right);
      };

      Pow.prototype.substituteExpression = function(sourceExpression, variable, equivalencies, eliminate) {
        var expression, i, j, left, newPow, results, right, sourceExpressions, variableEquivalencies, _i, _j, _k, _len, _len1, _len2, _ref, _ref1;
        if (equivalencies == null) {
          equivalencies = null;
        }
        if (eliminate == null) {
          eliminate = false;
        }
        if (eliminate) {
          sourceExpressions = sourceExpression.solve(variable, equivalencies);
        } else {
          sourceExpressions = [sourceExpression];
        }
        if (equivalencies == null) {
          equivalencies = {
            get: function(variable) {
              return [variable];
            }
          };
        }
        variableEquivalencies = equivalencies.get(variable);
        results = [];
        for (_i = 0, _len = sourceExpressions.length; _i < _len; _i++) {
          expression = sourceExpressions[_i];
          left = [this.children.left.copy()];
          right = [this.children.right.copy()];
          if (this.children.left instanceof terminals.Variable && (this.children.left.label === variable || (_ref = this.children.left.label, __indexOf.call(variableEquivalencies, _ref) >= 0))) {
            left = [expression.copy()];
          } else if (!(this.children.left instanceof terminals.Terminal)) {
            left = this.children.left.substituteExpression(expression, variable, equivalencies);
          }
          if (this.children.right instanceof terminals.Variable && (this.children.right.label === variable || (_ref1 = this.children.right.label, __indexOf.call(variableEquivalencies, _ref1) >= 0))) {
            right = [expression.copy()];
          } else if (!(this.children.right instanceof terminals.Terminal)) {
            right = this.children.right.substituteExpression(expression, variable, equivalencies);
          }
          for (_j = 0, _len1 = left.length; _j < _len1; _j++) {
            i = left[_j];
            for (_k = 0, _len2 = right.length; _k < _len2; _k++) {
              j = right[_k];
              newPow = new Pow(i, j);
              newPow = newPow.expandAndSimplify(equivalencies);
              results.push(newPow);
            }
          }
        }
        return results;
      };

      Pow.prototype.toMathML2 = function(equationID, expression, equality, topLevel) {
        var Add, Mul, closingHTML, html, innerHTML, mathClass, mathID, right, _base, _base1, _base2, _base3, _ref;
        if (expression == null) {
          expression = false;
        }
        if (equality == null) {
          equality = "0";
        }
        if (topLevel == null) {
          topLevel = false;
        }
        Mul = require("operators/Mul");
        Add = require("operators/Add");
        _ref = generateInfo.getMathMLInfo(equationID, expression, equality), mathClass = _ref[0], mathID = _ref[1], html = _ref[2];
        if (!topLevel) {
          html = "";
          closingHTML = "";
        } else {
          closingHTML = "</math></div>";
        }
        if ((typeof (_base = this.children.right).evaluate === "function" ? _base.evaluate() : void 0) === 1) {
          return html + this.children.left.toMathML2(equationID, expression) + closingHTML;
        } else if ((typeof (_base1 = this.children.right).evaluate === "function" ? _base1.evaluate() : void 0) === 0) {
          return html + "<mn>1</mn>" + closingHTML;
        } else {
          if ((typeof (_base2 = this.children.right).evaluate === "function" ? _base2.evaluate() : void 0) < 0) {
            right = this.children.right.copy();
            right = new Mul("-1", right);
            right = right.expandAndSimplify();
          } else {
            right = this.children.right.copy();
          }
          if (this.children.left instanceof Add || this.children.left instanceof Mul) {
            innerHTML = "<mfenced>" + (this.children.left.toMathML2(equationID, expression)) + "</mfenced>";
          } else {
            innerHTML = "" + (this.children.left.toMathML2(equationID, expression));
          }
          if ((typeof right.evaluate === "function" ? right.evaluate() : void 0) !== 1) {
            innerHTML = "<msup>" + innerHTML + (right.toMathML2(equationID, expression)) + "</msup>";
          }
          if ((typeof (_base3 = this.children.right).evaluate === "function" ? _base3.evaluate() : void 0) < 0) {
            innerHTML = "<mfrac><mn>1</mn>" + innerHTML + "</mfrac>";
          }
          return html + innerHTML + closingHTML;
        }
      };

      Pow.prototype.toHTML = function(equationID, expression, equality, topLevel) {
        var closingHTML, html, innerHTML, leftSide, mathClass, mathID, rightSide, _base, _base1, _ref;
        if (expression == null) {
          expression = false;
        }
        if (equality == null) {
          equality = "0";
        }
        if (topLevel == null) {
          topLevel = false;
        }
        _ref = generateInfo.getHTMLInfo(equationID, expression, equality), mathClass = _ref[0], mathID = _ref[1], html = _ref[2];
        if (!topLevel) {
          html = "";
          closingHTML = "";
        } else {
          closingHTML = "</div>";
        }
        if ((typeof (_base = this.children.right).evaluate === "function" ? _base.evaluate() : void 0) === 1) {
          return html + this.children.left.toHTML() + closingHTML;
        } else if ((typeof (_base1 = this.children.right).evaluate === "function" ? _base1.evaluate() : void 0) === 0) {
          return html + "1" + closingHTML;
        } else {
          if (this.children.left instanceof terminals.Terminal) {
            leftSide = this.children.left.toHTML();
          } else {
            leftSide = "(" + (this.children.left.toHTML()) + ")";
          }
          if (this.children.right instanceof terminals.Terminal) {
            rightSide = this.children.right.toHTML();
          } else {
            rightSide = "(" + (this.children.right.toHTML()) + ")";
          }
          innerHTML = "" + leftSide + " ** " + rightSide;
          return html + innerHTML + closingHTML;
        }
      };

      Pow.prototype.toDrawingNode = function() {
        var FractionNode, NumberNode, PowNode, SurdNode;
        SurdNode = prettyRender != null ? prettyRender.Surd : void 0;
        PowNode = prettyRender.Pow;
        FractionNode = prettyRender.Fraction;
        NumberNode = prettyRender.Number;
        if (this.children.right instanceof terminals.Constant) {
          if (this.children.right.numerator === 1) {
            if (this.children.right.denominator > 0) {
              return new SurdNode(this.children.left.toDrawingNode(), this.children.right.denominator);
            } else {
              return new FractionNode(new NumberNode(1), new SurdNode(this.children.left.toDrawingNode(), -this.children.right.denominator));
            }
          }
        }
        return new PowNode(this.children.left.toDrawingNode(), this.children.right.toDrawingNode());
      };

      Pow.prototype.differentiate = function(variable) {
        var Add, Constant, Mul, _base;
        Add = require("operators/Add");
        Mul = require("operators/Mul");
        Constant = require("terminals").Constant;
        if (__indexOf.call(this.children.right.getAllVariables, variable) >= 0) {
          throw new Error("I can't differentiate with a variable on the top of a power");
        }
        if ((typeof (_base = this.children.right).evaluate === "function" ? _base.evaluate() : void 0) === 0) {
          return new Constant(0);
        }
        return new Mul(new Pow(this.children.left, new Add(this.children.right, new Constant(-1))), this.children.left.differentiate(variable), this.children.right).expandAndSimplify();
      };

      return Pow;

    })(nodes.BinaryNode);
  });

}).call(this);

// Generated by CoffeeScript 1.6.3
(function() {
  define('operators',["operators/Add", "operators/Mul", "operators/Pow"], function(Add, Mul, Pow) {
    return {
      Add: Add,
      Mul: Mul,
      Pow: Pow
    };
  });

}).call(this);

// Generated by CoffeeScript 1.6.3
(function() {
  var __slice = [].slice,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  define('Equation',["terminals", "nodes", "operators", "parse"], function(terminals, nodes, operators, parse) {
    var Equation;
    Equation = (function() {
      function Equation() {
        var args, sides;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        switch (args.length) {
          case 1:
            if (args[0] instanceof String || typeof args[0] === "string") {
              sides = args[0].split("=");
              switch (sides.length) {
                case 1:
                  this.left = new terminals.Constant("0");
                  this.right = parse.stringToExpression(sides[0]);
                  this.right = this.right.simplify();
                  break;
                case 2:
                  this.left = parse.stringToTerminal(sides[0]);
                  this.right = parse.stringToExpression(sides[1]);
                  this.right = this.right.simplify();
                  break;
                default:
                  throw new Error("Too many '=' signs.");
              }
            } else if (args[0] instanceof terminals.Terminal || args[0] instanceof nodes.BasicNode) {
              this.left = new terminals.Constant("0");
              this.right = args[0].copy();
            } else {
              throw new Error("Argument " + args[0] + " must be a String, Terminal, or Node.");
            }
            break;
          case 2:
            if (args[0] instanceof String || typeof args[0] === "string") {
              this.left = parse.stringToTerminal(args[0]);
            } else if (args[0] instanceof terminals.Terminal || args[0] instanceof nodes.BasicNode) {
              this.left = args[0].copy();
            } else {
              throw new Error("Argument " + args[0] + " must be a String, Terminal, or Node.");
            }
            if (args[1] instanceof String || typeof args[1] === "string") {
              this.right = parse.stringToExpression(args[1]);
              this.right = this.right.simplify();
            } else if (args[1] instanceof terminals.Terminal || args[1] instanceof nodes.BasicNode) {
              this.right = args[1].copy();
            } else {
              throw new Error("Argument " + args[1] + " must be a String, Terminal, or Node.");
            }
            break;
          default:
            throw new Error("Too many arguments.");
        }
      }

      Equation.prototype.solve = function(variable, equivalencies) {
        var expr, solutions;
        if (equivalencies == null) {
          equivalencies = null;
        }
        expr = new operators.Add(this.right, new operators.Mul("-1", this.left));
        solutions = expr.solve(variable, equivalencies);
        return solutions.map(function(solution) {
          return new Equation(variable, solution);
        });
      };

      Equation.prototype.replaceVariables = function(replacements) {
        var left, right;
        left = this.left.replaceVariables(replacements);
        right = this.right.replaceVariables(replacements);
        return new Equation(left, right);
      };

      Equation.prototype.getAllVariables = function() {
        var leftVars, rightVars, variable, _i, _len;
        leftVars = this.left.getAllVariables();
        rightVars = this.right.getAllVariables();
        for (_i = 0, _len = leftVars.length; _i < _len; _i++) {
          variable = leftVars[_i];
          if (__indexOf.call(rightVars, variable) < 0) {
            rightVars.unshift(variable);
          }
        }
        return rightVars;
      };

      Equation.prototype.sub = function(substitutions, uncertainties, equivalencies, assumeZeroUncertainty) {
        if (assumeZeroUncertainty == null) {
          assumeZeroUncertainty = false;
        }
        return new Equation(this.left, this.right.sub(substitutions, uncertainties, equivalencies, assumeZeroUncertainty));
      };

      Equation.prototype.substituteExpression = function(source, variable, equivalencies, eliminate) {
        var i, results, s, sources, variableEquivalencies, _i, _j, _len, _len1, _ref;
        if (eliminate == null) {
          eliminate = false;
        }
        if (source instanceof Equation) {
          source = new operators.Add(source.right, new operators.Mul("-1", source.left));
        }
        if (equivalencies == null) {
          equivalencies = {
            get: function(variable) {
              return [variable];
            }
          };
        }
        variableEquivalencies = equivalencies.get(variable);
        if (eliminate) {
          sources = source.solve(variable, equivalencies);
        } else {
          sources = [source];
        }
        results = [];
        for (_i = 0, _len = sources.length; _i < _len; _i++) {
          s = sources[_i];
          _ref = this.right.substituteExpression(s, variable, equivalencies);
          for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
            i = _ref[_j];
            results.push(new Equation(this.left, i.expandAndSimplify(equivalencies)));
          }
        }
        return results;
      };

      Equation.prototype.expandAndSimplify = function(equivalencies) {
        var left, right;
        left = this.left.expandAndSimplify(equivalencies);
        right = this.right.expandAndSimplify(equivalencies);
        return new Equation(left, right);
      };

      Equation.prototype.simplify = function(equivalencies) {
        var left, right;
        left = this.left.simplify(equivalencies);
        right = this.right.simplify(equivalencies);
        return new Equation(left, right);
      };

      Equation.prototype.expand = function(equivalencies) {
        var left, right;
        left = this.left.expand(equivalencies);
        right = this.right.expand(equivalencies);
        return new Equation(left, right);
      };

      Equation.prototype.getVariableUnits = function(variable, equivalencies) {
        if (equivalencies == null) {
          equivalencies = {
            get: function(z) {
              return [z];
            }
          };
        }
        if (this.left.label === variable) {
          return this.left.units;
        }
        return this.right.getVariableUnits(variable, equivalencies);
      };

      Equation.prototype.setVariableUnits = function(variable, equivalencies, units) {
        if (equivalencies == null) {
          equivalencies = {
            get: function(z) {
              return [z];
            }
          };
        }
        if (this.left.label === variable) {
          this.left.units = units;
        }
        return this.right.setVariableUnits(variable, equivalencies, units);
      };

      Equation.prototype.copy = function() {
        return new Equation(this.left.copy(), this.right.copy());
      };

      Equation.prototype.equals = function(b) {
        if (!(b instanceof Equation)) {
          return false;
        }
        return b.left.equals(this.left) && b.right.equals(this.right);
      };

      Equation.prototype.toMathML = function(equationID, expression, equality, topLevel) {
        if (expression == null) {
          expression = false;
        }
        if (equality == null) {
          equality = null;
        }
        if (topLevel == null) {
          topLevel = false;
        }
        return this.right.toMathML(equationID, expression, this.left, topLevel);
      };

      Equation.prototype.toHTML = function(equationID, expression, equality, topLevel) {
        if (expression == null) {
          expression = false;
        }
        if (equality == null) {
          equality = null;
        }
        if (topLevel == null) {
          topLevel = false;
        }
        return this.right.toHTML(equationID, expression, this.left, topLevel);
      };

      Equation.prototype.toLaTeX = function() {
        return "" + (this.left.toLaTeX()) + " = " + (this.right.toLaTeX());
      };

      Equation.prototype.toString = function() {
        return "" + this.left + " = " + this.right;
      };

      return Equation;

    })();
    return Equation;
  });

}).call(this);

// Generated by CoffeeScript 1.6.3
(function() {
  define('uncertainties',["nodes", "terminals", "operators", "require"], function(nodes, terminals, operators, require) {
    return nodes.BasicNode.prototype.getUncertainty = function() {
      var Add, Constant, Mul, Pow, Uncertainty, out, stuff, variable, variables, _i, _len;
      Mul = operators.Mul;
      Pow = operators.Pow;
      Add = operators.Add;
      Uncertainty = terminals.Uncertainty;
      Constant = terminals.Constant;
      variables = this.getAllVariables();
      out = [];
      for (_i = 0, _len = variables.length; _i < _len; _i++) {
        variable = variables[_i];
        stuff = new Mul(new terminals.Uncertainty(variable), this.differentiate(variable));
        out.push(new Pow(stuff, 2));
      }
      return new Pow((function(func, args, ctor) {
        ctor.prototype = func.prototype;
        var child = new ctor, result = func.apply(child, args);
        return Object(result) === result ? result : child;
      })(Add, out, function(){}), new terminals.Constant(1, 2)).expandAndSimplify();
    };
  });

}).call(this);

// Generated by CoffeeScript 1.6.3
/* Coffeequate - http://github.com/MatthewJA/Coffeequate*/


(function() {
  require.config({
    baseUrl: "./"
  });

  define('coffeequate',["Equation", "operators", "terminals", "parse", "uncertainties", "prettyRender"], function(Equation, operators, terminals, parse, uncertainties, prettyRender) {
    return {
      Equation: Equation,
      tree: {
        operators: operators,
        terminals: terminals
      },
      parse: parse,
      prettyRender: {
        DrawingNode: prettyRender.DrawingNode,
        Add: prettyRender.Add,
        Mul: prettyRender.Mul,
        Power: prettyRender.Power,
        Bracket: prettyRender.Bracket,
        Number: prettyRender.Number,
        Variable: prettyRender.Variable,
        Fraction: prettyRender.Fraction
      },
      C: parse.stringToExpression
    };
  });

}).call(this);

require(["coffeequate"]);
    //The modules for your project will be inlined above
    //this snippet. Ask almond to synchronously require the
    //module value for 'main' here and return it as the
    //value to use for the public API for the built file.
    return require('coffeequate');
}));