var vows = require('vows'),
    assert = require('assert'),
    CQ = require("../coffeequate.min");

var suite = vows.describe("nsolve");

suite.addBatch({
    "Expression.nsolve": {
        topic: undefined,

        "can solve simple quadratic equations": function() {
            var expr = CQ("x**2 - 2");
            var sol = expr.nsolve(1.5, "x");
            assert.isTrue(sol == Math.sqrt(2));

            var expr2 = CQ("2*x**2 - 7");
            var sol2 = expr2.nsolve(3, "x");
            assert.isTrue(sol2 == Math.sqrt(3.5));

            var sol3 = expr2.nsolve(-3, "x");
            assert.isTrue(sol3 == -Math.sqrt(3.5));
        },

        "can solve simple cubic equations": function() {
            var expr = CQ("x**3 - 10");
            var sol = expr.nsolve(2,"x");
            assert.isTrue(sol == Math.pow(10, 1/3));

            var expr2 = CQ("x**3 - 27");
            var sol2 = expr2.nsolve(3,"x");
            assert.isTrue(sol2 == 3);
        },

        "can solve simple higher order equations": function() {
            var expr = CQ("x**7 - 23");
            var sol = expr.nsolve(2,"x");
            assert.isTrue(sol == Math.pow(23, 1/7));
        },

        "can solve complicated equations": function() {
            var expr = CQ("x**3 - 4*x**2 + 2*x - 3");
            var sol = expr.nsolve(3,"x");
            assert.isTrue(sol == 3.677993483398447);

            var expr2 = CQ("x**5 + 3*x**4 - 27*x**2 + 3*x - 9");
            var sol2 = expr2.nsolve(3,"x");
            assert.isTrue(sol2 == 2.2789393390684216);
        },

        "can stop if the process isn't converging": function() {
            var expr = CQ("x**2 + 7");
            assert.throws(function(){expr.nsolve(3,"x")}, Error);

        },

        "fails when derivative is zero": function() {
            var expr = CQ("y = 1");
            assert.throws(function(){expr.nsolve(3, "x")}, Error)
        }

    }
}).export(module);