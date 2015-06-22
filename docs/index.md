# Coffeequate

Coffeequate is a computer algebra system for JavaScript. It can manipulate algebraic expressions, and solve and simplify equations.

## Features
- Solve quadratic and linear equations
- Simplify most algebraic expressions
- Propagate uncertainties
- Substitute values (or other expressions) into expressions
- Handle variables, constants, and symbolic constants (like π or G)

## Installation

Coffeequate can be used in three ways: In a `<script>` tag, with an AMD loader like RequireJS, or with Node.

To use with a script tag, just include `coffeequate.min.js`:
```html
<script type="text/javascript" src="coffeequate.min.js"></script>
<!-- Use Coffeequate here! -->
```
This defines a `CQ` function (with a `coffeequate` alias) that lets you interact with Coffeequate.

To use with an AMD loader, just specify Coffeequate in your code:
```javascript
define(["lib/coffeequate.min"], function (CQ) {
// Use Coffeequate here!
});
```

To use with Node, just install with `npm install coffeequate` and `require` it:
```
var CQ = require("coffeequate");
// Use Coffeequate here!
```

## Basic usage

The `CQ` function takes strings and returns an `Expression` object that you can interact with with its various methods. The strings have a simple syntax:

- `+` for addition
- `*` for multiplication
- `-` for negation or subtraction
- `/` for division
- `(expr)` for parenthesising
- `**` for exponentiation
- Bare literals like `x` are treated as variables
- Literals preceded by a backslash like `\G` are treated as symbolic constants
- Numbers like `1` or `3.1` are treated as integers and floats respectively
- `a = b` is equivalent to `b - a`, which is implicitly equal to 0
- `f(x)` and `myFunction(z)` are symbolic functions

For example, we could write the distance between `(a, b)` and `(c, d)` like this:
```javascript
CQ("((a - c)**2 + (b - d)**2)**0.5")
```

Or we could reproduce Einstein's famous energy-mass equivalence equation:
```javascript
CQ("E = m * \\c**2")
```

More information about how to manipulate these expressions is on the [usage](usage) page.