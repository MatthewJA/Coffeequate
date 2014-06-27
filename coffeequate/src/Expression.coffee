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
		# @return [Expression] A solved Expression representing the variable.
		# @todo Add equivalencies [#62](https://github.com/MatthewJA/Coffeequate/issues/62)
		solve: (variable) ->
			# TODO: Equivalencies.
			(new Expression(solution) for solution in @expr.solve(variable))

		# Substitute values into the Expression.
		#
		# @param substitutions [Object] A map of variable labels to their values. Values can be integers, Expressions, Terminals, or BasicNodes.
		# @return [Expression] The Expression with substituted values.
		# @todo Add equivalencies [#62](https://github.com/MatthewJA/Coffeequate/issues/62)
		# @todo Add uncertainties [#61](https://github.com/MatthewJA/Coffeequate/issues/61)
		# @todo Reimplement sub options from the nodes. [#71](https://github.com/MatthewJA/Coffeequate/issues/71)
		sub: (substitutions) ->
			# TODO: Uncertainties, equivalencies, options.
			# TODO: Seems that the way I implemented substituting expressions was different last time for no real reason. Fix.

			# If there are any Expressions in here, we should remove them.
			newsubs = {}
			for key of substitutions
				if substitutions[key] instanceof Expression
					newsubs[key] = substitutions[key].expr
				else
					newsubs[key] = substitutions[key]

			return new Expression(@expr.sub(newsubs, null, null).simplify())

		copy: ->
			new Expression(@expr.copy())

		simplify: ->
			new Expression(@expr.simplify())
		expand: ->
			new Expression(@expr.expand())
	return Expression