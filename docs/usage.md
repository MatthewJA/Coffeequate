# Usage

## Making new expressions

Most interaction with Coffeequate is done with the methods of the `Expression` object that `CQ` returns. An expression is implicitly equated to zero (even if it's not going to be used as an equation), so all of the following are equivalent:
```javascript
CQ("y = m*x + b")
CQ("m*x + b - y = 0")
CQ("m*x + b - y")
```

## Converting to strings

You'll want to convert your expressions into some kind of pretty, string representation at some point. There are three methods that do this:

### toString()

`expr.toString()` converts the expression `expr` into a simple string representation. For example,

```javascript
CQ("E = m*\\c**2").toString() // ' - E + m*c**2'
```

### toMathML()

`expr.toMathML()` converts the expression `expr` into a MathML string. For example,

```javascript
CQ("E = m*\\c**2").toMathML() // '<mo>-</mo><mi class="variable">E</mi><mo>+</mo><mi class="variable">m</mi><mo>&middot;</mo><msup><mi class="constant symbolic-constant">c</mi><mn class="constant">2</mn></msup>'
```

### toLaTeX()

`expr.toLaTeX()` converts the expression `expr` into a LaTeX string. For example,

```javascript
CQ("E = m*\\c**2").toLaTeX() // '-E+m \\cdot c^{2}'
```

## Solving equations

### solve(variable, equivalencies={})

`expr.solve(variable)` solves the expression `expr` for the variable `variable`, and assumes that the expression is equal to zero. For example,

```javascript
CQ("m*x + b - y").solve("y") // m*x + b
CQ("m**2*\\c**4 + p**2*\\c**2").solve("p") // sqrt(-(c**4*m**2)), -(sqrt(-(c**4*m**2)))
```

`expr.solve(variable, equivalencies)` is the same as above, except that it takes a map of equivalencies. This equivalencies map describes which variables are equivalent to each other. For example, if `x` and `z` are equal, then `equivalencies = {"x":["x", "z"], "z":["x", "z"]}`. The order within the map is irrelevant, but it must be redundant.

### nsolve(guess, variable, equivalencies={}, tol=1e-9, max_iterations=75)
`expr.nsolve(guess, variable)` finds a numerical solution of the expression `expr` for the the variable `variable` using Newton's method with the initial value `guess`, assuming that the expression is set to zero. This only works for differentiable expressions.

For example,

```javascript
CQ("x**2 - 2").nsolve(1.5,"x") // 1.4142135623730951
```

The use of `equivalencies` is the same as for `expr.solve`. 

`expr.nsolve(guess, variable, equivalencies, tol)` finds the numerical solution of the expression `expr` so that the difference between the found solution and the exact solution is less than `tol`.

`expr.nsolve(guess, variable, equivalencies, tol, max_iterations)` will attempt to find a numerical solution within `tol` for the expression `expr` before the maximum number of iterations allowed `max_iterations` is reached. If this doesn't happen, the function will throw an error:

```javascript
CQ("x**2 + 7").nsolve(1.5,"x") // Error: Maximum Number of Iterations Reached
```

## Simplifying expressions

### simplify(equivalencies={})

`expr.simplify()` simplifies the expression `expr` if possible. It can optionally take an equivalencies map like `solve`, which it will use to simplify the equation further.

### expand()

`expr.expand()` expands the expression `expr` if possible.

## Substituting values

### sub(subs, equivs={}, subUncertainties=false, evalSymConstants=false)

`expr.sub(subs)` substitutes values into variables in `expr` according to the map `subs`. `subs` maps variable labels to values that should be substituted in their place. Values should be either numbers or Coffeequate expressions. For example,
```javascript
CQ("E = m*\\c**2").sub({"m": 10}) // -E + 10*\\c**2
```

Much like `simplify` and `solve`, `sub` can take an `equivs` argument mapping variables to an array of equivalent variables. This will be used while substituting and subsequently simplifying.

There are two optional boolean arguments, `subUncertainties` and `evalSymConstants`. If `subUncertainties` is true, then instead of substituting values into variables, `sub` will substitute values into the associated <em>uncertainties</em>. For more information on this, see the documentation for [uncertainties](#manipulating-uncertainties). If `evalSymConstants` is true, then symbolic constants will have their values substituted:
```javascript
CQ("E = m*\\c**2").sub({"m": 10}, {}, false, true) // 898755178736817700 - E
```

## Checking equality

### equals(other, equivalencies={})

`a.equals(b)` returns true if `a` and `b` represent the same expression, and false otherwise.

### approx()

`expr.approx()` sets all variables to 0 and evaluates the resulting expression, returning a number. This evaluates symbolic constants, too.

## Manipulating variables

### getAllVariables()

A list of variables in the expression can be retrieved with `expr.getAllVariables()`. For example,
```javascript
CQ("E = m*\\c**2").getAllVariables() // [ 'E', 'm' ]
```

### mapOverVariables(f)

`expr.mapOverVariables(f)` applies a function `f` to all variables in the expression. This is useful for changing labels, for example:
```javascript
var changeLabel = function(variable) {
    variable.label += "s";
    return variable;
};
var newExpr = CQ("E = m*\\c**2").mapOverVariables(changeLabel); // Es = ms*\\c**2
```

This method does not change the original expression.

## Deep-copying expressions

### copy()

The whole expression can be deep-copied with `expr.copy()`. The copy will be completely separate from the original, so it can be changed without mutating the original.

## Manipulating uncertainties

### getUncertainty()

`expr.getUncertainty()` propagates uncertainties through `expr` and returns a new expression representing the uncertainty in `expr`. For example,
```javascript
CQ("m*\\c**2").getUncertainty() // sqrt(\\c**4*σ(m)**2)
```

Uncertainties can be substituted in using `expr.sub`, with the `subUncertainties` argument set to true.
```javascript
CQ("m*\\c**2").getUncertainty().sub({m: 1}, {}, true).approx() // 89875517873681760
```

## Differentiating

### differentiate(variable, equivalencies={})

`expr.differentiate(variable)` differentiates `expr` with respect to `variable` and returns the result. For example,
```javascript
CQ("a*x**2 + b*x + c").differentiate("x") // b + 2*a*x
```

At the moment, this only does simple derivatives, e.g. trying to differentiate `2**x` will fail.

## Converting to functions

### toFunction(variables..., equivalencies={})

Expressions can be converted to functions using `expr.toFunction(variables...)`, which takes some number of variable labels and returns a function that takes those same variables as arguments and returns a value or expression. For example,
```javascript
var f = CQ("a*x**2 + b*x + c - y").toFunction("x", "y");
f(3, 2) // -2 + c + 3*b + 9*a
```
