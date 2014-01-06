define ["parse", "generateInfo"], (parse, generateInfo) ->

	# Terminals for the equation tree.

	class Terminal
		# Base class for terminals.
		constructor: (@label) ->

		evaluate: ->

		copy: ->
			return new Terminal(@label)

		toString: ->
			@label

	class Constant extends Terminal
		# Constants in the equation tree, e.g. 1/2
		constructor: (value, @denominator=null) ->
			@cmp = -6

			if @denominator?
				[@numerator, denominator] = parse.constant(value)
				@denominator *= denominator
			else
				[@numerator, @denominator] = parse.constant(value)

		evaluate: ->
			@numerator/@denominator

		copy: ->
			return new Constant(@numerator, @denominator)

		compareSameType: (b) ->
			# Compare this object with another of the same type.
			if @evaluate() < b.evaluate()
				return -1
			else if @evaluate() == b.evaluate()
				return 0
			else
				return 1

		multiply: (b) ->
			# Multiply by another constant and return the result.
			return new Constant(@numerator * b.numerator, @denominator * b.denominator)

		add: (b) ->
			# Add another constant and return the result.
			return new Constant(b.denominator * @numerator + @denominator * b.numerator, @denominator * b.denominator)

		equals: (b) ->
			# Test equality between this object and another.
			unless b instanceof Constant
				return false
			return @evaluate() == b.evaluate()

		toMathML: (equationID, expression=false, equality="0", topLevel=false) ->
			# Return this constant as a MathML string.
			if topLevel
				[mathClass, mathID, html] = generateInfo.getMathMLInfo(equationID, expression)
				closingHTML = "</math></div>"
			else
				html = ""
				closingHTML = ""

			if @denominator == 1
				return "<mn>#{@numerator}</mn>"
			return "<mfrac><mrow><mn>#{@numerator}</mn></mrow><mrow><mn>#{@denominator}</mn></mrow</mfrac>"

		toHTML: ->
			# Return this constant as an HTML string.
			if @denominator == 1
				return "#{@numerator}"
			return "(#{@numerator}/#{@denominator})"

		toLaTeX: ->
			# Return this constant as a LaTeX string.
			if @denominator == 1
				return "#{@numerator}"
			return "\\frac{#{@numerator}}{#{@denominator}}"

		toString: ->
			unless @denominator == 1
				return "#{@numerator}/#{@denominator}"
			return "#{@numerator}"

	class SymbolicConstant extends Terminal
		# Symbolic constants in the equation tree, e.g. π
		constructor: (@label, @value=null) ->
			@cmp = -5

		copy: ->
			return new SymbolicConstant(@label, @value)

		compareSameType: (b) ->
			# Compare this object with another of the same type.
			if @label < b.label
				return -1
			else if @label == b.label
				return 0
			else
				return 1

		evaluate: ->
			@value

		equals: (b) ->
			unless b instanceof SymbolicConstant
				return false
			return @label == b.label and @value == b.value

		toHTML: ->
			@toString()

		toMathML: (equationID, expression=false, equality="0", topLevel=false) ->
			if topLevel
				[mathClass, mathID, html] = generateInfo.getMathMLInfo(equationID, expression)
				closingHTML = "</math></div>"
			else
				html = ""
				closingHTML = ""

			"#{html}<mn>#{@label}</mn>#{closingHTML}"

		toLaTeX: ->
			@toString()

	class Variable extends Terminal
		# Variables in the equation tree, e.g. m
		constructor: (@label) ->
			@cmp = -4

		copy: ->
			return new Variable(@label)

		compareSameType: (b) ->
			# Compare this object with another of the same type.
			if @label < b.label
				return -1
			else if @label == b.label
				return 0
			else
				return 1

		equals: (b) ->
			# Check equality between this and some other object.
			unless b instanceof Variable
				return false
			return b.label == @label

		toMathML: (equationID, expression=false, equality="0", topLevel=false) ->
			# Return the variable as a MathML string.
			if topLevel
				[mathClass, mathID, html] = generateInfo.getMathMLInfo(equationID, expression)
				closingHTML = "</math></div>"
			else
				html = ""
				closingHTML = ""

			# The ID of the variable will wind up being variable-equation/expression-equationID-@label
			# E.g. variable-expression-1-p-0

			# Strip the ID off of the variable, if it has one.
			labelArray = @label.split("-")
			label = labelArray[0]
			labelID = if labelArray[1]? then 'id="variable-' + (if expression then "expression" else "equation") + "-#{equationID}-" + @label + '"' else ""
			if label.length > 1
				return html + '<msub class="variable"' + labelID + '><mi>' + label[0] + '</mi><mi>' + label[1..] + "</mi></msub>" + closingHTML
			else
				return html + '<mi class="variable"' + labelID + '>' + label + '</mi>' + closingHTML

		toHTML: ->
			# Return an HTML string representing the variable.
			# Strip the ID off of the variable, if it has one.
			labelArray = @label.split("-")
			label = labelArray[0]
			labelID = if labelArray[1]? then 'id="variable-' + @label + '"' else ""
			return '<span class="variable"' + labelID + '>' + label + '</span>'

		toLaTeX: ->
			@toString()

	return {

		Terminal: Terminal

		Variable: Variable

		Constant: Constant

		SymbolicConstant: SymbolicConstant

	}