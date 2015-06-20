var vows = require('vows'),
    assert = require('assert'),
    CQ = require("../coffeequate.min");

var suite = vows.describe("expression");

suite.addBatch({
    "Expression API": {
        topic: CQ("a + b * c ** d / e - f = g"),
        "should include toString, toMathML, and toLaTeX": function(expr) {
            assert.isFunction(expr.toString);
            assert.isFunction(expr.toMathML);
            assert.isFunction(expr.toLaTeX);
        },
        "should include solve": function(expr) {
            assert.isFunction(expr.solve);
        },
        "should include sub": function(expr) {
            assert.isFunction(expr.sub);
        },
        "should include getAllVariables": function(expr) {
            assert.isFunction(expr.getAllVariables);
        },
        "should include mapOverVariables": function(expr) {
            assert.isFunction(expr.mapOverVariables);
        },
        "should include copy": function(expr) {
            assert.isFunction(expr.copy);
        },
        "should include simplify and expand": function(expr) {
            assert.isFunction(expr.simplify);
            assert.isFunction(expr.expand);
        },
        "should include differentiate": function(expr) {
            assert.isFunction(expr.differentiate);
        },
        "should include getUncertainty": function(expr) {
            assert.isFunction(expr.getUncertainty);
        },
        "should include toFunction": function(expr) {
            assert.isFunction(expr.toFunction);
        },
        "should include approx": function(expr) {
            assert.isFunction(expr.approx);
        },
        "should include equals": function(expr) {
            assert.isFunction(expr.equals);
        }
    },

    "Expression.solve": {
        topic: undefined,
        "can solve trivial equations": function() {
            var expr = CQ("x = 1");
            var sol = expr.solve("x");
            assert.isTrue(CQ("1").equals(sol[0]));
            assert.lengthOf(sol, 1);
        },
        "can solve linear equations": function() {
            var expr = CQ("y = a*x + b");
            var sol = expr.solve("x");
            assert.isTrue(CQ("(y - b)/a").equals(sol[0]));
            assert.lengthOf(sol, 1);
            sol = expr.solve("y");
            assert.isTrue(CQ("a*x + b").equals(sol[0]));
            assert.lengthOf(sol, 1);
            sol = expr.solve("b");
            assert.isTrue(CQ("y - a*x").equals(sol[0]));
            assert.lengthOf(sol, 1);
        },
        "can solve quadratic equations": function() {
            var expr = CQ("a*x**2 + b*x + c = 0");
            var sol = expr.solve("x");
            var pSol = CQ("(-b + (b**2 - 4*a*c)**(1/2))/(2*a)");
            var nSol = CQ("(-b - (b**2 - 4*a*c)**(1/2))/(2*a)");
            assert.isTrue(pSol.equals(sol[0]) || pSol.equals(sol[1]));
            assert.isTrue(nSol.equals(sol[0]) || nSol.equals(sol[1]));
            assert.isTrue(nSol.equals(sol[0]) || pSol.equals(sol[0]));
            assert.isTrue(nSol.equals(sol[1]) || pSol.equals(sol[1]));
        },
        "can solve simple cubic equations": function() {
            var expr = CQ("a*x**3 - b = 0");
            var sol = expr.solve("x");
            // need to simplify here or we'll hit a bug, see #117
            assert.isTrue(CQ("(b/a)**(1/3)").equals(sol[0].simplify()));
            assert.lengthOf(sol, 1);
        },
        "fails on unsolvable cubic equations": function() {
            var expr = CQ("a*x**3 + b*x**2 + c*x + d = 0");
            assert.throws(function(){expr.solve("x")}, CQ.AlgebraError);
        },
        "fails on unsolvable quartic equations": function() {
            var expr = CQ("a*x**4 + b*x**3 + c*x**2 + d*x + e = 0");
            assert.throws(function(){expr.solve("x")}, CQ.AlgebraError);
        },
        "fails on unsolvable quintic equations": function() {
            var expr = CQ("a*x**5 + b*x**4 + c*x**3 + d*x**2 + e*x + f = 0");
            assert.throws(function(){expr.solve("x")}, CQ.AlgebraError);
        }
    },

    "Expressions can be formatted": {
        topic: CQ("a + b * c ** d / e - f"),
        "as strings": function(expr) {
            assert.equal(expr.toString(), "a - f + (b*c**d)/e");
        },
        "as MathML": function(expr) {
            assert.equal(expr.toMathML(), '<mi class="variable">a</mi><mo>-</'+
                'mo><mi class="variable">f</mi><mo>+</mo><mfrac> <mrow><mi cla'+
                'ss="variable">b</mi><mo>&middot;</mo><msup><mi class="variabl'+
                'e">c</mi><mi class="variable">d</mi></msup></mrow> <mrow><mi '+
                'class="variable">e</mi></mrow> </mfrac>');
        },
        "as LaTeX": function(expr) {
            assert.equal(expr.toLaTeX(), 'a-f+\\frac{b \\cdot c^{d}}{e}');
        }
    }
}).export(module);