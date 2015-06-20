var vows = require('vows'),
    assert = require('assert'),
    CQ = require("coffeequate");

var suite = vows.describe("expression");

suite.addBatch({
    "An addition expression": {
        topic: new CQ("a + b + c"),
        "contains an add node": function(expr) {
            assert.instanceOf(expr.expr, CQ.raw.Add);
        }
    }
}).export(module);