---
layout: index
title: Coffeequate
---
# Algebra in the browser.
No matter how hard you try, `-webkit-calc()` is not going to be able to solve an equation. Neither is JavaScript.

That's where Coffeequate comes in.

Coffeequate is a computer algebra system (CAS) for JavaScript. It can manipulate algebraic expressions, and solve and simplify equations.

## Features
* Solve quadratic and linear equations.
* Simplify algebraic expressions.
* Propagate uncertainties in an expression.
* Substitute numbers and other expressions into existing expressions.
* Handle variables, constants, and symbolic constants (like π or G).

## Usage
Loading Coffeequate into your webpage is as simple as including it in a script tag:

```html
<script type="text/javascript" src="coffeequate.min.js"></script>
```

You can also load it with an AMD loader like [RequireJS](http://requirejs.org/):

```javascript
define(["lib/coffeequate.min"], function (coffeequate) {
    // Use Coffeequate here!
});
```

### Examples
#### Solving an equation
```javascript
// If E = mc**2, then what does m equal?
E = new coffeequate.Equation("E = m * c ** 2");
console.log(E.solve("m")[0].toString()); // m = E/(c**2)
```

#### Substituting an expression into an equation
```javascript
// I want to find the equation for velocity of freefall.
Ek = new coffeequate.Equation("Ek = 1/2 * m * v**2"); // Kinetic energy
Ep = coffeequate.C("m * g * h"); // Gravitational potential energy
v = Ek.solve("v")[0];
console.log(v.substituteExpression(Ep, "Ek").toString()); // v = -1.414213562373095*sqrt(g)*sqrt(h)
```

#### Simplifying expressions
```javascript
console.log(
    coffeequate.C("x * (x + y) + -x * y + - (x ** 2)").expandAndSimplify().toString()
); // 0
```

## Upcoming Features
We plan to add lots of things!

* Differentiation. This already exists, but needs refining!
* Trigonometry and other functions.
* Support for fancier equations.
* Better parsing of expressions.

## Frequently Asked Questions

### I put an expression into `coffeequate.C`, and half of it didn't get read at all!
The most likely cause is that Coffeequate's parser doesn't yet support subtraction. Replace your `-` signs with `+ -` and it should work!