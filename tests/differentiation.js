var vows = require('vows'),
    assert = require('assert'),
    CQ = require("../coffeequate.min");

var suite = vows.describe("differentiation");

suite.addBatch({
    "Differentation": {
        topic: undefined,
        "works on addition": function() {
            var expr = CQ("a + b + c");
            var sol = expr.differentiate("b");
            assert.isTrue(CQ("1").equals(sol));
        },
        "works on multiplication": function() {
            var expr = CQ("a * b * c");
            var sol = expr.differentiate("b");
            assert.isTrue(CQ("a * c").equals(sol));
        },
        "works on subtraction": function() {
            var expr = CQ("a - b - c");
            var sol = expr.differentiate("b");
            assert.isTrue(CQ("-1").equals(sol));
        },
        "works on division": function() {
            var expr = CQ("a / b");
            var sol = expr.differentiate("b");
            assert.isTrue(CQ("-a / b**2").equals(sol));
        },
        "works on powers": function() {
            var expr = CQ("x ** 3");
            var sol = expr.differentiate("x");
            assert.isTrue(CQ("3*x**2").equals(sol));
            expr = CQ("x ** a");
            sol = expr.differentiate("x");
            assert.isTrue(CQ("a*x**(a-1)").equals(sol));
        },
        "works on polynomials": function() {
            var expr = CQ("a*x**3 + b*x**2 + c*x + d");
            var sol = expr.differentiate("x");
            assert.isTrue(CQ("3*a*x**2 + 2*b*x + c").equals(sol));
        },
        "works on exponentials of e": function() {
            var expr = CQ("\\e**x");
            var sol = expr.differentiate("x");
            assert.isTrue(expr.equals(sol));
            expr = CQ("\\E**(a*x**2 + x**3)");
            sol = expr.differentiate("x");
            assert.isTrue(CQ("(2*a*x + 3*x**2)*\\E**(a*x**2 + x**3)").equals(sol));
            expr = CQ("2.718281828459045**x");
            sol = expr.differentiate("x");
            assert.isTrue(expr.equals(sol));
        }
    }
}).export(module);