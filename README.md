Coffeequate
===========

Computer algebra system for JavaScript. Uses require.js.

## Installation
Drop all the files in /coffeequate/src into wherever you have your code. Do require.js magic until it works.
Look at /coffeequate/tests/specRunner.coffee for an example of how magic might work.

I'll compile this into a single JS file once I'm done writing it, and then it won't be so much magic.

## Use
Either make nodes directly:
    expression = new Add(new Pow(a, 2), new Pow(b, 2), new Mul(-1, new Pow(c, 2)))
Or make nodes with the parse functions:
	expression = parse.stringToExpression("a**2 + b**2 + -1*c**2")

All nodes are equated to 0.

For parsing, you can use `*` for multiplication, `**` for exponentiation, `+` for addition, `-` for *negation* (not subtraction), `1/2` for a fractional constant, and `()` parentheses to change the order of operations. Negation and parenthesising are higher precedence than exponentiation, which is higher precedence than multiplication, which is higher precedence than addition.

You also have at your disposal:

- `.solve(variable)` to solve for a variable with the same label as the string `variable`.
- `.expandAndSimplify()` to expand and simplify a node.
- `.expand()` to naively expand a node.
- `.simplify()` to naively simplify a node.
- `.copy()` to return a copy of the node.
- `.equals(b)` to compare the node with some object b.
- `.toMathML(equationID, expression=false, equality="0", topLevel=false)` to return a MathML string representing the expression. It takes some options:
-- `equationID`: used to uniquely identify the expression if you so wish.
-- `expression`: whether this is an expression or an equation - mainly used in an interface with another project.
-- `equality`: What the expression should be shown as being equated to in the output. Doesn't actually change what it is equated to, however.
-- `topLevel`: Whether to output the node as a complete MathML snippet with `<math>` tags and everything, or to just output MathML code to be inserted into such a snippet.
- `.toLaTeX()` to output as LaTeX code.
- `.toHTML(equationID, expression=false, equality="0", topLevel=false)` to output similarly to the `.toMathML()` method, but without actually using MathML.

## License
See /LICENSE.