define ["parse", "nodes"], (parse, nodes) ->

	# Public interface for nodes.
	# This is the main object that the user will deal with in Coffeequate.
	# It wraps underlying nodes and terminals in a neat interface.
	class Expression

		# Make a new Expression.
		#
		# @param val [String, Expression, BasicNode, Terminal] A string representation of an expression to parse or a node/terminal/expression to convert into an Expression.
		# @return [Expression]
		constructor: (val) ->
			if val instanceof String or typeof val == "string"
				# The string we pass in is just a representation to parse.
				@expr = parse.stringToExpression(val)
			else if val.copy?
				@expr = val.copy()
			else
				console.log("Received argument: ", val)
				throw new Error("Unknown argument: `#{val}'.")

		# Convert this Expression to a string.
		#
		# @return [String] A string representation of this Expression.
		toString: ->
			@expr.toString()

		# Convert this Expression to a MathML string.
		#
		# @return [String] A MathML representation of this Expression.
		toMathML: ->
			@expr.toMathML()

		# Convert this Expression to a LaTeX string.
		#
		# @return [String] A LaTeX representation of this Expression.
		toLaTeX: ->
			@expr.toLaTeX()

		# Equate the Expression to 0 and solve for a variable.
		#
		# @param variable [String] The variable to solve for.
		# @param equivalencies [Object] Optional. A map of variable labels to a list of equivalent variable labels.
		# @return [Expression] A solved Expression representing the variable.
		solve: (variable, equivalencies={}) ->
			(new Expression(solution) for solution in @expr.solve(variable, equivalencies))

		# Substitute values into the Expression.
		#
		# @param substitutions [Object] A map of variable labels to their values. Values can be integers, Expressions, Terminals, or BasicNodes.
		# @param equivalencies [Object] Optional. A map of variable labels to a list of equivalent variable labels.
		# @return [Expression] The Expression with substituted values.
		# @todo Add uncertainties [#61](https://github.com/MatthewJA/Coffeequate/issues/61)
		# @todo Reimplement sub options from the nodes. [#71](https://github.com/MatthewJA/Coffeequate/issues/71)
		sub: (substitutions, equivalencies={}) ->
			# TODO: Uncertainties, options.
			# TODO: Seems that the way I implemented substituting expressions was different last time for no real reason. Fix.

			# If there are any Expressions in here, we should remove them.
			newsubs = {}
			for key of substitutions
				if substitutions[key] instanceof Expression
					newsubs[key] = substitutions[key].expr
				else
					newsubs[key] = substitutions[key]

			return new Expression(@expr.sub(newsubs, null, equivalencies).simplify(equivalencies))

		# Deep-copy this Expression.
		#
		# @return [Expression] A copy of this Expression.
		copy: ->
			new Expression(@expr.copy())

		# Simplify this Expression.
		#
		# @param equivalencies [Object] Optional. A map of variable labels to a list of equivalent variable labels.
		# @return [Expression] A simplified Expression.
		simplify: (equivalencies={}) ->
			new Expression(@expr.simplify(equivalencies))

		# Expand this Expression.
		#
		# @return [Expression] An expanded Expression.
		expand: ->
			new Expression(@expr.expand())

		# Differentiate this expression with respect to a variable.
		#
		# @param variable [String] The label of the variable to differentiate with respect to.
		# @param equivalencies [Object] Optional. A map of variable labels to a list of equivalent variable labels.
		# @return [Expression] A differentiated expression.
		differentiate: (variable, equivalencies={}) ->
			new Expression(@expr.differentiate(variable, equivalencies))

		# Convert this expression to a JavaScript function.
		#
		# @param variables... [Array<String>] An array of variables for the function to accept, in order that they should appear in the final function.
		# @param equivalencies [Object] Optional. A map of variable labels to a list of equivalent variable labels. This will be used in the returned function.
		# @return [Function] A function that takes variable values and returns an Expression object.
		toFunction: (variables..., equivalencies) ->
			if typeof equivalencies == "string" or equivalencies instanceof String # We had no equivalencies object after all.
				variables.push(equivalencies)
				equivalencies = {}

			fun = (subs...) =>
				# Zip variables and subs together into an object.
				substitutions = {}
				for variable, index in variables
					if subs[index]?
						substitutions[variable] = subs[index]

				# Substitute these values into this expression and return the result.
				return @sub(substitutions, equivalencies)

			return fun

	return Expression