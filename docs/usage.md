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

## Simplifying expressions

### simplify(equivalencies={})

`expr.simplify()` simplifies the expression `expr` if possible. It can optionally take an equivalencies map like `solve`, which it will use to simplify the equation further.

### expand()

`expr.expand()` expands the expression `expr` if possible.

## Substituting values

### sub(subs, equivs={}, subUncertainties=false, evalSymConstants=false)

`expr.sub(subs)` substitutes values into variables in `expr` according to the map `subs`. `subs` maps variable labels to values that should be substituted in their place. Values should be either numbers or Coffeequate expressions. For example,
```javascript
CQ("E = m*\\c").sub({"m": 10}) // -E + 10*\\c
```

Much like `simplify` and `solve`, `sub` can take an `equivs` argument mapping variables to an array of equivalent variables. This will be used while substituting and subsequently simplifying.

There are two optional boolean arguments, `subUncertainties` and `evalSymConstants`. If `subUncertainties` is true, then instead of substituting values into variables, `sub` will substitute values into the associated <em>uncertainties</em>. For more information on this, see the documentation for [uncertainties](#uncertainties). If `evalSymConstants` is true, then symbolic constants will have their values substituted 