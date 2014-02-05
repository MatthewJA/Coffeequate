Coffeequate
===========

A computer algebra system for JavaScript.

## Installation
Include Coffeequate with an AMD loader. It provides a `coffeequate` object, with a `parse` object, an `Equation` object, and some exposed `tree` code.
Later versions of Coffeequate may be released as standalone JavaScript files that do not require an AMD loader.

## Use
Make expressions with the parse method `stringToExpression`:

    expression = coffeequate.parse.stringToExpression("a**2 + b**2 + -1*c**2")

Or make `Equations` directly:

    equation = new coffeequate.Equation("x", "y + z")
    equation = new coffeequate.Equation("x = y + z")

All nodes are equated to 0. Equations are equated to 0 unless you provide either an `=` sign or a left-hand-side of the equation.

For parsing, you can use `*` for multiplication, `**` for exponentiation, `+` for addition, `-` for *negation* (not subtraction), `1/2` for a fractional constant, and `()` parentheses to change the order of operations. Negation and parenthesising are higher precedence than exponentiation, which is higher precedence than multiplication, which is higher precedence than addition.

You also have at your disposal:

- `.solve(variable)` to solve for a variable with the same label as the string `variable`.
- `.expandAndSimplify()` to expand and simplify a node.
- `.expand()` to naively expand a node.
- `.simplify()` to naively simplify a node.
- `.copy()` to return a copy of the node.
- `.sub(substitutions)`, to substitute items in a dictionary into variables in the expressions.
- `.equals(b)` to compare the node with some object b.
- `.toMathML(equationID, expression=false, equality="0", topLevel=false)` to return a MathML string representing the expression. It takes some options:
	- `equationID`: used to uniquely identify the expression if you so wish.
	- `expression`: whether this is an expression or an equation - mainly used in an interface with another project.
	- `equality`: What the expression should be shown as being equated to in the output. Doesn't actually change what it is equated to, however.
	- `topLevel`: Whether to output the node as a complete MathML snippet with `<math>` tags and everything, or to just output MathML code to be inserted into such a snippet.
- `.toLaTeX()` to output as LaTeX code.
- `.toHTML(equationID, expression=false, equality="0", topLevel=false)` to output similarly to the `.toMathML()` method, but without actually using MathML.

## License
All current and previous versions licensed under the MIT License. See /LICENSE for a copy of this license.
