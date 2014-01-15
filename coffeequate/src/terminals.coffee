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

		replaceVariables: (replacements) ->
			@copy() # Does nothing - this is a constant.

		getAllVariables: ->
			[]

		sub: (substitutions) ->
			@copy()

		simplify: ->
			@copy()

		expand: ->
			@copy()

		expandAndSimplify: ->
			@copy()

		substituteExpression: (sourceExpression, variable, equivalencies) ->
			@copy()

		toMathML: (equationID, expression=false, equality="0", topLevel=false) ->
			# Return this constant as a MathML string.
			if topLevel
				[mathClass, mathID, html] = generateInfo.getMathMLInfo(equationID, expression, equality)
				closingHTML = "</math></div>"
			else
				html = ""
				closingHTML = ""

			if @denominator == 1
				return html + "<mn>#{@numerator}</mn>" + closingHTML
			return html + "<mfrac><mrow><mn>#{@numerator}</mn></mrow><mrow><mn>#{@denominator}</mn></mrow></mfrac>" + closingHTML

		toHTML: (equationID, expression=false, equality="0", topLevel=false) ->
			# Return this constant as an HTML string.
			[mathClass, mathID, html] = generateInfo.getHTMLInfo(equationID, expression, equality)

			unless topLevel
				html = ""
				closingHTML = ""
			else
				closingHTML = "</div>"

			if @denominator == 1
				return html + "#{@numerator}" + closingHTML
			return html + "(#{@numerator}/#{@denominator})" + closingHTML

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

		replaceVariables: (replacements) ->
			@copy() # Does nothing - this is a constant.

		getAllVariables: ->
			[]

		sub: (substitutions) ->
			@copy()

		simplify: ->
			@copy()

		expand: ->
			@copy()

		expandAndSimplify: ->
			@copy()

		substituteExpression: (sourceExpression, variable, equivalencies) ->
			@copy()

		toHTML: (equationID, expression=false, equality="0", topLevel=false) ->
			if topLevel
				[mathClass, mathID, html] = generateInfo.getHTMLInfo(equationID, expression, equality)
				closingHTML = "</div>"
			else
				html = ""
				closingHTML = ""
			return html + "<span class=\"symbolic-constant\">" + @toString() + "</span>" + closingHTML

		toMathML: (equationID, expression=false, equality="0", topLevel=false) ->
			if topLevel
				[mathClass, mathID, html] = generateInfo.getMathMLInfo(equationID, expression, equality)
				closingHTML = "</math></div>"
			else
				html = ""
				closingHTML = ""

			"#{html}<mn class=\"symbolic-constant\">#{@label}</mn>#{closingHTML}"

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

		equals: (b, equivalencies=null) ->
			# Check equality between this and some other object.
			unless b instanceof Variable
				return false

			if equivalencies?
				return @label in equivalencies.get(b.label)
			else
				return b.label == @label

		replaceVariables: (replacements) ->
			if @label of replacements
				@label = replacements[@label]

		getAllVariables: ->
			[@label]

		sub: (substitutions) ->
			if @label of substitutions
				substitute = substitutions[@label]
				if substitute.copy?
					return substitute.copy()
				else
					return new Constant(substitute)
			else
				return @copy()

		substituteExpression: (sourceExpression, variable, equivalencies=null, eliminate=false) ->
			# Replace all instances of a variable with an expression.

			# Generate an equivalencies index if necessary.
			if not equivalencies?
				equivalencies = {get: (variable) -> [variable]}

			variableEquivalencies = equivalencies.get(variable)

			# Eliminate the target variable if set to do so.
			if eliminate
				sourceExpression = sourceExpression.solve(variable)[0]
			if @label == variable or @label in variableEquivalencies
				return sourceExpression.copy()
			else
				return @copy()

		simplify: ->
			@copy()

		expand: ->
			@copy()

		expandAndSimplify: ->
			@copy()

		toMathML: (equationID, expression=false, equality="0", topLevel=false) ->
			# Return the variable as a MathML string.
			if topLevel
				[mathClass, mathID, html] = generateInfo.getMathMLInfo(equationID, expression, equality)
				closingHTML = "</div>"
			else
				html = ""
				closingHTML = ""

			# The ID of the variable will wind up being variable-equation/expression-equationID-@label
			# E.g. variable-expression-1-p-0

			# Strip the ID off of the variable, if it has one.
			labelArray = @label.split("-")
			label = labelArray[0]
			labelID = if labelArray[1]? then 'id="variable-' + (if expression then "expression" else "equation") + "-#{equationID}-" + @label + '"' else ""

			atCount = 0
			while label[0] == "@"
				atCount += 1
				label = label[1..]

			atStart = "<mover accent=\"true\">"
			atEnd = "<mrow><mo>" + ("." for i in [0...atCount]).join("") + "</mo></mrow></mover>"

			if label.length > 1
				return html + atStart + '<msub class="variable"' + labelID + '><mi>' + label[0] + '</mi><mi>' + label[1..] + "</mi></msub>" + atEnd + closingHTML
			else
				return html + atStart + '<mi class="variable"' + labelID + '>' + label + '</mi>' + atEnd + closingHTML

		toHTML: (equationID, expression=false, equality="0", topLevel=false) ->
			# Return an HTML string representing the variable.
			if topLevel
				[mathClass, mathID, html] = generateInfo.getHTMLInfo(equationID, expression, equality)
				closingHTML = "</div>"
			else
				html = ""
				closingHTML = ""

			# Strip the ID off of the variable, if it has one.
			labelArray = @label.split("-")
			label = labelArray[0]
			labelID = if labelArray[1]? then 'id="variable-' + (if expression then "expression" else "equation") + "-#{equationID}-" + @label + '"' else ""
			return html + '<span class="variable"' + labelID + '>' + label + '</span>' + closingHTML

		toLaTeX: ->
			@toString()

	return {

		Terminal: Terminal

		Variable: Variable

		Constant: Constant

		SymbolicConstant: SymbolicConstant

	}