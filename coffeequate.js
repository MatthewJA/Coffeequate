/**
 * Coffeequate v1.2.0
 * http://matthewja.com/Coffeequate
 */

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
        window.coffeequate = window.CQ = factory();
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

define("vendor/almond", function(){});

// Generated by CoffeeScript 1.6.3
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define('nodes',[],function() {
    var BasicNode, BinaryNode, RoseNode;
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

      BasicNode.prototype.toMathML = function() {
        return this.toDrawingNode().renderMathML();
      };

      BasicNode.prototype.stringEqual = function(other) {
        return other.toString() === this.toString();
      };

      return BasicNode;

    })();
    RoseNode = (function(_super) {
      __extends(RoseNode, _super);

      function RoseNode(label, children) {
        this.children = children != null ? children : null;
        if (this.children == null) {
          this.children = [];
        }
        RoseNode.__super__.constructor.call(this, label);
      }

      RoseNode.prototype.getChildren = function() {
        return this.children;
      };

      return RoseNode;

    })(BasicNode);
    BinaryNode = (function(_super) {
      __extends(BinaryNode, _super);

      function BinaryNode(label, left, right) {
        this.label = label;
        this.children = {
          left: left,
          right: right
        };
      }

      BinaryNode.prototype.getChildren = function() {
        return [this.children.left, this.children.right];
      };

      return BinaryNode;

    })(BasicNode);
    return {
      BasicNode: BasicNode,
      RoseNode: RoseNode,
      BinaryNode: BinaryNode
    };
  });

}).call(this);

// Generated by CoffeeScript 1.6.3
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define('parse',["require"], function(require) {
    var CONSTANT_FLOAT_REGEX, CONSTANT_INTEGER_REGEX, DIMENSIONS_REGEX, ParseError, SYMBOLIC_CONSTANT_REGEX, VARIABLE_REGEX, stringToTerminal;
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
    VARIABLE_REGEX = /^@*[a-zA-Z\u0391-\u03A9\u03B1-\u03C9ϕϖϱϰϑϵ][a-zA-Z\u0391-\u03A9\u03B1-\u03C9ϕϖϱϰϑϵ_\-\d]*$/;
    CONSTANT_INTEGER_REGEX = /^-?\d+$/;
    CONSTANT_FLOAT_REGEX = /^-?\d+(\.\d+)?(e-?\d+)?$/;
    SYMBOLIC_CONSTANT_REGEX = /^\\@*[a-zA-Z\u0391-\u03A9\u03B1-\u03C9ϕϖϱϰϑϵ][a-zA-Z\u0391-\u03A9\u03B1-\u03C9ϕϖϱϰϑϵ_\-\d]*$/;
    DIMENSIONS_REGEX = /^[^:]*::\{[^:+]*\}$/;
    stringToTerminal = function(string) {
      var segments, terminal, terminals;
      if (/\^/.test(string)) {
        throw new Error("Unexpected carat (^). Coffeequate uses ** for exponentiation.");
      }
      if (DIMENSIONS_REGEX.test(string)) {
        segments = string.split("::");
        terminal = stringToTerminal(segments[0]);
        terminal.units = parser.parse(segments[1].slice(1, segments[1].length - 1));
        return terminal;
      }
      string = string.trim();
      terminals = require("terminals");
      if (CONSTANT_INTEGER_REGEX.test(string)) {
        return new terminals.Constant(string, 1, "rational");
      } else if (CONSTANT_FLOAT_REGEX.test(string)) {
        return new terminals.Constant(string, 1, "float");
      } else if (VARIABLE_REGEX.test(string)) {
        return new terminals.Variable(string);
      } else if (SYMBOLIC_CONSTANT_REGEX.test(string)) {
        return new terminals.SymbolicConstant(string.slice(1));
      } else {
        throw new ParseError(string, "terminal");
      }
    };
    function parser(operators) {/* parser generated by jison 0.4.13 */
/*
  Returns a Parser object of the following structure:

  Parser: {
	yy: {}
  }

  Parser.prototype: {
	yy: {},
	trace: function(),
	symbols_: {associative list: name ==> number},
	terminals_: {associative list: number ==> name},
	productions_: [...],
	performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate, $$, _$),
	table: [...],
	defaultActions: {...},
	parseError: function(str, hash),
	parse: function(input),

	lexer: {
		EOF: 1,
		parseError: function(str, hash),
		setInput: function(input),
		input: function(),
		unput: function(str),
		more: function(),
		less: function(n),
		pastInput: function(),
		upcomingInput: function(),
		showPosition: function(),
		test_match: function(regex_match_array, rule_index),
		next: function(),
		lex: function(),
		begin: function(condition),
		popState: function(),
		_currentRules: function(),
		topState: function(),
		pushState: function(condition),

		options: {
			ranges: boolean           (optional: true ==> token location info will include a .range[] member)
			flex: boolean             (optional: true ==> flex-like lexing behaviour where the rules are tested exhaustively to find the longest match)
			backtrack_lexer: boolean  (optional: true ==> lexer regexes are tested in order and for each matching regex the action code is invoked; the lexer terminates the scan when a token is returned by the action code)
		},

		performAction: function(yy, yy_, $avoiding_name_collisions, YY_START),
		rules: [...],
		conditions: {associative list: name ==> set},
	}
  }


  token location info (@$, _$, etc.): {
	first_line: n,
	last_line: n,
	first_column: n,
	last_column: n,
	range: [start_number, end_number]       (where the numbers are indexes into the input string, regular zero-based)
  }


  the parseError function receives a 'hash' object with these members for lexer and parser errors: {
	text:        (matched text)
	token:       (the produced terminal token, if any)
	line:        (yylineno)
  }
  while parser (grammar) errors will also provide these members, i.e. parser errors deliver a superset of attributes: {
	loc:         (yylloc)
	expected:    (string describing the set of expected tokens)
	recoverable: (boolean: TRUE when the parser has a error recovery rule available for this particular error)
  }
*/
var parser = (function(){
var parser = {trace: function trace(){},
yy: {},
symbols_: {"error":2,"expressions":3,"e":4,"EOF":5,"+":6,"-":7,"*":8,"/":9,"**":10,"(":11,")":12,"TERMINAL":13,"$accept":0,"$end":1},
terminals_: {2:"error",5:"EOF",6:"+",7:"-",8:"*",9:"/",10:"**",11:"(",12:")",13:"TERMINAL"},
productions_: [0,[3,2],[4,3],[4,3],[4,3],[4,3],[4,3],[4,2],[4,3],[4,1]],
performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate /* action[1] */, $$ /* vstack */, _$ /* lstack */
/**/) {
/* this == yyval */

var $0 = $$.length - 1;
switch (yystate) {
case 1:return $$[$0-1];
break;
case 2:this.$ = new operators.Add($$[$0-2],$$[$0]);
break;
case 3:this.$ = new operators.Add($$[$0-2], new operators.Mul("-1", $$[$0]));
break;
case 4:this.$ = new operators.Mul($$[$0-2],$$[$0]);
break;
case 5:this.$ = new operators.Mul($$[$0-2], new operators.Pow($$[$0], "-1"));
break;
case 6:this.$ = new operators.Pow($$[$0-2],$$[$0]);
break;
case 7:this.$ = new operators.Mul("-1",$$[$0]);
break;
case 8:this.$ = $$[$0-1];
break;
case 9:this.$ = stringToTerminal(yytext.trim());
break;
}
},
table: [{3:1,4:2,7:[1,3],11:[1,4],13:[1,5]},{1:[3]},{5:[1,6],6:[1,7],7:[1,8],8:[1,9],9:[1,10],10:[1,11]},{4:12,7:[1,3],11:[1,4],13:[1,5]},{4:13,7:[1,3],11:[1,4],13:[1,5]},{5:[2,9],6:[2,9],7:[2,9],8:[2,9],9:[2,9],10:[2,9],12:[2,9]},{1:[2,1]},{4:14,7:[1,3],11:[1,4],13:[1,5]},{4:15,7:[1,3],11:[1,4],13:[1,5]},{4:16,7:[1,3],11:[1,4],13:[1,5]},{4:17,7:[1,3],11:[1,4],13:[1,5]},{4:18,7:[1,3],11:[1,4],13:[1,5]},{5:[2,7],6:[2,7],7:[2,7],8:[2,7],9:[2,7],10:[2,7],12:[2,7]},{6:[1,7],7:[1,8],8:[1,9],9:[1,10],10:[1,11],12:[1,19]},{5:[2,2],6:[2,2],7:[2,2],8:[1,9],9:[1,10],10:[1,11],12:[2,2]},{5:[2,3],6:[2,3],7:[2,3],8:[1,9],9:[1,10],10:[1,11],12:[2,3]},{5:[2,4],6:[2,4],7:[2,4],8:[2,4],9:[2,4],10:[1,11],12:[2,4]},{5:[2,5],6:[2,5],7:[2,5],8:[2,5],9:[2,5],10:[1,11],12:[2,5]},{5:[2,6],6:[2,6],7:[2,6],8:[2,6],9:[2,6],10:[2,6],12:[2,6]},{5:[2,8],6:[2,8],7:[2,8],8:[2,8],9:[2,8],10:[2,8],12:[2,8]}],
defaultActions: {6:[2,1]},
parseError: function parseError(str,hash){if(hash.recoverable){this.trace(str)}else{throw new Error(str)}},
parse: function parse(input) {
	var self = this, stack = [0], vstack = [null], lstack = [], table = this.table, yytext = '', yylineno = 0, yyleng = 0, recovering = 0, TERROR = 2, EOF = 1;
	var args = lstack.slice.call(arguments, 1);
	this.lexer.setInput(input);
	this.lexer.yy = this.yy;
	this.yy.lexer = this.lexer;
	this.yy.parser = this;
	if (typeof this.lexer.yylloc == 'undefined') {
		this.lexer.yylloc = {};
	}
	var yyloc = this.lexer.yylloc;
	lstack.push(yyloc);
	var ranges = this.lexer.options && this.lexer.options.ranges;
	if (typeof this.yy.parseError === 'function') {
		this.parseError = this.yy.parseError;
	} else {
		this.parseError = Object.getPrototypeOf(this).parseError;
	}
	function popStack(n) {
		stack.length = stack.length - 2 * n;
		vstack.length = vstack.length - n;
		lstack.length = lstack.length - n;
	}
	function lex() {
		var token;
		token = self.lexer.lex() || EOF;
		if (typeof token !== 'number') {
			token = self.symbols_[token] || token;
		}
		return token;
	}
	var symbol, preErrorSymbol, state, action, a, r, yyval = {}, p, len, newState, expected;
	while (true) {
		state = stack[stack.length - 1];
		if (this.defaultActions[state]) {
			action = this.defaultActions[state];
		} else {
			if (symbol === null || typeof symbol == 'undefined') {
				symbol = lex();
			}
			action = table[state] && table[state][symbol];
		}
					if (typeof action === 'undefined' || !action.length || !action[0]) {
				var errStr = '';
				expected = [];
				for (p in table[state]) {
					if (this.terminals_[p] && p > TERROR) {
						expected.push('\'' + this.terminals_[p] + '\'');
					}
				}
				if (this.lexer.showPosition) {
					errStr = 'Parse error on line ' + (yylineno + 1) + ':\n' + this.lexer.showPosition() + '\nExpecting ' + expected.join(', ') + ', got \'' + (this.terminals_[symbol] || symbol) + '\'';
				} else {
					errStr = 'Parse error on line ' + (yylineno + 1) + ': Unexpected ' + (symbol == EOF ? 'end of input' : '\'' + (this.terminals_[symbol] || symbol) + '\'');
				}
				this.parseError(errStr, {
					text: this.lexer.match,
					token: this.terminals_[symbol] || symbol,
					line: this.lexer.yylineno,
					loc: yyloc,
					expected: expected
				});
			}
		if (action[0] instanceof Array && action.length > 1) {
			throw new Error('Parse Error: multiple actions possible at state: ' + state + ', token: ' + symbol);
		}
		switch (action[0]) {
		case 1:
			stack.push(symbol);
			vstack.push(this.lexer.yytext);
			lstack.push(this.lexer.yylloc);
			stack.push(action[1]);
			symbol = null;
			if (!preErrorSymbol) {
				yyleng = this.lexer.yyleng;
				yytext = this.lexer.yytext;
				yylineno = this.lexer.yylineno;
				yyloc = this.lexer.yylloc;
				if (recovering > 0) {
					recovering--;
				}
			} else {
				symbol = preErrorSymbol;
				preErrorSymbol = null;
			}
			break;
		case 2:
			len = this.productions_[action[1]][1];
			yyval.$ = vstack[vstack.length - len];
			yyval._$ = {
				first_line: lstack[lstack.length - (len || 1)].first_line,
				last_line: lstack[lstack.length - 1].last_line,
				first_column: lstack[lstack.length - (len || 1)].first_column,
				last_column: lstack[lstack.length - 1].last_column
			};
			if (ranges) {
				yyval._$.range = [
					lstack[lstack.length - (len || 1)].range[0],
					lstack[lstack.length - 1].range[1]
				];
			}
			r = this.performAction.apply(yyval, [
				yytext,
				yyleng,
				yylineno,
				this.yy,
				action[1],
				vstack,
				lstack
			].concat(args));
			if (typeof r !== 'undefined') {
				return r;
			}
			if (len) {
				stack = stack.slice(0, -1 * len * 2);
				vstack = vstack.slice(0, -1 * len);
				lstack = lstack.slice(0, -1 * len);
			}
			stack.push(this.productions_[action[1]][0]);
			vstack.push(yyval.$);
			lstack.push(yyval._$);
			newState = table[stack[stack.length - 2]][stack[stack.length - 1]];
			stack.push(newState);
			break;
		case 3:
			return true;
		}
	}
	return true;
}};
/* generated by jison-lex 0.2.1 */
var lexer = (function(){
var lexer = {

EOF:1,

parseError:function parseError(str,hash){if(this.yy.parser){this.yy.parser.parseError(str,hash)}else{throw new Error(str)}},

// resets the lexer, sets new input
setInput:function (input){this._input=input;this._more=this._backtrack=this.done=false;this.yylineno=this.yyleng=0;this.yytext=this.matched=this.match="";this.conditionStack=["INITIAL"];this.yylloc={first_line:1,first_column:0,last_line:1,last_column:0};if(this.options.ranges){this.yylloc.range=[0,0]}this.offset=0;return this},

// consumes and returns one char from the input
input:function (){var ch=this._input[0];this.yytext+=ch;this.yyleng++;this.offset++;this.match+=ch;this.matched+=ch;var lines=ch.match(/(?:\r\n?|\n).*/g);if(lines){this.yylineno++;this.yylloc.last_line++}else{this.yylloc.last_column++}if(this.options.ranges){this.yylloc.range[1]++}this._input=this._input.slice(1);return ch},

// unshifts one char (or a string) into the input
unput:function (ch){var len=ch.length;var lines=ch.split(/(?:\r\n?|\n)/g);this._input=ch+this._input;this.yytext=this.yytext.substr(0,this.yytext.length-len-1);this.offset-=len;var oldLines=this.match.split(/(?:\r\n?|\n)/g);this.match=this.match.substr(0,this.match.length-1);this.matched=this.matched.substr(0,this.matched.length-1);if(lines.length-1){this.yylineno-=lines.length-1}var r=this.yylloc.range;this.yylloc={first_line:this.yylloc.first_line,last_line:this.yylineno+1,first_column:this.yylloc.first_column,last_column:lines?(lines.length===oldLines.length?this.yylloc.first_column:0)+oldLines[oldLines.length-lines.length].length-lines[0].length:this.yylloc.first_column-len};if(this.options.ranges){this.yylloc.range=[r[0],r[0]+this.yyleng-len]}this.yyleng=this.yytext.length;return this},

// When called from action, caches matched text and appends it on next action
more:function (){this._more=true;return this},

// When called from action, signals the lexer that this rule fails to match the input, so the next matching rule (regex) should be tested instead.
reject:function (){if(this.options.backtrack_lexer){this._backtrack=true}else{return this.parseError("Lexical error on line "+(this.yylineno+1)+". You can only invoke reject() in the lexer when the lexer is of the backtracking persuasion (options.backtrack_lexer = true).\n"+this.showPosition(),{text:"",token:null,line:this.yylineno})}return this},

// retain first n characters of the match
less:function (n){this.unput(this.match.slice(n))},

// displays already matched input, i.e. for error messages
pastInput:function (){var past=this.matched.substr(0,this.matched.length-this.match.length);return(past.length>20?"...":"")+past.substr(-20).replace(/\n/g,"")},

// displays upcoming input, i.e. for error messages
upcomingInput:function (){var next=this.match;if(next.length<20){next+=this._input.substr(0,20-next.length)}return(next.substr(0,20)+(next.length>20?"...":"")).replace(/\n/g,"")},

// displays the character position where the lexing error occurred, i.e. for error messages
showPosition:function (){var pre=this.pastInput();var c=new Array(pre.length+1).join("-");return pre+this.upcomingInput()+"\n"+c+"^"},

// test the lexed token: return FALSE when not a match, otherwise return token
test_match:function (match,indexed_rule){var token,lines,backup;if(this.options.backtrack_lexer){backup={yylineno:this.yylineno,yylloc:{first_line:this.yylloc.first_line,last_line:this.last_line,first_column:this.yylloc.first_column,last_column:this.yylloc.last_column},yytext:this.yytext,match:this.match,matches:this.matches,matched:this.matched,yyleng:this.yyleng,offset:this.offset,_more:this._more,_input:this._input,yy:this.yy,conditionStack:this.conditionStack.slice(0),done:this.done};if(this.options.ranges){backup.yylloc.range=this.yylloc.range.slice(0)}}lines=match[0].match(/(?:\r\n?|\n).*/g);if(lines){this.yylineno+=lines.length}this.yylloc={first_line:this.yylloc.last_line,last_line:this.yylineno+1,first_column:this.yylloc.last_column,last_column:lines?lines[lines.length-1].length-lines[lines.length-1].match(/\r?\n?/)[0].length:this.yylloc.last_column+match[0].length};this.yytext+=match[0];this.match+=match[0];this.matches=match;this.yyleng=this.yytext.length;if(this.options.ranges){this.yylloc.range=[this.offset,this.offset+=this.yyleng]}this._more=false;this._backtrack=false;this._input=this._input.slice(match[0].length);this.matched+=match[0];token=this.performAction.call(this,this.yy,this,indexed_rule,this.conditionStack[this.conditionStack.length-1]);if(this.done&&this._input){this.done=false}if(token){return token}else if(this._backtrack){for(var k in backup){this[k]=backup[k]}return false}return false},

// return next match in input
next:function (){if(this.done){return this.EOF}if(!this._input){this.done=true}var token,match,tempMatch,index;if(!this._more){this.yytext="";this.match=""}var rules=this._currentRules();for(var i=0;i<rules.length;i++){tempMatch=this._input.match(this.rules[rules[i]]);if(tempMatch&&(!match||tempMatch[0].length>match[0].length)){match=tempMatch;index=i;if(this.options.backtrack_lexer){token=this.test_match(tempMatch,rules[i]);if(token!==false){return token}else if(this._backtrack){match=false;continue}else{return false}}else if(!this.options.flex){break}}}if(match){token=this.test_match(match,rules[index]);if(token!==false){return token}return false}if(this._input===""){return this.EOF}else{return this.parseError("Lexical error on line "+(this.yylineno+1)+". Unrecognized text.\n"+this.showPosition(),{text:"",token:null,line:this.yylineno})}},

// return next match that has a token
lex:function lex(){var r=this.next();if(r){return r}else{return this.lex()}},

// activates a new lexer condition state (pushes the new lexer condition state onto the condition stack)
begin:function begin(condition){this.conditionStack.push(condition)},

// pop the previously active lexer condition state off the condition stack
popState:function popState(){var n=this.conditionStack.length-1;if(n>0){return this.conditionStack.pop()}else{return this.conditionStack[0]}},

// produce the lexer rule set which is active for the currently active lexer condition state
_currentRules:function _currentRules(){if(this.conditionStack.length&&this.conditionStack[this.conditionStack.length-1]){return this.conditions[this.conditionStack[this.conditionStack.length-1]].rules}else{return this.conditions["INITIAL"].rules}},

// return the currently active lexer condition state; when an index argument is provided it produces the N-th previous condition state, if available
topState:function topState(n){n=this.conditionStack.length-1-Math.abs(n||0);if(n>=0){return this.conditionStack[n]}else{return"INITIAL"}},

// alias for begin(condition)
pushState:function pushState(condition){this.begin(condition)},

// return the number of states currently on the stack
stateStackSize:function stateStackSize(){return this.conditionStack.length},
options: {},
performAction: function anonymous(yy,yy_,$avoiding_name_collisions,YY_START
/**/) {

var YYSTATE=YY_START;
switch($avoiding_name_collisions) {
case 0:/* skip whitespace */
break;
case 1:return 13; /* scientific notation */
break;
case 2:return 13;
break;
case 3:return 10;
break;
case 4:return 8;
break;
case 5:return 9;
break;
case 6:return 6;
break;
case 7:return 7;
break;
case 8:return 11;
break;
case 9:return 12;
break;
case 10:return 5;
break;
}
},
rules: [/^(?:\s+)/,/^(?:[\-]?[0-9]+(\.[0-9]+)?e[\-+]?[0-9]+(\.[0-9]+)?)/,/^(?:[^()+\-*/]+)/,/^(?:\*\*)/,/^(?:\*)/,/^(?:\/)/,/^(?:\+)/,/^(?:-)/,/^(?:\()/,/^(?:\))/,/^(?:$)/],
conditions: {"INITIAL":{"rules":[0,1,2,3,4,5,6,7,8,9,10],"inclusive":true}}
};
return lexer;
})();
parser.lexer = lexer;
function Parser () {
  this.yy = {};
}
Parser.prototype = parser;parser.Parser = Parser;
return new Parser;
})();


if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
exports.parser = parser;
exports.Parser = parser.Parser;
exports.parse = function () { return parser.parse.apply(parser, arguments); };
exports.main = function commonjsMain(args){if(!args[1]){console.log("Usage: "+args[0]+" FILE");process.exit(1)}var source=require("fs").readFileSync(require("path").normalize(args[1]),"utf8");return exports.parser.parse(source)};
if (typeof module !== 'undefined' && require.main === module) {
  exports.main(process.argv.slice(1));
}
};

return parser;}
;
    return {
      ParseError: ParseError,
      SyntaxError: parser.SyntaxError,
      stringToExpression: function(string, simplify) {
        var expr, operators;
        if (simplify == null) {
          simplify = true;
        }
        operators = require("operators");
        expr = parser(operators).parse(string);
        if (simplify && (expr.simplify != null)) {
          return expr.simplify();
        }
        return expr;
      },
      stringToTerminal: stringToTerminal
    };
  });

}).call(this);

// Generated by CoffeeScript 1.6.3
(function() {
  var greekLatexDictionary,
    __slice = [].slice,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  greekLatexDictionary = {
    "α": "\\alpha ",
    "A": "A",
    "β": "\\beta ",
    "B": "B",
    "χ": "\\chi ",
    "Δ": "\\Delta ",
    "δ": "\\delta ",
    "ε": "\\varepsilon ",
    "ϵ": "\\epsilon ",
    "E": "E",
    "Η": "\\Eta ",
    "γ": "\\gamma ",
    "Γ": "\\Gamma ",
    "ι": "\\iota ",
    "Ι": "I",
    "κ": "\\kappa ",
    "ϰ": "\\varkappa ",
    "Κ": "K",
    "λ": "\\lambda ",
    "Λ": "\\Lambda ",
    "μ": "\\mu ",
    "Μ": "M",
    "ν": "\\nu ",
    "Ν": "N",
    "ω": "\\omega ",
    "Ω": "\\Omega ",
    "ℴ": "o",
    "O": "O",
    "ϕ": "\\phi ",
    "φ": "\\varphi ",
    "Φ": "\\Phi ",
    "π": "\\pi ",
    "Π": "\\Pi ",
    "ψ": "\\psi ",
    "Ψ": "\\Psi ",
    "ρ": "\\rho ",
    "Ρ": "P",
    "σ": "\\sigma ",
    "ς": "\\varsigma ",
    "Σ": "\\Sigma ",
    "τ": "\\tau ",
    "Τ": "T",
    "θ": "\\theta ",
    "Θ": "\\Theta ",
    "υ": "\\upsilon ",
    "ξ": "\\xi ",
    "Ξ": "\\Xi ",
    "ζ": "\\zeta ",
    "Ζ": "Z",
    "ϖ": "\\varpi ",
    "ϱ": "\\varrho ",
    "ϑ": "\\vartheta "
  };

  define('prettyRender',[],function() {
    var prettyRender;
    prettyRender = {};
    prettyRender.DrawingNode = (function() {
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
          return new prettyRender.Bracket(child);
        }
        return child;
      };

      return DrawingNode;

    })();
    prettyRender.DrawingNode.makeWithBrackets = function() {
      var node, terms;
      terms = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      node = new this();
      terms = terms.map(function(x) {
        if (x.bindingStrength() <= node.bindingStrength()) {
          return new prettyRender.Bracket(x);
        } else {
          return x;
        }
      });
      node.terms = terms;
      return node;
    };
    prettyRender.Add = (function(_super) {
      __extends(Add, _super);

      function Add() {
        var terms;
        terms = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        this.terms = terms;
      }

      Add.prototype.bindingStrength = function() {
        return 4;
      };

      Add.prototype.drawPretty = function(renderFunction, plus, minus) {
        var out, term, _i, _len, _ref;
        out = "";
        if (this.terms[0] instanceof prettyRender.Negate) {
          out += minus;
          out += this.terms[0].contents[renderFunction]();
        } else {
          out += this.terms[0][renderFunction]();
        }
        _ref = this.terms.slice(1);
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          term = _ref[_i];
          if (term instanceof prettyRender.Negate) {
            out += minus;
            out += term.contents[renderFunction]();
          } else {
            out += plus;
            out += term[renderFunction]();
          }
        }
        return out;
      };

      Add.prototype.renderLaTeX = function() {
        return this.drawPretty("renderLaTeX", "+", "-");
      };

      Add.prototype.renderString = function() {
        return this.drawPretty("renderString", " + ", " - ");
      };

      Add.prototype.renderMathML = function() {
        return this.drawPretty("renderMathML", "<mo>+</mo>", "<mo>-</mo>");
      };

      return Add;

    })(prettyRender.DrawingNode);
    prettyRender.Mul = (function(_super) {
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

      Mul.prototype.renderMathML = function() {
        return this.terms.map(function(x) {
          return x.renderMathML();
        }).join("<mo>&middot;</mo>");
      };

      return Mul;

    })(prettyRender.DrawingNode);
    prettyRender.Pow = (function(_super) {
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

      Pow.prototype.renderMathML = function() {
        return "<msup>" + (this.left.renderMathML()) + (this.right.renderMathML()) + "</msup>";
      };

      return Pow;

    })(prettyRender.DrawingNode);
    prettyRender.Bracket = (function(_super) {
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

      Bracket.prototype.renderMathML = function() {
        return "<mfenced><mrow>" + (this.contents.renderMathML()) + "</mrow></mfenced>";
      };

      return Bracket;

    })(prettyRender.DrawingNode);
    prettyRender.Number = (function(_super) {
      __extends(Number, _super);

      function Number(value, classname) {
        this.value = value;
        this.classname = classname != null ? classname : "constant";
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

      Number.prototype.renderMathML = function() {
        return "<mn class=\"" + this.classname + "\">" + this.value + "</mn>";
      };

      return Number;

    })(prettyRender.DrawingNode);
    prettyRender.Variable = (function(_super) {
      __extends(Variable, _super);

      function Variable(label, classname) {
        this.label = label;
        this.classname = classname != null ? classname : "variable";
      }

      Variable.prototype.bindingStrength = function() {
        return 10;
      };

      Variable.prototype.renderLaTeX = function() {
        var char, mlabel, _i, _len, _ref;
        mlabel = "";
        _ref = this.label;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          char = _ref[_i];
          if (char in greekLatexDictionary) {
            mlabel += greekLatexDictionary[char];
          } else {
            mlabel += char;
          }
        }
        return mlabel;
      };

      Variable.prototype.renderString = function() {
        return this.label;
      };

      Variable.prototype.renderMathML = function() {
        var atCount, atEnd, atStart, i, label, labelArray;
        labelArray = this.label.split("-");
        label = labelArray[0];
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
          return atStart + '<msub class="' + this.classname + '"><mi>' + label[0] + '</mi><mi>' + label.slice(1) + "</mi></msub>" + atEnd;
        } else {
          return '<mi class="' + this.classname + '">' + label + '</mi>';
        }
      };

      return Variable;

    })(prettyRender.DrawingNode);
    prettyRender.Fraction = (function(_super) {
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

    })(prettyRender.DrawingNode);
    prettyRender.Surd = (function(_super) {
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
          return "" + (this.bracketIfNeeded(this.contents).renderString()) + " ** (1/" + this.power + ")";
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

    })(prettyRender.DrawingNode);
    prettyRender.Negate = (function(_super) {
      __extends(Negate, _super);

      function Negate(contents) {
        this.contents = contents;
      }

      Negate.prototype.renderLaTeX = function() {
        return "-\\left(" + this.contents + "\\right)";
      };

      Negate.prototype.renderString = function() {
        return "-(" + (this.contents.renderString()) + ")";
      };

      Negate.prototype.renderMathML = function() {
        var x;
        x = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return "<mrow><mo>-</mo>" + (this.contents.renderMathML()) + "</mrow>";
      };

      return Negate;

    })(prettyRender.DrawingNode);
    prettyRender.Uncertainty = (function(_super) {
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
        return "<msub><mo>&sigma;</mo>" + (dummy.renderMathML.apply(dummy, x)) + "</msub>";
      };

      return Uncertainty;

    })(prettyRender.DrawingNode);
    return prettyRender;
  });

}).call(this);

// Generated by CoffeeScript 1.6.3
(function() {
  var constants;

  constants = {
    c: 299792458,
    G: 6.67384e-11,
    π: Math.PI,
    PI: Math.PI,
    E: Math.E,
    e: Math.E,
    ε0: 8.85418782e-12,
    μ0: 1.25663706e-6,
    k: 1.3806488e-23,
    h: 6.62606957e-34,
    hbar: 1.05457173e-34,
    NA: 6.02214129e23,
    mu: 1.66053892e-27,
    a0: 5.29e-11,
    ke: 1 / (4 * Math.PI * 8.85418782e-12),
    ec: 1.60217657e-19,
    R: 8.3144621
  };

  define('constants',[],function() {
    return constants;
  });

}).call(this);

// Generated by CoffeeScript 1.6.3
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  define('terminals',["parse", "nodes", "prettyRender", "constants"], function(parse, nodes, prettyRender, constants) {
    var Constant, SymbolicConstant, Terminal, Uncertainty, Variable, _ref;
    Terminal = (function(_super) {
      __extends(Terminal, _super);

      function Terminal() {
        _ref = Terminal.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      Terminal.prototype.copy = function() {
        throw new Error("Not implemented.");
      };

      Terminal.prototype.containsVariable = function(variable, equivalencies) {
        if (equivalencies == null) {
          equivalencies = {};
        }
        return false;
      };

      return Terminal;

    })(nodes.BasicNode);
    Constant = (function(_super) {
      __extends(Constant, _super);

      function Constant(numerator, denominator, mode) {
        this.numerator = numerator;
        this.denominator = denominator != null ? denominator : 1;
        this.mode = mode != null ? mode : "rational";
        this.cmp = -6;
        if ((typeof this.numerator === "number" || this.numerator instanceof Number) && this.numerator % 1 !== 0) {
          this.mode = "float";
        }
        switch (this.mode) {
          case "rational":
            this.numerator = parseInt(this.numerator);
            this.denominator = parseInt(this.denominator);
            this.simplifyInPlace();
            break;
          case "float":
            this.numerator = parseFloat(this.numerator);
            this.denominator = parseFloat(this.denominator);
            this.numerator /= this.denominator;
            this.denominator = 1;
            break;
          default:
            throw new Error("Unknown constant mode: " + this.mode + ".");
        }
      }

      Constant.prototype.evaluate = function() {
        return this.numerator / this.denominator;
      };

      Constant.prototype.copy = function() {
        return new Constant(this.numerator, this.denominator, this.mode);
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

      Constant.prototype.mul = function(b) {
        var newMode;
        if (this.mode === b.mode) {
          newMode = this.mode;
        } else {
          newMode = "float";
        }
        return new Constant(this.numerator * b.numerator, this.denominator * b.denominator, newMode);
      };

      Constant.prototype.add = function(b) {
        var newMode;
        if (this.mode === b.mode) {
          newMode = this.mode;
        } else {
          newMode = "float";
        }
        return new Constant(b.denominator * this.numerator + this.denominator * b.numerator, this.denominator * b.denominator, newMode);
      };

      Constant.prototype.pow = function(b) {
        var con, den, flip, num, operators;
        if (this.mode === "rational") {
          if (b.mode === "rational") {
            flip = false;
            if (b.numerator < 0 && b.denominator < 0) {
              b = new Constant(-b.numerator, -b.denominator);
            } else if (b.numerator > 0 && b.denominator < 0) {
              flip = true;
              b = new Constant(b.numerator, -b.denominator);
            } else if (b.numerator < 0 && b.denominator > 0) {
              flip = true;
              b = new Constant(-b.numerator, b.denominator);
            }
            num = Math.pow(this.numerator, b.numerator);
            den = Math.pow(this.denominator, b.numerator);
            if (flip) {
              con = new Constant(den, num, "rational");
            } else {
              con = new Constant(num, den, "rational");
            }
            if (b.denominator === 1) {
              return con;
            } else {
              operators = require("operators");
              return new operators.Pow(con, new Constant(1, b.denominator, "rational"));
            }
          } else {
            return new Constant(Math.pow(this.evaluate(), b.evaluate()), 1, "float");
          }
        } else {
          return new Constant(Math.pow(this.evaluate(), b.evaluate()), 1, "float");
        }
      };

      Constant.prototype.equals = function(b) {
        if (!(b instanceof Constant)) {
          return false;
        }
        return this.evaluate() === b.evaluate();
      };

      Constant.prototype.replaceVariables = function() {
        return this.copy();
      };

      Constant.prototype.getAllVariables = function() {
        return [];
      };

      Constant.prototype.sub = function() {
        return this.copy();
      };

      Constant.prototype.simplifyInPlace = function() {
        var a, b, gcd, _ref1;
        a = this.numerator;
        b = this.denominator;
        while (b !== 0) {
          _ref1 = [b, Math.round(a % b * 10) / 10], a = _ref1[0], b = _ref1[1];
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
        if (this.mode === "rational") {
          constant.simplifyInPlace();
        }
        return constant;
      };

      Constant.prototype.expand = function() {
        return this.copy();
      };

      Constant.prototype.expandAndSimplify = function() {
        return this.simplify();
      };

      Constant.prototype.getUncertainty = function() {
        return new Constant(0);
      };

      Constant.prototype.mapOverVariables = function(fun) {
        return this.copy();
      };

      Constant.prototype.toDrawingNode = function() {
        var FractionNode, NegateNode, NumberNode;
        NumberNode = prettyRender.Number;
        FractionNode = prettyRender.Fraction;
        NegateNode = prettyRender.Negate;
        if (this.numerator > 0) {
          if (this.denominator === 1) {
            return new NumberNode(this.numerator);
          }
          return new FractionNode(new NumberNode(this.numerator), new NumberNode(this.denominator));
        } else {
          if (this.denominator === 1) {
            return new NegateNode(new NumberNode(-this.numerator));
          }
          return new NegateNode(new FractionNode(new NumberNode(this.numerator), new NumberNode(this.denominator)));
        }
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
        if (this.value != null) {
          return this.value;
        }
        if (this.label in constants) {
          return constants[this.label];
        }
        return null;
      };

      SymbolicConstant.prototype.equals = function(b) {
        if (!(b instanceof SymbolicConstant)) {
          return false;
        }
        return this.label === b.label && this.value === b.value;
      };

      SymbolicConstant.prototype.replaceVariables = function() {
        return this.copy();
      };

      SymbolicConstant.prototype.getAllVariables = function() {
        return [];
      };

      SymbolicConstant.prototype.sub = function(substitutions, uncertaintySubstitutions, equivalencies, assumeZeroUncertainty, evaluateSymbolicConstants) {
        if (equivalencies == null) {
          equivalencies = null;
        }
        if (assumeZeroUncertainty == null) {
          assumeZeroUncertainty = false;
        }
        if (evaluateSymbolicConstants == null) {
          evaluateSymbolicConstants = false;
        }
        if (!evaluateSymbolicConstants) {
          return this.copy();
        }
        if (this.value != null) {
          return new Constant(this.value, 1, "float");
        }
        if (this.label in constants) {
          return new Constant(constants[this.label], 1, "float");
        }
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

      SymbolicConstant.prototype.getUncertainty = function() {
        return new Constant(0);
      };

      SymbolicConstant.prototype.mapOverVariables = function(fun) {
        return this.copy();
      };

      SymbolicConstant.prototype.toDrawingNode = function() {
        var VariableNode;
        VariableNode = prettyRender.Variable;
        return new VariableNode(this.label, "constant symbolic-constant");
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
        var _ref1;
        if (equivalencies == null) {
          equivalencies = {};
        }
        if (!(b instanceof Variable)) {
          return false;
        }
        if (b.label in equivalencies) {
          return _ref1 = this.label, __indexOf.call(equivalencies[b.label], _ref1) >= 0;
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

      Variable.prototype.sub = function(substitutions, uncertaintySubstitutions, equivalencies) {
        var equivs, label, substitute, _i, _len;
        if (equivalencies == null) {
          equivalencies = {};
        }
        if (this.label in equivalencies) {
          equivs = equivalencies[this.label];
        } else {
          equivs = [this.label];
        }
        for (_i = 0, _len = equivs.length; _i < _len; _i++) {
          label = equivs[_i];
          if (label in substitutions) {
            substitute = substitutions[label];
            if (substitute.copy != null) {
              return substitute.copy();
            } else {
              if (substitute % 1 === 0) {
                return new Constant(substitute);
              } else {
                return new Constant(substitute, 1, "float");
              }
            }
          }
        }
        return this.copy();
      };

      Variable.prototype.getUncertainty = function() {
        return new Uncertainty(this.label);
      };

      Variable.prototype.mapOverVariables = function(fun) {
        return fun(this.copy());
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

      Variable.prototype.toDrawingNode = function() {
        var VariableNode;
        VariableNode = prettyRender.Variable;
        return new VariableNode(this.label);
      };

      Variable.prototype.differentiate = function(variable, equivalencies) {
        var _ref1;
        if (equivalencies == null) {
          equivalencies = {};
        }
        if (variable in equivalencies) {
          if (_ref1 = this.label, __indexOf.call(equivalencies[variable], _ref1) >= 0) {
            return new Constant(1);
          }
        }
        if (variable === this.label) {
          return new Constant(1);
        }
        return new Constant(0);
      };

      Variable.prototype.evaluate = function() {
        return null;
      };

      Variable.prototype.containsVariable = function(variable, equivalencies) {
        var _ref1;
        if (equivalencies == null) {
          equivalencies = {};
        }
        if (variable in equivalencies) {
          return _ref1 = this.label, __indexOf.call(equivalencies[variable], _ref1) >= 0;
        }
        return variable === this.label;
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
        var _ref1;
        if (equivalencies == null) {
          equivalencies = null;
        }
        if (!(b instanceof Uncertainty)) {
          return false;
        }
        if (b.label in equivalencies) {
          return _ref1 = this.label, __indexOf.call(equivalencies[b.label], _ref1) >= 0;
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
        var label, substitute, _i, _len, _ref1;
        if (equivalencies == null) {
          equivalencies = null;
        }
        if (assumeZero == null) {
          assumeZero = false;
        }
        if (this.label in equivalencies) {
          _ref1 = equivalencies[this.label];
          for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
            label = _ref1[_i];
            if (label in uncertaintySubstitutions && (uncertaintySubstitutions[label] != null)) {
              substitute = uncertaintySubstitutions[label];
              if (substitute.copy != null) {
                return substitute.copy();
              } else {
                return new Constant(substitute);
              }
            }
          }
          if (!assumeZero) {
            return this.copy();
          } else {
            return new Constant("0");
          }
        } else {
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
        }
      };

      Uncertainty.prototype.getUncertainty = function() {
        throw new Error("Can't take uncertainty of an uncertainty");
      };

      Uncertainty.prototype.mapOverVariables = function(fun) {
        return this.copy();
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
    AlgebraError = (function(_super) {
      __extends(AlgebraError, _super);

      function AlgebraError(expr, variable, postscript) {
        this.expr = expr;
        this.variable = variable;
        this.postscript = postscript != null ? postscript : null;
        AlgebraError.__super__.constructor.call(this, "Unsolvable: " + this.expr + " for " + this.variable + (this.postscript ? "; " + this.postscript : ""));
      }

      AlgebraError.prototype.toString = function() {
        return "Unsolvable: " + this.expr + " for " + this.variable + (this.postscript ? "; " + this.postscript : "");
      };

      return AlgebraError;

    })(Error);
    return AlgebraError;
  });

}).call(this);

// Generated by CoffeeScript 1.6.3
(function() {
  var __slice = [].slice;

  define('parseArgs',["nodes", "parse", "terminals"], function(nodes, parse, terminals) {
    var parseArgs;
    parseArgs = function() {
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
    return parseArgs;
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
    __slice = [].slice;

  define('operators/Add',["nodes", "terminals", "AlgebraError", "parseArgs", "require", "compare", "prettyRender"], function(nodes, terminals, AlgebraError, parseArgs, require, compare, prettyRender) {
    var Add, combinations, getLinearFactors;
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
    getLinearFactors = function(linearTerms, variable, equivalencies) {
      var Mul, child, factor, factors, subfactors, term, _i, _j, _len, _len1, _ref;
      if (equivalencies == null) {
        equivalencies = {};
      }
      Mul = require("operators/Mul");
      factors = [];
      for (_i = 0, _len = linearTerms.length; _i < _len; _i++) {
        term = linearTerms[_i];
        if (term instanceof terminals.Variable) {
          factors.push(new terminals.Constant("1"));
        } else {
          subfactors = [];
          _ref = term.children;
          for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
            child = _ref[_j];
            if (!child.containsVariable(variable, equivalencies)) {
              subfactors.push(child);
            }
          }
          factor = (function(func, args, ctor) {
            ctor.prototype = func.prototype;
            var child = new ctor, result = func.apply(child, args);
            return Object(result) === result ? result : child;
          })(Mul, subfactors, function(){});
          factors.push(factor);
        }
      }
      return factors;
    };
    Add = (function(_super) {
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

      Add.prototype.mapOverVariables = function(fun) {
        var child, children, _i, _len, _ref;
        children = [];
        _ref = this.children;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          child = _ref[_i];
          children.push(child.mapOverVariables(fun));
        }
        return (function(func, args, ctor) {
          ctor.prototype = func.prototype;
          var child = new ctor, result = func.apply(child, args);
          return Object(result) === result ? result : child;
        })(Add, children, function(){});
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
        if (equivalencies == null) {
          equivalencies = {};
        }
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
        if (equivalencies == null) {
          equivalencies = {};
        }
        Mul = require("operators/Mul");
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
        if (equivalencies == null) {
          equivalencies = {};
        }
        expr = this.expand();
        if (expr.simplify != null) {
          return expr.simplify(equivalencies);
        }
        return expr;
      };

      Add.prototype.solve = function(variable, equivalencies) {
        var Mul, Pow, a, b, c, child, dependentTerms, discriminant, discriminantSide, expr, factors, independentTerms, leftSide, linearTerms, mulFactors, negativeIndependents, nonPolynomialTerms, powerFactors, powerTerms, product, reciprocal, root, seenPower, solution, term, _i, _j, _k, _l, _len, _len1, _len2, _len3, _ref, _ref1;
        if (equivalencies == null) {
          equivalencies = {};
        }
        Mul = require("operators/Mul");
        Pow = require("operators/Pow");
        expr = this.expandAndSimplify(equivalencies).expandAndSimplify(equivalencies);
        if (!(expr instanceof Add)) {
          if (!expr.containsVariable(variable, equivalencies)) {
            throw new AlgebraError(expr.toString(), variable, "(variable not found)");
          }
          return expr.solve(variable, equivalencies);
        }
        dependentTerms = [];
        independentTerms = [];
        _ref = expr.children;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          term = _ref[_i];
          if (term.containsVariable(variable, equivalencies)) {
            dependentTerms.push(term.copy());
          } else {
            independentTerms.push(term.copy());
          }
        }
        if (dependentTerms.length === 0) {
          throw new AlgebraError(expr.toString(), variable, "(variable not found)");
        }
        linearTerms = [];
        powerTerms = [];
        nonPolynomialTerms = [];
        for (_j = 0, _len1 = dependentTerms.length; _j < _len1; _j++) {
          term = dependentTerms[_j];
          if (term instanceof terminals.Variable) {
            linearTerms.push(term);
          } else if (term instanceof Mul && term.isLinear(variable, equivalencies)) {
            linearTerms.push(term);
          } else if (term instanceof Pow && term.containsVariable(variable, equivalencies) && !term.children.right.containsVariable(variable, equivalencies)) {
            powerTerms.push(term);
          } else if (term instanceof Mul && term.isPolynomial(variable, equivalencies)) {
            powerTerms.push(term);
          } else {
            nonPolynomialTerms.push(term);
          }
        }
        if (nonPolynomialTerms.length > 0) {
          throw new AlgebraError(expr.toString(), variable, "(can't solve non-polynomial equations yet)");
        }
        if (powerTerms.length === 0) {
          negativeIndependents = new Mul("-1", (function(func, args, ctor) {
            ctor.prototype = func.prototype;
            var child = new ctor, result = func.apply(child, args);
            return Object(result) === result ? result : child;
          })(Add, independentTerms, function(){}));
          factors = getLinearFactors(linearTerms, variable, equivalencies);
          reciprocal = new Pow((function(func, args, ctor) {
            ctor.prototype = func.prototype;
            var child = new ctor, result = func.apply(child, args);
            return Object(result) === result ? result : child;
          })(Add, factors, function(){}), "-1");
          solution = new Mul(negativeIndependents, reciprocal);
          return [solution.expandAndSimplify(equivalencies)];
        }
        seenPower = null;
        powerFactors = [];
        for (_k = 0, _len2 = powerTerms.length; _k < _len2; _k++) {
          term = powerTerms[_k];
          if (term instanceof Pow) {
            if (seenPower == null) {
              seenPower = term.children.right;
              powerFactors.push(new terminals.Constant("1"));
            } else {
              if (seenPower.equals(term.children.right, equivalencies)) {
                powerFactors.push(new terminals.Constant("1"));
              } else {
                throw new AlgebraError(expr.toString(), variable, "(can't solve polynomials of degree > 2 yet)");
              }
            }
          } else {
            mulFactors = [];
            _ref1 = term.children;
            for (_l = 0, _len3 = _ref1.length; _l < _len3; _l++) {
              child = _ref1[_l];
              if (child instanceof Pow && child.containsVariable(variable, equivalencies)) {
                if (seenPower == null) {
                  seenPower = child.children.right;
                  mulFactors.push(new terminals.Constant("1"));
                } else {
                  if (seenPower.equals(child.children.right, equivalencies)) {
                    mulFactors.push(new terminals.Constant("1"));
                  } else {
                    throw new AlgebraError(expr.toString(), variable, "(can't solve polynomials of degree > 2 yet)");
                  }
                }
              } else {
                mulFactors.push(child);
              }
            }
            powerFactors.push((function(func, args, ctor) {
              ctor.prototype = func.prototype;
              var child = new ctor, result = func.apply(child, args);
              return Object(result) === result ? result : child;
            })(Mul, mulFactors, function(){}));
          }
        }
        if (linearTerms.length > 0 && seenPower.evaluate() !== 2) {
          throw new AlgebraError(expr.toString(), variable, "(can't solve polynomials of degree > 2 yet)");
        }
        if (linearTerms.length > 0) {
          a = (function(func, args, ctor) {
            ctor.prototype = func.prototype;
            var child = new ctor, result = func.apply(child, args);
            return Object(result) === result ? result : child;
          })(Add, powerFactors, function(){});
          b = (function(func, args, ctor) {
            ctor.prototype = func.prototype;
            var child = new ctor, result = func.apply(child, args);
            return Object(result) === result ? result : child;
          })(Add, getLinearFactors(linearTerms, variable, equivalencies), function(){});
          c = independentTerms.length ? (function(func, args, ctor) {
            ctor.prototype = func.prototype;
            var child = new ctor, result = func.apply(child, args);
            return Object(result) === result ? result : child;
          })(Add, independentTerms, function(){}) : new terminals.Constant("0");
          discriminant = new Pow(new Add(new Pow(b.copy(), "2"), new Mul("-4", a.copy(), c)), new Pow("2", "-1"));
          discriminantSide = new Mul(discriminant, new Pow(new Mul("2", a), "-1"));
          leftSide = new Mul("-1", b, new Pow(new Mul("2", a), "-1"));
          return [(new Add(leftSide.copy(), discriminantSide.copy())).expandAndSimplify(), (new Add(leftSide, new Mul("-1", discriminantSide))).expandAndSimplify()];
        } else {
          if (independentTerms.length) {
            negativeIndependents = new Mul("-1", (function(func, args, ctor) {
              ctor.prototype = func.prototype;
              var child = new ctor, result = func.apply(child, args);
              return Object(result) === result ? result : child;
            })(Add, independentTerms, function(){}));
          } else {
            negativeIndependents = new terminals.Constant("0");
          }
          reciprocal = powerFactors.length ? new Pow((function(func, args, ctor) {
            ctor.prototype = func.prototype;
            var child = new ctor, result = func.apply(child, args);
            return Object(result) === result ? result : child;
          })(Add, powerFactors, function(){}), "-1") : new terminals.Constant("1");
          product = new Mul(negativeIndependents, reciprocal);
          root = new Pow(seenPower, "-1");
          solution = new Pow(product, root);
          if ((typeof seenPower.evaluate === "function" ? seenPower.evaluate(equivalencies) : void 0) && seenPower.evaluate(equivalencies) % 2 === 0) {
            return [solution.expandAndSimplify(equivalencies), (new Mul("-1", solution)).expandAndSimplify(equivalencies)];
          } else {
            return [solution.expandAndSimplify(equivalencies)];
          }
        }
        throw new AlgebraError(expr.toString(), variable, " (reached end with no solution)");
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

      Add.prototype.sub = function(substitutions, uncertaintySubstitutions, equivalencies, assumeZeroUncertainty, evaluateSymbolicConstants) {
        var child, children, equiv, newAdd, subbed, variable, variableEquivalencies, _i, _j, _len, _len1, _ref;
        if (equivalencies == null) {
          equivalencies = {};
        }
        if (assumeZeroUncertainty == null) {
          assumeZeroUncertainty = false;
        }
        if (evaluateSymbolicConstants == null) {
          evaluateSymbolicConstants = false;
        }
        for (variable in substitutions) {
          if (substitutions[variable].copy == null) {
            substitutions[variable] = new terminals.Constant(substitutions[variable]);
          }
        }
        children = [];
        _ref = this.children;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          child = _ref[_i];
          if (child instanceof terminals.Variable) {
            variableEquivalencies = child.label in equivalencies ? equivalencies[child.label] : [child.label];
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
            children.push(child.sub(substitutions, uncertaintySubstitutions, equivalencies, assumeZeroUncertainty, evaluateSymbolicConstants));
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

      Add.prototype.toDrawingNode = function() {
        var AddNode;
        AddNode = prettyRender.Add;
        return AddNode.makeWithBrackets.apply(AddNode, this.children.map(function(term) {
          return term.toDrawingNode();
        }));
      };

      Add.prototype.differentiate = function(variable, equivalencies) {
        var derivative, newChildren;
        if (equivalencies == null) {
          equivalencies = {};
        }
        newChildren = this.children.map(function(x) {
          return x.differentiate(variable, equivalencies);
        });
        derivative = (function(func, args, ctor) {
          ctor.prototype = func.prototype;
          var child = new ctor, result = func.apply(child, args);
          return Object(result) === result ? result : child;
        })(Add, newChildren, function(){});
        return derivative.expandAndSimplify(equivalencies);
      };

      Add.prototype.containsVariable = function(variable, equivalencies) {
        var child, _i, _len, _ref;
        if (equivalencies == null) {
          equivalencies = {};
        }
        _ref = this.children;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          child = _ref[_i];
          if (child.containsVariable(variable, equivalencies)) {
            return true;
          }
        }
        return false;
      };

      return Add;

    })(nodes.RoseNode);
    return Add;
  });

}).call(this);

// Generated by CoffeeScript 1.6.3
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __slice = [].slice,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  define('operators/Mul',["nodes", "terminals", "AlgebraError", "parseArgs", "require", "compare", "prettyRender"], function(nodes, terminals, AlgebraError, parseArgs, require, compare, prettyRender) {
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
    Mul = (function(_super) {
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
            constantterm = constantterm.mul(child);
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

      Mul.prototype.mapOverVariables = function(fun) {
        var child, children, _i, _len, _ref;
        children = [];
        _ref = this.children;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          child = _ref[_i];
          children.push(child.mapOverVariables(fun));
        }
        return (function(func, args, ctor) {
          ctor.prototype = func.prototype;
          var child = new ctor, result = func.apply(child, args);
          return Object(result) === result ? result : child;
        })(Mul, children, function(){});
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
        if (equivalencies == null) {
          equivalencies = {};
        }
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
        if (equivalencies == null) {
          equivalencies = {};
        }
        Add = require("operators/Add");
        Pow = require("operators/Pow");
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
              constantterm = constantterm.mul(term);
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
        if (equivalencies == null) {
          equivalencies = {};
        }
        expr = this.expand();
        if (expr.simplify != null) {
          return expr.simplify(equivalencies);
        }
        return expr;
      };

      Mul.prototype.solve = function(variable, equivalencies) {
        var Pow, child, error, expr, _i, _len, _ref, _ref1, _ref2;
        if (equivalencies == null) {
          equivalencies = {};
        }
        Pow = require("operators/Pow");
        expr = this.expandAndSimplify(equivalencies);
        if (expr instanceof terminals.Terminal) {
          if (expr instanceof terminals.Variable && (expr.label === variable || (variable in equivalencies && (_ref = expr.label, __indexOf.call(equivalencies[variable], _ref) >= 0)))) {
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
          if (child instanceof terminals.Variable && (child.label === variable || (variable in equivalencies && (_ref2 = child.label, __indexOf.call(equivalencies[variable], _ref2) >= 0)))) {
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

      Mul.prototype.sub = function(substitutions, uncertaintySubstitutions, equivalencies, assumeZeroUncertainty, evaluateSymbolicConstants) {
        var child, children, equiv, newMul, subbed, variable, variableEquivalencies, _i, _j, _len, _len1, _ref;
        if (equivalencies == null) {
          equivalencies = {};
        }
        if (assumeZeroUncertainty == null) {
          assumeZeroUncertainty = false;
        }
        if (evaluateSymbolicConstants == null) {
          evaluateSymbolicConstants = false;
        }
        for (variable in substitutions) {
          if (substitutions[variable].copy == null) {
            substitutions[variable] = new terminals.Constant(substitutions[variable]);
          }
        }
        children = [];
        _ref = this.children;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          child = _ref[_i];
          if (child instanceof terminals.Variable) {
            variableEquivalencies = child.label in equivalencies ? equivalencies[child.label] : [child.label];
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
            children.push(child.sub(substitutions, uncertaintySubstitutions, equivalencies, assumeZeroUncertainty, evaluateSymbolicConstants));
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

      Mul.prototype.toDrawingNode = function() {
        var Pow, bottom, child, mul, negated, newBottom, newChildren, power, top, _i, _len, _ref, _ref1, _ref2;
        Pow = require("operators/Pow");
        terminals = require("terminals");
        if (this.children[0] instanceof terminals.Constant) {
          if (this.children[0].numerator < 0) {
            newChildren = this.children.slice(0);
            newChildren[0] = new terminals.Constant(this.children[0].numerator * -1, this.children[0].denominator);
            mul = (function(func, args, ctor) {
              ctor.prototype = func.prototype;
              var child = new ctor, result = func.apply(child, args);
              return Object(result) === result ? result : child;
            })(Mul, newChildren, function(){});
            return new prettyRender.Negate(mul.toDrawingNode());
          }
        }
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
                bottom.push(new Pow(child.children.left, new terminals.Constant(power.numerator, -power.denominator)).toDrawingNode());
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
        negated = false;
        if (top.length >= 1) {
          if (top[0] instanceof terminals.Constant) {
            if (top[0].numerator < 0) {
              top[0].numerator *= -1;
              negated = true;
            }
          }
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

      Mul.prototype.differentiate = function(variable, equivalencies) {
        var Add, f, g;
        if (equivalencies == null) {
          equivalencies = {};
        }
        Add = require("operators/Add");
        if (this.children.length === 0) {
          throw new Error("I'm pretty sure you need children in your Mul node");
        }
        if (this.children.length === 1) {
          return this.children[0].differentiate(variable, equivalencies).expandAndSimplify(equivalencies);
        } else {
          f = this.children[0];
          g = (function(func, args, ctor) {
            ctor.prototype = func.prototype;
            var child = new ctor, result = func.apply(child, args);
            return Object(result) === result ? result : child;
          })(Mul, this.children.slice(1), function(){});
          return new Add(new Mul(f, g.differentiate(variable, equivalencies)), new Mul(g, f.differentiate(variable, equivalencies))).expandAndSimplify(equivalencies);
        }
      };

      Mul.prototype.containsVariable = function(variable, equivalencies) {
        var child, _i, _len, _ref;
        if (equivalencies == null) {
          equivalencies = {};
        }
        _ref = this.children;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          child = _ref[_i];
          if (child.containsVariable(variable, equivalencies)) {
            return true;
          }
        }
        return false;
      };

      Mul.prototype.isLinear = function(variable, equivalencies) {
        var child, dependentCount, expr, terminalCount, _i, _len, _ref;
        if (equivalencies == null) {
          equivalencies = {};
        }
        dependentCount = 0;
        terminalCount = 0;
        expr = this.expandAndSimplify(equivalencies);
        if (!(expr instanceof Mul)) {
          return false;
        }
        _ref = expr.children;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          child = _ref[_i];
          if (child instanceof terminals.Variable) {
            if (child.containsVariable(variable, equivalencies)) {
              terminalCount += 1;
            }
          } else {
            if (child.containsVariable(variable, equivalencies)) {
              dependentCount += 1;
            }
          }
        }
        if (dependentCount > 0) {
          return false;
        }
        if (terminalCount > 1) {
          return false;
        }
        return true;
      };

      Mul.prototype.isPolynomial = function(variable, equivalencies) {
        var Pow, child, dependentCount, expr, powerCount, terminalCount, _i, _len, _ref;
        if (equivalencies == null) {
          equivalencies = {};
        }
        Pow = require("operators/Pow");
        terminalCount = 0;
        powerCount = 0;
        dependentCount = 0;
        expr = this.expandAndSimplify(equivalencies);
        if (!(expr instanceof Mul)) {
          return false;
        }
        _ref = expr.children;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          child = _ref[_i];
          if (child instanceof terminals.Variable && child.containsVariable(variable, equivalencies)) {
            terminalCount += 1;
          } else if (child instanceof Pow && child.containsVariable(variable, equivalencies) && !child.children.right.containsVariable(variable, equivalencies)) {
            powerCount += 1;
          } else {
            if (child.containsVariable(variable, equivalencies)) {
              dependentCount += 1;
            }
          }
        }
        if (dependentCount > 0) {
          return false;
        }
        if (terminalCount > 0) {
          if (powerCount > 0) {
            return false;
          }
          return true;
        }
        if (powerCount > 1) {
          return false;
        }
        return true;
      };

      return Mul;

    })(nodes.RoseNode);
    return Mul;
  });

}).call(this);

// Generated by CoffeeScript 1.6.3
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __slice = [].slice,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  define('operators/Pow',["nodes", "terminals", "AlgebraError", "parseArgs", "require", "compare", "prettyRender"], function(nodes, terminals, AlgebraError, parseArgs, require, compare, prettyRender) {
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
        if (equivalencies == null) {
          equivalencies = {};
        }
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

      Pow.prototype.mapOverVariables = function(fun) {
        var left, right;
        left = this.children.left.mapOverVariables(fun);
        right = this.children.right.mapOverVariables(fun);
        return new Pow(left, right);
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
        if (equivalencies == null) {
          equivalencies = {};
        }
        Mul = require("operators/Mul");
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
        } else if ((typeof left.evaluate === "function" ? left.evaluate() : void 0) === 1 || (typeof left.evaluate === "function" ? left.evaluate() : void 0) === 0) {
          return left;
        } else if ((typeof right.evaluate === "function" ? right.evaluate() : void 0) === 0) {
          return new terminals.Constant("1");
        } else {
          if (right instanceof terminals.Constant && left instanceof terminals.Constant) {
            return left.pow(right);
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
        if (equivalencies == null) {
          equivalencies = {};
        }
        expr = this.expand();
        if (expr.simplify != null) {
          return expr.simplify(equivalencies);
        }
        return expr;
      };

      Pow.prototype.solve = function(variable, equivalencies) {
        var Mul, error, expr, negative, returnables, solution, solutions, _i, _len;
        if (equivalencies == null) {
          equivalencies = {};
        }
        Mul = require("operators/Mul");
        expr = this.expandAndSimplify(equivalencies);
        if (expr instanceof terminals.Terminal) {
          if (expr instanceof terminals.Variable && (expr.label === variable || (expr.label in equivalencies && __indexOf.call(equivalencies[expr.label], variable) >= 0))) {
            return [new terminals.Constant("0")];
          } else {
            throw new AlgebraError(expr.toString(), variable);
          }
        }
        if (expr instanceof Pow) {
          if (expr.children.left instanceof terminals.Variable) {
            if (expr.children.left.label === variable || (expr.children.left.label in equivalencies && __indexOf.call(equivalencies[expr.children.left.label], variable) >= 0)) {
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

      Pow.prototype.sub = function(substitutions, uncertaintySubstitutions, equivalencies, assumeZeroUncertainty, evaluateSymbolicConstants) {
        var equiv, left, newPow, right, subbed, variable, variableEquivalencies, _i, _j, _len, _len1;
        if (equivalencies == null) {
          equivalencies = {};
        }
        if (assumeZeroUncertainty == null) {
          assumeZeroUncertainty = false;
        }
        if (evaluateSymbolicConstants == null) {
          evaluateSymbolicConstants = false;
        }
        for (variable in substitutions) {
          if (substitutions[variable].copy == null) {
            if (substitutions[variable] % 1 === 0) {
              substitutions[variable] = new terminals.Constant(substitutions[variable]);
            } else {
              substitutions[variable] = new terminals.Constant(substitutions[variable], 1, "float");
            }
          }
        }
        left = null;
        right = null;
        if (this.children.left instanceof terminals.Variable) {
          variableEquivalencies = this.children.left.label in equivalencies ? equivalencies[this.children.left.label] : [this.children.left.label];
          for (_i = 0, _len = variableEquivalencies.length; _i < _len; _i++) {
            equiv = variableEquivalencies[_i];
            if (equiv in substitutions) {
              left = substitutions[equiv].copy();
              break;
            }
          }
          if (left == null) {
            left = this.children.left.copy();
          }
        } else if (this.children.left.sub != null) {
          left = this.children.left.sub(substitutions, uncertaintySubstitutions, equivalencies, assumeZeroUncertainty, evaluateSymbolicConstants);
        } else {
          left = this.children.left.copy();
        }
        if (this.children.right instanceof terminals.Variable) {
          variableEquivalencies = this.children.right.label in equivalencies ? equivalencies[this.children.right.label] : [this.children.right.label];
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
          right = this.children.right.sub(substitutions, uncertaintySubstitutions, equivalencies, assumeZeroUncertainty, evaluateSymbolicConstants);
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

      Pow.prototype.toDrawingNode = function() {
        var FractionNode, NumberNode, PowNode, SurdNode;
        SurdNode = prettyRender != null ? prettyRender.Surd : void 0;
        PowNode = prettyRender.Pow;
        FractionNode = prettyRender.Fraction;
        NumberNode = prettyRender.Number;
        if (this.children.right instanceof terminals.Constant) {
          if (this.children.right.numerator === 1) {
            if (this.children.right.denominator === 1) {
              return this.children.left.toDrawingNode();
            }
            if (this.children.right.denominator > 0) {
              return new SurdNode(this.children.left.toDrawingNode(), this.children.right.denominator);
            } else {
              return new FractionNode(new NumberNode(1), new SurdNode(this.children.left.toDrawingNode(), -this.children.right.denominator));
            }
          }
        }
        return new PowNode(PowNode.prototype.bracketIfNeeded(this.children.left.toDrawingNode()), this.children.right.toDrawingNode());
      };

      Pow.prototype.differentiate = function(variable, equivalencies) {
        var Add, Constant, Mul, _base;
        if (equivalencies == null) {
          equivalencies = {};
        }
        Add = require("operators/Add");
        Mul = require("operators/Mul");
        Constant = require("terminals").Constant;
        if (__indexOf.call(this.children.right.getAllVariables, variable) >= 0) {
          throw new Error("I can't differentiate with a variable on the top of a power");
        }
        if ((typeof (_base = this.children.right).evaluate === "function" ? _base.evaluate() : void 0) === 0) {
          return new Constant(0);
        }
        return new Mul(new Pow(this.children.left, new Add(this.children.right, new Constant(-1))), this.children.left.differentiate(variable, equivalencies), this.children.right).expandAndSimplify(equivalencies);
      };

      Pow.prototype.containsVariable = function(variable, equivalencies) {
        if (equivalencies == null) {
          equivalencies = {};
        }
        return this.children.left.containsVariable(variable, equivalencies) || this.children.right.containsVariable(variable, equivalencies);
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
  var __slice = [].slice;

  define('Expression',["parse", "nodes"], function(parse, nodes) {
    var Expression;
    Expression = (function() {
      function Expression(val) {
        if (val instanceof String || typeof val === "string") {
          this.expr = parse.stringToExpression(val);
          if (this.expr.simplify != null) {
            this.expr = this.expr.simplify();
          }
        } else if (val.copy != null) {
          this.expr = val.copy().simplify();
        } else {
          console.log("Received argument: ", val);
          throw new Error("Unknown argument: `" + val + "'.");
        }
      }

      Expression.prototype.toString = function() {
        return this.expr.toString();
      };

      Expression.prototype.toMathML = function() {
        return this.expr.toMathML();
      };

      Expression.prototype.toLaTeX = function() {
        return this.expr.toLaTeX();
      };

      Expression.prototype.solve = function(variable, equivalencies) {
        var solution, _i, _len, _ref, _results;
        if (equivalencies == null) {
          equivalencies = {};
        }
        _ref = this.expr.solve(variable, equivalencies);
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          solution = _ref[_i];
          _results.push(new Expression(solution));
        }
        return _results;
      };

      Expression.prototype.sub = function(substitutions, equivalencies, substituteUncertainties, evaluateSymbolicConstants) {
        var key, newsubs, subbed, uncertaintySubs, variableSubs;
        if (equivalencies == null) {
          equivalencies = {};
        }
        if (substituteUncertainties == null) {
          substituteUncertainties = false;
        }
        if (evaluateSymbolicConstants == null) {
          evaluateSymbolicConstants = false;
        }
        newsubs = {};
        for (key in substitutions) {
          if (substitutions[key] instanceof Expression) {
            newsubs[key] = substitutions[key].expr;
          } else {
            newsubs[key] = substitutions[key];
          }
        }
        if (substituteUncertainties) {
          uncertaintySubs = newsubs;
          variableSubs = {};
        } else {
          uncertaintySubs = {};
          variableSubs = newsubs;
        }
        subbed = this.expr.sub(variableSubs, uncertaintySubs, equivalencies, false, evaluateSymbolicConstants);
        if (subbed.simplify != null) {
          subbed = subbed.simplify(equivalencies);
        }
        return new Expression(subbed);
      };

      Expression.prototype.getAllVariables = function() {
        return this.expr.getAllVariables();
      };

      Expression.prototype.mapOverVariables = function(fun) {
        return this.expr.mapOverVariables(fun);
      };

      Expression.prototype.copy = function() {
        return new Expression(this.expr.copy());
      };

      Expression.prototype.simplify = function(equivalencies) {
        var expr;
        if (equivalencies == null) {
          equivalencies = {};
        }
        if (this.expr.expandAndSimplify != null) {
          expr = this.expr.expandAndSimplify(equivalencies);
        } else if (this.expr.simplify != null) {
          expr = this.expr.simplify(equivalencies);
        } else {
          expr = this.expr.copy();
        }
        return new Expression(expr);
      };

      Expression.prototype.expand = function() {
        var expr;
        if (this.expr.expand != null) {
          expr = this.expr.expand();
        } else {
          expr = this.expr.copy();
        }
        return new Expression(expr);
      };

      Expression.prototype.differentiate = function(variable, equivalencies) {
        if (equivalencies == null) {
          equivalencies = {};
        }
        return new Expression(this.expr.differentiate(variable, equivalencies));
      };

      Expression.prototype.getUncertainty = function() {
        return new Expression(this.expr.getUncertainty());
      };

      Expression.prototype.toFunction = function() {
        var equivalencies, fun, variables, _i,
          _this = this;
        variables = 2 <= arguments.length ? __slice.call(arguments, 0, _i = arguments.length - 1) : (_i = 0, []), equivalencies = arguments[_i++];
        if (typeof equivalencies === "string" || equivalencies instanceof String) {
          variables.push(equivalencies);
          equivalencies = {};
        }
        fun = function() {
          var index, subs, substitutions, variable, _j, _len;
          subs = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
          substitutions = {};
          for (index = _j = 0, _len = variables.length; _j < _len; index = ++_j) {
            variable = variables[index];
            if (subs[index] != null) {
              substitutions[variable] = subs[index];
            }
          }
          return _this.sub(substitutions, equivalencies);
        };
        return fun;
      };

      return Expression;

    })();
    return Expression;
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

  define('coffeequate',["operators", "Expression", "parse", "uncertainties", "terminals"], function(operators, Expression, parse, uncertainties, terminals) {
    var CQ;
    CQ = function(input) {
      var left, right, val, _ref;
      if (/\=/.test(input)) {
        _ref = input.split("="), left = _ref[0], right = _ref[1];
        val = new operators.Add(parse.stringToExpression(right), new operators.Mul(parse.stringToExpression(left), "-1"));
        return new Expression(val);
      } else {
        return new Expression(input);
      }
    };
    CQ.raw = {
      Add: operators.Add,
      Mul: operators.Mul,
      Pow: operators.Pow,
      Terminal: terminals.Terminal,
      Variable: terminals.Variable,
      Constant: terminals.Constant,
      SymbolicConstant: terminals.SymbolicConstant,
      Uncertainty: terminals.Uncertainty
    };
    return CQ;
  });

}).call(this);

require(["coffeequate"]);
    //The modules for your project will be inlined above
    //this snippet. Ask almond to synchronously require the
    //module value for 'main' here and return it as the
    //value to use for the public API for the built file.
    return require('coffeequate');
}));